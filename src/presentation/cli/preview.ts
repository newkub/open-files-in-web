import { cp, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { statSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, extname, resolve, dirname, join } from "node:path";
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
			if (statSync(join(current, "package.json")).isFile()) {
				return current;
			}
		} catch {
			// continue up
		}
		current = dirname(current);
	}
	throw new Error("Could not find package root");
}

function inferType(ext: string): FileType {
	const e = ext.toLowerCase().replace(/^\./, "");
	if (e === "md" || e === "markdown") return "markdown";
	if (e === "html" || e === "htm") return "html";
	if (imageExts.has(e)) return "image";
	if (e === "pdf") return "pdf";
	if (e === "csv") return "csv";
	if (e === "json") return "json";
	if (codeExts.has(e)) return "code";
	return "text";
}

function isCompiledExe(): boolean {
	return fileURLToPath(import.meta.url).includes("~BUN");
}

function getDistPreviewDir(): string {
	// Compiled .exe uses a virtual import.meta.url; the real .exe path is in process.execPath.
	if (isCompiledExe()) {
		return resolve(dirname(process.execPath), "preview");
	}
	return resolve(findPackageRoot(dirname(fileURLToPath(import.meta.url))), "dist/preview");
}

export async function previewFile(target: string): Promise<string> {
	const absPath = resolve(target);
	const s = await stat(absPath);
	const isDir = s.isDirectory();
	const ext = isDir ? "" : extname(absPath).toLowerCase().replace(/^\./, "");
	const name = basename(absPath);
	const type: FileType = isDir ? "directory" : inferType(ext);

	const distPreview = getDistPreviewDir();
	const previewDir = resolve(tmpdir(), `open-files-preview-${Date.now()}`);

	await mkdir(previewDir, { recursive: true });
	await cp(distPreview, previewDir, { recursive: true });

	const data: PreviewData = { name, path: absPath, type };

	if (type === "directory") {
		data.items = await readdir(absPath);
	} else if (type === "image" || type === "pdf") {
		const destFile = resolve(previewDir, name);
		await cp(absPath, destFile);
		data.src = `./${encodeURIComponent(name)}`;
	} else {
		data.content = await readFile(absPath, "utf-8");
	}

	const indexPath = resolve(previewDir, "index.html");
	let html = await readFile(indexPath, "utf-8");
	html = html.replace(/ crossorigin/g, "");
	html = html.replace(/ type="module"/g, "");
	html = html.replace(/<script src="(\.\/assets\/[^"]+\.js)"><\/script>/, '<script defer src="$1"></script>');

	const dataScript = `<script>window.__DATA__=${JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e")};</script>`;
	html = html.replace("</head>", `${dataScript}</head>`);

	await writeFile(indexPath, html);
	await open(indexPath);

	return indexPath;
}
