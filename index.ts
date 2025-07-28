import { fetchEmbedInfo } from "./lib/network";
import { runSandboxed } from "./lib/sandbox";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const argv = await yargs(hideBin(process.argv))
	.option("url", {
		alias: "u",
		type: "string",
		description: "URL to fetch embed info from",
	})
	.demandOption("url").argv;

async function main() {
	let start = performance.now();
	const url = new URL(argv.url);
	const { script, clientKey, data } = await fetchEmbedInfo(url);
	console.log("Client Key:", clientKey);
	console.log("Sources:", data.sources);

	if (typeof data.sources === "string") {
		const decryptedSources = await runSandboxed(script, clientKey, data.sources);
		if (decryptedSources) {
			data.sources = decryptedSources;
			data.encrypted = false;
		}
	}
	data.duration = performance.now() - start;
	console.log(data);
}

main();
