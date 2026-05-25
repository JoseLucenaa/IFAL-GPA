import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { seedProjects } from '../data/seedProjects';
import { useAuth } from './AuthContext';
import type {
  AiReport,
  Delivery,
  DeliveryStatus,
  GitRepository,
  KanbanColumn,
  MemberRole,
  Project,
  ProjectKind,
  RepositoryPlatform,
  ReportType,
  Task,
  TaskPriority,
} from '../types/project';

const PROJECTS_KEY = '@ifal-gpa/projects';
const PROJECTS_DB_KEY = '@ifal-gpa/projects/by-user';
const SEEDED_PROJECT_USER_IDS = new Set([
  'u_demo_student',
  'u_demo_advisor',
  'u_test_student',
  'u_test_professor',
]);

type ProjectsDatabase = Record<string, Project[]>;

interface ProjectsContextValue {
  projects: Project[];
  loading: boolean;
  getProject: (id: string) => Project | undefined;
  moveTask: (projectId: string, taskId: string, column: KanbanColumn) => void;
  addProject: (input: {
    title: string;
    subtitle: string;
    kind: ProjectKind;
    course?: string;
    semester?: string;
    deadlineLabel: string;
    deadlineDate?: string;
    repositoryUrl?: string;
    memberNames: string[];
  }) => string;
  addTask: (projectId: string, input: TaskInput) => void;
  updateTask: (projectId: string, taskId: string, input: Partial<TaskInput> & { column?: KanbanColumn }) => void;
  deleteTask: (projectId: string, taskId: string) => void;
  addDelivery: (projectId: string, input: DeliveryInput) => void;
  reviewDelivery: (projectId: string, deliveryId: string, status: DeliveryStatus, advisorComments?: string) => void;
  addRepository: (projectId: string, input: RepositoryInput) => void;
  updateRepository: (projectId: string, repositoryId: string, input: RepositoryInput) => void;
  deleteRepository: (projectId: string, repositoryId: string) => void;
  generateReport: (projectId: string, type: ReportType, generatedBy: string) => AiReport;
  updateReport: (projectId: string, reportId: string, content: string) => void;
}

const ProjectsContext = createContext<ProjectsContextValue | undefined>(undefined);

export type TaskInput = {
  title: string;
  description?: string;
  assigneeId?: string;
  priority: TaskPriority;
  dueLabel?: string;
  dueDate?: string;
};

export type DeliveryInput = {
  title: string;
  description?: string;
  fileLabel?: string;
  version: string;
  uploadedBy: string;
};

