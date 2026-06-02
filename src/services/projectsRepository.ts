import { supabase } from '../lib/supabase';
import type { User } from '../types/auth';
import type {
  AiReport,
  Delivery,
  DeliveryStatus,
  GitRepository,
  KanbanColumn,
  Member,
  Project,
  ProjectKind,
  RepositoryPlatform,
  ReportType,
  Task,
  TaskPriority,
} from '../types/project';

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

type ProjectRow = {
  id: string;
  title: string;
  subtitle: string;
  description: string | null;
  kind: ProjectKind;
  course: string | null;
  semester: string | null;
  progress: number;
  deadline_label: string | null;
  deadline_date: string | null;
  last_report_summary: string | null;
  project_members?: ProjectMemberRow[];
  tasks?: TaskRow[];
  deliveries?: DeliveryRow[];
  git_repositories?: RepositoryRow[];
  ai_reports?: ReportRow[];
};

type ProjectMemberRow = {
  id: string;
  user_id: string;
  role: Member['role'];
  profiles?:
    | {
        id: string;
        name: string;
      }
    | {
        id: string;
        name: string;
      }[]
    | null;
};

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  assignee_id: string | null;
  priority: TaskPriority;
  due_label: string | null;
  due_date: string | null;
  column_status: KanbanColumn;
  created_at: string;
  completed_at: string | null;
};

type DeliveryRow = {
  id: string;
  title: string;
  description: string | null;
  file_label: string | null;
  file_url: string | null;
  version: string;
  status: DeliveryStatus;
  uploaded_by: string | null;
  uploaded_by_name: string | null;
  uploaded_at: string;
  advisor_comments: string | null;
};

type RepositoryRow = {
  id: string;
  name: string;
  url: string;
  platform: RepositoryPlatform;
  description: string | null;
  created_at: string;
};

type ReportRow = {
  id: string;
  type: ReportType;
  content: string;
  generated_by: string | null;
  generated_at: string;
  edited_manually: boolean;
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function inferPlatform(url: string): RepositoryPlatform {
  const lower = url.toLowerCase();
  if (lower.includes('github.com')) return 'GitHub';
  if (lower.includes('gitlab.com')) return 'GitLab';
  if (lower.includes('bitbucket.org')) return 'Bitbucket';
  return 'Outro';
}

function recalcProgress(tasks: Task[]): number {
  const done = tasks.filter((t) => t.column === 'done').length;
  return Math.round((done / Math.max(tasks.length, 1)) * 100);
}

function mapProject(row: ProjectRow): Project {
  const tasks = (row.tasks ?? [])
    .map((task): Task => ({
      id: task.id,
      title: task.title,
      description: task.description ?? undefined,
      assigneeId: task.assignee_id ?? undefined,
      priority: task.priority,
      dueLabel: task.due_label ?? undefined,
      dueDate: task.due_date ?? undefined,
      column: task.column_status,
      createdAt: task.created_at,
      completedAt: task.completed_at ?? undefined,
      comments: [],
    }))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    kind: row.kind,
    course: row.course ?? undefined,
    semester: row.semester ?? undefined,
    progress: row.progress,
    deadlineLabel: row.deadline_label ?? 'A definir',
    deadlineDate: row.deadline_date ?? undefined,
    members: (row.project_members ?? []).map((member): Member => {
      const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles;
      const name = profile?.name ?? 'Membro do projeto';
      return {
        id: member.user_id,
        name,
        initials: initialsFromName(name),
        role: member.role,
      };
    }),
    tasks,
    deliveries: (row.deliveries ?? [])
      .map((delivery): Delivery => ({
        id: delivery.id,
        title: delivery.title,
        description: delivery.description ?? undefined,
        fileLabel: delivery.file_label ?? undefined,
        fileUrl: delivery.file_url ?? undefined,
        version: delivery.version,
        status: delivery.status,
        uploadedBy: delivery.uploaded_by_name ?? delivery.uploaded_by ?? 'Equipe',
        uploadedAt: delivery.uploaded_at,
        advisorComments: delivery.advisor_comments ?? undefined,
        comments: [],
      }))
      .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)),
    repositories: (row.git_repositories ?? []).map((repository): GitRepository => ({
      id: repository.id,
      name: repository.name,
      url: repository.url,
      platform: repository.platform,
      description: repository.description ?? undefined,
      createdAt: repository.created_at,
    })),
    reports: (row.ai_reports ?? [])
      .map((report): AiReport => ({
        id: report.id,
        type: report.type,
        content: report.content,
        generatedBy: report.generated_by ?? 'Usuario',
        generatedAt: report.generated_at,
        editedManually: report.edited_manually,
      }))
      .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt)),
    lastReportSummary: row.last_report_summary ?? undefined,
  };
}

