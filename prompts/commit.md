# Git Commit Message

Analyze the current changes in this repository and propose a git commit message.

## How to read the changes

Run the appropriate git commands to understand what changed, for example:

- `git diff` for unstaged changes
- `git diff --cached` for staged changes
- `git status` for a quick overview

If there is nothing staged and nothing unstaged, report that no changes are ready to commit.

## Output format

Provide a commit message in this format:

```
<type>: <short summary>

<paragraph for non-technical readers>

<paragraph with technical details>

- <specific change 1>
- <specific change 2>
```

### Guidelines

1. **Short summary** — one line, concise, written in the imperative mood, prefixed with a conventional commit type such as `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, or `style`.
2. **Non-technical paragraph** — explain what changed and why in plain language. Avoid jargon. Anyone on the team should understand the purpose and impact.
3. **Technical paragraph** — describe the implementation briefly enough that a developer can quickly understand what files or systems were touched and how.
4. **Bullet list** — highlight the most important changes, decisions, or side effects.

## Tone

- Be clear and direct.
- Do not oversimplify to the point of losing meaning.
- Do not overload the message with raw file names or diff fragments.
- Avoid marketing language, emojis, and exclamation marks.

If there are many unrelated changes, suggest splitting them into multiple commits and provide a message for each group.
