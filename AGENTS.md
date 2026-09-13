---
name: open-files-in-web
description: Standalone skill for opening local files and URLs in a web browser preview
related:
  - open
  - open-in-devin
  - idea
  - create-files-in-os-temp
  - visualize-in-web
  - report
  - create-mermaid-diagram
  - create-report-in-dot-devin
  - report-uxui-sketch
  - draw-svg-image
  - run-build
  - use-bun-native-api
---

## Goal

Agent guidance for the `open-files-in-web` skill workspace.

## Scope

This workspace is a standalone Bun/TypeScript package that provides the `open-in-open-terminal` CLI. It opens URLs, local files, and directories in the browser, and can render Markdown, code, CSV, JSON, images, PDFs, and directories as a SolidJS + TanStack Solid Router preview.

## Execute

Run the following scripts from the workspace root:

| Script | Command |
|---|---|
| `dev` | `bun run src/index.ts` |
| `build` | `bun run build` (build:preview + build:cli + build:compile) |
| `build:preview` | `bunx vite build --config preview/vite.config.ts` |
| `build:cli` | `bun build src/index.ts src/presentation/cli/cli.ts --outdir dist --target bun --external open && tsc --emitDeclarationOnly` |
| `build:compile` | `bun build --compile src/presentation/cli/cli.ts --outfile dist/open-in-open-terminal.exe` |
| `build:watch` | `bunup --watch` |
| `typecheck` | `tsc --noEmit` |
| `typecheck:watch` | `tsc --noEmit --watch` |
| `test` | `bun test` |
| `test:watch` | `bun test --watch` |
| `verify` | `bun run typecheck && bun run test && bun run build` |
| `deps:analyze` | `bunx depcheck` |
| `clean` | `bunx rimraf node_modules dist` |

### Architecture

| Tech | Skill |
|---|---|
| typescript | `tech: /follow-lang-typescript` |
| bun | `tech: /use-bun-native-api` |
| vite | `tech: /follow-tool-vite` |

## Rules

- Keep `SKILL.md` under 250 lines.
- Map tech stack with `tech: /follow-<skill>`.
- Do not duplicate root conventions.
- Default preview mode is static single-file HTML (no HTTP server); use `--serve` to start a server.
- Image/PDF resources are embedded as base64 data URLs in static mode.
- Directory navigation uses hash-based client routing in static mode.
- The compiled `.exe` expects a `preview/` directory next to it.
- Global Windows command shims live in `~/.bun/bin`: `open-in-open-terminal.cmd`, `ofw.cmd`, `open-files.cmd`.

## Expected Outcome

- `open-files-in-web` AGENTS.md is accurate and committed.

