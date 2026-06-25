# Safe Coding

Use this skill when modifying code.

## Rules

- Read relevant files before editing.
- Make small changes.
- Preserve existing behavior unless asked otherwise.
- Do not edit secrets, env files, lockfiles, build output, or `.git`.
- After edits, run the narrowest relevant test, typecheck, or linter.
- Explain any risky operation before doing it.
- Prefer patches over rewrites.
