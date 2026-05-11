# IFAL-GPA Documentation

This directory records the product intent, current implementation, and feature work process for the IFAL Projetos app.

The goal is to keep implementation work traceable. Every meaningful feature added to the project should leave documentation here describing what changed, why it changed, where it lives in the codebase, and how it was verified.

## Documents

- [Current State](./current-state.md): what has already been implemented in the app.
- [Architecture](./architecture.md): how the app is organized today.
- [Feature Process](./feature-process.md): required documentation process for future feature additions.
- [Feature Log](./feature-log.md): chronological record of implemented features and project actions.

## Documentation Rule

When a feature is added or changed, update this directory in the same work session.

At minimum, update:

- `docs/feature-log.md` with the feature/action entry.
- `docs/current-state.md` if the user-facing behavior changes.
- `docs/architecture.md` if the code structure, data model, navigation, or external dependencies change.

