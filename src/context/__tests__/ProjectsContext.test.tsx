import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, render, waitFor } from '@testing-library/react-native';
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '../AuthContext';
import { ProjectsProvider, useProjects } from '../ProjectsContext';

const PROJECTS_DB_KEY = '@ifal-gpa/projects/by-user';
const SESSION_KEY = '@ifal-gpa/auth/session';

type AuthValue = ReturnType<typeof useAuth>;
type ProjectsValue = ReturnType<typeof useProjects>;

function AppProbe({
  onAuth,
  onProjects,
}: {
  onAuth?: (value: AuthValue) => void;
  onProjects: (value: ProjectsValue) => void;
}) {
  const auth = useAuth();
  const projects = useProjects();

  useEffect(() => {
    onAuth?.(auth);
  }, [auth, onAuth]);

  useEffect(() => {
    onProjects(projects);
  }, [projects, onProjects]);

  return null;
}

async function renderProviders(sessionUser?: {
  id: string;
  name: string;
  email: string;
  role: 'Estudante' | 'Professor orientador';
  course?: string;
  registration?: string;
  createdAt: string;
}) {
  if (sessionUser) {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
  }

  let auth: AuthValue | undefined;
  let projects: ProjectsValue | undefined;

  render(
    <AuthProvider>
      <ProjectsProvider>
        <AppProbe
          onAuth={(value) => {
            auth = value;
          }}
          onProjects={(value) => {
            projects = value;
          }}
        />
      </ProjectsProvider>
    </AuthProvider>,
  );

  await waitFor(() => {
    expect(auth?.loading).toBe(false);
    expect(projects?.loading).toBe(false);
  });

  if (!auth || !projects) throw new Error('Contexts were not rendered.');

  return {
    getAuth: () => auth as AuthValue,
    getProjects: () => projects as ProjectsValue,
  };
}

