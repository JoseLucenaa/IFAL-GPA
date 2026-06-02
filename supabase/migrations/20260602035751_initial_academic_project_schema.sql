create extension if not exists pgcrypto;

create type public.user_role as enum (
  'Estudante',
  'Professor orientador',
  'Coordenador',
  'Avaliador',
  'Administrador'
);

create type public.user_status as enum ('Ativo', 'Inativo', 'Suspenso');

create type public.project_kind as enum (
  'Projeto Integrador',
  'TCC',
  'Pesquisa',
  'Extensao',
  'Outro'
);

create type public.project_status as enum (
  'Planejado',
  'Em andamento',
  'Em revisao',
  'Concluido',
  'Cancelado'
);

create type public.member_role as enum (
  'Lider do projeto',
  'Desenvolvedor',
  'Pesquisador',
  'Documentador',
  'Designer',
  'Orientador',
  'Avaliador'
);

create type public.task_priority as enum ('Baixa', 'Media', 'Alta', 'Critica');
create type public.kanban_column as enum ('todo', 'doing', 'review', 'done');

create type public.delivery_status as enum (
  'Enviada',
  'Em analise',
  'Aprovada',
  'Reprovada',
  'Solicitacao de ajustes'
);

create type public.repository_platform as enum ('GitHub', 'GitLab', 'Bitbucket', 'Outro');

create type public.report_type as enum (
  'Relatorio parcial',
  'Relatorio final',
  'Relatorio de progresso',
  'Relatorio para orientacao',
  'Resumo executivo'
);

create type public.comment_entity_type as enum ('project', 'task', 'delivery', 'report');

