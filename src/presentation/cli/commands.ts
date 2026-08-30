import { Command } from "commander";
import { createBrowserAdapter } from "#adapters/browser";
import { createOpenUrlUseCase } from "../../modules/open-web";
import { previewFile } from "./preview";

export const createCli = (): Command => {
	const program = new Command();

	program
		.name("open-in-open-terminal")
		.description("Open web pages, local files, and documentation in browser")
		.version("1.0.0")
		.argument("[url]", "URL or file path to open")
		.option("-b, --browser <browser>", "Browser to use")
		.action(async (url, options) => {
			if (!url) {
				console.error("Error: URL or path is required");
				process.exit(1);
			}

			const adapter = createBrowserAdapter();
			const openUrl = createOpenUrlUseCase(adapter);

			const result = await openUrl({
				url,
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
		.description("Render a local file or directory in a Solid+TanStack preview")
		.action(async (target) => {
			try {
				const indexPath = await previewFile(target);
				console.log(`Preview: ${indexPath}`);
			} catch (error) {
				console.error("Failed to preview:", error instanceof Error ? error.message : String(error));
				process.exit(1);
			}
		});

	return program;
};
