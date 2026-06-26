---
name: safe-coding
description: Applies safe, reviewable coding practices when modifying any file. Enforces small diffs, pre-read, no secrets, no lockfiles, and post-edit verification.
---

---

# Safe Coding

Use this skill when modifying code.

## Before Editing

- Read the file(s) you plan to change before making any edits.
- Understand the existing patterns, naming conventions, and structure.
- Identify any related files that may be affected by the change.

## Rules

- Make small, focused, reviewable changes.
- Preserve existing behavior unless explicitly asked to change it.
- Do not edit secrets, env files, lockfiles, build output, coverage reports, or `.git` internals.
- Prefer patches (targeted edits) over full rewrites.
- Do not install packages, delete files, or rewrite history without clear user approval.
- Prefer additive changes; avoid destructive updates.
- Explain any risky or irreversible operation before executing it.

## After Editing

Run the narrowest relevant verification command:

- unit or component test
- typecheck
- lint
- integration test, if applicable

## Output

Explain:

1. What was changed and why
2. How existing behavior is preserved
3. Any risks or follow-up actions needed
4. Verification command run and its result
