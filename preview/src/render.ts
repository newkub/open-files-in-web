import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import toc from "markdown-it-toc-done-right";
import { getHighlighter } from "./shiki";
import type { PreviewData } from "./types";

export { getHighlighter } from "./shiki";

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

export function getData(): PreviewData {
	return (
		window.__DATA__ ?? {
			name: "unknown",
			path: "",
			type: "unknown",
		}
	);
}
