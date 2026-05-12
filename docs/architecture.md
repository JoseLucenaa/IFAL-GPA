# Architecture

Last reviewed: 2026-05-11

## Runtime

The project is an Expo app built with:

- React Native
- TypeScript
- Expo
- React Navigation
- AsyncStorage
- Jest
- React Native Testing Library
- Expo Google Fonts
- Expo Vector Icons

Entry points:

- `index.ts`
- `App.tsx`

`App.tsx` loads the Fustat font family, controls the splash screen, wraps the app with gesture/safe-area providers, provides auth state through `AuthProvider`, provides project state through `ProjectsProvider`, and renders `RootNavigator`.

## Source Layout

```text
src/
  components/    reusable UI components
  context/       app state providers
  data/          local seed data
  navigation/    navigators and route types
  screens/       user-facing screens
  theme/         design tokens
  types/         shared TypeScript domain types
```

## Data Flow

Current project data flow is local:

1. `ProjectsProvider` initializes state from `seedProjects`.
2. Screens call `useProjects()`.
3. User actions update React state in memory.
4. Screens re-render from the updated context value.

Current auth data flow is local and persisted:

1. `AuthProvider` initializes cached users and restores the cached session from AsyncStorage.
2. Auth screens call `useAuth()`.
3. Login validates against locally cached users.
4. Registration writes the new user to AsyncStorage and starts a session.
5. Logout removes the cached session.

There is no API layer yet. Project data does not persist beyond the current runtime session.

## Domain Model

File: `src/types/project.ts`

Current simplified entities:

- `Project`
- `Task`
- `Delivery`
- `Member`
- `ProjectKind`
- `KanbanColumn`

Current Kanban columns:

- `todo`
- `doing`
- `done`

The spec defines a richer future model with users, project members, tasks, deliveries, Git repositories, AI reports, and comments. The current model is intentionally smaller and should be expanded before backend integration.

File: `src/types/auth.ts`

Current auth entities:

- `User`
- `UserRole`

Current roles:

- `Estudante`
- `Professor orientador`
- `Coordenador`
- `Avaliador`
- `Administrador`

## Navigation Model

Root stack:

- `Login`
- `Register`
- `MainTabs`
- `ProjectDetail`

The root stack is conditional:

- unauthenticated users see `Login` and `Register`
- authenticated users see `MainTabs` and `ProjectDetail`

Main tabs:

- `Home`
- `Projects`
- `Insights`

Project detail receives:

```ts
{ projectId: string }
```

## Current Mutation Points

File: `src/context/AuthContext.tsx`

Supported mutations:

- `login`
- `register`
- `logout`

File: `src/context/ProjectsContext.tsx`

Supported mutations:

- `addProject`
- `moveTask`
- `setLastReport`

These are the main points to replace or wrap when a backend API is introduced.

## Implementation Notes

- Project creation currently generates ids with `Math.random()`.
- User registration currently generates ids with `Math.random()`.
- Auth users and session are stored in AsyncStorage under `@ifal-gpa/auth/users` and `@ifal-gpa/auth/session`.
- Password handling is local-only for MVP demonstration and must be replaced before production.
- Task movement recalculates project progress from completed tasks.
- AI report generation is simulated in `ProjectDetailScreen.tsx` with `buildMockReport`.
- Git opening uses `Linking.openURL`.
- Deliveries are currently read-only display data.
- Members only have `id`, `name`, and `initials`; there are no formal roles yet.

## Test Architecture

Files:

- `jest.config.js`
- `jest.setup.ts`
- `src/context/__tests__/AuthContext.test.tsx`

Jest uses the `jest-expo` preset.

`jest.setup.ts` mocks AsyncStorage with the package-provided mock:

```ts
@react-native-async-storage/async-storage/jest/async-storage-mock
```

Current tests exercise `AuthContext` behavior without a real device cache.

## Recommended Next Architecture Steps

1. Expand `src/types/project.ts` toward the entities described in `project.spec.md`.
2. Add a service layer for project operations before adding a backend.
3. Replace in-memory project state with persisted data.
4. Replace local prototype authentication with backend-backed authentication.
5. Add role-aware access rules before implementing advisor/coordinator workflows.
6. Move AI report generation behind a dedicated service boundary.
7. Add tests around state mutations and core workflow screens.
