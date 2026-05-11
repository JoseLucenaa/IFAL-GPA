# Current State

Last reviewed: 2026-05-11

## Product Intent

IFAL Projetos is an app for academic project management. Its principal purpose is to help students, advisors, and academic coordinators organize long-running projects such as TCCs, Projetos Integradores, research, and extension projects.

The app is currently a mobile-first Expo/React Native prototype that implements the central workflow visually:

- project overview
- team visibility
- project progress
- simple Kanban tracking
- delivery/version history display
- Git repository link display
- simulated AI report summary

The broader product specification in `project.spec.md` describes a larger system with authentication, permissions, backend APIs, file storage, versioned uploads, comments, notifications, and real AI report generation. Those areas are not implemented yet.

## Implemented App Areas

### Home

File: `src/screens/HomeScreen.tsx`

The home screen provides a dashboard-style entry point:

- IFAL Projetos hero area
- total active project count
- average project progress
- featured project card
- shortcuts to repositories/projects and AI reports

Data source: `ProjectsContext`.

### Projects

File: `src/screens/ProjectsScreen.tsx`

The projects screen provides:

- list of projects sorted by title
- project cards with kind, title, description, progress, member count, and deadline
- modal for creating a basic project

Current project creation is local and in-memory only. It supports:

- title
- short description
- project kind: `Projeto Integrador` or `TCC`
- main deadline label
- Git URL
- comma-separated team member names

There is no persistence after app reload.

### Project Detail

File: `src/screens/ProjectDetailScreen.tsx`

The project detail screen is the main workspace. It has segmented tabs:

- `Visao`
- `Kanban`
- `Entregas`
- `Git`
- `IA`

Implemented behavior:

- overview card with kind, title, deadline, description, and progress
- team grid with generated initials
- Kanban board grouped into `todo`, `doing`, and `done`
- task movement only moves forward through the columns
- deliveries are displayed as a read-only version history
- Git panel opens the configured repository URL
- AI panel simulates report generation with a local mock summary

### Insights

File: `src/screens/InsightsScreen.tsx`

The insights screen lists AI report summaries by project. It shows existing summaries when available and otherwise displays a placeholder prompting the user to open the project and generate a report.

### Navigation

Files:

- `src/navigation/RootNavigator.tsx`
- `src/navigation/MainTabs.tsx`
- `src/navigation/types.ts`
- `src/navigation/useAppNavigation.ts`

Navigation structure:

- root native stack
- bottom tabs for `Home`, `Projects`, and `Insights`
- project detail screen pushed from the stack

### State Management

File: `src/context/ProjectsContext.tsx`

The app uses React Context for project state.

Current operations:

- read all projects
- get project by id
- create project
- move task between Kanban columns
- set last AI report summary

State is initialized from `src/data/seedProjects.ts` and stored in component memory.

### Seed Data

File: `src/data/seedProjects.ts`

The app includes two sample projects:

- Plataforma de monitoramento ambiental
- TCC - Recomendacao de trilhas de estudo

These seed projects demonstrate project metadata, members, tasks, deliveries, Git URLs, progress, and one existing AI report summary.

### Design System

Files:

- `src/theme/colors.ts`
- `src/theme/spacing.ts`
- `src/theme/typography.ts`
- `src/components/AppText.tsx`
- `src/components/Card.tsx`
- `src/components/PrimaryButton.tsx`
- `src/components/ProgressBar.tsx`
- `src/components/SegmentedTabs.tsx`
- `src/components/TaskCard.tsx`

The app uses a small local design system with IFAL-oriented green colors, spacing tokens, typography, cards, buttons, progress bars, tabs, and task cards.

## Not Implemented Yet

The following items are described in the spec but are not implemented in the app:

- authentication
- user registration
- password recovery
- role-based permissions
- backend API
- database persistence
- file upload/storage
- delivery submission
- delivery review workflow
- delivery approval/rejection
- task creation/edit/delete
- task comments
- project comments
- member role management
- multiple Git repositories per project
- Git URL validation
- real AI model integration
- PDF/DOCX export
- notifications
- audit/history logging
- coordinator/admin views
- tests

