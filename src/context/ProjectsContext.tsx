import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { seedProjects } from '../data/seedProjects';
import type { KanbanColumn, Project, ProjectKind } from '../types/project';

interface ProjectsContextValue {
  projects: Project[];
  getProject: (id: string) => Project | undefined;
  moveTask: (projectId: string, taskId: string, column: KanbanColumn) => void;
  addProject: (input: {
    title: string;
    subtitle: string;
    kind: ProjectKind;
    deadlineLabel: string;
    gitUrl: string;
    memberNames: string[];
  }) => void;
  setLastReport: (projectId: string, summary: string) => void;
}

const ProjectsContext = createContext<ProjectsContextValue | undefined>(undefined);

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(() =>
    seedProjects.map((p) => ({ ...p, tasks: p.tasks.map((t) => ({ ...t })), deliveries: [...p.deliveries] })),
  );

  const getProject = useCallback(
    (id: string) => projects.find((p) => p.id === id),
    [projects],
  );

  const moveTask = useCallback((projectId: string, taskId: string, column: KanbanColumn) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const tasks = p.tasks.map((t) => (t.id === taskId ? { ...t, column } : t));
        const done = tasks.filter((t) => t.column === 'done').length;
        const progress = Math.round((done / Math.max(tasks.length, 1)) * 100);
        return { ...p, tasks, progress };
      }),
    );
  }, []);

  const addProject = useCallback(
    (input: {
      title: string;
      subtitle: string;
      kind: ProjectKind;
      deadlineLabel: string;
      gitUrl: string;
      memberNames: string[];
    }) => {
      const members = input.memberNames
        .map((n) => n.trim())
        .filter(Boolean)
        .map((name) => ({ id: makeId('m'), name, initials: initialsFromName(name) }));

      const newProject: Project = {
        id: makeId('p'),
        title: input.title.trim(),
        subtitle: input.subtitle.trim(),
        kind: input.kind,
        progress: 0,
        deadlineLabel: input.deadlineLabel.trim(),
        gitUrl: input.gitUrl.trim(),
        members: members.length ? members : [{ id: makeId('m'), name: 'Equipe', initials: 'EQ' }],
        tasks: [
          {
            id: makeId('t'),
            title: 'Definir marcos e entregas',
            dueLabel: 'Sprint 1',
            column: 'todo',
          },
        ],
        deliveries: [],
      };

      setProjects((prev) => [newProject, ...prev]);
    },
    [],
  );

  const setLastReport = useCallback((projectId: string, summary: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, lastReportSummary: summary } : p)),
    );
  }, []);

  const value = useMemo(
    () => ({ projects, getProject, moveTask, addProject, setLastReport }),
    [projects, getProject, moveTask, addProject, setLastReport],
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects(): ProjectsContextValue {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error('useProjects deve ser usado dentro de ProjectsProvider');
  return ctx;
}
