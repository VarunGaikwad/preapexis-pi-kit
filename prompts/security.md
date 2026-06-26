# Security Review

Review the project for security issues. Do not edit any files.

## Goal

Find real security risks in the project with clear evidence.

## Focus areas

Check for:

- Secret leakage
- Hardcoded API keys or tokens
- Unsafe shell commands
- Command injection
- SQL injection
- XSS or HTML injection
- Auth or permission bugs
- Insecure dependencies
- Unsafe file handling
- Logging sensitive data
- Missing input validation
- Weak error handling
- Unsafe use of `eval`, dynamic imports, or script execution
- Dangerous deployment or CI/CD configuration

## How to review

1. Read the relevant files and changes.
2. Check configuration, scripts, API routes, auth code, and file handling code.
3. Look for hardcoded secrets, unsafe command usage, weak validation, and risky permissions.
4. If package/security commands are available, suggest them, but do not run install or destructive commands.
5. Report only issues with evidence.
6. If unsure, report it under **Questions**, not as a confirmed finding.

## Output format

```markdown
# Security Review Report

## Summary

Briefly summarize the overall security state.

## Findings

### <severity>: <title>

- **File:** `path/to/file`
- **Line:** `<line number or range if available>`
- **Issue:** Short description of the problem.
- **Evidence:** What code or behavior shows the issue.
- **Risk:** What could go wrong.
- **Fix:** Recommended change.

## Questions

List anything suspicious but not confirmed.

## Suggested Checks

List safe commands the user can run, for example:

- `npm audit`
- `npm run lint`
- `npm test`

Do not run risky commands without approval.

## Final Notes

Short closing summary.
```

## Severity levels

Use:

- `Critical`
- `High`
- `Medium`
- `Low`

If no issues are found, say:

```txt
No obvious security issues found.
```

## Rules

- Read only.
- Do not edit files.
- Do not install packages.
- Do not run destructive commands.
- Be specific.
- Include file paths and line numbers when possible.
- Do not report theoretical issues without evidence.
- Do not read `.env` or secret files.