async function refreshProjectProgress(projectId: string): Promise<void> {
  const { data, error } = await supabase
    .from('tasks')
    .select('column_status')
    .eq('project_id', projectId);

  if (error) throw error;

  const tasks = (data ?? []).map((row) => ({
    column: row.column_status as KanbanColumn,
  })) as Task[];
  const progress = recalcProgress(tasks);

  const { error: updateError } = await supabase
    .from('projects')
    .update({ progress })
    .eq('id', projectId);

  if (updateError) throw updateError;
}

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select(
      `
        id,
        title,
        subtitle,
        description,
        kind,
        course,
        semester,
        progress,
        deadline_label,
        deadline_date,
        last_report_summary,
        project_members(id, user_id, role, profiles(id, name)),
        tasks(id, title, description, assignee_id, priority, due_label, due_date, column_status, created_at, completed_at),
        deliveries(id, title, description, file_label, file_url, version, status, uploaded_by, uploaded_by_name, uploaded_at, advisor_comments),
        git_repositories(id, name, url, platform, description, created_at),
        ai_reports(id, type, content, generated_by, generated_at, edited_manually)
      `,
    )
    .order('title', { ascending: true });

  if (error) throw error;
  return ((data ?? []) as unknown as ProjectRow[]).map(mapProject);
}

export async function createProject(
  input: {
    title: string;
    subtitle: string;
    kind: ProjectKind;
    course?: string;
    semester?: string;
    deadlineLabel: string;
    deadlineDate?: string;
    repositoryUrl?: string;
    memberNames: string[];
  },
  user: User,
): Promise<string> {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      title: input.title.trim(),
      subtitle: input.subtitle.trim(),
      kind: input.kind,
      course: input.course?.trim() || null,
      semester: input.semester?.trim() || null,
      deadline_label: input.deadlineLabel.trim() || 'A definir',
      deadline_date: input.deadlineDate?.trim() || null,
      status: 'Planejado',
    })
    .select('id')
    .single();

  if (error) throw error;
  const projectId = data.id as string;

  const { error: memberError } = await supabase.from('project_members').insert({
    project_id: projectId,
    user_id: user.id,
    role: 'Lider do projeto',
  });

  if (memberError) throw memberError;

  const repositoryUrl = input.repositoryUrl?.trim();
  if (repositoryUrl) {
    await addRepository(projectId, {
      name: 'Repositorio principal',
      url: repositoryUrl,
      platform: inferPlatform(repositoryUrl),
      description: 'Link informado na criacao do projeto',
    });
  }

  await addTask(projectId, {
    title: 'Definir marcos e entregas',
    description: 'Primeira tarefa criada automaticamente para iniciar o planejamento.',
    priority: 'Media',
    dueLabel: 'Sprint 1',
  });

  return projectId;
}

export async function addTask(projectId: string, input: TaskInput): Promise<void> {
  const { error } = await supabase.from('tasks').insert({
    project_id: projectId,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    assignee_id: input.assigneeId || null,
    priority: input.priority,
    due_label: input.dueLabel?.trim() || null,
    due_date: input.dueDate?.trim() || null,
    column_status: 'todo',
  });

  if (error) throw error;
  await refreshProjectProgress(projectId);
}

export async function updateTask(
  projectId: string,
  taskId: string,
  input: Partial<TaskInput> & { column?: KanbanColumn },
): Promise<void> {
  const updates: Record<string, unknown> = {};

  if (input.title !== undefined) updates.title = input.title.trim();
  if (input.description !== undefined) updates.description = input.description.trim() || null;
  if (input.assigneeId !== undefined) updates.assignee_id = input.assigneeId || null;
  if (input.priority !== undefined) updates.priority = input.priority;
  if (input.dueLabel !== undefined) updates.due_label = input.dueLabel.trim() || null;
  if (input.dueDate !== undefined) updates.due_date = input.dueDate.trim() || null;
  if (input.column !== undefined) {
    updates.column_status = input.column;
    updates.completed_at = input.column === 'done' ? new Date().toISOString() : null;
  }

  const { error } = await supabase.from('tasks').update(updates).eq('id', taskId);
  if (error) throw error;
  await refreshProjectProgress(projectId);
}

