import type { OpenUrlOptions } from "#modules/open-web/types";

export const validateUrl = (url: string): boolean => {
	if (!url || url.trim().length === 0) return false;
	return true;
};

export const normalizeUrl = (url: string): string => {
	return url.startsWith("http") ? url : `https://${url}`;
};

export const validateOptions = (options: OpenUrlOptions): boolean => {
	return validateUrl(options.url);
};
