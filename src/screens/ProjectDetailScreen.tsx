import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { AppText } from '../components/AppText';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProgressBar } from '../components/ProgressBar';
import { SegmentedTabs } from '../components/SegmentedTabs';
import { TaskCard } from '../components/TaskCard';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { fontFamily, textStyles } from '../theme/typography';
import { useProjects } from '../context/ProjectsContext';
import { useAuth } from '../context/AuthContext';
import type {
  Delivery,
  DeliveryStatus,
  GitRepository,
  KanbanColumn,
  Project,
  RepositoryPlatform,
  ReportType,
  Task,
  TaskPriority,
} from '../types/project';
import type { RootStackParamList } from '../navigation/types';

const segments = [
  { key: 'overview', label: 'Visao' },
  { key: 'kanban', label: 'Kanban' },
  { key: 'deliveries', label: 'Entregas' },
  { key: 'git', label: 'Git' },
  { key: 'ai', label: 'IA' },
] as const;

type SegmentKey = (typeof segments)[number]['key'];

const columnMeta: { key: KanbanColumn; title: string; tint: string }[] = [
  { key: 'todo', title: 'A fazer', tint: colors.columnTodo },
  { key: 'doing', title: 'Em progresso', tint: colors.columnDoing },
  { key: 'review', title: 'Em revisao', tint: '#EEF6FF' },
  { key: 'done', title: 'Concluido', tint: colors.columnDone },
];

const priorities: TaskPriority[] = ['Baixa', 'Media', 'Alta', 'Critica'];
const deliveryStatuses: DeliveryStatus[] = ['Enviada', 'Em analise', 'Aprovada', 'Reprovada', 'Solicitacao de ajustes'];
const repositoryPlatforms: RepositoryPlatform[] = ['GitHub', 'GitLab', 'Bitbucket', 'Outro'];
const reportTypes: ReportType[] = ['Relatorio parcial', 'Relatorio final', 'Relatorio de progresso', 'Relatorio para orientacao', 'Resumo executivo'];

export function ProjectDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'ProjectDetail'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { projectId } = route.params;
  const projects = useProjects();
  const project = projects.getProject(projectId);

  const [tab, setTab] = useState<SegmentKey>('overview');
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [repositoryModalOpen, setRepositoryModalOpen] = useState(false);
  const [reportDraft, setReportDraft] = useState(project?.reports[0]?.content ?? project?.lastReportSummary ?? '');
  const [reportType, setReportType] = useState<ReportType>('Relatorio de progresso');

  useLayoutEffect(() => {
    navigation.setOptions({
      title: project?.title ?? 'Projeto',
    });
  }, [navigation, project?.title]);

  if (!project) {
    return (
      <View style={[styles.missing, { paddingTop: insets.top }]}>
        <AppText weight="semibold" style={styles.missingText}>
          Projeto nao encontrado.
        </AppText>
      </View>
    );
  }

  const canReviewDeliveries = user?.role === 'Professor orientador' || user?.role === 'Administrador';

  return (
    <View style={styles.root}>
      <View style={[styles.tabsWrap, { paddingTop: spacing.sm }]}>
        <SegmentedTabs
          items={segments.map((s) => ({ key: s.key, label: s.label }))}
          active={tab}
          onChange={(k) => setTab(k as SegmentKey)}
        />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          paddingBottom: insets.bottom + spacing.xxxl,
          paddingTop: spacing.md,
        }}
        showsVerticalScrollIndicator={false}
      >
        {projects.error ? (
          <Card style={{ marginBottom: spacing.md }}>
            <AppText weight="semibold" style={styles.errorText}>
              {projects.error}
            </AppText>
          </Card>
        ) : null}
        {tab === 'overview' ? <Overview project={project} /> : null}
        {tab === 'kanban' ? (
          <KanbanBoard
            project={project}
            onAdd={() => setTaskModalOpen(true)}
            onAdvance={(taskId, col) => projects.moveTask(project.id, taskId, col)}
            onMove={(taskId, col) => projects.updateTask(project.id, taskId, { column: col })}
            onDelete={(taskId) => projects.deleteTask(project.id, taskId)}
          />
        ) : null}
        {tab === 'deliveries' ? (
          <Deliveries
            project={project}
            canReview={canReviewDeliveries}
            onAdd={() => setDeliveryModalOpen(true)}
            onReview={(deliveryId, status, comments) => projects.reviewDelivery(project.id, deliveryId, status, comments)}
          />
        ) : null}
        {tab === 'git' ? (
          <GitPanel
            project={project}
            onAdd={() => setRepositoryModalOpen(true)}
            onDelete={(repositoryId) => projects.deleteRepository(project.id, repositoryId)}
          />
        ) : null}
        {tab === 'ai' ? (
          <AiPanel
            project={project}
            draft={reportDraft}
            reportType={reportType}
            onTypeChange={setReportType}
            onDraftChange={setReportDraft}
            onGenerate={async () => {
              const generated = await projects.generateReport(project.id, reportType, user?.name ?? 'Usuario');
              setReportDraft(generated.content);
            }}
            onSave={async () => {
              const latest = project.reports[0];
              if (latest) await projects.updateReport(project.id, latest.id, reportDraft);
            }}
          />
        ) : null}
      </ScrollView>

      <TaskModal
        visible={taskModalOpen}
        members={project.members}
        onClose={() => setTaskModalOpen(false)}
        onSave={(input) => {
          void projects.addTask(project.id, input);
          setTaskModalOpen(false);
        }}
      />
      <DeliveryModal
        visible={deliveryModalOpen}
        userName={user?.name ?? 'Usuario local'}
        onClose={() => setDeliveryModalOpen(false)}
        onSave={(input) => {
          void projects.addDelivery(project.id, input);
          setDeliveryModalOpen(false);
        }}
      />
      <RepositoryModal
        visible={repositoryModalOpen}
        onClose={() => setRepositoryModalOpen(false)}
        onSave={(input) => {
          void projects.addRepository(project.id, input);
          setRepositoryModalOpen(false);
        }}
      />
    </View>
  );
}

