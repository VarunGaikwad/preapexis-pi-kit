# AGENTS.md

Guidance for AI agents working in this repository.

## Project

This repository is `preapexis-pi-kit`, a personal Pi coding-agent package.

It contains:

- `extensions/` — TypeScript Pi extensions.
- `prompts/` — prompt templates that become slash commands.
- `skills/` — reusable skills, each in its own folder with a `SKILL.md`.
- `themes/` — Pi UI themes.
- `package.json` — declares this repository as a Pi package.

## Core Rules

- Keep changes small, focused, and reviewable.
- Read existing files before editing them.
- Preserve existing behavior unless explicitly asked to change it.
- Match the style already used in the repo.
- Do not add dependencies unless explicitly approved.
- Do not delete files unless explicitly approved.
- Do not rewrite Git history.
- Do not edit secrets, `.env` files, `.git`, build output, or generated files.

## Package Structure Rules

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

## Extension Rules

Extensions are TypeScript files in `extensions/`.

Current expected extensions:

- `safety.ts` — general safety protection.
- `git-guard.ts` — Git-specific safety.
- `status.ts` — footer/status display.
- `prompts.ts` — `/prompts` menu.
- `brand-ui.ts` — custom UI branding.

Avoid duplicate responsibilities:

- Git branch display belongs in `git-guard.ts`.
- Model, mode, repo trust, and test status belong in `status.ts`.
- Risky non-Git shell command protection belongs in `safety.ts`.
- Prompt menu belongs in `prompts.ts`.

Do not reintroduce duplicate `/plan`, `/commit`, `/security`, or similar commands in extensions if matching prompt files already exist.

## Prompt Rules

Prompt files live in `prompts/`.

The filename becomes the slash command.

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

## Skill Rules

Skill files must start with valid frontmatter:

```md
---
name: skill-name
description: Short description.
---
```

Do not add an extra `---` after the frontmatter.

Keep skills focused and reusable.

Good skill categories for this repo:

- safe coding
- frontend onboarding
- frontend quality review
- component implementation

## Safety Rules

Agents must avoid:

- reading or editing `.env` files
- editing `.git`
- editing `node_modules`
- editing build output such as `dist`, `build`, `out`, or `coverage`
- changing lockfiles unless the user approves
- running package install/remove commands unless the user approves
- running destructive Git commands
- running destructive shell commands

If a task is unclear, ask questions before editing.

Ask only important questions. If the task is clear, continue.

## Verification

When code changes are made, run the narrowest relevant check if available:

- typecheck
- lint
- test
- build

If checks cannot be run, explain why.

Do not claim tests passed unless they were actually run.

## Git Rules

Before risky edits, check whether the repo is dirty.

Dirty means there are uncommitted changes.

Avoid overwriting user work.

Do not run:

```bash
git push --force
git reset --hard
git clean -fd
```

unless the user explicitly approves and the safety extension allows it.

## README Rules

Keep `README.md` aligned with the actual files.

If an extension, prompt, skill, or theme is renamed, update the README.

Avoid mentioning removed files such as `team.ts` or old names such as `workflow.ts` if they no longer exist.

## Style

- Use clear, simple language.
- Prefer plain Markdown.
- Avoid unnecessary complexity.
- Avoid adding comments that only repeat the code.
- Prefer explicit names over clever names.
