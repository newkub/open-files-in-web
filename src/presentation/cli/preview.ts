import { cp, mkdir, readdir, stat } from "node:fs/promises";
import { statSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, extname, relative, resolve } from "node:path";
import open from "open";
import { inferType, type FileType, type PreviewData } from "./file-types";

export { inferType };
export type { FileType, PreviewData };

const MAX_DEPTH = 4;
const MAX_ITEMS_PER_DIR = 500;
const MAX_TEXT_SIZE = 1024 * 1024; // 1 MB
const MAX_SRC_SIZE = 4 * 1024 * 1024; // 4 MB for images/pdfs

function findPackageRoot(start: string): string {
	let current = start;
	while (current !== dirname(current)) {
		try {
			if (statSync(resolve(current, "package.json")).isFile()) {
				return current;
			}
		} catch {
			// continue up
		}
		current = dirname(current);
	}
	throw new Error("Could not find package root");
}

function isCompiledExe(): boolean {
	return import.meta.path.includes("~BUN");
}

function getDistPreviewDir(): string {
	if (isCompiledExe()) {
		return resolve(dirname(process.execPath), "preview");
	}
	return resolve(findPackageRoot(dirname(import.meta.path)), "dist/preview");
}

function toRawUrl(baseDir: string, targetPath: string): string {
	const rel = relative(baseDir, targetPath).replace(/\\/g, "/");
	const parts = rel
		.split("/")
		.filter(Boolean)
		.map((p) => encodeURIComponent(p));
	return "./raw/" + parts.join("/");
}

function mimeForFile(ext: string): string {
	switch (ext.toLowerCase()) {
		case "png":
			return "image/png";
		case "jpg":
		case "jpeg":
			return "image/jpeg";
		case "gif":
			return "image/gif";
		case "webp":
			return "image/webp";
		case "svg":
			return "image/svg+xml";
		case "bmp":
			return "image/bmp";
		case "ico":
			return "image/x-icon";
		case "pdf":
			return "application/pdf";
		default:
			return "application/octet-stream";
	}
}

async function toBase64Src(targetPath: string, ext: string): Promise<string | undefined> {
	try {
		const s = await stat(targetPath);
		if (!s.isFile() || s.size > MAX_SRC_SIZE) return undefined;
		const content = await Bun.file(targetPath).arrayBuffer();
		return `data:${mimeForFile(ext)};base64,${Buffer.from(content).toString("base64")}`;
	} catch {
		return undefined;
	}
}

function shouldReadAsText(type: FileType, size: number): boolean {
	if (type === "image" || type === "pdf") return false;
	return size <= MAX_TEXT_SIZE;
}

interface BuildOptions {
	baseDir: string;
	depth?: number;
	static?: boolean;
}

async function buildPreviewData(
	targetPath: string,
	options: BuildOptions,
): Promise<PreviewData> {
	const { baseDir, depth = 0, static: isStatic = false } = options;
	const s = await stat(targetPath);
	const isDir = s.isDirectory();
	const ext = isDir ? "" : extname(targetPath).toLowerCase().replace(/^\./, "");
	const name = basename(targetPath);
	const type: FileType = isDir ? "directory" : inferType(ext);
	const data: PreviewData = { name, path: targetPath, type, ext };

	if (type === "directory") {
		const items = (await readdir(targetPath)).slice(0, MAX_ITEMS_PER_DIR);
		data.items = items;

		if (isStatic && depth < MAX_DEPTH) {
			const children: Record<string, PreviewData> = {};
			for (const item of items) {
				const childPath = resolve(targetPath, item);
				try {
					children[item] = await buildPreviewData(childPath, {
						baseDir,
						depth: depth + 1,
						static: true,
					});
				} catch {
					// skip unreadable children
				}
			}
			data.children = children;
		}
	} else if (type === "image" || type === "pdf") {
		if (isStatic) {
			data.src = await toBase64Src(targetPath, ext);
		} else {
			data.src = toRawUrl(baseDir, targetPath);
		}
	} else if (shouldReadAsText(type, s.size)) {
		try {
			data.content = await Bun.file(targetPath).text();
		} catch {
			data.type = "unknown";
		}
	} else {
		data.type = "unknown";
	}

	return data;
}

function injectDataScript(html: string, data: PreviewData): string {
	const script = `<script>window.__DATA__=${JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e")};</script>`;
	const existing = /<script>window\.__DATA__=[\s\S]*?<\/script>/;
	if (existing.test(html)) {
		return html.replace(existing, script);
	}
	return html.replace("</head>", `${script}</head>`);
}

