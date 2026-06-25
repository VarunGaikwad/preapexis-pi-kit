Initialize your understanding of this repository.

Do not edit files yet.

Your job is to inspect the project and produce a clear onboarding report for future work.

## Steps

1. Read the most important project files first:
   - README.md
   - AGENTS.md
   - package.json / pyproject.toml / go.mod / Cargo.toml / pom.xml / build.gradle
   - CONTRIBUTING.md
   - docs/
   - .github/workflows/
   - docker-compose.yml / Dockerfile
   - existing test configuration

2. Identify the project structure:
   - main application entry points
   - important directories
   - test locations
   - config files
   - generated/build output directories
   - files that should be treated carefully

3. Detect the development workflow:
   - install command
   - dev command
   - build command
   - test command
   - lint command
   - typecheck command
   - formatting command

4. Identify safety risks:
   - secrets or env files
   - deployment files
   - database migrations
   - production config
   - generated files
   - lockfiles
   - destructive scripts
   - commands that should require confirmation

5. Infer coding conventions:
   - language/framework
   - naming style
   - error handling style
   - testing style
   - API conventions
   - dependency management

## Output

Return a repository onboarding report with these sections:

# Repository Summary

Briefly explain what this project appears to do.

# Tech Stack

List the detected languages, frameworks, libraries, and tools.

# Project Map

Explain the important folders and files.

# Common Commands

List install, dev, build, test, lint, typecheck, and format commands if found.

# Safety Notes

List files, directories, and commands that should be treated carefully.

# Coding Conventions

Summarize the project’s apparent patterns.

# Recommended Agent Rules

Suggest repo-specific rules that should be added to AGENTS.md or team instructions.

# Open Questions

List anything unclear or missing.

Do not modify the repository unless I explicitly ask.
