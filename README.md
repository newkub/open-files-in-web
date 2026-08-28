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
