# preapexis-pi-kit

A personalized kit for the [pi-coding-agent](https://github.com/earendil-works/pi-coding-agent) that bundles extensions, prompts, skills, and themes to streamline AI‑assisted development workflows.

## What’s inside

- **extensions/** – TypeScript extensions that add custom behavior to the agent:
  - `safety.ts` – guards against risky commands (rm -rf, sudo, chmod 777, etc.) and creates checkpoints before edits.
  - `team.ts` – injects shared working‑rule reminders (small diffs, read‑first, no secrets, etc.).
  - `workflow.ts` – provides slash commands (`/plan`, `/save-plan`, `/implement`, `/commit`, `/review`, `/security`) that guide you through the prompt‑based workflow.
  - `gitguard.ts` – warns on a dirty working tree, creates git checkpoints, blocks force‑push, confirms reset --hard, and shows the current branch in the status bar.
  - `status.ts` – shows useful info in the footer: branch, model, mode, test status, and repo trust state.
- **prompts/** – ready‑to‑use prompt templates for common tasks:
  - `plan.md` – create a read‑only implementation plan.
  - `save-plan.md` – turn a plan into a markdown file.
  - `implement.md` – implement a saved plan.
  - `commit.md` – generate a conventional, explainable git commit message.
  - `review-safe.md` – run a safety‑focused code review.
  - `security.md` – run a security‑focused audit.
- **skills/** – reusable skill packs (e.g., frontend‑onboarding, frontend‑quality, styling‑system, safe‑coding, etc.) that can be attached to agents.
- **themes/** – visual themes (including `safe-dark.json`) for the PI UI.
- **package.json** – declares the kit as a pi‑package and lists peer dependencies.
- **settings.json** – default configuration (theme, trusted‑policy, folder locations).

## Installation

1. Ensure you have the [pi-coding-agent](https://github.com/earendil-works/pi-coding-agent) installed (via `npm i -g @earendil-works/pi-coding-agent` or your preferred method).
2. Clone or copy this repository into your workspace.
3. From the repository root, link the kit as a local pi‑package:

   ```bash
   pi link
   ```

   (or run `pi install ./` if you published it to a local registry).

4. Restart the PI editor/reload extensions. The kit’s extensions, prompts, skills, and themes will be automatically available.

## Usage

### Prompt‑based workflow

1. **Plan** – Run the `plan` prompt, paste your feature request or bug description where it says `{USER_REQUEST}`, and let the agent produce a structured plan.
2. **Save** – Run the `save-plan` prompt, paste the generated plan where it says `{PLAN_CONTENT}`; the agent will write it to `doc/plan/YYYY-MM-DD‑<slug>.md` and optionally add a reference to `AGENTS.md`.
3. **Implement** – Run the `implement` prompt, paste the plan (or provide the path to the saved markdown file). The agent will implement the steps, run tests, and report progress.
4. **Commit** – After you’re satisfied, run the `commit` prompt; it will inspect `git diff` and suggest a conventional commit message with a plain‑language explanation and technical details.
5. **Review** – Use `review-safe` for a general safety review or `security` for a focused security audit.

### Slash commands (provided by the `workflow` extension)

- `/plan` – Shows a reminder on how to use the `plan` prompt.
- `/save-plan` – Shows how to save a plan.
- `/implement` – Shows how to implement a plan.
- `/commit` – Shows how to generate a commit message.
- `/review` – Shows how to run a safety review.
- `/security` – Shows how to run a security review.
- `/workflows` – Lists all workflow shortcuts.

### Extensions at a glance

- **safety** – Blocks dangerous shell commands, creates git checkpoints before file edits, and adds safety rules to the system prompt.
- **team** – Adds a permanent reminder of the team’s working conventions to every agent session.
- **gitguard** – Warns on a dirty repo, creates backup branches before risky edits, blocks `git push --force`, confirms `git reset --hard`, and shows the current branch (with a `*` when dirty) in the status bar.
- **status** – Displays the current git branch, the active model (e.g., `claude/sonnet-3-5`), the mode (`safe`), test status (`not run` / `passed` / `failed`), and repo trust state (`trusted` / `untrusted`). Includes helper commands `/test-pass`, `/test-fail`, `/test-none` to manually update the test status.

## Customization

- **Themes**: Switch via the UI or edit `settings.json` to point to a different theme file in `themes/`.
- **Settings**: Adjust `defaultProjectTrust`, enable/disable telemetry, etc., in `settings.json`.
- **Extensions**: Enable/disable or configure individual extensions by editing their source in `extensions/` (re‑link after changes).

## Development

To add a new extension, place a `.ts` file in `extensions/` and export a default function that receives the `ExtensionAPI`.  
To add a new prompt, drop a `.md` file in `prompts/` – the agent will surface it in the prompt picker.  
To add a new skill, place a folder with a `SKILL.md` (and optional assets) in `skills/`.

## License

ISC – see the `LICENSE` file for details.

---

*Built with ❤️ for the pi‑coding‑agent ecosystem.*