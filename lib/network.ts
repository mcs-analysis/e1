import { SourcesResponse } from "./types";

const SCRIPT_URL_REGEX = /<script\s.*?src="([^"]*embed[^"]*)">/;
const CLIENT_KEY_REGEX = /[a-zA-Z0-9]{48}|(?<=")[a-zA-Z0-9]{16}(?=")/g;

function matchClientKey(html: string) {
	const matches = html.match(CLIENT_KEY_REGEX);
	if (!matches) {
		return null;
	}

	if (matches.length === 3) {
		return matches[0] + matches[1] + matches[2];
	}

	return matches[0];
}

export async function fetchEmbedInfo(url: URL) {
	const debugUrl = new URL(url);
	debugUrl.searchParams.set("_debug", "true");

	const response = await fetch(debugUrl, {
		headers: {
			"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch embed info: ${response.statusText}`);
	}

	const html = await response.text();
	const scriptMatch = html.match(SCRIPT_URL_REGEX);
	if (!scriptMatch) {
		throw new Error("Embed script URL not found in the HTML.");
	}
	const scriptCode = await fetch(new URL(scriptMatch[1], url.origin)).then((res) => res.text());

	const clientKey = matchClientKey(html);
	if (!clientKey) {
		throw new Error("Client key not found in the HTML.");
	}

	let data = await fetchData(url.toString(), clientKey);
	if (!data || !data.sources || data.sources.length === 0) {
		throw new Error("No data found for the video.");
	}

	return {
		script: scriptCode,
		clientKey,
		data,
	};
}

async function fetchData(url: string, clientKey: string): Promise<SourcesResponse> {
	let sourcesUrl = toGetSourcesUrl(url, clientKey);

	const response = await fetch(sourcesUrl, {
		headers: {
			"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
			"X-Requested-With": "XMLHttpRequest",
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch sources: ${response.statusText}`);
	}

	const jsonResponse = await response.json();
	if (!jsonResponse || !jsonResponse.sources) {
		throw new Error("Sources not found in the response.");
	}

	return jsonResponse as SourcesResponse;
}

function toGetSourcesUrl(originalUrl: string, clientKey: string) {
	const url = new URL(originalUrl);
	const pathParts = url.pathname.split("/").filter(Boolean);
	const videoId = pathParts.pop();

	url.pathname = `/${pathParts.join("/")}/getSources`;
	url.search = `?id=${videoId}&_k=${clientKey}`;

	return url.toString();
}
