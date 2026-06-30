# Implement Plan

Implement the plan below. Do not change scope unless you ask first.

## Plan

{PLAN_CONTENT}

Or, if the plan is saved as a file, provide the path and read it first.

## Steps

1. Read the plan carefully.
2. Read the project files mentioned in the plan.
3. Briefly explain the implementation approach before editing.
4. Implement the steps one by one.
5. Keep changes small and reviewable.
6. Run tests, lint, or type checks if available.
7. Do not delete files or rewrite history without approval.

## Rules

- Follow the plan closely.
- If something is unclear or blocked, use the `ask_user` tool to ask the user for clarification with short, clear options.
- Do not guess important missing details.
- Prefer editing existing files when it fits the existing project structure.
- Create new files only when the plan clearly requires it.
- Match the project's existing style and conventions.
- Add or update tests for new behavior when appropriate.
- Run available checks: tests, lint, type check.
- Do not touch secrets, env files, lockfiles, or generated files unless the plan explicitly requires it and the user approves.

## Output

At the end, summarize:

- What was implemented
- Files changed
- Tests added or updated
- Commands run
- Anything still pending