async function inlineBundle(html: string, assetsDir: string, outPath: string): Promise<void> {
	let result = html;

	// Strip module/crossorigin attributes so the HTML works from file://
	result = result.replace(/ crossorigin/g, "");
	result = result.replace(/ type="module"/g, "");

	// Inline CSS if present
	const cssMatches = [...result.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="\.\/assets\/([^"]+)"[^>]*>/g)];
	for (const match of cssMatches) {
		const cssFile = resolve(assetsDir, match[1]);
		try {
			const css = await Bun.file(cssFile).text();
			result = result.replace(match[0], `<style>${css.replace(/<\/style>/gi, "<\\/style>")}</style>`);
		} catch {
			// leave as-is
		}
	}

	// Inline JS
	const jsMatch = result.match(/<script[^>]*src="\.\/assets\/([^"]+\.js)"[^>]*>\s*<\/script>/);
	if (jsMatch) {
		const jsFile = resolve(assetsDir, jsMatch[1]);
		const jsContent = await Bun.file(jsFile).text();
		const safeContent = jsContent.replace(/<\/script>/gi, "<\\/script>");
		const tag = `<script>${safeContent}</script>`;
		result = result.replace(jsMatch[0], tag);
	}

	await Bun.write(outPath, result);
}

interface PreviewOptions {
	noOpen?: boolean;
	serve?: boolean;
}

export async function previewFile(target: string, options: PreviewOptions = {}): Promise<string> {
	const absPath = resolve(target);
	const s = await stat(absPath);
	const isDir = s.isDirectory();
	const baseDir = isDir ? absPath : dirname(absPath);

	const distPreview = getDistPreviewDir();
	const previewDir = resolve(tmpdir(), `open-files-preview-${Date.now()}`);

	await mkdir(previewDir, { recursive: true });

	const staticMode = !options.serve;
	const data = await buildPreviewData(absPath, { baseDir, static: staticMode });

	if (staticMode) {
		// Single self-contained HTML file, no server needed
		const assetsDir = resolve(distPreview, "assets");
		const indexPath = resolve(previewDir, "index.html");
		const distIndexPath = resolve(distPreview, "index.html");
		let html = await Bun.file(distIndexPath).text();
		html = html.replace(/ crossorigin/g, "");
		html = html.replace(/<script[^>]*src="\.\/assets\/[^"]+"[^>]*>\s*<\/script>/, (m) => {
			// keep the tag as-is for inlineBundle to find
			return m.replace(" type=\"module\"", "").replace(" crossorigin", "");
		});
		html = injectDataScript(html, data);
		await inlineBundle(html, assetsDir, indexPath);

		if (options.noOpen) {
			return indexPath;
		}

		const fileUrl = "file://" + indexPath.replace(/\\/g, "/");
		await open(fileUrl);
		return indexPath;
	}

	// Server mode (legacy, for large directories or dynamic raw access)
	await cp(distPreview, previewDir, { recursive: true });

	const indexPath = resolve(previewDir, "index.html");
	let html = await Bun.file(indexPath).text();
	html = html.replace(/ crossorigin/g, "");
	html = html.replace(/ type="module"/g, "");
	html = html.replace(/<script src="(\.\/assets\/[^"]+\.js)"><\/script>/, '<script defer src="$1"></script>');
	html = injectDataScript(html, data);
	await Bun.write(indexPath, html);

	const server = Bun.serve({
		port: 0,
		async fetch(req) {
			const url = new URL(req.url);

			if (url.pathname.startsWith("/raw/")) {
				const rawName = decodeURIComponent(url.pathname.slice(5));
				const rawPath = resolve(baseDir, rawName);
				if (!rawPath.startsWith(baseDir)) {
					return new Response("not allowed", { status: 403 });
				}
				const file = Bun.file(rawPath);
				if (!(await file.exists())) {
					return new Response("not found", { status: 404 });
				}
				return new Response(file);
			}

			if (url.pathname === "/") {
				const subPath = url.searchParams.get("path");
				if (subPath) {
					const targetPath = resolve(baseDir, subPath);
					if (!targetPath.startsWith(baseDir)) {
						return new Response("not allowed", { status: 403 });
					}
					try {
						const subData = await buildPreviewData(targetPath, { baseDir, static: false });
						const subHtml = injectDataScript(html, subData);
						return new Response(subHtml, { headers: { "Content-Type": "text/html" } });
					} catch {
						return new Response("not found", { status: 404 });
					}
				}
				const file = Bun.file(indexPath);
				return new Response(file);
			}

			const fileName = decodeURIComponent(url.pathname.slice(1));
			const filePath = resolve(previewDir, fileName);
			if (!filePath.startsWith(previewDir)) {
				return new Response("not allowed", { status: 403 });
			}
			const file = Bun.file(filePath);
			if (!(await file.exists())) {
				return new Response("not found", { status: 404 });
			}
			return new Response(file);
		},
	});

	const serverUrl = server.url.href;

	const stop = () => {
		try {
			server.stop(true);
		} catch {
			// already stopped
		}
	};

	process.on("SIGINT", stop);
	process.on("SIGTERM", stop);
	process.on("exit", stop);

	console.log(`Preview server: ${serverUrl}`);

	if (options.noOpen) {
		return serverUrl;
	}

	await open(serverUrl);

	return serverUrl;
}
