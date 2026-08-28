---
name: @wrikka/open-web
description: Workspace @wrikka/open-web
related:
  - follow-create-devin-skills
  - follow-skills-map
  - improve-codebase
  - optimize-codebase
  - ask-me
---

## Goal

Agent guidance for the `@wrikka/open-web` workspace.

## Scope

This workspace lives in `apps/cli/open-web` within the monorepo.

## Execute

Run the following scripts from `apps/cli/open-web`:

| Script | Command |
|---|---|
| `dev` | `bun run src/index.ts` |
| `build` | `bunup` |
| `build:watch` | `bunup --watch` |
| `typecheck` | `tsgo --noEmit` |
| `typecheck:watch` | `tsgo --noEmit --watch` |
| `lint` | `biome check` |
| `lint:fix` | `biome check --write` |
| `format` | `biome check --write` |
| `test` | `vitest run` |
| `test:watch` | `vitest` |
| `test:coverage` | `vitest run --coverage` |
| `test:integration` | `vitest run --config vitest.integration.config.ts` |
| `test:e2e` | `vitest run --config vitest.e2e.config.ts` |
| `scan` | `ast-grep scan` |
| `check` | `bun run lint && bun run typecheck && bun run scan` |
| `verify` | `bun run check && bun run test && bun run build` |
| `deps:analyze` | `bunx depcheck` |
| `clean` | `bunx rimraf node_modules dist` |
| `security` | `bunx audit` |
| `bench` | `bunx mitata` |
| `prerelease` | `bun run build` |
| `release` | `auto-it` |

Moon tasks: `bench, build, build-watch, check, clean, deps-analyze, dev, format, lint, lint-fix, prerelease, release, scan, security, test, test-coverage, test-e2e, test-integration, test-watch, typecheck, typecheck-watch, verify`

### Architecture

| Tech | Skill |
|---|---|
| (external) | `tech: /learn-from-web` |
| typescript | `tech: /follow-typescript` |
| bunup | `tech: /follow-bunup` |
| vitest | `tech: /follow-vitest` |

### Skills

- follow-create-devin-skills
- follow-skills-map
- improve-codebase
- optimize-codebase
- ask-me

### Workspaces

- uses: `@wrikka/create-cli` (`apps/cli/create-cli`)
- uses: `@wrikka/default-config` (`packages/lib/default-config`)

## Rules

- Keep under 250 lines.
- Map tech stack with `tech: /follow-<skill>`.
- Map workspace dependencies in `uses:`.
- Do not duplicate root conventions.

## Expected Outcome

- `@wrikka/open-web` AGENTS.md is accurate and committed.
