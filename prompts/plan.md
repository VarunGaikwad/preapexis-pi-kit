# Create Plan (Read-Only)

This prompt is read-only. Do not edit, create, or delete any file.

## User request

{USER_REQUEST}

## Your task

Read the current project to understand context. Then produce a structured plan based on the user request above.

## Output format

```markdown
# Plan: <short title>

## Goal
One sentence describing the outcome.

## Context
What you learned from reading the project.

## Steps
1. <step 1>
2. <step 2>
3. <step 3>

## Files to change
- `path/to/file`

## Risks or open questions
- <risk 1>
- <risk 2>

## Success criteria
- <criteria 1>
- <criteria 2>
```

## Rules

- Read only. No write, edit, delete, bash write, or any tool that changes files.
- Ask for missing context if needed.
- Keep the plan actionable and specific.
- Use plain language, but include technical details where they matter.
