# Initialize Repository Understanding

Your job is to deeply inspect this repository and create or update an `AGENTS.md` file that captures everything Pi needs to know to work effectively in this codebase.

If the repository is large, inspect the most important files first and clearly mention what was not inspected.

## Goal

Create a useful `AGENTS.md` file so future Pi sessions can quickly understand:

- what this project does
- where important files live
- which commands to run
- which files are risky
- which files to inspect for common tasks
- what rules agents should follow

## Steps

1. **Check for an existing `AGENTS.md`**
   - If it exists, read it first.
   - Preserve anything that is still accurate and relevant.
   - Do not remove existing project-specific rules unless they are clearly outdated.
   - Merge new findings with the existing content.

2. **Read the codebase thoroughly**

   Read important files such as:
   - `README.md`
   - `package.json`
   - `pyproject.toml`
   - `go.mod`
   - `Cargo.toml`
   - `pom.xml`
   - `build.gradle`
   - `CONTRIBUTING.md`
   - `docs/`
   - `.github/workflows/`
   - `docker-compose.yml`
   - `Dockerfile`
   - config files such as:
     - `tsconfig.json`
     - `vite.config.*`
     - `next.config.*`
     - `webpack.config.*`
     - `eslint.config.*`
     - `prettier.config.*`
   - main source directories such as:
     - `src/`
     - `app/`
     - `lib/`
     - `packages/`
     - `extensions/`
     - `prompts/`
     - `skills/`
     - `themes/`
   - test files and test configuration
   - `.env.example` files only

   Do not read actual `.env` files.

3. **Identify the project structure**

   Find:
   - main entry points
   - important directories and their purposes
   - config files
   - generated/build output directories
   - files that should be treated carefully

4. **Detect the development workflow**

   Find commands for:
   - install
   - dev
   - build
   - test
   - lint
   - typecheck
   - format
   - reload or local development, if applicable

5. **Identify safety risks**

   Look for:
   - secrets or env files
   - deployment files
   - database migrations
   - production config
   - generated files
   - lockfiles
   - destructive scripts
   - commands that should require confirmation

6. **Infer coding conventions**

   Look for:
   - language/framework
   - naming style
   - error handling style
   - testing style
   - API conventions
   - dependency management
   - state management and data flow, if applicable

7. **Create a task-focused project map inside `AGENTS.md`**

   Add a section that tells future agents where to look first for common tasks.

   Example:
   - For branding/UI changes, read `extensions/brand-ui.ts`.
   - For update behavior, read `extensions/update.ts`.
   - For safety behavior, read `extensions/safety.ts` and `extensions/git-guard.ts`.
   - For prompt workflows, read `prompts/`.
   - For skills, read `skills/<skill-name>/SKILL.md`.

## Output

Create or update `AGENTS.md` in the repository root with this structure:

```markdown
# Agent Guidelines: <project name>

## Project Summary

Briefly explain what this project does.

## Tech Stack

Languages, frameworks, libraries, and tools.

## Project Map

| Path   | Purpose          |
| ------ | ---------------- |
| `src/` | Main source code |

## Common Task Map

| Task                   | Read These Files First                            |
| ---------------------- | ------------------------------------------------- |
| Change branding/UI     | `extensions/brand-ui.ts`, `themes/`               |
| Change update behavior | `extensions/update.ts`                            |
| Change safety behavior | `extensions/safety.ts`, `extensions/git-guard.ts` |

## Development Commands

| Command    | Purpose   |
| ---------- | --------- |
| `npm test` | Run tests |

## Coding Conventions

Naming, error handling, testing, API patterns, state management.

## Safety Rules

Files, directories, and commands to treat carefully.

## Architecture Notes

Key patterns, data flow, important abstractions.

## Agent Rules

Repo-specific rules for AI agents working in this codebase.

## Open Questions

Anything unclear or missing.

## Inspection Notes

Mention important areas that were not inspected.
```
````

## Rules

- Be thorough but concise.
- `AGENTS.md` should be scannable.
- Do not include secrets, API keys, tokens, passwords, or sensitive data.
- Do not read actual `.env` files.
- If `AGENTS.md` already exists, merge with it instead of blindly replacing it.
- Focus on information that helps an AI agent write better code.
- Prefer specific file paths over vague explanations.
- Do not modify source code during initialization.
- Only create or update `AGENTS.md`.
- After creating or updating `AGENTS.md`, report:
  - file path
  - what sections were added or updated
  - anything that was unclear


