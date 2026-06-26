# Changelog

All notable changes to `preapexis-pi-kit` will be documented in this file.

This project follows a simple changelog format:
- `Added` for new features
- `Changed` for updates to existing behavior
- `Fixed` for bug fixes
- `Removed` for deleted features/files
- `Security` for safety-related changes

## [1.0.0] - 2026-06-26

### Added

- Initial Pi package setup.
- Added `package.json` with Pi package entries for:
  - `extensions`
  - `prompts`
  - `skills`
  - `themes`
- Added safety-focused extensions:
  - `safety.ts`
  - `git-guard.ts`
  - `status.ts`
  - `prompts.ts`
  - `brand-ui.ts`
- Added prompt workflows:
  - `init.md`
  - `plan.md`
  - `save-plan.md`
  - `implement.md`
  - `commit.md`
  - `review-safe.md`
  - `security.md`
- Added reusable skills:
  - `safe-coding`
  - `component-implementation`
  - `frontend-onboarding`
  - `frontend-quality`
- Added `README.md`.
- Added `AGENTS.md`.
- Added `LICENSE`.
- Added `.gitignore`.

### Changed

- Renamed workflow helper concept to `/prompts`.
- Updated `plan.md` to include:
  - batch planning
  - recommended model
  - effort level
  - risk level
  - approval requirement
  - final execution summary
- Updated `save-plan.md` to save plans under `docs/plans/`.
- Cleaned skill files to remove extra frontmatter separators.
- Simplified `settings.json` recommendations.

### Fixed

- Removed duplicate `/plan`, `/commit`, `/security`, and related command behavior by keeping real workflows in prompt files.
- Removed duplicate branch display from `status.ts`.
- Kept Git branch display inside `git-guard.ts`.

### Security

- Added protection rules for risky shell commands.
- Added `.env` read/edit blocking.
- Added protected path checks for generated files, dependency folders, and Git internals.
- Added Git protection for dirty worktrees, force-push, and `git reset --hard`.
