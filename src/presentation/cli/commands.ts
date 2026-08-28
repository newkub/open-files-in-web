import { Command } from "commander";
import { createBrowserAdapter } from "#adapters/browser";
import { createOpenUrlUseCase } from "../../modules/open-web";

export const createCli = (): Command => {
	const program = new Command();

	program
		.name("open-in-open-terminal")
		.description("Open web pages and documentation in browser")
		.version("1.0.0")
		.argument("[url]", "URL to open")
		.option("-b, --browser <browser>", "Browser to use")
		.action(async (url, options) => {
			if (!url) {
				console.error("Error: URL is required");
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

	return program;
};
