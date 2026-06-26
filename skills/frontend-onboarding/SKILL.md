---
name: frontend-onboarding
description: Understands the frontend app structure, framework, routing, build tools, styling system, and test setup. Use when starting work in an unfamiliar frontend repo or feature area.
---

---

# Frontend Onboarding

Use this skill before making frontend changes in an unfamiliar codebase.

This skill is read-only. Do not edit files during onboarding unless explicitly asked.

## Inspect First

Read the most relevant files:

- README.md
- AGENTS.md
- package.json
- vite.config._ / next.config._ / webpack.config._ / astro.config._ / svelte.config.\*
- tsconfig.json
- eslint.config._ / .eslintrc._
- prettier config
- tailwind.config.\* / theme files / design-system files
- src/ or app/
- routes/pages directory
- components directory
- tests directory
- storybook config, if present

## Identify

Find and summarize:

1. Frontend framework
2. Routing approach
3. State management approach
4. Styling approach
5. Component organization
6. API/data fetching pattern
7. Form handling pattern
8. Test setup
9. Build/lint/typecheck commands
10. Important files that should be edited carefully

## Safety Rules

- Do not change global styles.
- Do not introduce new UI libraries.
- Do not change routing, auth, or data-fetching behavior casually.
- Do not edit generated files or build output.
- Prefer existing patterns over new abstractions.
- If the frontend structure is unclear, ask questions before suggesting changes.

## Output

Return:

# Frontend Summary

# App Structure

# Styling System

# State and Data Flow

# Forms and Validation

# Test Commands

# Risks and Careful Areas

# Suggested Frontend Agent Rules

# Open Questions
