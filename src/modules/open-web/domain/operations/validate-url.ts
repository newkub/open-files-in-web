import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const isWebUrl = (s: string): boolean => /^https?:\/\//i.test(s);
const isFileUrl = (s: string): boolean => /^file:\/\//i.test(s);

export const validateUrl = (url: string): boolean => {
	return typeof url === "string" && url.trim().length > 0;
};

export const normalizeUrl = (url: string): string => {
	const s = url.trim();
	if (isWebUrl(s) || isFileUrl(s)) return s;
	return pathToFileURL(resolve(s)).href;
};

export const validateOptions = (options: { url: string }): boolean => {
	return validateUrl(options.url);
};
