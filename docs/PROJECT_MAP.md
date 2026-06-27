# Project Map

## Purpose

`preapexis-pi-kit` is a personal Pi coding-agent package that bundles TypeScript extensions, prompt templates, reusable skills, and UI themes for the [Pi Agent Harness](https://github.com/earendil-works/pi). It adds safety guards, status displays, prompt workflows, and custom branding to AI-assisted coding sessions.

## Important Files

| File | Purpose |
|------|---------|
| `AGENTS.md` | Core rules and guidance for agents working in this repository. Read this first before any edit. |
| `README.md` | Public documentation, installation instructions, and usage guide. |
| `package.json` | Pi package manifest. Declares `pi.extensions`, `pi.prompts`, `pi.skills`, and `pi.themes`. Also defines npm scripts and dev dependencies. |
| `CHANGELOG.md` | Version history and release notes. |
| `LICENSE` | ISC license. |
| `settings.json` | Local Pi settings (`theme`, `defaultProjectTrust`). Not published as part of the package manifest. |
| `tsconfig.json` | TypeScript configuration covering `extensions/**/*.ts`, `tests/**/*.ts`, and `vitest.config.ts`. |
| `vitest.config.ts` | Vitest test runner configuration (Node environment, globals enabled). |
| `.gitignore` | Git ignore rules. |

## Directory Map

| Directory | Purpose |
|-----------|---------|
| `extensions/` | TypeScript Pi extensions. Each file exports a default function receiving `ExtensionAPI`. |
| `prompts/` | Markdown prompt templates. The filename (without `.md`) becomes a slash command. |
| `skills/` | Reusable skills. Each skill lives in its own subfolder containing a `SKILL.md` with frontmatter. |
| `themes/` | JSON theme files for Pi UI. Each file must have `name`, `vars`, `colors`, and `$schema`. |
| `tests/` | Vitest test suite validating package structure, extension syntax, prompt conventions, skills, and themes. |
| `scripts/` | Development helper scripts. |
| `docs/` | Project documentation. Currently contains this map. `docs/plans/` is the target directory for `/save-plan`. |

## Extension Map

### `extensions/brand-ui.ts`
- **Slash commands:** none
- **UI/status changes:** Custom PreApeXis terminal branding and visual UI customization.
- **Safety behavior:** none
- **When to edit:** Changing branding, colors, or terminal UI styling.

### `extensions/git-guard.ts`
- **Slash commands:** none
- **UI/status changes:** May show dirty-worktree warnings and checkpoint-branch notifications.
- **Safety behavior:** Warns on dirty Git worktrees; blocks `git push --force`; confirms `git reset --hard`; creates checkpoint branches before risky edits.
- **When to edit:** Changing Git-specific safety behavior or checkpoint logic.

### `extensions/prompts.ts`
- **Slash commands:** `/prompts`
- **UI/status changes:** Displays a menu listing available prompt workflows.
- **Safety behavior:** none
- **When to edit:** Adding or removing prompt workflows, or changing how the menu is rendered.

### `extensions/safety.ts`
- **Slash commands:** none
- **UI/status changes:** none
- **Safety behavior:** Blocks risky shell commands; prevents reading/editing `.env` files; blocks edits to `node_modules`, build output, `.git` internals, and generated files; requires confirmation for package install/remove commands; injects safety and clarification rules into the agent system prompt.
- **When to edit:** Changing general (non-Git) safety rules or protected path lists.

### `extensions/sound-cues.ts`
- **Slash commands:** `/sound-on`, `/sound-off`, `/sound-test`
- **UI/status changes:** none
- **Safety behavior:** none
- **When to edit:** Changing sound cue triggers or audio behavior.

### `extensions/status.ts`
- **Slash commands:** `/test-pass`, `/test-fail`, `/test-none`
- **UI/status changes:** Shows compact kit status in the footer (e.g., `kit: safe · trusted · tests:none`).
- **Safety behavior:** none
- **When to edit:** Changing footer display format or status indicators.

### `extensions/update.ts`
- **Slash commands:** `/update`
- **UI/status changes:** Displays an update menu for Pi, this kit, or project packages.
- **Safety behavior:** none
- **When to edit:** Changing update behavior or menu options.

### `extensions/usage-tracker.ts`
- **Slash commands:** `/usage`, `/usage-reset`
- **UI/status changes:** May display session token usage and estimated cost.
- **Safety behavior:** none
- **When to edit:** Changing usage tracking logic or cost estimation.

### `extensions/workspace-guard.ts`
- **Slash commands:** `/workspace-root`
- **UI/status changes:** Sets status indicator `workspace: locked` on session start.
- **Safety behavior:** Blocks file operations (`read`, `write`, `edit`, `ls`, `grep`, `find`) and `bash` commands that target paths outside the workspace root; injects workspace-boundary rules into the agent system prompt.
- **When to edit:** Changing workspace boundary behavior or outside-access confirmation logic.

## Prompt Map

| Slash command | File path | Purpose | When to use it |
|---------------|-----------|---------|----------------|
| `/commit` | `prompts/commit.md` | Suggests a conventional commit message from current Git changes. Does not commit automatically. | After making changes and before committing. |
| `/implement` | `prompts/implement.md` | Implements a saved or pasted plan. May edit files. Should follow the plan closely and ask if unclear. | After `/plan` and `/save-plan` (or when a plan is provided). |
| `/init` | `prompts/init.md` | Inspects a repository and creates an onboarding report. Read-only. | When opening a new repo or unfamiliar feature area. |
| `/plan` | `prompts/plan.md` | Creates a read-only implementation plan with batches, model choice, effort guidance, and risk level. | Before starting implementation work. |
| `/repo-map` | `prompts/repo-map.md` | Creates or updates `docs/PROJECT_MAP.md`. Read-only for source files. | When the project structure has changed or a map is missing. |
| `/review-safe` | `prompts/review-safe.md` | Runs a read-only project review. | When wanting a general code or project review. |
| `/save-plan` | `prompts/save-plan.md` | Saves a generated plan as a markdown file under `docs/plans/`. | After `/plan` to persist the plan. |
| `/security` | `prompts/security.md` | Runs a read-only security review. | When reviewing for security issues. |

## Skill Map

| Skill name | File path | Purpose | When it should activate |
|------------|-----------|---------|------------------------|
| `component-implementation` | `skills/component-implementation/SKILL.md` | Builds or modifies frontend components using existing patterns, styling, accessibility rules, and test conventions. | When creating or modifying frontend UI components. |
| `frontend-onboarding` | `skills/frontend-onboarding/SKILL.md` | Understands frontend app structure, framework, routing, build tools, styling system, and test setup. Read-only unless asked. | When starting work in an unfamiliar frontend repo or feature area. |
| `frontend-quality` | `skills/frontend-quality/SKILL.md` | Reviews frontend code for accessibility, responsiveness, performance, UX states, browser behavior, and maintainability. Read-only unless asked. | When reviewing or improving frontend quality. |
| `safe-coding` | `skills/safe-coding/SKILL.md` | Applies safe, reviewable coding practices: small diffs, pre-read, no secrets, no lockfiles, post-edit verification. | When modifying any file in a codebase. |

## Theme Map

| Theme | File path |
|-------|-----------|
| Latte Review | `themes/latte-review.json` |
| Neon Guardian | `themes/neon-guardian.json` |
| Safe Dark | `themes/safe-dark.json` |
| Tokyo Midnight | `themes/tokyo-midnight.json` |

## Common Tasks

### Change branding/UI
Read:
- `extensions/brand-ui.ts`
- `themes/`

### Change update behavior
Read:
- `extensions/update.ts`

### Change safety behavior
Read:
- `extensions/safety.ts`
- `extensions/git-guard.ts`
- `extensions/workspace-guard.ts`

### Change footer/status
Read:
- `extensions/status.ts`
- `extensions/usage-tracker.ts`

### Change prompt workflows
Read:
- `extensions/prompts.ts`
- `prompts/`

### Change sound cues
Read:
- `extensions/sound-cues.ts`

### Change workspace boundaries
Read:
- `extensions/workspace-guard.ts`

### Add a new extension
Read first:
- `AGENTS.md` (Extension Rules)
- `tests/extensions.test.ts`
Then create:
- `extensions/<name>.ts`

### Add a new prompt
Read first:
- `AGENTS.md` (Prompt Rules)
- `tests/prompts.test.ts`
Then create:
- `prompts/<name>.md`
Update:
- `extensions/prompts.ts` (if the prompt should appear in the `/prompts` menu)

### Add a new skill
Read first:
- `AGENTS.md` (Skill Rules)
- `tests/skills.test.ts`
Then create:
- `skills/<name>/SKILL.md`

### Add a new theme
Read first:
- `tests/themes.test.ts`
Then create:
- `themes/<name>.json`

### Release a new version
Read:
- `scripts/git-release.mjs`
- `package.json`
- `CHANGELOG.md`

## Common Commands

| Command | Purpose |
|---------|---------|
| `npm test` | Run the full Vitest test suite (structure, syntax, and validation tests). |
| `npm run test:watch` | Run Vitest in watch mode. |
| `npm run git` | Run the interactive git-release script (bumps version, commits, tags, pushes). |
| `pi install -l .` | Install this package locally into Pi for development testing. |
| `/reload` | Reload Pi after installing, updating, or changing extensions. |

## Safety Notes

- **Do not edit `.env` files** — blocked by `extensions/safety.ts`.
- **Do not edit `.git` internals** — blocked by `extensions/safety.ts`.
- **Do not edit `node_modules`** — blocked by `extensions/safety.ts`.
- **Do not edit build output** (`dist`, `build`, `out`, `coverage`) — blocked by `extensions/safety.ts`.
- **Do not change lockfiles** unless the user explicitly approves.
- **Do not run destructive Git commands** (`git push --force`, `git reset --hard`, `git clean -fd`) without explicit user approval — guarded by `extensions/git-guard.ts`.
- **Do not run commands leaving the workspace** without approval — guarded by `extensions/workspace-guard.ts`.
- **`scripts/git-release.mjs`** performs `git push` and may create tags; review its behavior before running in a dirty worktree.

## Agent Rules

- Read `AGENTS.md` before making any edits.
- Keep changes small, focused, and reviewable.
- Read existing files before editing them.
- Preserve existing behavior unless explicitly asked to change it.
- Match the style already used in the repo.
- Do not add dependencies unless explicitly approved.
- Do not delete files unless explicitly approved.
- Do not rewrite Git history.
- Each skill must live in its own folder under `skills/`.
- Prompt filenames become slash commands; do not create `prompts/prompts.md` because `/prompts` is provided by `extensions/prompts.ts`.
- Extensions must export a default function receiving `ExtensionAPI`.
- Run `npm test` after structural changes to extensions, prompts, skills, or themes.
- Update `README.md` and `CHANGELOG.md` when adding or renaming public features.
- Planning and review prompts should remain read-only.
- The `/commit` prompt must suggest a message only; it must not commit automatically.
- The `/save-plan` prompt should save plans under `docs/plans/`.
