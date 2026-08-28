import {
	getBrowserFlag,
	normalizeUrl,
	validateUrl,
} from "#modules/open-web/domain";
import type { OpenUrlOptions, OpenUrlResult } from "#modules/open-web/types";
import type { IOpenUrlPorts } from "../../ports";

export const createOpenUrlUseCase = (ports: IOpenUrlPorts) => {
	return async (options: OpenUrlOptions): Promise<OpenUrlResult> => {
		if (!validateUrl(options.url)) {
			return {
				success: false,
				url: options.url,
				message: "URL is required",
			};
		}

		const normalizedUrl = normalizeUrl(options.url);
		const browserFlags = getBrowserFlag(options.browser);
		const platform = ports.getPlatform();

		const command =
			platform === "win32"
				? "start"
				: platform === "darwin"
					? "open"
					: "xdg-open";

		try {
			await ports.executeCommand(command, [...browserFlags, normalizedUrl]);
			return {
				success: true,
				url: normalizedUrl,
				message: `Opened: ${normalizedUrl}`,
			};
		} catch (error) {
			return {
				success: false,
				url: normalizedUrl,
				message: error instanceof Error ? error.message : String(error),
			};
		}
	};
};
