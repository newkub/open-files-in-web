---
name: open-files-in-web
description: Open a file, directory, or URL in a web browser with a CLI plus preview
argument-hint: "[path-or-url] | preview [path]"
related:
  - open-in-devin
  - idea
  - create-files-in-os-temp
  - visualize-in-web
  - report
  - create-mermaid-diagram
  - create-report-in-dot-devin
  - report-uxui
  - draw-svg-image
  - run-build

---

## Goal

Open a file, directory, or URL in a web browser — local paths are converted into a self-contained HTML preview then opened via `file://` without starting a server

## Scope

- Works with files, directories, or URLs you want to preview in a browser
- Supports `file://` URLs, plain files, markdown, code files, csv, json, html, image, pdf, and directories
- Uses a SolidJS + TanStack Solid Router previewer with TOC, syntax highlight, and Noto Sans Thai
- Can be built into a standalone `.exe`
- Global commands: `open-in-open-terminal`, `ofw`, `open-files` in `~/.bun/bin`
- Not for opening websites directly — use `/open-web` for a plain URL
- See also for related skills: `/open-in-devin`, `/idea-features`, `/create-files-in-os-temp`, `/visualize-in-web`, `/report html`, `/create-mermaid-diagram`, `/create-report-in-dot-devin`, `/report-uxui`, `/draw-svg-image`, `/run-build`

## Execute

### 1. Prepare

> Goal: Check the workspace and target

1. Read `AGENTS.md` to learn the project conventions
2. Identify the target: a file, directory, or URL
3. Verify the target exists and is accessible
4. Check that `open-files-in-web/` has the complete CLI source

### 2. Build Open-Web CLI

> Goal: Build the CLI

1. cd into `open-files-in-web/`
2. Run `bun install` to install dependencies
3. Run `bun run build` (=`build:preview` + `build:cli` + `build:compile`) to produce `dist/preview`, `dist/presentation/cli/cli.js`, `dist/open-in-open-terminal.exe`, and `dist/ofw.exe`
4. If the build fails → do `/resolve-errors` then retry up to 3 times
5. Use `bun run verify` to run typecheck + test + build in one pass (per `package.json` scripts, verified 2026-09-12)
6. cd back to the skills directory

### 3. Open URL Or Local Path

> Goal: Open a URL, local file, or directory in a browser

1. If the target is a URL (`http://`, `https://`, `file://`) → open it directly in a browser
2. If the target is an existing absolute/relative file or directory → generate a static HTML preview and open it via `file://`
3. Use any of these commands:
   - `bun dist/presentation/cli/cli.js <path-or-url>`
   - `dist/open-in-open-terminal.exe <path-or-url>`
   - `dist/ofw.exe <path-or-url>`
   - `ofw <path-or-url>` (global alias)
   - `open-files <path-or-url>` (global alias)
4. CLI options (`commander` ^15.0.0, verified 2026-09-12): `-b, --browser <browser>` (`chrome`/`firefox`/`safari`/`edge`/`default`), `-s, --serve`, `--no-open`

### 4. Preview Local Files (Static-First)

> Goal: Render files as an HTML preview before opening

1. Use a bare argument or the explicit `preview` subcommand:
   - `ofw <path>`
   - `ofw preview <path>`
2. By default it creates a single self-contained HTML file in the temp directory, inlines JS/CSS, embeds images/pdfs as base64 data URLs, then opens via `file://`
3. No HTTP server needed for normal usage
4. Use `--serve` to enable HTTP server mode (for large files or raw access needs)
5. Use `--no-open` to generate the preview without opening a browser
6. Supports markdown, code, image, pdf, csv, json, html, and directories
7. Directory previews can open child files/folders via hash-based navigation (`#/child/path`) in static mode

### 5. Build Standalone .exe

> Goal: Produce an executable usable without bun

1. `bun run build` automatically creates `dist/open-in-open-terminal.exe` and `dist/ofw.exe`
2. Use the `.exe` to open files or previews immediately
3. The compiled `.exe` locates its preview assets in the adjacent `dist/preview`

### 6. Global Shims

> Goal: Make the CLI callable from anywhere

1. `open-in-open-terminal.cmd`, `ofw.cmd`, and `open-files.cmd` are created in `~/.bun/bin/`
2. The shims point to `dist/open-in-open-terminal.exe` or `dist/ofw.exe` in `open-files-in-web/`
3. Verify `~/.bun/bin` is on the `PATH`

### 7. Verify And Report

> Goal: Confirm the open succeeded with no errors

1. Check the process exit code
2. If there are errors → do `/resolve-errors`
3. Do `/report-before-after` summarizing the target and the URL opened
4. Do `/suggest-next-action` to recommend the next step

## Rules

### 1. Build First

- Build before first use or after a pull/clone
- `bun install` must pass before `bun run build`

### 2. URL Safety

- Verify the path exists before converting it to `file://`
- Do not open files from risky system paths without user confirmation
- Use `file://` for local files; do not pass raw paths to the browser unless necessary

### 3. Fallback

- If the CLI is not built yet or fails → fall back to `open`, `start`, `xdg-open`
- If a file cannot be rendered → open it raw with `file://`

### 4. Preview Output

- The preview creates temporary files in `os.tmpdir()`
- The default is a static single-file HTML (no HTTP server)
- Images/pdfs in static mode are embedded as base64 data URLs
- `--serve` starts an HTTP server at `http://localhost:<port>/` and opens that URL
- `--no-open` generates the preview but does not open a browser

## Expected Outcome

- The browser opens the target as requested
- The CLI and `.exe` work
- No broken references after the build
- A report of the target and the URL used
- A clear next action after use
