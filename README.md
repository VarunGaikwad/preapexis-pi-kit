# preapexis-pi-kit

A personalized kit for the [Pi Agent Harness](https://github.com/earendil-works/pi) that bundles extensions, prompts, skills, and themes to improve AI-assisted coding workflows.

## What’s inside

- **extensions/** – TypeScript extensions that add custom behavior to Pi:
  - `safety.ts` – blocks risky shell commands, protects secrets, blocks unsafe paths, and injects safety rules.
  - `git-guard.ts` – warns on dirty Git worktrees, blocks force-push, confirms `git reset --hard`, creates checkpoint branches before edits, and shows the current branch.
  - `status.ts` – shows useful footer info such as model, mode, repo trust state, and test status.
  - `prompts.ts` – adds `/prompts`, a small menu listing available prompt workflows.
  - `brand-ui.ts` – adds custom Pi branding/UI.

- **prompts/** – prompt templates for common workflows:
  - `init.md` – inspect a repository and create an onboarding report.
  - `plan.md` – create a read-only implementation plan with batches, model choice, and effort guidance.
  - `save-plan.md` – save a generated plan as a markdown file.
  - `implement.md` – implement a saved or pasted plan.
  - `commit.md` – generate a conventional commit message from current Git changes.
  - `review-safe.md` – run a safe read-only project review.
  - `security.md` – run a read-only security review.

- **skills/** – reusable skills for focused agent behavior:
  - `safe-coding`
  - `component-implementation`
  - `frontend-onboarding`
  - `frontend-quality`

- **themes/** – custom Pi themes.

- **package.json** – declares this repository as a Pi package.

## Installation

Clone this repository:

```bash
git clone https://github.com/VarunGaikwad/preapexis-pi-kit.git
cd preapexis-pi-kit
```

Install or link it with Pi:

```bash
pi install -l .
```

Or install directly from GitHub:

```bash
pi install git:github.com/VarunGaikwad/preapexis-pi-kit@master
```

After installing, restart Pi or reload extensions:

```txt
/reload
```

## Updating

To update from GitHub, run:

```bash
pi install git:github.com/VarunGaikwad/preapexis-pi-kit@master
```

Then reload Pi:

```txt
/reload
```

## Usage

### Prompt workflow

Recommended flow:

```txt
/init
/plan <your request>
/save-plan <paste generated plan>
/implement <saved plan path or pasted plan>
/commit
```

Use review prompts when needed:

```txt
/review-safe
/security
```

### `/prompts`

Run:

```txt
/prompts
```

This shows all available prompt workflows and how to use them.

## Prompt details

### `/init`

Reads the project and creates an onboarding report.

Use this when opening a new repo or unfamiliar feature area.

### `/plan`

Creates a read-only plan.

The plan includes:

- implementation batches
- likely files to change
- risk level
- recommended model
- recommended effort level
- approval needs
- final execution summary

Example summary:

```txt
Use Haiku with low effort for batches 1 and 2.
Use Sonnet with medium effort for batches 3 and 4.
Use Opus with high effort for batch 5.
```

### `/save-plan`

Saves a generated plan to:

```txt
docs/plans/YYYY-MM-DD-plan-name.md
```

It asks before editing `AGENTS.md`.

### `/implement`

Implements a saved or pasted plan.

It should:

- follow the plan closely
- keep changes small
- ask if something is unclear
- run tests, lint, or typecheck when available
- summarize what changed

### `/commit`

Reads Git changes and suggests a commit message.

It does not commit automatically.

### `/review-safe`

Runs a read-only project review.

### `/security`

Runs a read-only security review.

## Extensions

### safety.ts

General safety layer.

Protects against:

- risky shell commands
- reading or editing `.env` files
- editing dependency folders
- editing build output
- editing `.git` internals
- unsafe package install/remove commands without confirmation

It also injects safety and clarification rules into the agent prompt.

### git-guard.ts

Git-specific safety layer.

Handles:

- dirty working tree warning
- branch display with `*` when dirty
- force-push blocking
- `git reset --hard` confirmation
- checkpoint branch creation before risky edits

Example status:

```txt
⎇ master*
```

The `*` means there are uncommitted changes.

### status.ts

Shows project status in the footer:

```txt
mode: safe model: openrouter/... repo: trusted tests: none
```

Commands:

```txt
/test-pass
/test-fail
/test-none
```

### prompts.ts

Adds:

```txt
/prompts
```

This command lists available prompt workflows.

### brand-ui.ts

Adds custom Pi branding and visual UI customization.

## Skills

Each skill should live in its own folder:

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

## Development

To add a new extension:

```txt
extensions/my-extension.ts
```

It should export a default function that receives `ExtensionAPI`.

To add a new prompt:

```txt
prompts/my-prompt.md
```

The filename becomes the slash command.

Example:

```txt
prompts/security.md → /security
```

To add a new skill:

```txt
skills/my-skill/SKILL.md
```

## Package structure

```txt
preapexis-pi-kit/
  package.json
  LICENSE
  README.md
  extensions/
  prompts/
  skills/
  themes/
```

## License

ISC. See the `LICENSE` file for details.

---

Built for a safer, cleaner Pi coding-agent workflow.
