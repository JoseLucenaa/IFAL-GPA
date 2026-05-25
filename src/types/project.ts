export type KanbanColumn = 'todo' | 'doing' | 'review' | 'done';

export type TaskPriority = 'Baixa' | 'Media' | 'Alta' | 'Critica';

export type MemberRole =
  | 'Lider do projeto'
  | 'Desenvolvedor'
  | 'Pesquisador'
  | 'Documentador'
  | 'Designer'
  | 'Orientador'
  | 'Avaliador';

export type ProjectKind = 'Projeto Integrador' | 'TCC' | 'Pesquisa' | 'Extensao' | 'Outro';

export type DeliveryStatus =
  | 'Enviada'
  | 'Em analise'
  | 'Aprovada'
  | 'Reprovada'
  | 'Solicitacao de ajustes';

export type RepositoryPlatform = 'GitHub' | 'GitLab' | 'Bitbucket' | 'Outro';

export type ReportType =
  | 'Relatorio parcial'
  | 'Relatorio final'
  | 'Relatorio de progresso'
  | 'Relatorio para orientacao'
  | 'Resumo executivo';

export interface Comment {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assigneeId?: string;
  priority: TaskPriority;
  dueLabel?: string;
  dueDate?: string;
  column: KanbanColumn;
  createdAt: string;
  completedAt?: string;
  comments: Comment[];
}

export interface Delivery {
  id: string;
  title: string;
  description?: string;
  fileLabel?: string;
  fileUrl?: string;
  version: string;
  status: DeliveryStatus;
  uploadedBy: string;
  uploadedAt: string;
  advisorComments?: string;
  comments: Comment[];
}

export interface Member {
  id: string;
  name: string;
  initials: string;
  role: MemberRole;
}

export interface GitRepository {
  id: string;
  name: string;
  url: string;
  platform: RepositoryPlatform;
  description?: string;
  createdAt: string;
}

export interface AiReport {
  id: string;
  type: ReportType;
  content: string;
  generatedBy: string;
  generatedAt: string;
  editedManually: boolean;
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  kind: ProjectKind;
  course?: string;
  semester?: string;
  progress: number;
  deadlineLabel: string;
  deadlineDate?: string;
  members: Member[];
  tasks: Task[];
  deliveries: Delivery[];
  repositories: GitRepository[];
  reports: AiReport[];
  lastReportSummary?: string;
}
