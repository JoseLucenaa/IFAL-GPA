# Current State

Last reviewed: 2026-05-11

## Product Intent

IFAL Projetos is an app for academic project management. Its principal purpose is to help students, advisors, and academic coordinators organize long-running projects such as TCCs, Projetos Integradores, research, and extension projects.

The app is currently a mobile-first Expo/React Native prototype that implements the central workflow visually:

- local login and registration
- project overview
- team visibility
- project progress
- simple Kanban tracking
- delivery/version history display
- Git repository link display
- simulated AI report summary

The broader product specification in `project.spec.md` describes a larger system with secure authentication, permissions, backend APIs, file storage, versioned uploads, comments, notifications, and real AI report generation. Several of those areas are still not implemented yet.

## Implemented App Areas

### Authentication

Files:

- `src/context/AuthContext.tsx`
- `src/screens/LoginScreen.tsx`
- `src/screens/RegisterScreen.tsx`
- `src/types/auth.ts`
- `@react-native-async-storage/async-storage`

The app now provides a prototype authentication flow:

- login screen
- registration screen
- local cached session restore
- local logout
- user identity display on the home screen
- role selection during registration

User and session data are stored on-device with AsyncStorage:

- `@ifal-gpa/auth/users`
- `@ifal-gpa/auth/session`

Current demo accounts:

- `ana@ifal.edu.br` / `123456`
- `helena@ifal.edu.br` / `123456`

Important limitation: this is local prototype authentication. Passwords are stored in the local app cache for MVP demonstration only. Production authentication still needs a backend, secure password hashing, token/session handling, and role-based authorization.

### Home

File: `src/screens/HomeScreen.tsx`

The home screen provides a dashboard-style entry point:

- IFAL Projetos hero area
- total active project count
- average project progress
- signed-in user card
- logout action
- featured project card
- shortcuts to repositories/projects and AI reports

Data sources: `AuthContext` and `ProjectsContext`.

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
- unauthenticated stack for `Login` and `Register`
- bottom tabs for `Home`, `Projects`, and `Insights`
- project detail screen pushed from the stack

### State Management

File: `src/context/AuthContext.tsx`

The app uses React Context for authentication state.

Current operations:

- restore cached session
- login
- register
- logout

Auth data is persisted locally with AsyncStorage.

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

### Tests

Files:

- `jest.config.js`
- `jest.setup.ts`
- `src/context/__tests__/AuthContext.test.tsx`

The project now has a Jest environment using `jest-expo` and React Native Testing Library.

Current test coverage focuses on the authentication feature:

- initial unauthenticated state
- local demo user seeding
- login with cached demo user
- invalid credential rejection
- local user registration
- cached session restore
- logout and session removal

## Not Implemented Yet

The following items are described in the spec but are not implemented in the app:

- password recovery
- role-based permissions
- production authentication
- secure password hashing
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
- broader test coverage for screens, navigation, projects, Kanban, deliveries, Git, and reports
