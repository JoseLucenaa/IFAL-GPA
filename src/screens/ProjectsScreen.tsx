import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { AppText } from '../components/AppText';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProgressBar } from '../components/ProgressBar';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { fontFamily, textStyles } from '../theme/typography';
import { useProjects } from '../context/ProjectsContext';
import type { Project, ProjectKind } from '../types/project';
import { useAppNavigation } from '../navigation/useAppNavigation';

const projectKinds: ProjectKind[] = ['Projeto Integrador', 'TCC', 'Pesquisa', 'Extensao', 'Outro'];
const filterKinds: Array<ProjectKind | 'Todos'> = ['Todos', ...projectKinds];

export function ProjectsScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const numColumns = isDesktop ? 3 : 1;

  const navigation = useAppNavigation();
  const { projects, loading, error: projectsError, addProject } = useProjects();
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeKind, setActiveKind] = useState<ProjectKind | 'Todos'>('Todos');

  const filteredProjects = useMemo(
    () =>
      projects
        .filter((project) => activeKind === 'Todos' || project.kind === activeKind)
        .filter((project) => {
          const normalized = query.trim().toLowerCase();
          if (!normalized) return true;

          return [project.title, project.subtitle, project.course, project.semester, project.kind]
            .filter(Boolean)
            .some((value) => value?.toLowerCase().includes(normalized));
        })
        .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR')),
    [activeKind, projects, query],
  );

  const overdueCount = projects.reduce(
    (acc, project) =>
      acc + project.tasks.filter((task) => task.dueDate && new Date(task.dueDate) < new Date() && task.column !== 'done').length,
    0,
  );
  const reviewCount = projects.reduce(
    (acc, project) => acc + project.deliveries.filter((delivery) => delivery.status === 'Enviada' || delivery.status === 'Em analise').length,
    0,
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.md }]}>
      <View style={[styles.header, isDesktop && styles.desktopHeader]}>
        <View style={styles.headerCopy}>
          <AppText weight="medium" style={styles.eyebrow}>
            Workspace
          </AppText>
          <AppText weight="bold" style={textStyles.title}>
            Projetos
          </AppText>
          <AppText weight="regular" style={styles.subtitle}>
            Encontre rapidamente projetos por tipo, prazo, equipe ou repositorio.
          </AppText>
        </View>
        <Pressable
          onPress={() => setModalOpen(true)}
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
          accessibilityLabel="Novo projeto"
        >
          <Ionicons name="add" size={26} color="#fff" />
        </Pressable>
      </View>

      <View style={[styles.toolbar, isDesktop && styles.desktopToolbar]}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar projeto, curso ou semestre"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {filterKinds.map((kind) => {
            const selected = activeKind === kind;
            return (
              <Pressable
                key={kind}
                onPress={() => setActiveKind(kind)}
                style={[styles.filterChip, selected && styles.filterChipSelected]}
              >
                <AppText weight="semibold" style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>
                  {kind}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={[styles.summaryGrid, isDesktop && styles.desktopSummaryGrid]}>
        <SummaryStat label="Projetos" value={String(projects.length)} icon="folder-outline" />
        <SummaryStat label="Atrasos" value={String(overdueCount)} icon="alert-circle-outline" danger={overdueCount > 0} />
        <SummaryStat label="Em revisao" value={String(reviewCount)} icon="document-text-outline" />
      </View>

      {projectsError ? (
        <View style={styles.loadingWrap}>
          <AppText weight="medium" style={styles.errorText}>
            {projectsError}
          </AppText>
        </View>
      ) : loading ? (
        <View style={styles.loadingWrap}>
          <AppText weight="medium" style={styles.subtitle}>
            Carregando projetos...
          </AppText>
        </View>
      ) : (
        <FlatList
          key={isDesktop ? 'desktop-grid' : 'mobile-list'}
          numColumns={numColumns}
          columnWrapperStyle={isDesktop ? { gap: spacing.md, paddingHorizontal: spacing.xs } : undefined}
          data={filteredProjects}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            { paddingBottom: insets.bottom + spacing.xxxl, paddingTop: spacing.lg, paddingHorizontal: spacing.xl, gap: isDesktop ? spacing.md : undefined },
            isDesktop && { maxWidth: 1200, width: '100%', alignSelf: 'center' }
          ]}
          ItemSeparatorComponent={isDesktop ? null : () => <View style={{ height: spacing.md }} />}
          renderItem={({ item }) => (
            <View style={isDesktop ? { flex: 1, padding: spacing.xs } : undefined}>
              <Pressable
                onPress={() => navigation.navigate('ProjectDetail', { projectId: item.id })}
                style={({ pressed }) => [pressed && styles.itemPressed, { flex: 1 }]}
              >
                <ProjectRow project={item} isDesktop={isDesktop} />
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            <Card>
              <AppText weight="semibold" style={styles.emptyTitle}>
                {projects.length ? 'Nenhum projeto encontrado' : 'Comece pelo primeiro projeto'}
              </AppText>
              <AppText weight="regular" style={styles.emptyBody}>
                {projects.length
                  ? 'Ajuste a busca ou selecione outro tipo para ampliar os resultados.'
                  : 'Organize entregas longas, versoes e repositorios em um so lugar.'}
              </AppText>
              {!projects.length ? (
                <PrimaryButton
                  label="Criar projeto"
                  onPress={() => setModalOpen(true)}
                  style={{ marginTop: spacing.lg }}
                />
              ) : null}
            </Card>
          }
        />
      )}

      <NewProjectModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={async (payload) => {
          const projectId = await addProject(payload);
          setModalOpen(false);
          navigation.navigate('ProjectDetail', { projectId });
        }}
      />
    </View>
  );
}

