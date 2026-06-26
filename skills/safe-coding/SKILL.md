---
name: safe-coding
description: Applies safe, reviewable coding practices when modifying any file. Enforces small diffs, pre-read, no secrets, no lockfiles, and post-edit verification.
---

---

# Safe Coding

Use this skill when modifying code.

## Before Editing

- Read the file or files you plan to change before making edits.
- Understand the existing patterns, naming conventions, and structure.
- Identify related files that may be affected by the change.
- If the task is unclear, ask questions before editing.

## Rules

- Make small, focused, reviewable changes.
- Preserve existing behavior unless explicitly asked to change it.
- Do not edit secrets, env files, lockfiles, build output, coverage reports, or `.git` internals.
- Prefer targeted edits over full rewrites.
- Do not install packages, delete files, or rewrite history without clear user approval.
- Prefer additive changes; avoid destructive updates.
- Explain risky or irreversible operations before executing them.
- Match the project’s existing style and conventions.

## After Editing

Run the narrowest relevant verification command if available:

- unit or component test
- typecheck
- lint
- integration test, if applicable

If verification cannot be run, explain why.

## Output

Explain:

1. What changed and why
2. How existing behavior is preserved
3. Any risks or follow-up actions needed
4. Verification command run and its result
