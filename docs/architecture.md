# Architecture

Last reviewed: 2026-05-11

## Runtime

The project is an Expo app built with:

- React Native
- TypeScript
- Expo
- React Navigation
- Expo Google Fonts
- Expo Vector Icons

Entry points:

- `index.ts`
- `App.tsx`

`App.tsx` loads the Fustat font family, controls the splash screen, wraps the app with gesture/safe-area providers, provides project state through `ProjectsProvider`, and renders `RootNavigator`.

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

Current data flow is local:

1. `ProjectsProvider` initializes state from `seedProjects`.
2. Screens call `useProjects()`.
3. User actions update React state in memory.
4. Screens re-render from the updated context value.

There is no API layer yet. There is no persistence beyond the current runtime session.

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

## Navigation Model

Root stack:

- `MainTabs`
- `ProjectDetail`

Main tabs:

- `Home`
- `Projects`
- `Insights`

Project detail receives:

```ts
{ projectId: string }
```

## Current Mutation Points

File: `src/context/ProjectsContext.tsx`

Supported mutations:

- `addProject`
- `moveTask`
- `setLastReport`

These are the main points to replace or wrap when a backend API is introduced.

## Implementation Notes

- Project creation currently generates ids with `Math.random()`.
- Task movement recalculates project progress from completed tasks.
- AI report generation is simulated in `ProjectDetailScreen.tsx` with `buildMockReport`.
- Git opening uses `Linking.openURL`.
- Deliveries are currently read-only display data.
- Members only have `id`, `name`, and `initials`; there are no formal roles yet.

## Recommended Next Architecture Steps

1. Expand `src/types/project.ts` toward the entities described in `project.spec.md`.
2. Add a service layer for project operations before adding a backend.
3. Replace in-memory state with persisted data.
4. Add authentication and role-aware access rules before implementing advisor/coordinator workflows.
5. Move AI report generation behind a dedicated service boundary.
6. Add tests around state mutations and core workflow screens.