export type RepositoryInput = {
  name: string;
  url: string;
  platform: RepositoryPlatform;
  description?: string;
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function cloneProject(project: Project): Project {
  return {
    ...project,
    members: project.members.map((m) => ({ ...m })),
    tasks: project.tasks.map((t) => ({ ...t, comments: t.comments.map((c) => ({ ...c })) })),
    deliveries: project.deliveries.map((d) => ({ ...d, comments: d.comments.map((c) => ({ ...c })) })),
    repositories: project.repositories.map((r) => ({ ...r })),
    reports: project.reports.map((r) => ({ ...r })),
  };
}

function recalcProgress(tasks: Task[]): number {
  const done = tasks.filter((t) => t.column === 'done').length;
  return Math.round((done / Math.max(tasks.length, 1)) * 100);
}

function repositoryFromUrl(url?: string): GitRepository[] {
  const trimmed = url?.trim();
  if (!trimmed) return [];
  return [
    {
      id: makeId('r'),
      name: 'Repositorio principal',
      url: trimmed,
      platform: inferPlatform(trimmed),
      description: 'Link informado na criacao do projeto',
      createdAt: new Date().toISOString(),
    },
  ];
}

function inferPlatform(url: string): RepositoryPlatform {
  const lower = url.toLowerCase();
  if (lower.includes('github.com')) return 'GitHub';
  if (lower.includes('gitlab.com')) return 'GitLab';
  if (lower.includes('bitbucket.org')) return 'Bitbucket';
  return 'Outro';
}

function ensureSeedShape(project: Project): Project {
  return {
    ...project,
    members: project.members.map((m, index) => ({
      ...m,
      role: m.role ?? (index === 0 ? 'Lider do projeto' : 'Desenvolvedor'),
    })),
    tasks: project.tasks.map((t) => ({
      ...t,
      priority: t.priority ?? 'Media',
      createdAt: t.createdAt ?? new Date().toISOString(),
      comments: t.comments ?? [],
    })),
    deliveries: project.deliveries.map((d) => ({
      ...d,
      title: d.title ?? 'Entrega',
      status: d.status ?? 'Enviada',
      uploadedBy: d.uploadedBy ?? 'Equipe',
      uploadedAt: d.uploadedAt ?? new Date().toISOString(),
      comments: d.comments ?? [],
    })),
    repositories: project.repositories ?? [],
    reports: project.reports ?? [],
  };
}

function parseProjects(raw: string): Project[] | undefined {
  try {
    const parsed = JSON.parse(raw) as Project[];
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function restoreProjects() {
      if (authLoading) return;

      if (!user) {
        setProjects([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const raw = await AsyncStorage.getItem(PROJECTS_DB_KEY);
        if (!mounted) return;

        if (raw) {
          const parsed = JSON.parse(raw) as ProjectsDatabase;
          const userProjects = Array.isArray(parsed[user.id]) ? parsed[user.id] : undefined;

          if (userProjects) {
            setProjects(userProjects.map((p) => cloneProject(ensureSeedShape(p))));
          } else {
            const initialProjects = SEEDED_PROJECT_USER_IDS.has(user.id)
              ? seedProjects.map((p) => cloneProject(ensureSeedShape(p)))
              : [];
            await AsyncStorage.setItem(
              PROJECTS_DB_KEY,
              JSON.stringify({ ...parsed, [user.id]: initialProjects }),
            );
            setProjects(initialProjects);
          }
        } else {
          const legacyRaw = await AsyncStorage.getItem(PROJECTS_KEY);
          const legacyProjects = legacyRaw ? parseProjects(legacyRaw) : undefined;
          const initialProjects = SEEDED_PROJECT_USER_IDS.has(user.id)
            ? (legacyProjects ?? seedProjects).map((p) => cloneProject(ensureSeedShape(p)))
            : [];

          await AsyncStorage.setItem(PROJECTS_DB_KEY, JSON.stringify({ [user.id]: initialProjects }));
          setProjects(initialProjects);
        }
      } catch {
        if (mounted) {
          setProjects(
            SEEDED_PROJECT_USER_IDS.has(user.id)
              ? seedProjects.map((p) => cloneProject(ensureSeedShape(p)))
              : [],
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void restoreProjects();

    return () => {
      mounted = false;
    };
  }, [authLoading, user]);

  useEffect(() => {
    if (loading || authLoading || !user) return;
    const userId = user.id;

    async function persistProjects() {
      const raw = await AsyncStorage.getItem(PROJECTS_DB_KEY);
      const db = raw ? (JSON.parse(raw) as ProjectsDatabase) : {};
      await AsyncStorage.setItem(PROJECTS_DB_KEY, JSON.stringify({ ...db, [userId]: projects }));
    }

    void persistProjects();
  }, [authLoading, loading, projects, user]);

  const getProject = useCallback(
    (id: string) => projects.find((p) => p.id === id),
    [projects],
  );

  const moveTask = useCallback((projectId: string, taskId: string, column: KanbanColumn) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const tasks = p.tasks.map((t) =>
          t.id === taskId
            ? { ...t, column, completedAt: column === 'done' ? new Date().toISOString() : undefined }
            : t,
        );
        const progress = recalcProgress(tasks);
        return { ...p, tasks, progress };
      }),
    );
  }, []);

  const addProject = useCallback(
    (input: {
      title: string;
      subtitle: string;
      kind: ProjectKind;
      course?: string;
      semester?: string;
      deadlineLabel: string;
      deadlineDate?: string;
      repositoryUrl?: string;
      memberNames: string[];
    }): string => {
      const members = input.memberNames
        .map((n) => n.trim())
        .filter(Boolean)
        .map((name, index) => ({
          id: makeId('m'),
          name,
          initials: initialsFromName(name),
          role: (index === 0 ? 'Lider do projeto' : 'Desenvolvedor') as MemberRole,
        }));

      const id = makeId('p');

      const newProject: Project = {
        id,
        title: input.title.trim(),
        subtitle: input.subtitle.trim(),
        kind: input.kind,
        course: input.course?.trim() || undefined,
        semester: input.semester?.trim() || undefined,
        progress: 0,
        deadlineLabel: input.deadlineLabel.trim(),
        deadlineDate: input.deadlineDate?.trim() || undefined,
        members: members.length
          ? members
          : [{ id: makeId('m'), name: 'Equipe', initials: 'EQ', role: 'Lider do projeto' }],
        tasks: [
          {
            id: makeId('t'),
            title: 'Definir marcos e entregas',
            description: 'Primeira tarefa criada automaticamente para iniciar o planejamento.',
            priority: 'Media',
            dueLabel: 'Sprint 1',
            column: 'todo',
            createdAt: new Date().toISOString(),
            comments: [],
          },
        ],
        deliveries: [],
        repositories: repositoryFromUrl(input.repositoryUrl),
        reports: [],
      };

      setProjects((prev) => [newProject, ...prev]);
      return id;
    },
    [],
  );

  const addTask = useCallback((projectId: string, input: TaskInput) => {
    const task: Task = {
      id: makeId('t'),
      title: input.title.trim(),
      description: input.description?.trim() || undefined,
      assigneeId: input.assigneeId,
      priority: input.priority,
      dueLabel: input.dueLabel?.trim() || undefined,
      dueDate: input.dueDate?.trim() || undefined,
      column: 'todo',
      createdAt: new Date().toISOString(),
      comments: [],
    };

    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, tasks: [...p.tasks, task], progress: recalcProgress([...p.tasks, task]) } : p)),
    );
  }, []);

  const updateTask = useCallback((projectId: string, taskId: string, input: Partial<TaskInput> & { column?: KanbanColumn }) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const tasks = p.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                ...input,
                title: input.title?.trim() ?? t.title,
                description: input.description?.trim() || input.description === '' ? input.description?.trim() : t.description,
                dueLabel: input.dueLabel?.trim() || input.dueLabel === '' ? input.dueLabel?.trim() : t.dueLabel,
                dueDate: input.dueDate?.trim() || input.dueDate === '' ? input.dueDate?.trim() : t.dueDate,
                completedAt: input.column === 'done' ? new Date().toISOString() : input.column ? undefined : t.completedAt,
              }
            : t,
        );
        return { ...p, tasks, progress: recalcProgress(tasks) };
      }),
    );
  }, []);

  const deleteTask = useCallback((projectId: string, taskId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const tasks = p.tasks.filter((t) => t.id !== taskId);
        return { ...p, tasks, progress: recalcProgress(tasks) };
      }),
    );
  }, []);

  const addDelivery = useCallback((projectId: string, input: DeliveryInput) => {
    const delivery: Delivery = {
      id: makeId('d'),
      title: input.title.trim(),
      description: input.description?.trim() || undefined,
      fileLabel: input.fileLabel?.trim() || undefined,
      version: input.version.trim(),
      status: 'Enviada',
      uploadedBy: input.uploadedBy,
      uploadedAt: new Date().toISOString(),
      comments: [],
    };
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, deliveries: [delivery, ...p.deliveries] } : p)));
  }, []);

  const reviewDelivery = useCallback((projectId: string, deliveryId: string, status: DeliveryStatus, advisorComments?: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              deliveries: p.deliveries.map((d) =>
                d.id === deliveryId ? { ...d, status, advisorComments: advisorComments?.trim() || undefined } : d,
              ),
            }
          : p,
      ),
    );
  }, []);

  const addRepository = useCallback((projectId: string, input: RepositoryInput) => {
    const repository: GitRepository = {
      id: makeId('r'),
      name: input.name.trim(),
      url: input.url.trim(),
      platform: input.platform,
      description: input.description?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, repositories: [...p.repositories, repository] } : p)));
  }, []);

  const updateRepository = useCallback((projectId: string, repositoryId: string, input: RepositoryInput) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              repositories: p.repositories.map((r) =>
                r.id === repositoryId
                  ? {
                      ...r,
                      name: input.name.trim(),
                      url: input.url.trim(),
                      platform: input.platform,
                      description: input.description?.trim() || undefined,
                    }
                  : r,
              ),
            }
          : p,
      ),
    );
  }, []);

  const deleteRepository = useCallback((projectId: string, repositoryId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, repositories: p.repositories.filter((r) => r.id !== repositoryId) } : p,
      ),
    );
  }, []);

  const generateReport = useCallback((projectId: string, type: ReportType, generatedBy: string): AiReport => {
    const reportId = makeId('ai');
    let generatedReport: AiReport = {
      id: reportId,
      type,
      content: '',
      generatedBy,
      generatedAt: new Date().toISOString(),
      editedManually: false,
    };

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const open = p.tasks.filter((t) => t.column !== 'done').length;
        const overdue = p.tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.column !== 'done').length;
        const pendingDeliveries = p.deliveries.filter((d) => d.status === 'Enviada' || d.status === 'Em analise').length;
        const content =
          `${type} gerado com auxilio de IA.\n\n` +
          `Projeto: ${p.title}\n` +
          `Andamento geral: ${p.progress}%.\n` +
          `Tarefas em aberto: ${open}. Tarefas atrasadas: ${overdue}.\n` +
          `Entregas registradas: ${p.deliveries.length}. Aguardando revisao: ${pendingDeliveries}.\n` +
          `Repositorios vinculados: ${p.repositories.length}.\n\n` +
          `Proximos passos sugeridos: revisar pendencias do Kanban, alinhar entregas com o prazo ${p.deadlineLabel} e registrar feedbacks de orientacao.`;
        generatedReport = {
          id: reportId,
          type,
          content,
          generatedBy,
          generatedAt: new Date().toISOString(),
          editedManually: false,
        };
        return { ...p, reports: [generatedReport, ...p.reports], lastReportSummary: content };
      }),
    );
    return generatedReport;
  }, []);

  const updateReport = useCallback((projectId: string, reportId: string, content: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              reports: p.reports.map((r) => (r.id === reportId ? { ...r, content, editedManually: true } : r)),
              lastReportSummary: p.reports[0]?.id === reportId ? content : p.lastReportSummary,
            }
          : p,
      ),
    );
  }, []);

  const value = useMemo(
    () => ({
      projects,
      loading,
      getProject,
      moveTask,
      addProject,
      addTask,
      updateTask,
      deleteTask,
      addDelivery,
      reviewDelivery,
      addRepository,
      updateRepository,
      deleteRepository,
      generateReport,
      updateReport,
    }),
    [
      projects,
      loading,
      getProject,
      moveTask,
      addProject,
      addTask,
      updateTask,
      deleteTask,
      addDelivery,
      reviewDelivery,
      addRepository,
      updateRepository,
      deleteRepository,
      generateReport,
      updateReport,
    ],
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects(): ProjectsContextValue {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error('useProjects deve ser usado dentro de ProjectsProvider');
  return ctx;
}
