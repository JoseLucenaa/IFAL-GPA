create function public.set_project_owner()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Project creation requires an authenticated user.';
  end if;

  new.created_by = (select auth.uid());
  return new;
end;
$$;

drop trigger if exists projects_set_owner on public.projects;

create trigger projects_set_owner
before insert on public.projects
for each row execute function public.set_project_owner();

drop policy if exists "Signed in users can create projects" on public.projects;

create policy "Signed in users can create projects"
on public.projects for insert
to authenticated
with check ((select auth.uid()) is not null);