function Overview({ project }: { project: Project }) {
  const overdue = project.tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.column !== 'done').length;

  return (
    <View style={{ gap: spacing.lg }}>
      <Card>
        <View style={styles.rowBetween}>
          <View style={styles.kindPill}>
            <AppText weight="semibold" style={styles.kindPillText}>
              {project.kind}
            </AppText>
          </View>
          <AppText weight="medium" style={styles.deadline}>
            Prazo: {project.deadlineLabel}
          </AppText>
        </View>
        <AppText weight="bold" style={[textStyles.title, { marginTop: spacing.md }]}>
          {project.title}
        </AppText>
        <AppText weight="regular" style={styles.bodyMuted}>
          {project.subtitle}
        </AppText>
        <View style={styles.metaGrid}>
          <Metric label="Tarefas" value={String(project.tasks.length)} />
          <Metric label="Atrasadas" value={String(overdue)} danger={overdue > 0} />
          <Metric label="Entregas" value={String(project.deliveries.length)} />
          <Metric label="Repos." value={String(project.repositories.length)} />
        </View>
        <View style={{ marginTop: spacing.lg }}>
          <View style={styles.rowBetween}>
            <AppText weight="medium" style={styles.smallLabel}>
              Progresso consolidado
            </AppText>
            <AppText weight="semibold" style={styles.smallValue}>
              {project.progress}%
            </AppText>
          </View>
          <ProgressBar value={project.progress} height={10} />
        </View>
      </Card>

      <Card>
        <AppText weight="bold" style={styles.sectionTitle}>
          Equipe
        </AppText>
        <View style={styles.teamGrid}>
          {project.members.map((m) => (
            <View key={m.id} style={styles.member}>
              <View style={styles.avatar}>
                <AppText weight="bold" style={styles.avatarText}>
                  {m.initials}
                </AppText>
              </View>
              <AppText weight="semibold" style={styles.memberName} numberOfLines={2}>
                {m.name}
              </AppText>
              <AppText weight="medium" style={styles.memberRole} numberOfLines={1}>
                {m.role}
              </AppText>
            </View>
          ))}
        </View>
      </Card>
    </View>
  );
}

