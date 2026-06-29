# Initialize Repository Understanding

> This prompt initializes or updates the repository-level `AGENTS.md` file for Pi.
> It should rely on `docs/PROJECT_MAP.md` when available and avoid doing full repository mapping itself.

## Goal

Create or update an `AGENTS.md` file that gives future Pi sessions clear, durable instructions for working in this repository.

The `AGENTS.md` file should help future agents quickly understand:

- what this project does
- where important files live
- which commands to run
- which files are risky
- which files to inspect for common tasks
- what repository-specific rules agents should follow

## Core Rule

`/init` must not duplicate the work of `/repo-map`.

Use `docs/PROJECT_MAP.md` if it exists. If it does not exist, recommend running `/repo-map`.

When creating or updating `AGENTS.md`, ensure it contains this line exactly once:

> Use `docs/PROJECT_MAP.md` if it exists. If it does not exist, recommend running `/repo-map`.

Do not add duplicate copies of this line if it already exists.

## What `/init` Should Do

1. Check whether `AGENTS.md` exists.
2. Check whether `docs/PROJECT_MAP.md` exists.
3. If `docs/PROJECT_MAP.md` exists:
   - Read it.
   - Use it as the primary source for repository structure and important files.
   - Do not re-map the full repository.

4. If `docs/PROJECT_MAP.md` does not exist:
   - Do not perform full repository mapping.
   - Recommend running `/repo-map`.
   - Inspect only lightweight top-level files needed to create a useful minimal `AGENTS.md`, such as:
     - `README.md`
     - `package.json`
     - `pnpm-workspace.yaml`
     - `tsconfig.json`
     - `pyproject.toml`
     - `Cargo.toml`
     - `go.mod`
     - `.github/workflows/*`

   - Clearly mention in `AGENTS.md` that the repository map is missing.

5. Create or update `AGENTS.md`.
6. Preserve any existing useful project-specific instructions.
7. Remove or rewrite outdated, duplicated, or generic content only when clearly safe.
8. Keep `AGENTS.md` concise and durable.

## What `/init` Should Not Do

Do not:

- scan the entire repository when `docs/PROJECT_MAP.md` is missing
- duplicate large sections from `docs/PROJECT_MAP.md`
- turn `AGENTS.md` into a full repository map
- include long file trees
- include temporary investigation notes
- include speculative rules
- overwrite existing project-specific instructions without reason
- remove safety, testing, build, or deployment rules unless clearly outdated
- add the required `docs/PROJECT_MAP.md` line more than once

## AGENTS.md Content Requirements

The final `AGENTS.md` should include these sections when relevant.

### Project Overview

Briefly describe what the project is and what it does.

Keep this section short.

### Repository Map

Reference the project map instead of duplicating it.

This section must include the following line exactly once:

> Use `docs/PROJECT_MAP.md` if it exists. If it does not exist, recommend running `/repo-map`.

If `docs/PROJECT_MAP.md` exists, summarize only the most important locations from it.

If it does not exist, write that the repository map is missing and that `/repo-map` should be run.

### Common Commands

Include important commands for:

- installing dependencies
- running locally
- building
- testing
- linting
- formatting
- type-checking

Only include commands that are supported by files in the repository.

Do not invent commands.

### Important Files and Directories

List only high-value files and directories that future agents should know about.

Prefer concise bullets.

Do not include a full tree.

### Development Rules

Include repository-specific rules, such as:

- preferred package manager
- coding style
- branch or commit expectations
- test requirements
- generated file rules
- environment variable rules
- API or security constraints

Do not add generic rules unless they are clearly useful for this repository.

### Risky Areas

Mention files or areas that require extra caution, such as:

- authentication
- billing
- migrations
- deployment
- generated files
- config files
- shared types
- public APIs
- data deletion
- security-sensitive code

### Before Making Changes

Include a short checklist future agents should follow before editing.

Example:

- Read `AGENTS.md`.
- Read `docs/PROJECT_MAP.md` if available.
- Inspect the files directly related to the requested change.
- Run the smallest relevant validation command.
- Avoid broad rewrites unless explicitly requested.

### Notes for Future Agents

Include any durable notes that will help future Pi sessions.

Avoid temporary notes like “today I checked…” or “currently investigating…”.

## Update Strategy

When updating an existing `AGENTS.md`:

1. Read the full existing file.
2. Preserve accurate project-specific content.
3. Add missing required sections.
4. Add the required `docs/PROJECT_MAP.md` line if missing.
5. Remove duplicate copies of the required line.
6. Keep the file organized and easy to skim.
7. Prefer small, careful edits over full rewrites.
8. If a full rewrite is necessary, preserve all accurate rules from the old file.

## Minimal AGENTS.md Template

Use this structure when creating a new `AGENTS.md`.

```md
# AGENTS.md

## Project Overview

Briefly describe what this project does.

## Repository Map

Use `docs/PROJECT_MAP.md` if it exists. If it does not exist, recommend running `/repo-map`.

## Common Commands

- Install:
- Run:
- Build:
- Test:
- Lint:
- Type-check:

Only keep commands that are confirmed by repository files.

## Important Files and Directories

- `README.md` — project overview and usage.
- Add only important confirmed paths here.

## Development Rules

- Add repository-specific rules here.
- Do not invent rules.

## Risky Areas

- Add files or workflows that require extra caution.

## Before Making Changes

- Read this file.
- Read `docs/PROJECT_MAP.md` if it exists.
- Inspect the files directly related to the requested change.
- Run the smallest relevant validation command.
- Avoid broad rewrites unless explicitly requested.

## Notes for Future Agents

Add durable notes that will help future sessions.
```

## Output Requirements

After running `/init`, respond with:

1. Whether `AGENTS.md` was created or updated.
2. Whether `docs/PROJECT_MAP.md` was found.
3. A short summary of the important changes made.
4. Any recommended next step, especially running `/repo-map` if the project map is missing.

Keep the response concise.

## Success Criteria

The task is successful when:

- `AGENTS.md` exists.
- It contains the required `docs/PROJECT_MAP.md` line exactly once.
- Existing useful instructions were preserved.
- Repository details are accurate and not invented.
- `/init` did not perform full repository mapping.
- The file is concise, durable, and useful for future Pi sessions.