describe('ProjectsContext', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('seeds projects only for the student test account', async () => {
    const { getProjects } = await renderProviders({
      id: 'u_test_student',
      name: 'Teste Estudante',
      email: 'student@test.ifal.edu.br',
      role: 'Estudante',
      createdAt: '2026-05-25T00:00:00.000Z',
    });

    expect(getProjects().projects.length).toBeGreaterThan(0);

    const raw = await AsyncStorage.getItem(PROJECTS_DB_KEY);
    expect(raw).not.toBeNull();
    expect(raw).toContain('u_test_student');
    expect(raw).toContain('Plataforma de monitoramento ambiental');
  });

  it('starts a newly created account with no projects', async () => {
    const { getAuth, getProjects } = await renderProviders();

    expect(getProjects().projects).toHaveLength(0);

    await act(async () => {
      await getAuth().register({
        name: 'Conta Nova',
        email: 'nova@ifal.edu.br',
        password: '123456',
        role: 'Estudante',
        course: 'ADS',
        registration: '20260003',
      });
    });

    await waitFor(() => {
      expect(getProjects().loading).toBe(false);
      expect(getProjects().projects).toHaveLength(0);
    });

    const raw = await AsyncStorage.getItem(PROJECTS_DB_KEY);
    expect(raw).toContain(getAuth().user?.id);
  });

  it('keeps project data isolated by user account', async () => {
    const { getProjects } = await renderProviders({
      id: 'u_new_empty',
      name: 'Novo Usuario',
      email: 'novo@ifal.edu.br',
      role: 'Estudante',
      createdAt: '2026-05-25T00:00:00.000Z',
    });

    expect(getProjects().projects).toHaveLength(0);

    let projectId = '';
    await act(async () => {
      projectId = await getProjects().addProject({
        title: 'Projeto privado',
        subtitle: 'Somente desta conta',
        kind: 'Projeto Integrador',
        course: 'ADS',
        semester: '2026.1',
        deadlineLabel: '30 jun',
        deadlineDate: '2026-06-30',
        repositoryUrl: 'https://github.com/ifal/teste',
        memberNames: ['Maria Silva'],
      });
    });

    expect(getProjects().getProject(projectId)?.title).toBe('Projeto privado');

    const raw = await AsyncStorage.getItem(PROJECTS_DB_KEY);
    expect(raw).toContain('u_new_empty');
    expect(raw).toContain('Projeto privado');
    expect(raw).not.toContain('u_test_student');
  });

  it('creates a project with members and an initial repository', async () => {
    const { getProjects } = await renderProviders({
      id: 'u_test_student',
      name: 'Teste Estudante',
      email: 'student@test.ifal.edu.br',
      role: 'Estudante',
      createdAt: '2026-05-25T00:00:00.000Z',
    });

    let projectId = '';
    await act(async () => {
      projectId = await getProjects().addProject({
        title: 'Novo PI',
        subtitle: 'Projeto de teste',
        kind: 'Projeto Integrador',
        course: 'ADS',
        semester: '2026.1',
        deadlineLabel: '30 jun',
        deadlineDate: '2026-06-30',
        repositoryUrl: 'https://github.com/ifal/teste',
        memberNames: ['Maria Silva', 'Joao Lima'],
      });
    });

    const project = getProjects().getProject(projectId);
    expect(project?.members).toHaveLength(2);
    expect(project?.members[0]?.role).toBe('Lider do projeto');
    expect(project?.repositories[0]?.platform).toBe('GitHub');
  });

  it('adds, moves, and deletes tasks while recalculating progress', async () => {
    const { getProjects } = await renderProviders({
      id: 'u_test_student',
      name: 'Teste Estudante',
      email: 'student@test.ifal.edu.br',
      role: 'Estudante',
      createdAt: '2026-05-25T00:00:00.000Z',
    });
    const projectId = getProjects().projects[0]!.id;

    await act(async () => {
      getProjects().addTask(projectId, {
        title: 'Nova tarefa',
        priority: 'Alta',
        dueLabel: 'amanha',
        dueDate: '2026-06-01',
      });
    });

    const created = getProjects().getProject(projectId)?.tasks.find((t) => t.title === 'Nova tarefa');
    expect(created?.column).toBe('todo');

    await act(async () => {
      getProjects().moveTask(projectId, created!.id, 'done');
    });

    expect(getProjects().getProject(projectId)?.tasks.find((t) => t.id === created!.id)?.column).toBe('done');

    await act(async () => {
      getProjects().deleteTask(projectId, created!.id);
    });

    expect(getProjects().getProject(projectId)?.tasks.find((t) => t.id === created!.id)).toBeUndefined();
  });

  it('adds and reviews deliveries', async () => {
    const { getProjects } = await renderProviders({
      id: 'u_test_professor',
      name: 'Teste Professor',
      email: 'professor@test.ifal.edu.br',
      role: 'Professor orientador',
      createdAt: '2026-05-25T00:00:00.000Z',
    });
    const projectId = getProjects().projects[0]!.id;

    await act(async () => {
      getProjects().addDelivery(projectId, {
        title: 'Relatorio parcial',
        version: 'v2.0',
        fileLabel: 'relatorio.pdf',
        uploadedBy: 'Teste Estudante',
      });
    });

    const delivery = getProjects().getProject(projectId)?.deliveries.find((d) => d.version === 'v2.0');
    expect(delivery?.status).toBe('Enviada');

    await act(async () => {
      getProjects().reviewDelivery(projectId, delivery!.id, 'Solicitacao de ajustes', 'Ajustar referencias.');
    });

    const reviewed = getProjects().getProject(projectId)?.deliveries.find((d) => d.id === delivery!.id);
    expect(reviewed?.status).toBe('Solicitacao de ajustes');
    expect(reviewed?.advisorComments).toBe('Ajustar referencias.');
  });

  it('manages repositories and AI report history', async () => {
    const { getProjects } = await renderProviders({
      id: 'u_test_student',
      name: 'Teste Estudante',
      email: 'student@test.ifal.edu.br',
      role: 'Estudante',
      createdAt: '2026-05-25T00:00:00.000Z',
    });
    const projectId = getProjects().projects[0]!.id;

    await act(async () => {
      getProjects().addRepository(projectId, {
        name: 'Docs',
        url: 'https://gitlab.com/ifal/docs',
        platform: 'GitLab',
      });
    });

    expect(getProjects().getProject(projectId)?.repositories.some((r) => r.platform === 'GitLab')).toBe(true);

    let reportId = '';
    await act(async () => {
      reportId = (await getProjects().generateReport(projectId, 'Resumo executivo', 'Teste')).id;
    });

    expect(getProjects().getProject(projectId)?.reports[0]?.id).toBe(reportId);

    await act(async () => {
      getProjects().updateReport(projectId, reportId, 'Conteudo revisado');
    });

    expect(getProjects().getProject(projectId)?.reports[0]?.content).toBe('Conteudo revisado');
    expect(getProjects().getProject(projectId)?.reports[0]?.editedManually).toBe(true);
  });
});
