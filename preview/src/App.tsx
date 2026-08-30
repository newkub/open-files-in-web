import { createResource, Show } from "solid-js";
import { getData, renderMarkdown } from "./render";
import {
	CodeViewer,
	CsvTable,
	DirectoryList,
	HtmlViewer,
	ImageViewer,
	JsonTree,
	PdfViewer,
	TextViewer,
	UnknownViewer,
} from "./viewers";
import "./styles.css";

interface MarkdownResult {
	content: string;
	toc: string;
}

function App() {
	const data = getData();

	const [markdown] = createResource(
		() => (data.type === "markdown" ? data.content : null),
		async (content) => {
			const raw = await renderMarkdown(content ?? "");
			const doc = new DOMParser().parseFromString(raw, "text/html");
			const toc =
				doc.querySelector("nav.table-of-contents") ||
				doc.querySelector(".toc") ||
				doc.querySelector(".table-of-contents");
			const tocHtml = toc?.outerHTML ?? "";
			if (toc) toc.remove();
			return { content: doc.body.innerHTML, toc: tocHtml } as MarkdownResult;
		},
	);

	return (
		<div class="app">
			<header class="header">
				<h1>{data.name}</h1>
				<span class="meta">
					{data.type} — {data.path}
				</span>
			</header>
			<main class="main">
				<Show when={data.type === "markdown" && markdown()?.toc}>
					<aside class="toc" prop:innerHTML={markdown()?.toc ?? ""} />
				</Show>
				<article class={`content type-${data.type}`}>
					{data.type === "markdown" && (
						<Show
							when={!markdown.loading}
							fallback={<div class="loading">Rendering markdown...</div>}
						>
							<div class="markdown-body" prop:innerHTML={markdown()?.content ?? ""} />
						</Show>
					)}
					{data.type === "code" && <CodeViewer data={data} />}
					{data.type === "html" && <HtmlViewer data={data} />}
					{data.type === "image" && <ImageViewer data={data} />}
					{data.type === "pdf" && <PdfViewer data={data} />}
					{data.type === "csv" && <CsvTable data={data} />}
					{data.type === "json" && <JsonTree data={data} />}
					{data.type === "text" && <TextViewer data={data} />}
					{data.type === "directory" && <DirectoryList data={data} />}
					{data.type === "unknown" && <UnknownViewer data={data} />}
				</article>
			</main>
		</div>
	);
}

export default App;
