# Security Review

Review the project for security issues. Do not edit any files.

## Focus areas

- Secret leakage
- Unsafe shell commands
- Injection risks
- Auth or permission bugs
- Insecure dependencies
- Unsafe file handling
- Logging sensitive data
- Missing validation

## How to review

1. Read the relevant files and changes.
2. Check for the issues listed above.
3. Look for common mistakes: hardcoded keys, SQL injection, command injection, unsafe eval, missing input validation, weak permissions, verbose error messages, secrets in logs.

## Output format

For each finding, report:

```markdown
### <severity>: <title>

- **File:** `path/to/file`
- **Line:** `<line number or range>`
- **Issue:** Short description of the problem.
- **Risk:** What could go wrong.
- **Fix:** Recommended change.
```

Use severity levels: `Critical`, `High`, `Medium`, `Low`.

If no issues are found, say: "No obvious security issues found."

## Rules

- Read only. No edits.
- Be specific. Include file paths and line numbers when possible.
- Do not report theoretical issues without evidence.
- If unsure, flag as a question rather than a finding.
