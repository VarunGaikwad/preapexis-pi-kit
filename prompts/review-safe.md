# Safe Project Review

Review the project safely. Do not edit, create, delete, or modify any files.

## Goal

Find practical issues in the current project without making changes.

## Review areas

Look for:

- Bugs
- Broken or suspicious logic
- Security risks
- Secrets in code
- Risky shell commands
- Risky package or dependency changes
- Files that should not be changed
- Missing tests
- Missing error handling
- Type or lint problems
- Confusing project structure
- Outdated or duplicated code

## Steps

1. First explain your review plan.
2. Read the most relevant project files.
3. Inspect tests and configuration if available.
4. Report findings clearly.
5. Do not fix anything unless the user asks.

## Rules

- Read only.
- Do not edit files.
- Do not install packages.
- Do not run destructive commands.
- Do not report guesses as facts.
- If you are unsure, mark it as a question.
- Focus on real issues with evidence.
- Prefer important findings over long generic advice.

## Output format

```markdown
# Safe Review Report

## Review Plan

Briefly explain what you checked.

## Findings

### <severity>: <title>

- **File:** `path/to/file`
- **Issue:** What looks wrong.
- **Why it matters:** Impact or risk.
- **Suggested fix:** What should be changed.

## Missing Tests

List important missing tests, if any.

## Files to Treat Carefully

List files or folders the agent should avoid changing casually.

## Open Questions

List anything unclear.

## Summary

Short final summary.
```
