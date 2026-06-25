---
name: component-implementation
description: Builds or modifies frontend components using the project's existing component patterns, styling system, accessibility rules, and test conventions.
---

---

# Component Implementation

Use this skill when creating or modifying frontend UI components.

## Before Editing

Inspect existing nearby components to understand:

- naming conventions
- file layout
- props style
- styling approach
- accessibility patterns
- test style
- story/demo pattern, if any

## Component Rules

- Prefer small, focused components.
- Keep props clear and typed.
- Avoid unnecessary state.
- Prefer controlled inputs when the project already uses them.
- Reuse existing design-system components.
- Reuse existing icons, spacing, colors, and typography tokens.
- Do not add a new UI package unless explicitly asked.
- Avoid large rewrites of existing components.

## Accessibility Rules

Check:

- semantic HTML
- keyboard navigation
- visible focus states
- labels for inputs
- button vs link usage
- alt text for meaningful images
- ARIA only when necessary
- color contrast risks

## State Rules

- Keep local UI state local.
- Do not introduce global state unless needed.
- Avoid duplicating server state in local state.
- Preserve existing loading, error, and empty states.

## After Editing

Run the narrowest relevant command:

- component test
- unit test
- typecheck
- lint
- storybook check, if available

## Output

Explain:

1. What component changed
2. Why the approach matches existing patterns
3. Accessibility considerations
4. Tests or checks run
5. Any remaining risks