export async function deleteTask(projectId: string, taskId: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  if (error) throw error;
  await refreshProjectProgress(projectId);
}

export async function addDelivery(projectId: string, input: DeliveryInput): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase.from('deliveries').insert({
    project_id: projectId,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    file_label: input.fileLabel?.trim() || null,
    version: input.version.trim(),
    status: 'Enviada',
    uploaded_by: userData.user?.id ?? null,
    uploaded_by_name: input.uploadedBy,
  });

  if (error) throw error;
}

export async function reviewDelivery(
  deliveryId: string,
  status: DeliveryStatus,
  advisorComments?: string,
): Promise<void> {
  const { error } = await supabase
    .from('deliveries')
    .update({
      status,
      advisor_comments: advisorComments?.trim() || null,
    })
    .eq('id', deliveryId);

  if (error) throw error;
}

export async function addRepository(projectId: string, input: RepositoryInput): Promise<void> {
  const { error } = await supabase.from('git_repositories').insert({
    project_id: projectId,
    name: input.name.trim(),
    url: input.url.trim(),
    platform: input.platform,
    description: input.description?.trim() || null,
  });

  if (error) throw error;
}

export async function updateRepository(repositoryId: string, input: RepositoryInput): Promise<void> {
  const { error } = await supabase
    .from('git_repositories')
    .update({
      name: input.name.trim(),
      url: input.url.trim(),
      platform: input.platform,
      description: input.description?.trim() || null,
    })
    .eq('id', repositoryId);

  if (error) throw error;
}

export async function deleteRepository(repositoryId: string): Promise<void> {
  const { error } = await supabase.from('git_repositories').delete().eq('id', repositoryId);
  if (error) throw error;
}

export async function generateReport(
  project: Project,
  type: ReportType,
  generatedBy: string,
): Promise<AiReport> {
  const open = project.tasks.filter((t) => t.column !== 'done').length;
  const overdue = project.tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.column !== 'done',
  ).length;
  const pendingDeliveries = project.deliveries.filter(
    (d) => d.status === 'Enviada' || d.status === 'Em analise',
  ).length;
  const content =
    `${type} gerado com auxilio de IA.\n\n` +
    `Projeto: ${project.title}\n` +
    `Andamento geral: ${project.progress}%.\n` +
    `Tarefas em aberto: ${open}. Tarefas atrasadas: ${overdue}.\n` +
    `Entregas registradas: ${project.deliveries.length}. Aguardando revisao: ${pendingDeliveries}.\n` +
    `Repositorios vinculados: ${project.repositories.length}.\n\n` +
    `Proximos passos sugeridos: revisar pendencias do Kanban, alinhar entregas com o prazo ${project.deadlineLabel} e registrar feedbacks de orientacao.`;

  const { data: userData } = await supabase.auth.getUser();
  const generatedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from('ai_reports')
    .insert({
      project_id: project.id,
      type,
      content,
      generated_by: userData.user?.id ?? null,
      generated_at: generatedAt,
      edited_manually: false,
    })
    .select('id')
    .single();

  if (error) throw error;

  const { error: projectError } = await supabase
    .from('projects')
    .update({ last_report_summary: content })
    .eq('id', project.id);

  if (projectError) throw projectError;

  return {
    id: data.id as string,
    type,
    content,
    generatedBy,
    generatedAt,
    editedManually: false,
  };
}

export async function updateReport(
  projectId: string,
  reportId: string,
  content: string,
): Promise<void> {
  const { error } = await supabase
    .from('ai_reports')
    .update({ content, edited_manually: true })
    .eq('id', reportId);

  if (error) throw error;

  const { error: projectError } = await supabase
    .from('projects')
    .update({ last_report_summary: content })
    .eq('id', projectId);

  if (projectError) throw projectError;
}