function Metric({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <View style={styles.metric}>
      <AppText weight="bold" style={[styles.metricValue, danger && { color: colors.danger }]}>
        {value}
      </AppText>
      <AppText weight="medium" style={styles.metricLabel}>
        {label}
      </AppText>
    </View>
  );
}

function KanbanBoard({
  project,
  onAdd,
  onAdvance,
  onMove,
  onDelete,
}: {
  project: Project;
  onAdd: () => void;
  onAdvance: (taskId: string, col: KanbanColumn) => void;
  onMove: (taskId: string, col: KanbanColumn) => void;
  onDelete: (taskId: string) => void;
}) {
  const isWeb = Platform.OS === 'web';
  const [draggedTask, setDraggedTask] = useState<{ id: string; column: KanbanColumn } | null>(null);
  const [dropTarget, setDropTarget] = useState<KanbanColumn | null>(null);

  const grouped = useMemo(() => {
    const map: Record<KanbanColumn, Task[]> = { todo: [], doing: [], review: [], done: [] };
    for (const t of project.tasks) map[t.column].push(t);
    return map;
  }, [project.tasks]);

  useEffect(() => {
    if (!isWeb || !draggedTask || typeof document === 'undefined') return;

    const findColumn = (event: MouseEvent): KanbanColumn | null => {
      const element = document.elementFromPoint(event.clientX, event.clientY);
      const column = element?.closest('[data-kanban-column]') as HTMLElement | null;
      const value = column?.dataset.kanbanColumn;
      return columnMeta.some((item) => item.key === value) ? (value as KanbanColumn) : null;
    };

    const handleMouseMove = (event: MouseEvent) => {
      setDropTarget(findColumn(event));
    };

    const handleMouseUp = (event: MouseEvent) => {
      const targetColumn = findColumn(event);
      if (targetColumn && targetColumn !== draggedTask.column) {
        onMove(draggedTask.id, targetColumn);
      }
      setDraggedTask(null);
      setDropTarget(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp, { once: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedTask, isWeb, onMove]);

  const taskMouseProps = (task: Task): Record<string, unknown> => {
    if (!isWeb) return {};

    return {
      onMouseDown: (event: MouseEvent) => {
        if (event.button !== 0) return;
        event.preventDefault();
        setDraggedTask({ id: task.id, column: task.column });
        setDropTarget(task.column);
      },
    };
  };

  const columnDataProps = (column: KanbanColumn): Record<string, unknown> => {
    if (!isWeb) return {};
    return { dataSet: { kanbanColumn: column } };
  };

  return (
    <View style={{ gap: spacing.md }}>
      <PrimaryButton label="Nova tarefa" onPress={onAdd} icon={<Ionicons name="add-circle-outline" size={18} color="#fff" />} />
      {isWeb ? (
        <View style={styles.dragHint}>
          <Ionicons name="hand-left-outline" size={16} color={colors.primary} />
          <AppText weight="medium" style={styles.dragHintText}>
            Segure e arraste uma tarefa para outra coluna para mudar seu status.
          </AppText>
        </View>
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kanbanRow}>
        {columnMeta.map((col) => (
          <View
            key={col.key}
            {...columnDataProps(col.key)}
            style={[
              styles.column,
              { backgroundColor: col.tint },
              dropTarget === col.key && styles.columnDropTarget,
            ]}
          >
            <View style={styles.columnHeader}>
              <AppText weight="bold" style={styles.columnTitle}>
                {col.title}
              </AppText>
              <View style={styles.countPill}>
                <AppText weight="semibold" style={styles.countText}>
                  {grouped[col.key].length}
                </AppText>
              </View>
            </View>
            <View style={{ gap: spacing.sm }}>
              {grouped[col.key].map((task) => (
                <View
                  key={task.id}
                  {...taskMouseProps(task)}
                  style={[
                    { gap: spacing.xs },
                    isWeb && styles.draggableTask,
                    draggedTask?.id === task.id && styles.draggingTask,
                  ]}
                >
                  <TaskCard task={task} onAdvance={onAdvance} />
                  <View style={styles.taskActions}>
                    {columnMeta.map((target) => (
                      <Pressable key={target.key} onPress={() => onMove(task.id, target.key)} style={styles.actionChip}>
                        <AppText weight="semibold" style={styles.actionText}>
                          {target.title}
                        </AppText>
                      </Pressable>
                    ))}
                    <Pressable onPress={() => onDelete(task.id)} style={[styles.actionChip, styles.deleteChip]}>
                      <AppText weight="semibold" style={styles.deleteText}>
                        Excluir
                      </AppText>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function Deliveries({
  project,
  canReview,
  onAdd,
  onReview,
}: {
  project: Project;
  canReview: boolean;
  onAdd: () => void;
  onReview: (deliveryId: string, status: DeliveryStatus, comments?: string) => void;
}) {
  const [commentByDelivery, setCommentByDelivery] = useState<Record<string, string>>({});

  return (
    <View style={{ gap: spacing.md }}>
      <PrimaryButton label="Nova entrega" onPress={onAdd} icon={<Ionicons name="cloud-upload-outline" size={18} color="#fff" />} />
      {!project.deliveries.length ? (
        <Card>
          <AppText weight="semibold" style={styles.emptyTitle}>
            Nenhuma versao registrada
          </AppText>
          <AppText weight="regular" style={styles.bodyMuted}>
            Envie uma entrega para iniciar o historico de versoes.
          </AppText>
        </Card>
      ) : (
        project.deliveries.map((d) => (
          <Card key={d.id}>
            <View style={styles.timelineTop}>
              <View style={styles.versionPill}>
                <AppText weight="bold" style={styles.versionText}>
                  {d.version}
                </AppText>
              </View>
              <StatusPill status={d.status} />
            </View>
            <AppText weight="semibold" style={styles.deliveryTitle}>
              {d.title}
            </AppText>
            <AppText weight="regular" style={styles.notes}>
              Enviado por {d.uploadedBy} em {formatDate(d.uploadedAt)}
            </AppText>
            {d.description ? <AppText weight="regular" style={styles.bodyMuted}>{d.description}</AppText> : null}
            {d.fileLabel ? <AppText weight="medium" style={styles.fileText}>{d.fileLabel}</AppText> : null}
            {d.advisorComments ? (
              <View style={styles.quote}>
                <AppText weight="regular" style={styles.quoteText}>
                  {d.advisorComments}
                </AppText>
              </View>
            ) : null}
            {canReview ? (
              <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
                <TextInput
                  value={commentByDelivery[d.id] ?? ''}
                  onChangeText={(text) => setCommentByDelivery((prev) => ({ ...prev, [d.id]: text }))}
                  placeholder="Comentario do orientador"
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                />
                <View style={styles.wrapRow}>
                  {deliveryStatuses.map((status) => (
                    <Pressable key={status} style={styles.actionChip} onPress={() => onReview(d.id, status, commentByDelivery[d.id])}>
                      <AppText weight="semibold" style={styles.actionText}>
                        {status}
                      </AppText>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}
          </Card>
        ))
      )}
    </View>
  );
}

function GitPanel({
  project,
  onAdd,
  onDelete,
}: {
  project: Project;
  onAdd: () => void;
  onDelete: (repositoryId: string) => void;
}) {
  return (
    <View style={{ gap: spacing.md }}>
      <PrimaryButton label="Adicionar repositorio" onPress={onAdd} icon={<Ionicons name="git-branch-outline" size={18} color="#fff" />} />
      {!project.repositories.length ? (
        <Card>
          <AppText weight="semibold" style={styles.emptyTitle}>
            Nenhum repositorio vinculado
          </AppText>
          <AppText weight="regular" style={styles.bodyMuted}>
            Adicione links GitHub, GitLab, Bitbucket ou outro Git remoto.
          </AppText>
        </Card>
      ) : (
        project.repositories.map((repo) => (
          <RepositoryCard key={repo.id} repository={repo} onDelete={() => onDelete(repo.id)} />
        ))
      )}
    </View>
  );
}

function RepositoryCard({ repository, onDelete }: { repository: GitRepository; onDelete: () => void }) {
  return (
    <Card>
      <View style={styles.gitHeader}>
        <Ionicons name="git-branch-outline" size={22} color={colors.text} />
        <View style={{ flex: 1 }}>
          <AppText weight="bold" style={styles.sectionTitle}>
            {repository.name}
          </AppText>
          <AppText weight="medium" style={styles.memberRole}>
            {repository.platform}
          </AppText>
        </View>
      </View>
      {repository.description ? (
        <AppText weight="regular" style={styles.bodyMuted}>
          {repository.description}
        </AppText>
      ) : null}
      <Pressable onPress={() => Linking.openURL(repository.url)} style={styles.urlBox}>
        <AppText weight="medium" style={styles.urlText} numberOfLines={2}>
          {repository.url}
        </AppText>
        <Ionicons name="open-outline" size={18} color={colors.primary} />
      </Pressable>
      <PrimaryButton label="Remover" variant="ghost" onPress={onDelete} style={{ marginTop: spacing.md }} />
    </Card>
  );
}

function AiPanel({
  project,
  draft,
  reportType,
  onTypeChange,
  onDraftChange,
  onGenerate,
  onSave,
}: {
  project: Project;
  draft: string;
  reportType: ReportType;
  onTypeChange: (type: ReportType) => void;
  onDraftChange: (text: string) => void;
  onGenerate: () => void;
  onSave: () => void;
}) {
  return (
    <View style={{ gap: spacing.lg }}>
      <Card>
        <View style={styles.aiHero}>
          <View style={styles.aiIcon}>
            <Ionicons name="sparkles" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText weight="bold" style={styles.sectionTitle}>
              Relatorio orientado por IA
            </AppText>
            <AppText weight="regular" style={styles.bodyMuted}>
              A sintese usa tarefas, entregas, prazos e repositorios locais do projeto.
            </AppText>
          </View>
        </View>
        <View style={styles.wrapRow}>
          {reportTypes.map((type) => (
            <Pressable key={type} onPress={() => onTypeChange(type)} style={[styles.actionChip, reportType === type && styles.selectedChip]}>
              <AppText weight="semibold" style={[styles.actionText, reportType === type && styles.selectedChipText]}>
                {type}
              </AppText>
            </Pressable>
          ))}
        </View>
        <PrimaryButton label="Gerar relatorio" onPress={onGenerate} style={{ marginTop: spacing.md }} />
      </Card>

      <Card>
        <AppText weight="bold" style={styles.sectionTitle}>
          Revisao manual
        </AppText>
        <TextInput
          value={draft}
          onChangeText={onDraftChange}
          placeholder="Gere um relatorio para editar o conteudo aqui."
          placeholderTextColor={colors.textMuted}
          multiline
          style={[styles.input, styles.reportInput]}
        />
        <PrimaryButton label="Salvar revisao" variant="outline" onPress={onSave} disabled={!project.reports.length} />
      </Card>

      {project.reports.map((report) => (
        <Card key={report.id}>
          <View style={styles.rowBetween}>
            <AppText weight="bold" style={styles.sectionTitle}>
              {report.type}
            </AppText>
            <AppText weight="medium" style={styles.dateText}>
              {formatDate(report.generatedAt)}
            </AppText>
          </View>
          <View style={styles.quote}>
            <AppText weight="regular" style={styles.quoteText}>
              {report.content}
            </AppText>
          </View>
          {report.editedManually ? (
            <AppText weight="semibold" style={styles.memberRole}>
              Editado manualmente
            </AppText>
          ) : null}
        </Card>
      ))}
    </View>
  );
}

function TaskModal({
  visible,
  members,
  onClose,
  onSave,
}: {
  visible: boolean;
  members: Project['members'];
  onClose: () => void;
  onSave: (input: {
    title: string;
    description?: string;
    assigneeId?: string;
    priority: TaskPriority;
    dueLabel?: string;
    dueDate?: string;
  }) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Media');
  const [assigneeId, setAssigneeId] = useState<string | undefined>(members[0]?.id);
  const [dueLabel, setDueLabel] = useState('');
  const [dueDate, setDueDate] = useState('');

  return (
    <FormModal visible={visible} title="Nova tarefa" onClose={onClose}>
      <Field label="Titulo" value={title} onChangeText={setTitle} placeholder="Ex.: Revisar metodologia" />
      <Field label="Descricao" value={description} onChangeText={setDescription} placeholder="Detalhes da atividade" />
      <OptionRow label="Prioridade" values={priorities} value={priority} onChange={setPriority} />
      <OptionRow label="Responsavel" values={members.map((m) => m.id)} value={assigneeId ?? ''} labelFor={(id) => members.find((m) => m.id === id)?.name ?? 'Equipe'} onChange={setAssigneeId} />
      <Field label="Prazo visivel" value={dueLabel} onChangeText={setDueLabel} placeholder="Ex.: 15 jun" />
      <Field label="Data do prazo" value={dueDate} onChangeText={setDueDate} placeholder="AAAA-MM-DD" />
      <PrimaryButton
        label="Salvar tarefa"
        onPress={() => {
          if (!title.trim()) return;
          onSave({ title, description, assigneeId, priority, dueLabel, dueDate });
          setTitle('');
          setDescription('');
          setPriority('Media');
          setDueLabel('');
          setDueDate('');
        }}
      />
    </FormModal>
  );
}

function DeliveryModal({
  visible,
  userName,
  onClose,
  onSave,
}: {
  visible: boolean;
  userName: string;
  onClose: () => void;
  onSave: (input: { title: string; description?: string; fileLabel?: string; version: string; uploadedBy: string }) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileLabel, setFileLabel] = useState('');
  const [version, setVersion] = useState('');

  return (
    <FormModal visible={visible} title="Nova entrega" onClose={onClose}>
      <Field label="Titulo" value={title} onChangeText={setTitle} placeholder="Ex.: Documento parcial" />
      <Field label="Versao" value={version} onChangeText={setVersion} placeholder="v1.2" />
      <Field label="Arquivo ou link" value={fileLabel} onChangeText={setFileLabel} placeholder="nome-do-arquivo.pdf" />
      <Field label="Descricao" value={description} onChangeText={setDescription} placeholder="Resumo da entrega" />
      <PrimaryButton
        label="Registrar entrega"
        onPress={() => {
          if (!title.trim() || !version.trim()) return;
          onSave({ title, version, fileLabel, description, uploadedBy: userName });
          setTitle('');
          setVersion('');
          setFileLabel('');
          setDescription('');
        }}
      />
    </FormModal>
  );
}

function RepositoryModal({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (input: { name: string; url: string; platform: RepositoryPlatform; description?: string }) => void;
}) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState<RepositoryPlatform>('GitHub');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  return (
    <FormModal visible={visible} title="Novo repositorio" onClose={onClose}>
      <Field label="Nome" value={name} onChangeText={setName} placeholder="Repositorio principal" />
      <Field label="URL" value={url} onChangeText={setUrl} placeholder="https://github.com/..." autoCapitalize="none" autoCorrect={false} />
      <OptionRow label="Plataforma" values={repositoryPlatforms} value={platform} onChange={setPlatform} />
      <Field label="Descricao" value={description} onChangeText={setDescription} placeholder="Opcional" />
      {error ? <AppText weight="semibold" style={styles.errorText}>{error}</AppText> : null}
      <PrimaryButton
        label="Salvar repositorio"
        onPress={() => {
          if (!name.trim() || !/^https?:\/\/\S+\.\S+/.test(url.trim())) {
            setError('Informe nome e URL iniciada por http:// ou https://.');
            return;
          }
          onSave({ name, url, platform, description });
          setName('');
          setUrl('');
          setPlatform('GitHub');
          setDescription('');
          setError('');
        }}
      />
    </FormModal>
  );
}

function FormModal({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalSheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <AppText weight="bold" style={styles.modalTitle}>
              {title}
            </AppText>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {children}
            <PrimaryButton label="Cancelar" variant="ghost" onPress={onClose} style={{ marginTop: spacing.sm }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function Field(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const { label, style, ...rest } = props;
  return (
    <>
      <AppText weight="semibold" style={styles.fieldLabel}>
        {label}
      </AppText>
      <TextInput placeholderTextColor={colors.textMuted} style={[styles.input, style]} {...rest} />
    </>
  );
}

function OptionRow<T extends string>({
  label,
  values,
  value,
  labelFor,
  onChange,
}: {
  label: string;
  values: T[];
  value: T | string;
  labelFor?: (value: T) => string;
  onChange: (value: T) => void;
}) {
  return (
    <>
      <AppText weight="semibold" style={styles.fieldLabel}>
        {label}
      </AppText>
      <View style={styles.wrapRow}>
        {values.map((item) => {
          const selected = value === item;
          return (
            <Pressable key={item} onPress={() => onChange(item)} style={[styles.actionChip, selected && styles.selectedChip]}>
              <AppText weight="semibold" style={[styles.actionText, selected && styles.selectedChipText]}>
                {labelFor ? labelFor(item) : item}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

function StatusPill({ status }: { status: DeliveryStatus }) {
  return (
    <View style={styles.statusPill}>
      <AppText weight="semibold" style={styles.statusText}>
        {status}
      </AppText>
    </View>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('pt-BR');
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  tabsWrap: { paddingHorizontal: spacing.xl, backgroundColor: colors.surface },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  missingText: { color: colors.textSecondary, fontSize: 15 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  kindPill: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  kindPillText: { color: colors.primary, fontSize: 12 },
  deadline: { fontSize: 12, color: colors.textMuted, flexShrink: 1, textAlign: 'right' },
  bodyMuted: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 20 },
  smallLabel: { fontSize: 12, color: colors.textMuted },
  smallValue: { fontSize: 12, color: colors.primary },
  sectionTitle: { fontSize: 16, color: colors.text },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
  metric: { minWidth: '45%', flex: 1, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  metricValue: { color: colors.text, fontSize: 18 },
  metricLabel: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  teamGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.lg },
  member: { width: '30%', minWidth: 96, gap: spacing.xs },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 14 },
  memberName: { fontSize: 13, color: colors.text },
  memberRole: { fontSize: 11, color: colors.textMuted },
  kanbanRow: { gap: spacing.md, paddingBottom: spacing.lg },
  column: {
    width: 280,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(15, 28, 20, 0.06)',
  },
  columnHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  columnTitle: { fontSize: 14, color: colors.text },
  countPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  countText: { fontSize: 12, color: colors.textSecondary },
  dragHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dragHintText: { color: colors.primaryDark, fontSize: 12 },
  columnDropTarget: {
    borderColor: colors.primary,
    borderWidth: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  draggableTask: {
    cursor: 'grab',
  } as never,
  draggingTask: {
    opacity: 0.56,
    transform: [{ scale: 0.98 }],
  },
  taskActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  actionChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  actionText: { fontSize: 11, color: colors.textSecondary },
  selectedChip: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
  selectedChipText: { color: colors.primary },
  deleteChip: { borderColor: '#FEE4E2', backgroundColor: '#FFF5F5' },
  deleteText: { color: colors.danger, fontSize: 11 },
  emptyTitle: { fontSize: 15, color: colors.text },
  timelineTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  versionPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  versionText: { color: '#fff', fontSize: 12 },
  statusPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.primaryMuted,
  },
  statusText: { color: colors.primary, fontSize: 12 },
  dateText: { fontSize: 12, color: colors.textMuted },
  deliveryTitle: { fontSize: 15, color: colors.text, marginTop: spacing.md },
  notes: { fontSize: 13, color: colors.textSecondary, marginTop: spacing.sm },
  fileText: { color: colors.primary, fontSize: 13, marginTop: spacing.sm },
  gitHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  urlBox: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  urlText: { flex: 1, color: colors.primary, fontSize: 13 },
  aiHero: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  aiIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quote: {
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quoteText: { fontSize: 14, color: colors.textSecondary, lineHeight: 21 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  fieldLabel: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.sm },
  input: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colors.text,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    marginBottom: spacing.md,
  },
  reportInput: { minHeight: 180, textAlignVertical: 'top' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 28, 20, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    maxHeight: '92%',
  },
  modalHandle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  modalTitle: { fontSize: 20, color: colors.text },
  errorText: { color: colors.danger, fontSize: 13, marginBottom: spacing.md },
});
