# Repository Map Generator

Create or update a repository map for this project.

You may create or edit only this file:

```txt
docs/PROJECT_MAP.md
```

Do not edit source code, config files, prompts, skills, themes, or extensions.

## Goal

Generate a useful project map so future agent sessions know which files to inspect for common tasks.

## Steps

1. Read existing project guidance:
   - `AGENTS.md`
   - `README.md`
   - `package.json`
   - existing `docs/PROJECT_MAP.md` if it exists

2. Inspect the repository structure:
   - top-level files
   - `extensions/`
   - `prompts/`
   - `skills/`
   - `themes/`
   - `docs/`
   - config files
   - test files

3. Identify important files and responsibilities.

4. Create or update:

```txt
docs/PROJECT_MAP.md
```

5. Keep the map practical and easy to scan.

## Output file structure

Write `docs/PROJECT_MAP.md` using this structure:

```md
# Project Map

## Purpose

Short explanation of what this repository does.

## Important Files

List important root files and what they are for.

## Directory Map

Explain each important directory.

## Extension Map

For each extension, explain:

- file path
- slash commands added, if any
- UI/status changes, if any
- safety behavior, if any
- when to edit this file

## Prompt Map

For each prompt, explain:

- slash command
- file path
- purpose
- when to use it

## Skill Map

For each skill, explain:

- skill name
- file path
- purpose
- when it should activate

## Theme Map

List available themes and where they live.

## Common Tasks

For each common task, list which files to read first.

Examples:

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

### Change footer/status

Read:

- `extensions/status.ts`
- `extensions/usage-tracker.ts`

### Change prompt workflows

Read:

- `extensions/prompts.ts`
- `prompts/`

## Common Commands

List useful commands for development, testing, install, update, and reload.

## Safety Notes

List files and commands that should be handled carefully.

## Agent Rules

Add repo-specific rules future agents should follow.
```

## Rules

- Be specific.
- Prefer file paths over vague descriptions.
- Do not guess if a file was not inspected.
- If something is unclear, add it under `Open Questions`.
- Do not modify anything except `docs/PROJECT_MAP.md`.

## Final response

After writing the file, summarize:

- whether the file was created or updated
- important sections added
- any open questions
