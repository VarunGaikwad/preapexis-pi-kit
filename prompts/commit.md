# Git Commit Message

Analyze the current changes in this repository and propose a git commit message.

Do not create the commit. Only suggest the message.

## How to read the changes

Run safe git read commands only:

- `git status`
- `git diff`
- `git diff --cached`
- `git log --oneline -5` if useful for style

If there is nothing staged and nothing unstaged, report that no changes are ready to commit.

## Output format

Provide a commit message in this format:

```txt
<type>: <short summary>

<plain-language explanation>

<technical explanation>

- <specific change 1>
- <specific change 2>
```

## Guidelines

1. Use a conventional commit type:
   - `feat`
   - `fix`
   - `refactor`
   - `docs`
   - `test`
   - `chore`
   - `style`
   - `build`
   - `ci`

2. The short summary must be:
   - one line
   - concise
   - imperative mood
   - no period at the end

3. The plain-language paragraph should explain what changed and why.

4. The technical paragraph should explain the implementation details briefly.

5. The bullet list should include the most important changes.

## Split commits

If there are many unrelated changes, suggest splitting them into multiple commits.

For each group, provide:

```txt
Commit 1:
<message>

Commit 2:
<message>
```

## Rules

- Do not commit.
- Do not stage files.
- Do not edit files.
- Do not run destructive git commands.
- Do not include secrets or long raw diffs in the message.
- Keep the message clear and useful for humans.