create type public.notification_type as enum (
  'Nova tarefa atribuida',
  'Tarefa proxima do prazo',
  'Tarefa atrasada',
  'Nova entrega enviada',
  'Entrega comentada pelo orientador',
  'Solicitacao de ajustes',
  'Projeto concluido',
  'Relatorio gerado'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role public.user_role not null default 'Estudante',
  course text,
  registration text,
  status public.user_status not null default 'Ativo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text not null default '',
  description text,
  kind public.project_kind not null,
  course text,
  semester text,
  progress integer not null default 0 check (progress between 0 and 100),
  deadline_label text,
  deadline_date date,
  start_date date,
  status public.project_status not null default 'Planejado',
  advisor_id uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  last_report_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.member_role not null,
  joined_at timestamptz not null default now(),
  unique (project_id, user_id, role)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  assignee_id uuid references public.profiles(id) on delete set null,
  priority public.task_priority not null default 'Media',
  due_label text,
  due_date date,
  column_status public.kanban_column not null default 'todo',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.deliveries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  file_label text,
  file_url text,
  version text not null,
  status public.delivery_status not null default 'Enviada',
  uploaded_by uuid references public.profiles(id) on delete set null,
  uploaded_by_name text,
  uploaded_at timestamptz not null default now(),
  advisor_comments text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.git_repositories (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  url text not null check (url ~* '^https?://'),
  platform public.repository_platform not null default 'Outro',
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ai_reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  type public.report_type not null,
  content text not null,
  generated_by uuid references public.profiles(id) on delete set null,
  generated_at timestamptz not null default now(),
  edited_manually boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  author_name text,
  entity_type public.comment_entity_type not null,
  entity_id uuid not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index project_members_project_id_idx on public.project_members(project_id);
create index project_members_user_id_idx on public.project_members(user_id);
create index projects_advisor_id_idx on public.projects(advisor_id);
create index projects_created_by_idx on public.projects(created_by);
create index projects_course_idx on public.projects(course);
create index tasks_project_id_idx on public.tasks(project_id);
create index tasks_assignee_id_idx on public.tasks(assignee_id);
create index tasks_due_date_idx on public.tasks(due_date);
create index deliveries_project_id_idx on public.deliveries(project_id);
create index git_repositories_project_id_idx on public.git_repositories(project_id);
create index ai_reports_project_id_idx on public.ai_reports(project_id);
create index comments_entity_idx on public.comments(entity_type, entity_id);
create index comments_author_id_idx on public.comments(author_id);
create index notifications_recipient_id_idx on public.notifications(recipient_id, read_at);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create trigger deliveries_set_updated_at
before update on public.deliveries
for each row execute function public.set_updated_at();

create trigger git_repositories_set_updated_at
before update on public.git_repositories
for each row execute function public.set_updated_at();

create trigger ai_reports_set_updated_at
before update on public.ai_reports
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.tasks enable row level security;
alter table public.deliveries enable row level security;
alter table public.git_repositories enable row level security;
alter table public.ai_reports enable row level security;
alter table public.comments enable row level security;
alter table public.notifications enable row level security;

create policy "Profiles are viewable by signed in users"
on public.profiles for select
to authenticated
using (true);

create policy "Users can insert their own profile"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create schema if not exists app_private;
revoke all on schema app_private from public;

create function app_private.is_project_participant(target_project_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.projects p
    where p.id = target_project_id
      and (
        p.created_by = (select auth.uid())
        or p.advisor_id = (select auth.uid())
        or exists (
          select 1
          from public.project_members pm
          where pm.project_id = p.id
            and pm.user_id = (select auth.uid())
        )
      )
  );
$$;

create function app_private.can_manage_project(target_project_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.projects p
    where p.id = target_project_id
      and (
        p.created_by = (select auth.uid())
        or p.advisor_id = (select auth.uid())
        or exists (
          select 1
          from public.project_members pm
          where pm.project_id = p.id
            and pm.user_id = (select auth.uid())
            and pm.role in ('Lider do projeto', 'Orientador')
        )
      )
  );
$$;

grant usage on schema app_private to authenticated;
grant execute on function app_private.is_project_participant(uuid) to authenticated;
grant execute on function app_private.can_manage_project(uuid) to authenticated;

create policy "Project participants can view projects"
on public.projects for select
to authenticated
using (app_private.is_project_participant(id));

create policy "Signed in users can create projects"
on public.projects for insert
to authenticated
with check (created_by = (select auth.uid()));

create policy "Project leaders and advisors can update projects"
on public.projects for update
to authenticated
using (app_private.can_manage_project(id))
with check (app_private.can_manage_project(id));

create policy "Project leaders and advisors can delete projects"
on public.projects for delete
to authenticated
using (app_private.can_manage_project(id));

create policy "Project participants can view members"
on public.project_members for select
to authenticated
using (app_private.is_project_participant(project_id));

create policy "Project leaders and advisors can manage members"
on public.project_members for all
to authenticated
using (app_private.can_manage_project(project_id))
with check (app_private.can_manage_project(project_id));

create policy "Project participants can view tasks"
on public.tasks for select
to authenticated
using (app_private.is_project_participant(project_id));

create policy "Project participants can manage tasks"
on public.tasks for all
to authenticated
using (app_private.is_project_participant(project_id))
with check (app_private.is_project_participant(project_id));

create policy "Project participants can view deliveries"
on public.deliveries for select
to authenticated
using (app_private.is_project_participant(project_id));

create policy "Project participants can manage deliveries"
on public.deliveries for all
to authenticated
using (app_private.is_project_participant(project_id))
with check (app_private.is_project_participant(project_id));

create policy "Project participants can view repositories"
on public.git_repositories for select
to authenticated
using (app_private.is_project_participant(project_id));

create policy "Project participants can manage repositories"
on public.git_repositories for all
to authenticated
using (app_private.is_project_participant(project_id))
with check (app_private.is_project_participant(project_id));

create policy "Project participants can view reports"
on public.ai_reports for select
to authenticated
using (app_private.is_project_participant(project_id));

create policy "Project participants can manage reports"
on public.ai_reports for all
to authenticated
using (app_private.is_project_participant(project_id))
with check (app_private.is_project_participant(project_id));

create policy "Signed in users can view their comments"
on public.comments for select
to authenticated
using (author_id = (select auth.uid()));

create policy "Signed in users can create comments"
on public.comments for insert
to authenticated
with check (author_id = (select auth.uid()));

create policy "Authors can update their comments"
on public.comments for update
to authenticated
using (author_id = (select auth.uid()))
with check (author_id = (select auth.uid()));

create policy "Authors can delete their comments"
on public.comments for delete
to authenticated
using (author_id = (select auth.uid()));

create policy "Users can view their notifications"
on public.notifications for select
to authenticated
using (recipient_id = (select auth.uid()));

create policy "Users can update their notifications"
on public.notifications for update
to authenticated
using (recipient_id = (select auth.uid()))
with check (recipient_id = (select auth.uid()));
