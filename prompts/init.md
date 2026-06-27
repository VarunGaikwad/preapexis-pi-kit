# Initialize Agent Guidelines

Your job is to create or update the root `AGENTS.md` file for this repository.

This prompt must **not** duplicate the full repository map. The detailed repository map belongs in:

`docs/PROJECT_MAP.md`

If `docs/PROJECT_MAP.md` exists, read it and use it as the main source for repository structure.

If `docs/PROJECT_MAP.md` does not exist, do **not** create a large project map inside `AGENTS.md`. Instead, inspect only the most important project files and add a note in `AGENTS.md` saying that `/repo-map` should be run to generate `docs/PROJECT_MAP.md`.

## Goal

Create a concise, useful `AGENTS.md` file that tells future Pi agents:

- what this project does
- which repository map file to read
- which commands to run
- which files are risky
- which files to inspect first for common tasks
- what rules agents must follow

`AGENTS.md` should be short, scannable, and task-focused.

It should act as an **agent operating guide**, not a full file inventory.

## Important Rule

Do not copy the full contents of `docs/PROJECT_MAP.md` into `AGENTS.md`.

Instead, summarize only the most important paths and link to it.

Good:

- For the full repository map, read `docs/PROJECT_MAP.md`.

Bad:

- Listing every source file, prompt file, skill file, theme file, test file, and config file again inside `AGENTS.md`.

## Steps

1. Check for an existing `AGENTS.md`
   - If it exists, read it first.
   - Preserve accurate project-specific rules.
   - Remove duplicated or overly detailed file inventory if it is already covered by `docs/PROJECT_MAP.md`.
   - Keep the file concise.

2. Check for `docs/PROJECT_MAP.md`
   - If it exists, read it.
   - Use it to understand the project structure.
   - Reference it from `AGENTS.md`.
   - Do not duplicate it.

3. Read key project files

   Read only the files needed to create good agent guidance:
   - `README.md`
   - `package.json`
   - `AGENTS.md`, if present
   - `docs/PROJECT_MAP.md`, if present
   - `.github/workflows/`, if present
   - important config files such as:
     - `tsconfig.json`
     - `eslint.config.*`
     - `prettier.config.*`

   - main package directories such as:
     - `extensions/`
     - `prompts/`
     - `skills/`
     - `themes/`
     - `tests/`

   Do not read actual `.env` files.

4. Detect the development workflow

   Find commands for:
   - install
   - test
   - typecheck
   - release
   - local Pi usage
   - package publishing, if applicable

5. Identify safety risks

   Look for:
   - auth files
   - env files
   - GitHub Actions publishing workflows
   - release scripts
   - package version files
   - lockfiles
   - destructive commands
   - workspace boundary rules

6. Create or update `AGENTS.md`

   Use this structure:

   # Agent Guidelines: <project name>

   ## Project Summary

   Briefly explain what this project does.

   ## Start Here

   Tell future agents which files to read first.

   Include:
   - `README.md`
   - `docs/PROJECT_MAP.md`, if present
   - `package.json`
   - key task-specific files

   If `docs/PROJECT_MAP.md` is missing, say:
   - Run `/repo-map` to generate `docs/PROJECT_MAP.md`.

   ## Repository Map

   Keep this section short.

   If `docs/PROJECT_MAP.md` exists, write:
   - Full repository map: `docs/PROJECT_MAP.md`

   Then include only a small high-level table, not a full inventory.

   Example:

   | Path          | Purpose                |
   | ------------- | ---------------------- |
   | `extensions/` | Pi extension modules   |
   | `prompts/`    | Slash prompt workflows |
   | `skills/`     | Packaged Pi skills     |
   | `themes/`     | Pi themes              |
   | `tests/`      | Vitest tests           |

   ## Common Task Map

   Keep this task-focused.

   Example:

   | Task                    | Read These Files First                                                             |
   | ----------------------- | ---------------------------------------------------------------------------------- |
   | Change branding/UI      | `extensions/brand-ui.ts`, `themes/`                                                |
   | Change update behavior  | `extensions/update.ts`                                                             |
   | Change safety behavior  | `extensions/safety.ts`, `extensions/git-guard.ts`, `extensions/workspace-guard.ts` |
   | Change prompt workflows | `prompts/`, `extensions/prompts.ts`                                                |
   | Change LiteLLM provider | `extensions/litellm-provider.ts`                                                   |
   | Change release behavior | `scripts/git-release.mjs`, `.github/workflows/`                                    |

   ## Development Commands

   Include only commands that are present in the project.

   Example:

   | Command                       | Purpose                                        |
   | ----------------------------- | ---------------------------------------------- |
   | `npm test`                    | Run tests                                      |
   | `npm run git --msg="message"` | Commit, optionally bump version, tag, and push |

   ## Coding Conventions

   Summarize important conventions only.

   Include language, module style, formatting style, testing style, and extension patterns.

   ## Safety Rules

   Include rules agents must follow.

   Mention:
   - Do not read `.env` files.
   - Do not expose secrets.
   - Do not modify files outside the current workspace unless explicitly allowed.
   - Be careful with release scripts, npm publishing, GitHub workflows, and package version files.
   - Ask before destructive Git commands.
   - Do not duplicate `docs/PROJECT_MAP.md` inside `AGENTS.md`.

   ## Architecture Notes

   Summarize important architecture patterns.

   Keep this short.

   ## Agent Rules

   Include direct rules for future agents.

   Example:
   - Prefer editing existing extension files over creating duplicates.
   - Keep `AGENTS.md` concise.
   - Put detailed repository mapping in `docs/PROJECT_MAP.md`.
   - Do not add GitHub install instructions if this package should be installed from npm.
   - Do not duplicate Pi’s built-in status/footer information.
   - Keep workspace guard behavior strict by default.

   ## Open Questions

   List anything unclear.

   ## Inspection Notes

   Mention what was inspected and what was not inspected.

## Output Rules

- Only create or update `AGENTS.md`.
- Do not modify source code.
- Do not modify `docs/PROJECT_MAP.md`.
- Do not create a second project map inside `AGENTS.md`.
- Keep `AGENTS.md` concise.
- Prefer references to `docs/PROJECT_MAP.md` over duplicated file lists.
- Do not include secrets, API keys, tokens, passwords, or sensitive data.
- Do not read actual `.env` files.

After updating `AGENTS.md`, report:

- file path
- sections added or updated
- whether `docs/PROJECT_MAP.md` was found and used
- anything unclear