function ProjectRow({ project, isDesktop }: { project: Project; isDesktop?: boolean }) {
  const overdue = project.tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.column !== 'done').length;
  const pendingReview = project.deliveries.filter((d) => d.status === 'Enviada' || d.status === 'Em analise').length;
  const completedTasks = project.tasks.filter((task) => task.column === 'done').length;

  return (
    <Card style={[styles.rowCard, isDesktop && { height: '100%' }]}>
      <View style={styles.rowTop}>
        <View style={[styles.kindPill, overdue > 0 && styles.kindPillDanger]}>
          <AppText weight="semibold" style={styles.kindPillText}>
            {project.kind}
          </AppText>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </View>
      <AppText weight="bold" style={styles.rowTitle} numberOfLines={2}>
        {project.title}
      </AppText>
      <AppText weight="regular" style={styles.rowSubtitle} numberOfLines={2}>
        {project.subtitle}
      </AppText>
      <View style={styles.statusRow}>
        <StatusChip icon="checkbox-outline" label={`${completedTasks}/${project.tasks.length} tarefas`} />
        <StatusChip icon="document-text-outline" label={`${project.deliveries.length} entregas`} />
      </View>
      <View style={{ marginTop: spacing.md }}>
        <View style={styles.progressLabels}>
          <AppText weight="medium" style={styles.progressLabel}>
            Progresso
          </AppText>
          <AppText weight="semibold" style={styles.progressValue}>
            {project.progress}%
          </AppText>
        </View>
        <ProgressBar value={project.progress} />
      </View>
      <View style={styles.metaRow}>
        <Ionicons name="people-outline" size={16} color={colors.textMuted} />
        <AppText weight="medium" style={styles.metaText}>
          {project.members.length} membros
        </AppText>
        <View style={styles.dot} />
        <Ionicons name="git-branch-outline" size={16} color={colors.textMuted} />
        <AppText weight="medium" style={styles.metaText}>
          {project.repositories.length} repos.
        </AppText>
        <View style={styles.dot} />
        <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
        <AppText weight="medium" style={styles.metaText} numberOfLines={1}>
          {project.deadlineLabel}
        </AppText>
      </View>
      {(overdue > 0 || pendingReview > 0) && (
        <View style={styles.alertRow}>
          {overdue > 0 ? (
            <AppText weight="semibold" style={styles.alertText}>
              {overdue} tarefa(s) atrasada(s)
            </AppText>
          ) : null}
          {pendingReview > 0 ? (
            <AppText weight="semibold" style={styles.reviewText}>
              {pendingReview} entrega(s) em revisao
            </AppText>
          ) : null}
        </View>
      )}
    </Card>
  );
}

