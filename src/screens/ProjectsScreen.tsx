import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
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

export function ProjectsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();
  const { projects, loading, addProject } = useProjects();
  const [modalOpen, setModalOpen] = useState(false);

  const sorted = useMemo(
    () => [...projects].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR')),
    [projects],
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.header}>
        <View>
          <AppText weight="bold" style={textStyles.title}>
            Projetos
          </AppText>
          <AppText weight="regular" style={styles.subtitle}>
            Projetos persistidos no dispositivo, com equipe, prazos e repositorios.
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

      {loading ? (
        <View style={styles.loadingWrap}>
          <AppText weight="medium" style={styles.subtitle}>
            Carregando projetos...
          </AppText>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxxl, paddingHorizontal: spacing.xl }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate('ProjectDetail', { projectId: item.id })}
              style={({ pressed }) => [pressed && styles.itemPressed]}
            >
              <ProjectRow project={item} />
            </Pressable>
          )}
          ListEmptyComponent={
            <Card>
              <AppText weight="semibold" style={styles.emptyTitle}>
                Comece pelo primeiro projeto
              </AppText>
              <AppText weight="regular" style={styles.emptyBody}>
                Organize entregas longas, versoes e repositorios em um so lugar.
              </AppText>
              <PrimaryButton
                label="Criar projeto"
                onPress={() => setModalOpen(true)}
                style={{ marginTop: spacing.lg }}
              />
            </Card>
          }
        />
      )}

      <NewProjectModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={(payload) => {
          const projectId = addProject(payload);
          setModalOpen(false);
          navigation.navigate('ProjectDetail', { projectId });
        }}
      />
    </View>
  );
}

function ProjectRow({ project }: { project: Project }) {
  const overdue = project.tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.column !== 'done').length;
  const pendingReview = project.deliveries.filter((d) => d.status === 'Enviada' || d.status === 'Em analise').length;

  return (
    <Card style={styles.rowCard}>
      <View style={styles.rowTop}>
        <View style={styles.kindPill}>
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
  }) => void;
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
              onPress={() => {
                if (!title.trim()) {
                  setError('Informe o titulo do projeto.');
                  return;
                }
                if (repositoryUrl.trim() && !isValidUrl(repositoryUrl)) {
                  setError('Use uma URL iniciada por http:// ou https://.');
                  return;
                }
                onCreate({
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
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs, maxWidth: '78%' },
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
  kindPillText: { color: colors.primary, fontSize: 12 },
  rowTitle: { fontSize: 17, marginTop: spacing.md, color: colors.text },
  rowSubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs },
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
