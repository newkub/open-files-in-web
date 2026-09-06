import { existsSync } from "node:fs";
import { Command } from "commander";
import { createBrowserAdapter } from "#adapters/browser";
import { createOpenUrlUseCase } from "../../modules/open-web";
import { previewFile } from "./preview";

function isUrl(value: string): boolean {
	return /^https?:\/\//.test(value) || value.startsWith("file://");
}

export const createCli = (): Command => {
	const program = new Command();

	program
		.name("open-in-open-terminal")
		.alias("ofw")
		.description("Open web pages, local files, and documentation in browser")
		.version("1.0.0")
		.argument("[path]", "URL or local file/directory path to open")
		.option("-b, --browser <browser>", "Browser to use")
		.option("-s, --serve", "Use HTTP server mode for preview (default is static HTML)")
		.option("--no-open", "Generate preview HTML without opening the browser")
		.action(async (input, options) => {
			if (!input) {
				console.error("Error: URL or path is required");
				process.exit(1);
			}

			// Local file/directory -> preview, URL -> open directly
			if (!isUrl(input) && existsSync(input)) {
				try {
					const indexPath = await previewFile(input, {
						noOpen: options.open === false,
						serve: options.serve === true,
					});
					console.log(`Preview: ${indexPath}`);
				} catch (error) {
					console.error("Failed to preview:", error instanceof Error ? error.message : String(error));
					process.exit(1);
				}
				return;
			}

			const adapter = createBrowserAdapter();
			const openUrl = createOpenUrlUseCase(adapter);

			const result = await openUrl({
				url: input,
				browser: options.browser as
					| "chrome"
					| "firefox"
					| "safari"
					| "edge"
					| "default"
					| undefined,
			});

			if (result.success) {
				console.log(result.message);
			} else {
				console.error("Failed to open URL:", result.message);
				process.exit(1);
			}
		});

	program
		.command("preview <path>")
		.description("Render a local file or directory in a Solid+TanStack preview (default: static HTML, use --serve for server)")
		.option("--serve", "Start an HTTP server instead of generating a single HTML file")
		.option("--no-open", "Generate preview HTML without opening the browser")
		.action(async (target, options) => {
			try {
				const indexPath = await previewFile(target, {
					noOpen: options.open === false,
					serve: options.serve === true,
				});
				console.log(`Preview: ${indexPath}`);
			} catch (error) {
				console.error("Failed to preview:", error instanceof Error ? error.message : String(error));
				process.exit(1);
			}
		});

	return program;
};
