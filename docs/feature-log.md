# Feature Log

This file records project actions and feature work chronologically.

## 2026-05-11 - Initial App Prototype Reviewed

Type: Documentation

Spec reference:

- `project.spec.md` sections 1, 3, 5, 6, 12, 13, and 15

Summary:

- Reviewed the existing Expo/React Native codebase against the product specification.
- Confirmed the app currently implements a mobile-first prototype for academic project management.
- Identified the implemented areas: home dashboard, projects list, project creation modal, project workspace tabs, simple Kanban movement, delivery history display, Git link display, and simulated AI summaries.
- Identified the missing spec areas: authentication, permissions, backend persistence, file uploads, delivery review workflow, task CRUD, comments, notifications, real AI integration, and exports.

Files studied:

- `project.spec.md`
- `README.md`
- `package.json`
- `app.json`
- `App.tsx`
- `src/context/ProjectsContext.tsx`
- `src/data/seedProjects.ts`
- `src/types/project.ts`
- `src/navigation/RootNavigator.tsx`
- `src/navigation/MainTabs.tsx`
- `src/screens/HomeScreen.tsx`
- `src/screens/ProjectsScreen.tsx`
- `src/screens/ProjectDetailScreen.tsx`
- `src/screens/InsightsScreen.tsx`
- `src/components/TaskCard.tsx`
- `src/components/Card.tsx`
- `src/components/SegmentedTabs.tsx`
- `src/theme/colors.ts`

User-facing behavior:

- No runtime behavior changed in this entry.

Implementation notes:

- The project is currently stateful only in memory through React Context.
- The current implementation is aligned with an app-first product direction.
- The current model is smaller than the full spec model and should be expanded before backend work.

Verification:

- Static code/documentation review only.

Known gaps:

- No tests were run for this documentation entry.
- README remains minimal and can be expanded later to link to the docs.

## 2026-05-11 - Documentation Directory Added

Type: Documentation

Spec reference:

- Supports the project process for future implementation work.

Summary:

- Added a `docs/` directory for project documentation.
- Added current-state documentation.
- Added architecture documentation.
- Added a repeatable feature documentation process.
- Added this feature log for chronological tracking.

Files changed:

- `docs/README.md`
- `docs/current-state.md`
- `docs/architecture.md`
- `docs/feature-process.md`
- `docs/feature-log.md`

User-facing behavior:

- No app behavior changed.

Implementation notes:

- Future features should update `docs/feature-log.md` in the same work session.
- User-facing changes should also update `docs/current-state.md`.
- Structural changes should also update `docs/architecture.md`.

Verification:

- Documentation files were created and reviewed locally.

Known gaps:

- No automated tests were needed because this was a documentation-only change.

## 2026-05-11 - Local Authentication and Cached User Session

Type: Feature

Spec reference:

- `project.spec.md` section 6.1 Cadastro e Autenticacao de Usuarios
- `project.spec.md` section 13 MVP
- `project.spec.md` section 17 Prioridades de Desenvolvimento

Summary:

- Added login and registration screens.
- Added auth domain types for users and roles.
- Added an `AuthContext` for login, registration, logout, and session restore.
- Added AsyncStorage persistence for cached users and the current session.
- Updated root navigation to show auth screens before login and the app workspace after login.
- Added signed-in user display and logout action on the home screen.

Files changed:

- `App.tsx`
- `package.json`
- `package-lock.json`
- `src/context/AuthContext.tsx`
- `src/types/auth.ts`
- `src/navigation/RootNavigator.tsx`
- `src/navigation/types.ts`
- `src/screens/LoginScreen.tsx`
- `src/screens/RegisterScreen.tsx`
- `src/screens/HomeScreen.tsx`
- `docs/current-state.md`
- `docs/architecture.md`
- `docs/feature-log.md`

User-facing behavior:

- Users now land on a login screen when no cached session exists.
- Users can register a local account with name, email, password, role, course, and institutional id.
- Users can log in with a local cached account.
- The app restores the last logged-in user from the device cache.
- The home screen shows the current user and allows logout.

Implementation notes:

- Auth data is stored with `@react-native-async-storage/async-storage`.
- Storage keys are `@ifal-gpa/auth/users` and `@ifal-gpa/auth/session`.
- Two demo users are seeded locally when the user cache is empty.
- This is prototype authentication only; password handling must be replaced by secure backend authentication before production.

Verification:

- Ran `npx tsc --noEmit` successfully.
- Ran `npx expo install --check`; Expo used the local dependency map because networking was disabled and reported dependencies up to date.
- Attempted `npm run web` and `npx expo start --web --port 8081`; Expo failed before readiness with `RangeError [ERR_SOCKET_BAD_PORT]` from its free-port helper in this environment.

Known gaps:

- No backend authentication.
- No secure password hashing.
- No password recovery flow.
- No role-based authorization enforcement yet.
- No automated UI tests yet.

## 2026-05-12 - Jest Environment and Auth Feature Tests

Type: Feature

Spec reference:

- `project.spec.md` section 6.1 Cadastro e Autenticacao de Usuarios
- `project.spec.md` section 13 MVP

Summary:

- Added a Jest environment for the Expo app.
- Added React Native Testing Library for component/context tests.
- Added an AsyncStorage Jest mock setup.
- Added tests for the local authentication feature.

Files changed:

- `package.json`
- `package-lock.json`
- `jest.config.js`
- `jest.setup.ts`
- `src/context/__tests__/AuthContext.test.tsx`
- `docs/current-state.md`
- `docs/architecture.md`
- `docs/feature-log.md`

User-facing behavior:

- No runtime app behavior changed.

Implementation notes:

- Jest uses the `jest-expo` preset.
- `jest-expo` is pinned to the Expo SDK 54 compatible version.
- AsyncStorage is mocked with `@react-native-async-storage/async-storage/jest/async-storage-mock`.
- Auth tests render `AuthProvider` and inspect behavior through `useAuth`.

Verification:

- Ran `npm test -- --runInBand` successfully: 1 suite passed, 6 tests passed.
- Ran `npx tsc --noEmit` successfully.
- Ran `npx expo install --check`; Expo used the local dependency map because networking was disabled and reported dependencies up to date.

Known gaps:

- No screen-level interaction tests yet.
- No navigation tests yet.
- No tests yet for projects, Kanban, deliveries, Git, or AI reports.
