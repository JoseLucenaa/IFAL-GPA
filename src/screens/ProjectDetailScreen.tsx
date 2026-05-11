import React, { useLayoutEffect, useMemo, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
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
import { textStyles } from '../theme/typography';
import { useProjects } from '../context/ProjectsContext';
import type { KanbanColumn, Project } from '../types/project';
import type { RootStackParamList } from '../navigation/types';

const segments = [
  { key: 'overview', label: 'Visão' },
  { key: 'kanban', label: 'Kanban' },
  { key: 'deliveries', label: 'Entregas' },
  { key: 'git', label: 'Git' },
  { key: 'ai', label: 'IA' },
] as const;

type SegmentKey = (typeof segments)[number]['key'];

const columnMeta: { key: KanbanColumn; title: string; tint: string }[] = [
  { key: 'todo', title: 'A fazer', tint: colors.columnTodo },
  { key: 'doing', title: 'Em progresso', tint: colors.columnDoing },
  { key: 'done', title: 'Concluído', tint: colors.columnDone },
];

export function ProjectDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'ProjectDetail'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { projectId } = route.params;
  const { getProject, moveTask, setLastReport } = useProjects();
  const project = getProject(projectId);

  const [tab, setTab] = useState<SegmentKey>('overview');
  const [aiLoading, setAiLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: project?.title ?? 'Projeto',
    });
  }, [navigation, project?.title]);

  if (!project) {
    return (
      <View style={[styles.missing, { paddingTop: insets.top }]}>
        <AppText weight="semibold" style={styles.missingText}>
          Projeto não encontrado.
        </AppText>
      </View>
    );
  }

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
        {tab === 'overview' ? <Overview project={project} /> : null}
        {tab === 'kanban' ? (
          <KanbanBoard
            project={project}
            onAdvance={(taskId, col) => moveTask(project.id, taskId, col)}
          />
        ) : null}
        {tab === 'deliveries' ? <Deliveries project={project} /> : null}
        {tab === 'git' ? <GitPanel url={project.gitUrl} /> : null}
        {tab === 'ai' ? (
          <AiPanel
            project={project}
            loading={aiLoading}
            onGenerate={() => {
              setAiLoading(true);
              setTimeout(() => {
                const summary = buildMockReport(project);
                setLastReport(project.id, summary);
                setAiLoading(false);
              }, 1600);
            }}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

function Overview({ project }: { project: Project }) {
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
        <AppText weight="regular" style={styles.sectionHint}>
          Papéis e contatos podem ser integrados ao backend no futuro.
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
            </View>
          ))}
        </View>
      </Card>
    </View>
  );
}

