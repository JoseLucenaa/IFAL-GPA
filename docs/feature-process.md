# Feature Process

Use this process for every meaningful feature or behavior change.

## 1. Define the Feature

Record:

- feature name
- problem being solved
- user role affected
- related section in `project.spec.md`
- expected user-facing result

## 2. Identify the Scope

Record:

- screens affected
- components affected
- state/context changes
- data model changes
- navigation changes
- dependencies added or removed
- backend/API assumptions, if any

## 3. Implement

Keep changes scoped to the feature. Prefer existing app patterns:

- screens live in `src/screens`
- reusable UI lives in `src/components`
- shared types live in `src/types`
- state changes live in `src/context`
- navigation changes live in `src/navigation`
- visual tokens live in `src/theme`

## 4. Verify

Record what was checked:

- TypeScript compile
- Expo start/build behavior
- manual screen flow
- user interaction tested
- edge cases tested
- known gaps

If verification could not be run, record why.

## 5. Update Documentation

Every feature must update documentation in the same session.

Required updates:

- Add an entry to `docs/feature-log.md`.
- Update `docs/current-state.md` when user-facing behavior changes.
- Update `docs/architecture.md` when structure, data flow, navigation, or dependencies change.

## Feature Log Template

Copy this template into `docs/feature-log.md`:

```md
## YYYY-MM-DD - Feature Name

Type: Feature | Fix | Refactor | Documentation | Chore

Spec reference:

- `project.spec.md` section:

Summary:

- 

Files changed:

- 

User-facing behavior:

- 

Implementation notes:

- 

Verification:

- 

Known gaps:

- 
```

