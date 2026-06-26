---
name: frontend-quality
description: Reviews frontend code for accessibility, responsiveness, performance, UX states, browser behavior, and maintainability.
---

---

# Frontend Quality Review

Use this skill when reviewing or improving frontend quality.

Do not edit files unless explicitly asked.

## Review Areas

Check for:

- broken UI states
- missing loading states
- missing error states
- missing empty states
- poor responsive behavior
- keyboard accessibility issues
- focus management issues
- incorrect semantic HTML
- unnecessary re-renders
- expensive rendering logic
- unstable keys in lists
- hydration issues
- client/server boundary mistakes
- inconsistent styling
- duplicated UI logic
- missing tests

## Accessibility Checklist

Verify:

- interactive elements are keyboard reachable
- form fields have labels
- modals/dialogs manage focus correctly
- buttons are buttons and links are links
- images have appropriate alt text
- errors are announced or clearly visible
- focus states are not removed
- ARIA is not used incorrectly

## Performance Checklist

Look for:

- large unnecessary client bundles
- avoidable client components
- repeated expensive computations
- unnecessary effects
- unnecessary global state
- unoptimized images
- layout shift risks
- over-fetching data

## Rules

- Prefer specific findings with file paths.
- Do not report generic advice as a finding.
- If unsure, mark it as a question.
- Prioritize user-visible issues first.
- Suggest safe, small follow-up fixes.

## Output

Return:

# Critical Issues

# Recommended Fixes

# Accessibility Notes

# Performance Notes

# Tests to Add

# Safe Follow-Up Changes

# Open Questions
