> ![Status](https://img.shields.io/badge/status-in_development-red)

# @wrikka/open-web

Open web pages and documentation in browser — Cross-platform URL opener with browser selection, URL validation, and platform-aware command execution.

![Bun](https://img.shields.io/badge/Bun-1.3.14-000000)
![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2-3178c6)
![Version](https://img.shields.io/badge/version-1.0.0-1976d2)

```text
┌──────────────────────────────────────────────────────────┐
│  open-web                                                │
│  Open web pages and documentation in browser             │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Validate    │  │  Normalize   │  │  Platform    │    │
│  │  URL         │  │  URL         │  │  Detect      │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         └─────────────────┴─────────────────┘            │
│                          │                               │
│                   ┌──────▼───────┐                       │
│                   │  Open URL    │                       │
│                   └──────────────┘                       │
└──────────────────────────────────────────────────────────┘
```

## Get Started

1. Install — `bun add @wrikka/open-web`
   ```bash
   bun add @wrikka/open-web
   ```
2. Build — `bun run build`
   ```bash
   cd apps/cli/open-web && bun run build
   ```
3. Run Dev — `bun run dev`
   ```bash
   bun run dev
   ```
4. Verify — `bun run verify`
   ```bash
   bun run verify
   ```

## Features

| Icon | Feature | Description |
|:---:|---------|-------------|
| ![icon](https://api.iconify.design/mdi:web.svg?color=%231976d2&width=16) | URL Opening | Open any URL in the default browser |
| ![icon](https://api.iconify.design/mdi:check-circle.svg?color=%23388e3c&width=16) | URL Validation | Validate and normalize URLs automatically |
| ![icon](https://api.iconify.design/mdi:google-chrome.svg?color=%23d32f2f&width=16) | Browser Selection | Choose chrome, firefox, safari, or edge |
| ![icon](https://api.iconify.design/mdi:laptop.svg?color=%23f57c00&width=16) | Cross-Platform | Windows, macOS, and Linux support |
| ![icon](https://api.iconify.design/mdi:console.svg?color=%237b1fa2&width=16) | CLI Interface | Command-line tool with commander |
| ![icon](https://api.iconify.design/mdi:link-variant.svg?color=%23c2185b&width=16) | URL Normalization | Auto-prepend https:// if missing |
| ![icon](https://api.iconify.design/mdi:file-document.svg?color=%23009688&width=16) | File & Folder Opening | Open local files and directories as `file://` URLs |
| ![icon](https://api.iconify.design/mdi:eye.svg?color=%23ff9800&width=16) | Rich Preview | SolidJS + TanStack Solid Router previewer for Markdown, code, images, PDFs, CSV, JSON, and more |
| ![icon](https://api.iconify.design/mdi:code-tags.svg?color=%23607d8b&width=16) | Syntax Highlight | Shiki-powered code highlighting with TOC sidebar |
| ![icon](https://api.iconify.design/mdi:font.svg?color=%23e91e63&width=16) | Thai Font | Noto Sans Thai for Thai content |

## Usage

### Usage via CLI

```bash
bunx open-in-open-terminal https://github.com
bunx open-in-open-terminal github.com -b chrome
bunx open-in-open-terminal https://docs.bun.sh -b firefox
```

```text
┌──────────────────────────────────────────────────────────┐
│  $ bunx open-in-open-terminal https://github.com         │
│  Opened: https://github.com                              │
└──────────────────────────────────────────────────────────┘
```

### Open local files and folders

Files and directories are normalized to `file://` URLs and opened with the platform's default handler.

```bash
bunx open-in-open-terminal D:\path\to\file.md
bunx open-in-open-terminal D:\path\to\folder
```

### Preview files with Solid + TanStack

The `preview` subcommand renders Markdown, code, images, PDFs, CSV, JSON, and more in a self-contained HTML preview.

```bash
bunx open-in-open-terminal preview D:\path\to\file.md
```

It copies the preview assets to a temporary directory, starts an embedded HTTP server on `http://localhost:<port>/`, and opens the browser. Use `--no-open` to generate the preview without launching the browser.

### Build standalone .exe

```bash
bun build --compile src/presentation/cli/cli.ts --outfile dist/open-in-open-terminal.exe
```

### Usage via SDK

```bash
bun add @wrikka/open-web
```

```typescript
import { createBrowserAdapter, createOpenUrlUseCase } from '@wrikka/open-web';

const adapter = createBrowserAdapter();
const openUrl = createOpenUrlUseCase(adapter);

const result = await openUrl({
  url: 'https://github.com',
  browser: 'chrome',
});

console.log(result.success, result.message);
```

| api | description | options | default |
|-----|-------------|---------|---------|
| `createOpenUrlUseCase(ports)` | Create URL opener use case | `ports`: browser adapter | — |
| `openUrl({ url, browser })` | Open URL in browser | `url`, `browser`: chrome, firefox, safari, edge, default | `browser=default` |
