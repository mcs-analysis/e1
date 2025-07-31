import * as fs from "node:fs/promises";
import ivm from "isolated-vm";
import * as ivmInspect from "ivm-inspect";
import path from "path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function runSandboxed(script: string, clientKey: string, sources: string) {
	const isolate = new ivm.Isolate({ memoryLimit: 128 });
	const context = await isolate.createContext();
	const jail = context.global;

	const util = await ivmInspect.create(isolate, context);
	await ivmInspect.forwardConsole(context, util);

	await jail.set("global", jail.derefInto());
	await jail.set("window", jail.derefInto());
	await jail.set("playerSettings", new ivm.ExternalCopy({ autoPlay: 1 }).copyInto());
	await jail.set(
		"navigator",
		new ivm.ExternalCopy({
			userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
		}).copyInto()
	);

	await jail.set("atob", (str: string) => Buffer.from(str, "base64").toString("binary"));
	await jail.set("btoa", (str: string) => Buffer.from(str, "binary").toString("base64"));

	const spoofingScript = await fs.readFile(path.join(__dirname, "spoof.js"), "utf8");
	await isolate.compileScript(spoofingScript).then(
		async (s) =>
			await s.run(context).catch((error) => {
				console.error("Error executing spoofing script in isolated-vm:", error);
			})
	);

	await jail.set("__CLIENT_KEY__", clientKey);
	await jail.set("__SOURCES__", sources);

	let decryptedSources = null;
	await jail.set("sendOutDecryptedSources", (sources: any) => {
		decryptedSources = sources;
	});

	await isolate.compileScript(script).then(
		async (s) =>
			await s.run(context).catch((error) => {
				console.error("Error executing code script in isolated-vm:", error);
			})
	);

	isolate.dispose();

	return decryptedSources;
}
