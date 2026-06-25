# Save Plan as Markdown

This prompt takes a plan and saves it as a markdown file.

## Plan to save

{PLAN_CONTENT}

## Your task

1. Read the project root to check if `AGENTS.md` exists.
2. If `AGENTS.md` exists:
   - Read it.
   - Add a short reference to this plan at the end (or in a Plans section).
   - Save the plan itself as `doc/plan/YYYY-MM-DD-plan-name.md`.
3. If `AGENTS.md` does not exist:
   - Create the folder `doc/plan/` if needed.
   - Save the plan as `doc/plan/YYYY-MM-DD-plan-name.md`.

## File naming

Pick a slug from the plan title. Use today's date in the filename.

Example: `doc/plan/2026-06-25-add-login-flow.md`

## Output structure for the plan file

```markdown
# <plan title>

## Goal

## Context

## Steps

## Files to change

## Risks or open questions

## Success criteria
```

## Rules

- Do not change the meaning of the plan.
- Fix formatting only.
- Create missing folders.
- Keep `AGENTS.md` reference short: title + link to plan file.
