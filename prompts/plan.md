# Create Plan with Batch Model Guidance

This prompt is read-only. Do not edit, create, or delete any file.

## User request

Use the user's message after `/plan` as the request.

If no request is provided, ask the user what they want to plan.

## Model preference

If the user provides specific models, use those models in the recommendation.

If the project has an `AGENTS.md` file, read it and check whether it contains model preferences, available models, coding rules, or execution guidance.

If no model preference is provided, use Claude-style defaults:

- Use Haiku for simple, repetitive, low-risk, or mechanical batches.
- Use Sonnet for normal implementation, debugging, refactoring, and medium-complexity work.
- Use Opus for high-risk, architecture-heavy, security-sensitive, or difficult reasoning work.

## Effort levels

For each batch, recommend an effort level:

- Low effort: simple, obvious, low-risk changes.
- Medium effort: normal coding work, moderate reasoning, some project context needed.
- High effort: complex reasoning, architecture decisions, risky changes, security-sensitive work, or unclear requirements.

## Your task

Read the current project to understand context. Then produce a structured implementation plan based on the user request.

Break the plan into batches or sub-plans. Each batch should be small enough to run safely as a separate agent task.

For every batch, include:

- Goal
- Files likely involved
- What should be done
- Risk level
- Recommended model
- Recommended effort level
- Whether user approval is needed before implementation

## Rules

- Read only.
- Do not write, edit, delete, install packages, or run commands that change files.
- Ask questions if the request is unclear.
- Do not guess important missing details.
- Keep the plan actionable and specific.
- Use plain language, but include technical details where they matter.
- Mention risks and open questions clearly.
- Prefer smaller batches over one large implementation.
- Put risky or unclear work in a separate batch.
- Put tests and verification in their own batch if the work is large.
- Recommend cheaper/faster models for simple batches and stronger models for difficult batches.

## Output format

```markdown
# Plan: <short title>

## Goal

One sentence describing the outcome.

## Context

What you learned from reading the project.

## Assumptions

- <assumption 1>
- <assumption 2>

## Batches

### Batch 1: <name>

- **Goal:** <what this batch achieves>
- **Files likely involved:**
  - `path/to/file`
- **Work:**
  1. <step 1>
  2. <step 2>
- **Risk:** Low / Medium / High
- **Recommended model:** Haiku / Sonnet / Opus / user-provided model
- **Recommended effort:** Low / Medium / High
- **Needs approval before implementation:** Yes / No
- **Why this model:** <short reason>

### Batch 2: <name>

- **Goal:** <what this batch achieves>
- **Files likely involved:**
  - `path/to/file`
- **Work:**
  1. <step 1>
  2. <step 2>
- **Risk:** Low / Medium / High
- **Recommended model:** Haiku / Sonnet / Opus / user-provided model
- **Recommended effort:** Low / Medium / High
- **Needs approval before implementation:** Yes / No
- **Why this model:** <short reason>

## Files to change

- `path/to/file`

## Risks or open questions

- <risk 1>
- <risk 2>

## Success criteria

- <criteria 1>
- <criteria 2>

## Final execution summary

| Batch | Purpose   | Model  | Effort | Risk   | Approval needed |
| ----- | --------- | ------ | ------ | ------ | --------------- |
| 1     | <purpose> | Haiku  | Low    | Low    | No              |
| 2     | <purpose> | Sonnet | Medium | Medium | No              |
| 3     | <purpose> | Opus   | High   | High   | Yes             |

## Recommended run order

1. Run Batch <number> with <model> using <effort> effort.
2. Run Batch <number> with <model> using <effort> effort.
3. Run Batch <number> with <model> using <effort> effort.

## Simple recommendation

Use `<model>` with `<effort>` effort for batches `<batch numbers>`.
Use `<model>` with `<effort>` effort for batches `<batch numbers>`.
Use `<model>` with `<effort>` effort for batches `<batch numbers>`.
```
