import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import type {
  AiReport,
  DeliveryStatus,
  KanbanColumn,
  Project,
  ProjectKind,
  ReportType,
} from '../types/project';
import * as repository from '../services/projectsRepository';
import type {
  DeliveryInput,
  RepositoryInput,
  TaskInput,
} from '../services/projectsRepository';

interface ProjectsContextValue {
  projects: Project[];
  loading: boolean;
  error: string;
  refreshProjects: () => Promise<void>;
  getProject: (id: string) => Project | undefined;
  moveTask: (projectId: string, taskId: string, column: KanbanColumn) => Promise<void>;
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
  }) => Promise<string>;
  addTask: (projectId: string, input: TaskInput) => Promise<void>;
  updateTask: (projectId: string, taskId: string, input: Partial<TaskInput> & { column?: KanbanColumn }) => Promise<void>;
  deleteTask: (projectId: string, taskId: string) => Promise<void>;
  addDelivery: (projectId: string, input: DeliveryInput) => Promise<void>;
  reviewDelivery: (projectId: string, deliveryId: string, status: DeliveryStatus, advisorComments?: string) => Promise<void>;
  addRepository: (projectId: string, input: RepositoryInput) => Promise<void>;
  updateRepository: (projectId: string, repositoryId: string, input: RepositoryInput) => Promise<void>;
  deleteRepository: (projectId: string, repositoryId: string) => Promise<void>;
  generateReport: (projectId: string, type: ReportType, generatedBy: string) => Promise<AiReport>;
  updateReport: (projectId: string, reportId: string, content: string) => Promise<void>;
}

const ProjectsContext = createContext<ProjectsContextValue | undefined>(undefined);

export type { DeliveryInput, RepositoryInput, TaskInput };

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setError('');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const nextProjects = await repository.fetchProjects();
      setProjects(nextProjects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel carregar projetos.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    void refreshProjects();
  }, [authLoading, refreshProjects]);

  const withRefresh = useCallback(
    async <T,>(operation: () => Promise<T>): Promise<T> => {
      setError('');
      try {
        const result = await operation();
        await refreshProjects();
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Nao foi possivel salvar os dados.';
        setError(message);
        throw new Error(message);
      }
    },
    [refreshProjects],
  );

  const getProject = useCallback(
    (id: string) => projects.find((p) => p.id === id),
    [projects],
  );

  const moveTask = useCallback(
    (projectId: string, taskId: string, column: KanbanColumn) =>
      withRefresh(() => repository.updateTask(projectId, taskId, { column })),
    [withRefresh],
  );

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
    }) => {
      if (!user) throw new Error('Entre para criar projetos.');
      return withRefresh(() => repository.createProject(input, user));
    },
    [user, withRefresh],
  );

  const addTask = useCallback(
    (projectId: string, input: TaskInput) => withRefresh(() => repository.addTask(projectId, input)),
    [withRefresh],
  );

  const updateTask = useCallback(
    (projectId: string, taskId: string, input: Partial<TaskInput> & { column?: KanbanColumn }) =>
      withRefresh(() => repository.updateTask(projectId, taskId, input)),
    [withRefresh],
  );

  const deleteTask = useCallback(
    (projectId: string, taskId: string) => withRefresh(() => repository.deleteTask(projectId, taskId)),
    [withRefresh],
  );

  const addDelivery = useCallback(
    (projectId: string, input: DeliveryInput) => withRefresh(() => repository.addDelivery(projectId, input)),
    [withRefresh],
  );

  const reviewDelivery = useCallback(
    (projectId: string, deliveryId: string, status: DeliveryStatus, advisorComments?: string) =>
      withRefresh(() => repository.reviewDelivery(deliveryId, status, advisorComments)),
    [withRefresh],
  );

  const addRepository = useCallback(
    (projectId: string, input: RepositoryInput) => withRefresh(() => repository.addRepository(projectId, input)),
    [withRefresh],
  );

  const updateRepository = useCallback(
    (_projectId: string, repositoryId: string, input: RepositoryInput) =>
      withRefresh(() => repository.updateRepository(repositoryId, input)),
    [withRefresh],
  );

  const deleteRepository = useCallback(
    (_projectId: string, repositoryId: string) => withRefresh(() => repository.deleteRepository(repositoryId)),
    [withRefresh],
  );

  const generateReport = useCallback(
    (projectId: string, type: ReportType, generatedBy: string) => {
      const project = getProject(projectId);
      if (!project) throw new Error('Projeto nao encontrado.');
      return withRefresh(() => repository.generateReport(project, type, generatedBy));
    },
    [getProject, withRefresh],
  );

  const updateReport = useCallback(
    (projectId: string, reportId: string, content: string) =>
      withRefresh(() => repository.updateReport(projectId, reportId, content)),
    [withRefresh],
  );

  const value = useMemo(
    () => ({
      projects,
      loading,
      error,
      refreshProjects,
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
      error,
      refreshProjects,
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
