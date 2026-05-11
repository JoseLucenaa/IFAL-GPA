export type KanbanColumn = 'todo' | 'doing' | 'done';

export interface Task {
  id: string;
  title: string;
  dueLabel?: string;
  column: KanbanColumn;
}

export interface Delivery {
  id: string;
  version: string;
  label: string;
  date: string;
  notes?: string;
}

export interface Member {
  id: string;
  name: string;
  initials: string;
}

export type ProjectKind = 'TCC' | 'Projeto Integrador';

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  kind: ProjectKind;
  progress: number;
  deadlineLabel: string;
  gitUrl: string;
  members: Member[];
  tasks: Task[];
  deliveries: Delivery[];
  lastReportSummary?: string;
}
