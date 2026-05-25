# Current State

Last reviewed: 2026-05-25

## Product Intent

IFAL Projetos is an app for academic project management. Its principal purpose is to help students, advisors, and academic coordinators organize long-running projects such as TCCs, Projetos Integradores, research, and extension projects.

The app is currently a mobile-first Expo/React Native prototype that implements the central workflow visually:

- local login and registration
- persisted project overview
- team visibility
- project progress
- Kanban task creation, movement, deletion, and overdue highlighting
- delivery/version submission and local review status
- multiple Git repository link display and validation
- simulated editable AI report history

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

- `student@test.ifal.edu.br` / `123456`
- `professor@test.ifal.edu.br` / `123456`
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

Current project creation is local and persisted with AsyncStorage. It supports:

- title
- short description
- project kind: `Projeto Integrador`, `TCC`, `Pesquisa`, `Extensao`, or `Outro`
- course
- semester
- main deadline label
- optional deadline date
- optional first Git URL
- comma-separated team member names

Projects are stored per user under `@ifal-gpa/projects/by-user`. Seed/demo accounts receive sample projects; newly registered accounts start with an empty project list.

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
- Kanban board grouped into `todo`, `doing`, `review`, and `done`
- task creation, movement, deletion, priority display, and overdue highlighting
- deliveries can be registered as new local versions
- professor/admin users can update delivery review status and advisor comments
- Git panel supports multiple repositories and opens repository URLs
- AI panel generates local data-based report drafts, allows manual editing, and stores report history

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
- create task
- update task
- delete task
- move task between Kanban columns
- add delivery
- review delivery
- add/update/delete repository
- generate/update AI report

State is scoped to the signed-in user. `ProjectsContext` restores the current user's project list from AsyncStorage, seeds only known demo/test accounts, creates an empty project list for new accounts, and persists local mutations back to that user's record.

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
- `src/context/__tests__/ProjectsContext.test.tsx`

The project now has a Jest environment using `jest-expo` and React Native Testing Library.

Current test coverage focuses on local auth and project-state behavior:

- initial unauthenticated state
- local demo/test user seeding
- login with cached demo user
- invalid credential rejection
- local user registration
- cached session restore
- logout and session removal
- per-user project database seeding
- newly registered accounts starting with zero projects
- project isolation between user accounts
- project/task/delivery/repository/report context mutations

## Not Implemented Yet

The following items are described in the spec but are not implemented in the app:

- password recovery
- role-based permissions
- production authentication
- secure password hashing
- backend API
- database persistence
- file upload/storage
- full task editing forms
- task comments
- project comments
- member role management
- real AI model integration
- PDF/DOCX export
- notifications
- audit/history logging
- coordinator/admin views
- broader test coverage for screens, navigation, projects, Kanban, deliveries, Git, and reports
