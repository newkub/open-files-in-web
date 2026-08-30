import { cp, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { statSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import open from "open";

type FileType =
	| "markdown"
	| "code"
	| "html"
	| "image"
	| "pdf"
	| "csv"
	| "json"
	| "text"
	| "directory"
	| "unknown";

interface PreviewData {
	name: string;
	path: string;
	type: FileType;
	ext?: string;
	content?: string;
	src?: string;
	items?: string[];
}

const imageExts = new Set([
	"png",
	"jpg",
	"jpeg",
	"gif",
	"bmp",
	"webp",
	"svg",
	"ico",
]);

const codeExts = new Set([
	"js",
	"ts",
	"tsx",
	"jsx",
	"rs",
	"py",
	"go",
	"c",
	"cpp",
	"h",
	"hpp",
	"java",
	"php",
	"rb",
	"swift",
	"kt",
	"sh",
	"bash",
	"ps1",
	"psm1",
	"css",
	"scss",
	"sass",
	"less",
	"xml",
	"sql",
	"log",
	"ini",
	"cfg",
	"conf",
	"dockerfile",
	"vue",
	"svelte",
]);

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

const EXTENSION_TYPE_MAP: Record<string, FileType> = {
	md: "markdown",
	markdown: "markdown",
	html: "html",
	htm: "html",
	pdf: "pdf",
	csv: "csv",
	json: "json",
};

export function inferType(ext: string): FileType {
	const e = ext.toLowerCase().replace(/^\./, "");
	return (
		EXTENSION_TYPE_MAP[e] ??
		(imageExts.has(e) ? "image" : codeExts.has(e) ? "code" : "text")
	);
}

function isCompiledExe(): boolean {
	return fileURLToPath(import.meta.url).includes("~BUN");
}

function getDistPreviewDir(): string {
	if (isCompiledExe()) {
		return resolve(dirname(process.execPath), "preview");
	}
	return resolve(findPackageRoot(dirname(fileURLToPath(import.meta.url))), "dist/preview");
}

function toRawUrl(baseDir: string, targetPath: string): string {
	const rel = relative(baseDir, targetPath).replace(/\\/g, "/");
	const parts = rel
		.split("/")
		.filter(Boolean)
		.map((p) => encodeURIComponent(p));
	return "./raw/" + parts.join("/");
}

async function buildPreviewData(targetPath: string, baseDir: string): Promise<PreviewData> {
	const s = await stat(targetPath);
	const isDir = s.isDirectory();
	const ext = isDir ? "" : extname(targetPath).toLowerCase().replace(/^\./, "");
	const name = basename(targetPath);
	const type: FileType = isDir ? "directory" : inferType(ext);
	const data: PreviewData = { name, path: targetPath, type, ext };

	if (type === "directory") {
		data.items = await readdir(targetPath);
	} else if (type === "image" || type === "pdf") {
		data.src = toRawUrl(baseDir, targetPath);
	} else {
		data.content = await readFile(targetPath, "utf-8");
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

interface PreviewOptions {
	noOpen?: boolean;
}

export async function previewFile(target: string, options: PreviewOptions = {}): Promise<string> {
	const absPath = resolve(target);
	const s = await stat(absPath);
	const isDir = s.isDirectory();
	const baseDir = isDir ? absPath : dirname(absPath);

	const distPreview = getDistPreviewDir();
	const previewDir = resolve(tmpdir(), `open-files-preview-${Date.now()}`);

	await mkdir(previewDir, { recursive: true });
	await cp(distPreview, previewDir, { recursive: true });

	const data = await buildPreviewData(absPath, baseDir);

	const indexPath = resolve(previewDir, "index.html");
	let html = await readFile(indexPath, "utf-8");
	html = html.replace(/ crossorigin/g, "");
	html = html.replace(/ type="module"/g, "");
	html = html.replace(/<script src="(\.\/assets\/[^"]+\.js)"><\/script>/, '<script defer src="$1"></script>');
	html = injectDataScript(html, data);

	await writeFile(indexPath, html);

	if (options.noOpen) {
		return indexPath;
	}

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
						const subData = await buildPreviewData(targetPath, baseDir);
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
	await open(serverUrl);

	return serverUrl;
}
