# Save Plan as Markdown

Save the plan below as a markdown file.

## Plan to save

{PLAN_CONTENT}

## Your task

1. Read the project root.
2. Check whether a `docs/` folder exists.
3. Create `docs/plans/` if needed.
4. Save the plan as:

```txt
docs/plans/YYYY-MM-DD-plan-name.md
```

5. If `AGENTS.md` exists, ask before adding a reference to it.

## File naming

Pick a short slug from the plan title.

Use today's date in the filename.

Example:

```txt
docs/plans/2026-06-25-add-login-flow.md
```

## Output structure for the plan file

```markdown
# <plan title>

## Goal

## Context

## Assumptions

## Batches

## Files to change

## Risks or open questions

## Success criteria

## Final execution summary

## Recommended run order
```

## Rules

- Do not change the meaning of the plan.
- Fix formatting only.
- Create missing folders if needed.
- Do not edit `AGENTS.md` unless the user approves.
- If a plan file with the same name already exists, use the `ask_user` tool to ask before overwriting.
- When you need to ask the user anything, use the `ask_user` tool with short, clear options.
- At the end, report the saved file path.
