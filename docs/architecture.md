# Architecture

Last reviewed: 2026-05-25

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

Current project data flow is local, persisted, and scoped by signed-in user:

1. `AuthProvider` restores the signed-in user.
2. `ProjectsProvider` restores that user's project list from AsyncStorage key `@ifal-gpa/projects/by-user`.
3. Known demo/test accounts are seeded from `seedProjects` when they have no stored row.
4. Newly registered accounts receive an empty project list.
3. Screens call `useProjects()`.
4. User actions update React state in memory.
5. Project state is written back to the current user's AsyncStorage record after local mutations.
6. Screens re-render from the updated context value.

Current auth data flow is local and persisted:

1. `AuthProvider` initializes cached users and restores the cached session from AsyncStorage.
2. Auth screens call `useAuth()`.
3. Login validates against locally cached users.
4. Registration writes the new user to AsyncStorage and starts a session.
5. Logout removes the cached session.

There is no API layer yet. Project data persists on the current device only.

## Domain Model

File: `src/types/project.ts`

Current local MVP entities:

- `Project`
- `Task`
- `Delivery`
- `Member`
- `GitRepository`
- `AiReport`
- `Comment`
- `ProjectKind`
- `KanbanColumn`

Current Kanban columns:

- `todo`
- `doing`
- `review`
- `done`

The local model now follows the MVP spec closely enough for mobile workflows, but remains device-local until a backend/API layer is introduced.

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
- `addTask`
- `updateTask`
- `deleteTask`
- `moveTask`
- `addDelivery`
- `reviewDelivery`
- `addRepository`
- `updateRepository`
- `deleteRepository`
- `generateReport`
- `updateReport`

These are the main points to replace or wrap when a backend API is introduced.

## Implementation Notes

- Project creation and local child entities currently generate ids with `Math.random()`.
- User registration currently generates ids with `Math.random()`.
- Auth users and session are stored in AsyncStorage under `@ifal-gpa/auth/users` and `@ifal-gpa/auth/session`.
- Projects are stored in AsyncStorage under `@ifal-gpa/projects/by-user`, keyed by auth user id.
- The legacy `@ifal-gpa/projects` key is read only as a migration fallback for seeded demo users.
- Password handling is local-only for MVP demonstration and must be replaced before production.
- Task movement recalculates project progress from completed tasks.
- AI report generation is simulated in `ProjectsContext` from local project data.
- Git opening uses `Linking.openURL`.
- Deliveries are local records with version, status, upload metadata, and advisor comments.
- Members include local project roles.

## Test Architecture

Files:

- `jest.config.js`
- `jest.setup.ts`
- `src/context/__tests__/AuthContext.test.tsx`
- `src/context/__tests__/ProjectsContext.test.tsx`

Jest uses the `jest-expo` preset.

`jest.setup.ts` mocks AsyncStorage with the package-provided mock:

```ts
@react-native-async-storage/async-storage/jest/async-storage-mock
```

Current tests exercise `AuthContext` and `ProjectsContext` behavior without a real device cache.

## Recommended Next Architecture Steps

1. Add a service/API boundary before introducing a backend.
2. Replace local prototype authentication with backend-backed authentication.
3. Replace AsyncStorage project persistence with API/database persistence.
4. Add stricter role-aware access rules before implementing coordinator/admin workflows.
5. Move AI report generation behind a dedicated service boundary.
6. Add screen-level tests around the project workspace workflows.
