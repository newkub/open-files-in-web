import type { BrowserName, Platform } from "#modules/open-web/types";

export const getPlatform = (): Platform => {
	return process.platform as Platform;
};

export const getOpenCommand = (platform: Platform): string => {
	switch (platform) {
		case "win32":
			return "start";
		case "darwin":
			return "open";
		default:
			return "xdg-open";
	}
};

export const getBrowserFlag = (browser?: BrowserName): string[] => {
	if (!browser || browser === "default") return [];
	return [`--browser=${browser}`];
};
