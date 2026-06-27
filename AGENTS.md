# Agent Guidelines: preapexis-pi-kit

## Project Summary

`preapexis-pi-kit` is a personal Pi coding-agent package that bundles TypeScript extensions, prompt templates, reusable skills, and UI themes for the [Pi Agent Harness](https://github.com/earendil-works/pi). It adds safety guards, status displays, prompt workflows, and custom branding to AI-assisted coding sessions.

Published to npm as `@preapexis/pi-kit`.

## Tech Stack

- **Language:** TypeScript (ES2022, NodeNext module resolution)
- **Runtime:** Node.js
- **Test runner:** Vitest
- **Package manager:** npm
- **Peer dependency:** `@earendil-works/pi-coding-agent`

## Project Map

| Path               | Purpose                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| `AGENTS.md`        | Core rules and guidance for agents working in this repository. Read this first before any edit.           |
| `README.md`        | Public documentation, installation instructions, and usage guide.                                         |
| `package.json`     | Pi package manifest. Declares `pi.extensions`, `pi.prompts`, `pi.skills`, and `pi.themes`.                |
| `CHANGELOG.md`     | Version history and release notes.                                                                        |
| `LICENSE`          | ISC license.                                                                                              |
| `settings.json`    | Local Pi settings (`theme`, `defaultProjectTrust`). Not published as part of the package manifest.        |
| `tsconfig.json`    | TypeScript configuration covering `extensions/**/*.ts`, `tests/**/*.ts`, and `vitest.config.ts`.          |
| `vitest.config.ts` | Vitest test runner configuration (Node environment, globals enabled).                                     |
| `extensions/`      | TypeScript Pi extensions. Each file exports a default function receiving `ExtensionAPI`.                  |
| `prompts/`         | Markdown prompt templates. The filename (without `.md`) becomes a slash command.                          |
| `skills/`          | Reusable skills. Each skill lives in its own subfolder containing a `SKILL.md` with frontmatter.          |
| `themes/`          | JSON theme files for Pi UI. Each file must have `name`, `vars`, `colors`, and `$schema`.                  |
| `tests/`           | Vitest test suite validating package structure, extension syntax, prompt conventions, skills, and themes. |
| `scripts/`         | Development helper scripts. Currently contains `git-release.mjs`.                                         |
| `docs/`            | Project documentation. `docs/plans/` is the target directory for `/save-plan`.                            |

## Common Task Map

| Task                        | Read These Files First                                                                        |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| Change branding/UI          | `extensions/brand-ui.ts`, `themes/`                                                           |
| Change update behavior      | `extensions/update.ts`                                                                        |
| Change safety behavior      | `extensions/safety.ts`, `extensions/git-guard.ts`, `extensions/workspace-guard.ts`            |
| Change footer/status        | `extensions/status.ts`, `extensions/usage-tracker.ts`                                         |
| Change prompt workflows     | `extensions/prompts.ts`, `prompts/`                                                           |
| Change sound cues           | `extensions/sound-cues.ts`                                                                    |
| Change workspace boundaries | `extensions/workspace-guard.ts`                                                               |
| Add a new extension         | `AGENTS.md` (Extension Rules), `tests/extensions.test.ts`, then create `extensions/<name>.ts` |
| Add a new prompt            | `AGENTS.md` (Prompt Rules), `tests/prompts.test.ts`, then create `prompts/<name>.md`          |
| Add a new skill             | `AGENTS.md` (Skill Rules), `tests/skills.test.ts`, then create `skills/<name>/SKILL.md`       |
| Add a new theme             | `tests/themes.test.ts`, then create `themes/<name>.json`                                      |
| Release a new version       | `scripts/git-release.mjs`, `package.json`, `CHANGELOG.md`, `.github/workflows/publish.yml`    |

## Development Commands

| Command              | Purpose                                                                        |
| -------------------- | ------------------------------------------------------------------------------ |
| `npm test`           | Run the full Vitest test suite (structure, syntax, and validation tests).      |
| `npm run test:watch` | Run Vitest in watch mode.                                                      |
| `npm run git`        | Run the interactive git-release script (bumps version, commits, tags, pushes). |
| `pi install -l .`    | Install this package locally into Pi for development testing.                  |
| `/reload`            | Reload Pi after installing, updating, or changing extensions.                  |

## Coding Conventions

- **Language:** TypeScript with strict mode enabled.
- **Module system:** ES modules (`"type": "module"`), NodeNext resolution.
- **Extension pattern:** Each extension exports a default function receiving `ExtensionAPI`.
- **Naming:** Use clear, explicit names. Prefer `kebab-case` for filenames.
- **Error handling:** Extensions use `ctx.hasUI` checks before UI operations; fall back to `console.log` or blocking when UI is unavailable.
- **Testing:** Tests are in `tests/` using Vitest. Tests validate structural constraints (default exports, frontmatter, valid JSON) rather than deep behavioral logic.
- **Dependencies:** Do not add dependencies unless explicitly approved. The package has no runtime dependencies; only `typescript` and `vitest` as devDependencies.
- **Comments:** Avoid comments that only repeat the code. Use JSDoc for extension-level documentation.

## Safety Rules

Agents must avoid:

- reading or editing `.env` files
- editing `.git`
- editing `node_modules`
- editing build output such as `dist`, `build`, `out`, or `coverage`
- changing lockfiles unless the user approves
- running package install/remove commands unless the user approves
- running destructive Git commands (`git push --force`, `git reset --hard`, `git clean -fd`)
- running destructive shell commands
- running commands that leave the workspace without approval

Before risky edits, check whether the repo is dirty. Avoid overwriting user work.

The `scripts/git-release.mjs` script performs `git push` and may create tags; review its behavior before running in a dirty worktree.

## Architecture Notes

- **Extension API:** All extensions consume `@earendil-works/pi-coding-agent`'s `ExtensionAPI`. They hook into lifecycle events (`session_start`, `before_agent_start`, `tool_call`, `agent_end`) and register slash commands.
- **System prompt injection:** `safety.ts`, `workspace-guard.ts`, and potentially other extensions append rules to the agent system prompt via `before_agent_start`.
- **UI availability:** Extensions must check `ctx.hasUI` before calling `ctx.ui.notify`, `ctx.ui.confirm`, `ctx.ui.select`, or `ctx.ui.setStatus`.
- **Workspace boundary:** `workspace-guard.ts` locks the workspace root at `session_start` and blocks tool calls targeting outside paths.
- **Git checkpointing:** `git-guard.ts` creates `pi-checkpoint-<branch>-<timestamp>` branches before risky edits when the working tree is dirty.
- **Separation of concerns:**
  - Git branch display belongs in `git-guard.ts`.
  - Model, mode, repo trust, and test status belong in `status.ts`.
  - Risky non-Git shell command protection belongs in `safety.ts`.
  - Prompt menu belongs in `prompts.ts`.

## Agent Rules

### Core Rules

- Keep changes small, focused, and reviewable.
- Read existing files before editing them.
- Preserve existing behavior unless explicitly asked to change it.
- Match the style already used in the repo.
- Do not add dependencies unless explicitly approved.
- Do not delete files unless explicitly approved.
- Do not rewrite Git history.
- Do not edit secrets, `.env` files, `.git`, build output, or generated files.

### Package Structure Rules

The Pi package should continue to use this structure:

```txt
preapexis-pi-kit/
  package.json
  README.md
  LICENSE
  AGENTS.md
  extensions/
  prompts/
  skills/
  themes/
```

Each skill must live in its own folder:

```txt
skills/
  safe-coding/
    SKILL.md
  component-implementation/
    SKILL.md
  frontend-onboarding/
    SKILL.md
  frontend-quality/
    SKILL.md
```

Do not place skill files directly inside `skills/` unless Pi explicitly supports that format.

### Extension Rules

Current expected extensions:

- `safety.ts` — general safety protection.
- `git-guard.ts` — Git-specific safety.
- `status.ts` — footer/status display.
- `prompts.ts` — `/prompts` menu.
- `brand-ui.ts` — custom UI branding.

Avoid duplicate responsibilities (see Architecture Notes).

Do not reintroduce duplicate `/plan`, `/commit`, `/security`, or similar commands in extensions if matching prompt files already exist.

### Prompt Rules

Prompt files live in `prompts/`. The filename becomes the slash command.

Examples:

```txt
prompts/plan.md -> /plan
prompts/security.md -> /security
```

Do not create `prompts/prompts.md` because `/prompts` is already provided by `extensions/prompts.ts`.

Current expected prompts:

- `init.md`
- `plan.md`
- `save-plan.md`
- `implement.md`
- `commit.md`
- `review-safe.md`
- `security.md`

Prompt behavior rules:

- Planning prompts should be read-only.
- Review prompts should be read-only.
- Commit prompt should suggest a commit message only; it must not commit.
- Implement prompt may edit files, but should follow the saved plan and ask if unclear.
- Save-plan prompt should save plans under `docs/plans/`.
- Do not edit `AGENTS.md` from a prompt unless the user approves.

### Skill Rules

Skill files must start with valid frontmatter:

```md
---
name: skill-name
description: Short description.
---
```

Do not add an extra `---` after the frontmatter.

Keep skills focused and reusable.

### Verification

When code changes are made, run the narrowest relevant check if available:

- typecheck
- lint
- test
- build

If checks cannot be run, explain why.

Do not claim tests passed unless they were actually run.

### README Rules

Keep `README.md` aligned with the actual files.

If an extension, prompt, skill, or theme is renamed, update the README.

Avoid mentioning removed files such as `team.ts` or old names such as `workflow.ts` if they no longer exist.

### Style

- Use clear, simple language.
- Prefer plain Markdown.
- Avoid unnecessary complexity.
- Avoid adding comments that only repeat the code.
- Prefer explicit names over clever names.

### Clarification

If a task is unclear, ask questions before editing.

Ask only important questions. If the task is clear, continue.

Do not edit files until the user answers clarification questions.

## Open Questions

None.

## Inspection Notes

All important files were inspected:

- Root files: `package.json`, `README.md`, `CHANGELOG.md`, `LICENSE`, `settings.json`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`
- Extensions: all 9 files in `extensions/`
- Prompts: all 8 files in `prompts/`
- Skills: all 4 `SKILL.md` files
- Themes: all 4 JSON files
- Tests: all 6 test files plus `tests/helpers.ts`
- Scripts: `scripts/git-release.mjs`
- CI/CD: `.github/workflows/publish.yml`
- Editor configs: `.vscode/settings.json`, `.pi/settings.json`

Not inspected in detail: individual theme JSON internals (only structure was validated via tests), and the full `node_modules/` tree (not relevant).
