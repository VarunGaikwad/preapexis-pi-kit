````md
# preapexis-pi-kit

A personalized kit for the [Pi Agent Harness](https://github.com/earendil-works/pi) that bundles extensions, prompts, skills, and themes to improve AI-assisted coding workflows.

npm package: [@preapexis/pi-kit](https://www.npmjs.com/package/@preapexis/pi-kit)

## What’s inside

- **extensions/** – TypeScript extensions that add custom behavior to Pi:
  - `safety.ts` – blocks risky shell commands, protects secrets, blocks unsafe paths, and injects safety rules.
  - `git-guard.ts` – warns on dirty Git worktrees, blocks force-push, confirms `git reset --hard`, and creates checkpoint branches before risky edits.
  - `status.ts` – shows compact kit status such as safety mode, repo trust, and test status.
  - `usage-tracker.ts` – tracks session token usage and estimated cost, with `/usage` and `/usage-reset`.
  - `update.ts` – adds `/update` for updating Pi, this kit, or project packages.
  - `sound-cues.ts` – adds optional sound cues for start, done, need-input, and error events.
  - `prompts.ts` – adds `/prompts`, a small menu listing available prompt workflows.
  - `brand-ui.ts` – adds custom PreApeXis branding/UI.

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

Install from npm:

```bash
pi install npm:@preapexis/pi-kit
```
````

After installing, restart Pi or reload extensions:

```txt
/reload
```

## Updating

Update from npm:

```bash
pi install npm:@preapexis/pi-kit
```

Then reload Pi:

```txt
/reload
```

You can also use the built-in update command:

```txt
/update
```

Then select the update option you want from the menu.

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

### `/update`

Run:

```txt
/update
```

This opens an update menu for updating Pi, this kit, or project packages.

### Sound commands

```txt
/sound-on
/sound-off
/sound-test
```

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
- force-push blocking
- `git reset --hard` confirmation
- checkpoint branch creation before risky edits

### status.ts

Shows compact kit status in the footer:

```txt
kit: safe · trusted · tests:none
```

Commands:

```txt
/test-pass
/test-fail
/test-none
```

### usage-tracker.ts

Tracks session token usage and estimated cost.

Commands:

```txt
/usage
/usage-reset
```

### update.ts

Adds:

```txt
/update
```

This command opens a menu for updating Pi, this kit, or project packages.

### sound-cues.ts

Adds optional terminal sound cues.

Commands:

```txt
/sound-on
/sound-off
/sound-test
```

### prompts.ts

Adds:

```txt
/prompts
```

This command lists available prompt workflows.

### brand-ui.ts

Adds custom PreApeXis terminal branding and visual UI customization.

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

To test this package locally while developing:

```bash
pi install -l .
```

Then reload Pi:

```txt
/reload
```

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
  AGENTS.md
  CHANGELOG.md
  extensions/
    safety.ts
    git-guard.ts
    status.ts
    usage-tracker.ts
    update.ts
    sound-cues.ts
    prompts.ts
    brand-ui.ts
  prompts/
  skills/
  themes/
```

## License

ISC. See the `LICENSE` file for details.

---

Built for a safer, cleaner Pi coding-agent workflow.

```

```
