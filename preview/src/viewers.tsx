import { For, Show, createResource } from "solid-js";
import { getHighlighter, escapeHtml, renderMarkdown } from "./render";
import type { PreviewData } from "./types";

export function MarkdownViewer(props: { data: PreviewData }) {
	const [html] = createResource(
		() => props.data.content,
		async (content) => renderMarkdown(content ?? ""),
	);

	return (
		<Show when={!html.loading} fallback={<div class="loading">Rendering markdown...</div>}>
			<div class="markdown-body" prop:innerHTML={html() ?? ""} />
		</Show>
	);
}

export function CodeViewer(props: { data: PreviewData }) {
	const [html] = createResource(
		() => props.data,
		async (data) => {
			const highlighter = await getHighlighter();
			try {
				return highlighter.codeToHtml(data.content ?? "", {
					lang: data.ext || "text",
					theme: "github-dark",
				});
			} catch {
				return `<pre class="shiki"><code>${escapeHtml(data.content ?? "")}</code></pre>`;
			}
		},
	);

	return (
		<Show when={!html.loading} fallback={<pre class="text-content">{props.data.content}</pre>}>
			<div class="code-viewer" prop:innerHTML={html() ?? ""} />
		</Show>
	);
}

export function HtmlViewer(props: { data: PreviewData }) {
	return (
		<iframe
			srcdoc={props.data.content}
			title={props.data.name}
			class="html-frame"
			sandbox="allow-scripts"
		/>
	);
}

export function ImageViewer(props: { data: PreviewData }) {
	return <img src={props.data.src} alt={props.data.name} class="image-viewer" />;
}

export function PdfViewer(props: { data: PreviewData }) {
	return <iframe src={props.data.src} title={props.data.name} class="pdf-frame" />;
}

export function CsvTable(props: { data: PreviewData }) {
	const rows = () =>
		(props.data.content ?? "")
			.split("\n")
			.map((line) => line.split(",").map((cell) => cell.trim()));

	return (
		<table class="csv-table">
			<For each={rows()}>
				{(row, index) => (
					<tr>
						<For each={row}>
							{(cell) => (
								<Show when={index() === 0} fallback={<td>{cell}</td>}>
									<th>{cell}</th>
								</Show>
							)}
						</For>
					</tr>
				)}
			</For>
		</table>
	);
}

export function JsonTree(props: { data: PreviewData }) {
	const formatted = () => {
		try {
			return JSON.stringify(
				JSON.parse(props.data.content ?? "{}"),
				null,
				2,
			);
		} catch {
			return props.data.content ?? "";
		}
	};
	return <pre class="json-content">{formatted()}</pre>;
}

export function TextViewer(props: { data: PreviewData }) {
	return <pre class="text-content">{props.data.content}</pre>;
}

export function DirectoryList(props: { data: PreviewData }) {
	return (
		<ul class="directory-list">
			<For each={props.data.items ?? []}>
				{(item) => <li>{item}</li>}
			</For>
		</ul>
	);
}

export function UnknownViewer(props: { data: PreviewData }) {
	return (
		<div class="unknown-viewer">
			<p>Cannot preview <strong>{props.data.name}</strong>.</p>
			<p>Type: {props.data.type}</p>
		</div>
	);
}
