import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import toc from "markdown-it-toc-done-right";
import { createHighlighterCore, createJavaScriptRegexEngine } from "shiki";
import githubDark from "shiki/themes/github-dark.mjs";
import bash from "shiki/langs/bash.mjs";
import c from "shiki/langs/c.mjs";
import cpp from "shiki/langs/cpp.mjs";
import css from "shiki/langs/css.mjs";
import diff from "shiki/langs/diff.mjs";
import docker from "shiki/langs/docker.mjs";
import go from "shiki/langs/go.mjs";
import html from "shiki/langs/html.mjs";
import ini from "shiki/langs/ini.mjs";
import java from "shiki/langs/java.mjs";
import javascript from "shiki/langs/javascript.mjs";
import json from "shiki/langs/json.mjs";
import jsx from "shiki/langs/jsx.mjs";
import kotlin from "shiki/langs/kotlin.mjs";
import log from "shiki/langs/log.mjs";
import markdown from "shiki/langs/markdown.mjs";
import php from "shiki/langs/php.mjs";
import powershell from "shiki/langs/powershell.mjs";
import python from "shiki/langs/python.mjs";
import ruby from "shiki/langs/ruby.mjs";
import rust from "shiki/langs/rust.mjs";
import sql from "shiki/langs/sql.mjs";
import svelte from "shiki/langs/svelte.mjs";
import swift from "shiki/langs/swift.mjs";
import tsx from "shiki/langs/tsx.mjs";
import typescript from "shiki/langs/typescript.mjs";
import vue from "shiki/langs/vue.mjs";
import xml from "shiki/langs/xml.mjs";
import yaml from "shiki/langs/yaml.mjs";
import type { FileType, PreviewData } from "./types";

const allLangs = [
	bash,
	c,
	cpp,
	css,
	diff,
	docker,
	go,
	html,
	ini,
	java,
	javascript,
	json,
	jsx,
	kotlin,
	log,
	markdown,
	php,
	powershell,
	python,
	ruby,
	rust,
	sql,
	svelte,
	swift,
	tsx,
	typescript,
	vue,
	xml,
	yaml,
];

let highlighterPromise: ReturnType<typeof createHighlighterCore> | null = null;

export async function getHighlighter() {
	if (!highlighterPromise) {
		highlighterPromise = createHighlighterCore({
			themes: [githubDark],
			langs: allLangs,
			engine: createJavaScriptRegexEngine(),
		});
	}
	return highlighterPromise;
}

export async function renderMarkdown(content: string): Promise<string> {
	const highlighter = await getHighlighter();

	const md = new MarkdownIt({
		html: true,
		linkify: true,
		typographer: true,
		highlight: (code, lang) => {
			try {
				return highlighter.codeToHtml(code, {
					lang: (lang || undefined) as any,
					theme: "github-dark",
				});
			} catch {
				return highlighter.codeToHtml(code, {
					theme: "github-dark",
				});
			}
		},
	});

	md.use(anchor, { permalink: false });
	md.use(toc, { listType: "ul" });

	return md.render(`[[toc]]\n\n${content}`);
}

export function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
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

export function inferType(ext: string): FileType {
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

export function getData(): PreviewData {
	return (
		window.__DATA__ ?? {
			name: "unknown",
			path: "",
			type: "unknown",
		}
	);
}