function SummaryStat({
  label,
  value,
  icon,
  danger,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  danger?: boolean;
}) {
  return (
    <Card style={styles.summaryCard}>
      <View style={[styles.summaryIcon, danger && styles.summaryIconDanger]}>
        <Ionicons name={icon} size={18} color={danger ? colors.danger : colors.primary} />
      </View>
      <View>
        <AppText weight="bold" style={styles.summaryValue}>
          {value}
        </AppText>
        <AppText weight="medium" style={styles.summaryLabel}>
          {label}
        </AppText>
      </View>
    </Card>
  );
}

function StatusChip({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.statusChip}>
      <Ionicons name={icon} size={14} color={colors.textMuted} />
      <AppText weight="semibold" style={styles.statusChipText}>
        {label}
      </AppText>
    </View>
  );
}

function NewProjectModal({
  visible,
  onClose,
  onCreate,
}: {
  visible: boolean;
  onClose: () => void;
  onCreate: (payload: {
    title: string;
    subtitle: string;
    kind: ProjectKind;
    course?: string;
    semester?: string;
    deadlineLabel: string;
    deadlineDate?: string;
    repositoryUrl?: string;
    memberNames: string[];
  }) => Promise<void>;
}) {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [kind, setKind] = useState<ProjectKind>('Projeto Integrador');
  const [course, setCourse] = useState('');
  const [semester, setSemester] = useState('');
  const [deadlineLabel, setDeadlineLabel] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [members, setMembers] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setTitle('');
    setSubtitle('');
    setKind('Projeto Integrador');
    setCourse('');
    setSemester('');
    setDeadlineLabel('');
    setDeadlineDate('');
    setRepositoryUrl('');
    setMembers('');
    setError('');
  };

  const inputStyle = {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colors.text,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  } as const;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalSheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <AppText weight="bold" style={styles.modalTitle}>
              Novo projeto
            </AppText>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Field label="Titulo" value={title} onChangeText={setTitle} placeholder="Ex.: Sistema de gestao de estagios" style={inputStyle} />
            <Field label="Descricao curta" value={subtitle} onChangeText={setSubtitle} placeholder="Resumo em uma linha" style={inputStyle} />

            <AppText weight="semibold" style={styles.fieldLabel}>
              Tipo
            </AppText>
            <View style={styles.kindRow}>
              {projectKinds.map((k) => {
                const selected = kind === k;
                return (
                  <Pressable key={k} onPress={() => setKind(k)} style={[styles.kindChip, selected && styles.kindChipSelected]}>
                    <AppText weight="semibold" style={[styles.kindChipText, selected && styles.kindChipTextSel]}>
                      {k}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            <Field label="Curso" value={course} onChangeText={setCourse} placeholder="Analise e Desenvolvimento de Sistemas" style={inputStyle} />
            <Field label="Periodo/Semestre" value={semester} onChangeText={setSemester} placeholder="2026.1" style={inputStyle} />
            <Field label="Prazo principal" value={deadlineLabel} onChangeText={setDeadlineLabel} placeholder="Ex.: 15 de set. de 2026" style={inputStyle} />
            <Field label="Data do prazo (opcional)" value={deadlineDate} onChangeText={setDeadlineDate} placeholder="AAAA-MM-DD" style={inputStyle} />
            <Field label="Repositorio Git inicial" value={repositoryUrl} onChangeText={setRepositoryUrl} placeholder="https://github.com/..." style={inputStyle} autoCapitalize="none" autoCorrect={false} />
            <Field label="Equipe (nomes separados por virgula)" value={members} onChangeText={setMembers} placeholder="Ana Souza, Bruno Lima" style={inputStyle} />

            {error ? (
              <AppText weight="semibold" style={styles.errorText}>
                {error}
              </AppText>
            ) : null}

            <PrimaryButton
              label="Salvar projeto"
              loading={submitting}
              onPress={async () => {
                if (!title.trim()) {
                  setError('Informe o titulo do projeto.');
                  return;
                }
                if (repositoryUrl.trim() && !isValidUrl(repositoryUrl)) {
                  setError('Use uma URL iniciada por http:// ou https://.');
                  return;
                }
                setSubmitting(true);
                setError('');
                try {
                  await onCreate({
                    title,
                    subtitle,
                    kind,
                    course,
                    semester,
                    deadlineLabel: deadlineLabel || 'A definir',
                    deadlineDate,
                    repositoryUrl,
                    memberNames: members.split(',').map((s) => s.trim()).filter(Boolean),
                  });
                  reset();
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Nao foi possivel criar o projeto.');
                } finally {
                  setSubmitting(false);
                }
              }}
            />
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
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[style, { marginBottom: spacing.md }]}
        {...rest}
      />
    </>
  );
}

function isValidUrl(value: string) {
  return /^https?:\/\/\S+\.\S+/.test(value.trim());
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  header: {
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  desktopHeader: {
    paddingHorizontal: spacing.xl,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    marginTop: spacing.lg,
  },
  headerCopy: { flex: 1, minWidth: 0 },
  eyebrow: { color: colors.primary, fontSize: 13, marginBottom: spacing.xs },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs, maxWidth: 620, lineHeight: 20 },
  toolbar: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  desktopToolbar: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  searchBox: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontFamily: fontFamily.regular,
    color: colors.text,
    fontSize: 15,
    paddingVertical: spacing.md,
    outlineStyle: 'none' as never,
  },
  filterRow: {
    gap: spacing.sm,
    paddingRight: spacing.xl,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  filterChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  filterChipText: { color: colors.textSecondary, fontSize: 13 },
  filterChipTextSelected: { color: colors.primary },
  summaryGrid: {
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  desktopSummaryGrid: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  summaryCard: {
    minWidth: 150,
    flexGrow: 1,
    flexBasis: 0,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIconDanger: { backgroundColor: '#FEF3F2' },
  summaryValue: { color: colors.text, fontSize: 20 },
  summaryLabel: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  loadingWrap: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  fabPressed: { transform: [{ scale: 0.96 }] },
  rowCard: { padding: spacing.lg },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kindPill: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  kindPillDanger: { backgroundColor: '#FEF3F2' },
  kindPillText: { color: colors.primary, fontSize: 12 },
  rowTitle: { fontSize: 17, marginTop: spacing.md, color: colors.text },
  rowSubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusChipText: { color: colors.textSecondary, fontSize: 11 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  progressLabel: { fontSize: 12, color: colors.textMuted },
  progressValue: { fontSize: 12, color: colors.primary },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    flexWrap: 'wrap',
  },
  metaText: { fontSize: 12, color: colors.textSecondary, flexShrink: 1 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.borderStrong },
  alertRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  alertText: { color: colors.danger, fontSize: 12 },
  reviewText: { color: colors.info, fontSize: 12 },
  itemPressed: { opacity: 0.94, transform: [{ scale: 0.995 }] },
  emptyTitle: { fontSize: 16, color: colors.text },
  emptyBody: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 20 },
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
  fieldLabel: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.sm },
  kindRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  kindChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  kindChipSelected: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
  kindChipText: { fontSize: 13, color: colors.textSecondary },
  kindChipTextSel: { color: colors.primary },
  errorText: { color: colors.danger, fontSize: 13, marginBottom: spacing.md },
});