function KanbanBoard({
  project,
  onAdvance,
}: {
  project: Project;
  onAdvance: (taskId: string, col: KanbanColumn) => void;
}) {
  const grouped = useMemo(() => {
    const map: Record<KanbanColumn, typeof project.tasks> = { todo: [], doing: [], done: [] };
    for (const t of project.tasks) {
      map[t.column].push(t);
    }
    return map;
  }, [project.tasks]);

  return (
    <View style={{ gap: spacing.md }}>
      <AppText weight="regular" style={styles.hint}>
        Organize tarefas e prazos. Use “Mover” para simular o fluxo do quadro.
      </AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kanbanRow}>
        {columnMeta.map((col) => (
          <View key={col.key} style={[styles.column, { backgroundColor: col.tint }]}>
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
                <TaskCard key={task.id} task={task} onAdvance={onAdvance} />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function Deliveries({ project }: { project: Project }) {
  if (!project.deliveries.length) {
    return (
      <Card>
        <AppText weight="semibold" style={styles.emptyTitle}>
          Nenhuma versão registrada
        </AppText>
        <AppText weight="regular" style={styles.bodyMuted}>
          Controle de entregas versionadas aparecerá aqui (v0.1, v0.2, builds, PDFs).
        </AppText>
      </Card>
    );
  }

  return (
    <View style={{ gap: spacing.md }}>
      <AppText weight="regular" style={styles.hint}>
        Histórico de entregas para auditoria e orientação.
      </AppText>
      {project.deliveries.map((d) => (
        <Card key={d.id}>
          <View style={styles.timelineTop}>
            <View style={styles.versionPill}>
              <AppText weight="bold" style={styles.versionText}>
                {d.version}
              </AppText>
            </View>
            <AppText weight="medium" style={styles.dateText}>
              {d.date}
            </AppText>
          </View>
          <AppText weight="semibold" style={styles.deliveryTitle}>
            {d.label}
          </AppText>
          {d.notes ? (
            <AppText weight="regular" style={styles.notes}>
              {d.notes}
            </AppText>
          ) : null}
        </Card>
      ))}
    </View>
  );
}

function GitPanel({ url }: { url: string }) {
  return (
    <Card>
      <View style={styles.gitHeader}>
        <Ionicons name="logo-github" size={22} color={colors.text} />
        <AppText weight="bold" style={styles.sectionTitle}>
          Repositório
        </AppText>
      </View>
      <AppText weight="regular" style={styles.bodyMuted}>
        Link público ou privado do time. Em produção, valide permissões e webhooks.
      </AppText>
      <Pressable
        onPress={() => Linking.openURL(url.startsWith('http') ? url : `https://${url}`)}
        style={styles.urlBox}
      >
        <AppText weight="medium" style={styles.urlText} numberOfLines={2}>
          {url}
        </AppText>
        <Ionicons name="open-outline" size={18} color={colors.primary} />
      </Pressable>
    </Card>
  );
}

function AiPanel({
  project,
  loading,
  onGenerate,
}: {
  project: Project;
  loading: boolean;
  onGenerate: () => void;
}) {
  return (
    <View style={{ gap: spacing.lg }}>
      <Card>
        <View style={styles.aiHero}>
          <SparkleBadge />
          <View style={{ flex: 1 }}>
            <AppText weight="bold" style={styles.sectionTitle}>
              Relatório orientado por IA
            </AppText>
            <AppText weight="regular" style={styles.bodyMuted}>
              Consolida status do quadro, entregas e prazos em linguagem natural para bancas e orientadores.
            </AppText>
          </View>
        </View>
        <PrimaryButton label="Gerar relatório" loading={loading} onPress={onGenerate} />
      </Card>

      <Card>
        <AppText weight="bold" style={styles.sectionTitle}>
          Último resumo
        </AppText>
        <View style={styles.quote}>
          <AppText weight="regular" style={styles.quoteText}>
            {project.lastReportSummary ??
              'Ainda não há relatório. Toque em “Gerar relatório” para simular a primeira síntese automática.'}
          </AppText>
        </View>
      </Card>
    </View>
  );
}

function SparkleBadge() {
  return (
    <View style={styles.aiIcon}>
      <Ionicons name="sparkles" size={20} color={colors.primary} />
    </View>
  );
}

function buildMockReport(project: Project): string {
  const open = project.tasks.filter((t) => t.column !== 'done').length;
  const deliveries = project.deliveries.length;
  return (
    `Síntese automática (${project.kind}): há ${open} tarefa(s) em aberto no quadro. ` +
    `Entregas versionadas registradas: ${deliveries}. ` +
    `Recomenda-se alinhar próximos marcos com o prazo de ${project.deadlineLabel} e revisar dependências no repositório vinculado.`
  );
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
  sectionHint: { fontSize: 13, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 18 },
  teamGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.lg },
  member: { width: '30%', minWidth: 96, gap: spacing.sm },
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
  hint: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
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
  emptyTitle: { fontSize: 15, color: colors.text },
  timelineTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  versionPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  versionText: { color: '#fff', fontSize: 12 },
  dateText: { fontSize: 12, color: colors.textMuted },
  deliveryTitle: { fontSize: 15, color: colors.text, marginTop: spacing.md },
  notes: { fontSize: 13, color: colors.textSecondary, marginTop: spacing.sm },
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
});
