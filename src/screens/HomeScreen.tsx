import React, { useMemo } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { AppText } from '../components/AppText';
import { ProgressBar } from '../components/ProgressBar';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { useProjects } from '../context/ProjectsContext';
import { useAuth } from '../context/AuthContext';
import { useAppNavigation } from '../navigation/useAppNavigation';
import type { Project } from '../types/project';

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const navigation = useAppNavigation();
  const { projects } = useProjects();
  const { user, logout } = useAuth();

  const active = projects.length;
  const avgProgress =
    active === 0
      ? 0
      : Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / active);
  const openTasks = projects.reduce((acc, p) => acc + p.tasks.filter((t) => t.column !== 'done').length, 0);
  const reviewDeliveries = projects.reduce(
    (acc, p) => acc + p.deliveries.filter((d) => d.status === 'Enviada' || d.status === 'Em analise').length,
    0,
  );
  const featured = useMemo(() => pickFeaturedProject(projects), [projects]);
  const attentionItems = useMemo(() => buildAttentionItems(projects), [projects]);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.body,
          isDesktop && styles.desktopBody,
          { paddingTop: insets.top + (isDesktop ? spacing.xxxl : spacing.lg), paddingBottom: insets.bottom + spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeader}>
          <View style={{ flex: 1 }}>
            <AppText weight="medium" style={styles.eyebrow}>
              IFAL Projetos
            </AppText>
            <AppText weight="bold" style={isDesktop ? styles.desktopTitle : styles.title}>
              Painel academico
            </AppText>
            <AppText weight="regular" style={styles.subtitle}>
              Acompanhe progresso, prazos, entregas e relatorios em um unico fluxo.
            </AppText>
          </View>

          {user ? (
            <View style={styles.userPill}>
              <View style={styles.userAvatar}>
                <AppText weight="bold" style={styles.userAvatarText}>
                  {initialsFromName(user.name)}
                </AppText>
              </View>
              <View style={styles.userTextWrap}>
                <AppText weight="bold" style={styles.userName} numberOfLines={1}>
                  {user.name}
                </AppText>
                <AppText weight="medium" style={styles.userRole} numberOfLines={1}>
                  {user.role}
                </AppText>
              </View>
              <Pressable onPress={() => void logout()} style={styles.logoutButton} accessibilityLabel="Sair">
                <Ionicons name="log-out-outline" size={18} color={colors.primary} />
              </Pressable>
            </View>
          ) : null}
        </View>

        <View style={styles.metricsGrid}>
          <MetricTile icon="folder-open-outline" label="Projetos ativos" value={String(active)} />
          <MetricTile icon="trending-up-outline" label="Progresso medio" value={`${avgProgress}%`} />
          <MetricTile icon="checkbox-outline" label="Tarefas abertas" value={String(openTasks)} />
          <MetricTile icon="document-text-outline" label="Entregas em revisao" value={String(reviewDeliveries)} />
        </View>

        <View style={isDesktop ? styles.desktopMainRow : styles.stack}>
          <View style={isDesktop ? styles.mainColumn : styles.stack}>
            {featured ? (
              <Pressable
                onPress={() => navigation.navigate('ProjectDetail', { projectId: featured.id })}
                style={({ pressed }) => [pressed && styles.cardPressed]}
              >
                <LinearGradient
                  colors={[colors.primaryDark, colors.primary, colors.primaryLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.featuredCard}
                >
                  <View style={styles.featuredTop}>
                    <View style={styles.featuredPill}>
                      <AppText weight="bold" style={styles.featuredPillText}>
                        Prioridade
                      </AppText>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </View>
                  <AppText weight="bold" style={styles.featuredTitle} numberOfLines={2}>
                    {featured.title}
                  </AppText>
                  <AppText weight="regular" style={styles.featuredSubtitle} numberOfLines={2}>
                    {featured.subtitle}
                  </AppText>
                  <View style={styles.featuredMetaRow}>
                    <InfoPill icon="calendar-outline" label={featured.deadlineLabel} />
                    <InfoPill icon="people-outline" label={`${featured.members.length} membros`} />
                    <InfoPill icon="git-branch-outline" label={`${featured.repositories.length} repos.`} />
                  </View>
                  <View style={styles.featuredProgress}>
                    <View style={styles.progressLabels}>
                      <AppText weight="medium" style={styles.progressLabelLight}>
                        Andamento geral
                      </AppText>
                      <AppText weight="bold" style={styles.progressValueLight}>
                        {featured.progress}%
                      </AppText>
                    </View>
                    <ProgressBar value={featured.progress} height={10} />
                  </View>
                </LinearGradient>
              </Pressable>
            ) : (
              <EmptyProjectCard onCreate={() => navigation.navigate('Projects')} />
            )}

            <Card style={styles.attentionCard}>
              <SectionTitle icon="pulse-outline" title="Precisa de atencao" />
              {attentionItems.length ? (
                attentionItems.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => navigation.navigate('ProjectDetail', { projectId: item.projectId })}
                    style={({ pressed }) => [styles.attentionItem, pressed && styles.cardPressed]}
                  >
                    <View style={[styles.attentionIcon, item.tone === 'danger' && styles.attentionIconDanger]}>
                      <Ionicons
                        name={item.tone === 'danger' ? 'alert-circle-outline' : 'time-outline'}
                        size={18}
                        color={item.tone === 'danger' ? colors.danger : colors.primary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText weight="bold" style={styles.attentionTitle} numberOfLines={1}>
                        {item.title}
                      </AppText>
                      <AppText weight="regular" style={styles.attentionBody} numberOfLines={2}>
                        {item.body}
                      </AppText>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </Pressable>
                ))
              ) : (
                <AppText weight="regular" style={styles.emptyBody}>
                  Nenhuma pendencia critica no momento.
                </AppText>
              )}
            </Card>
          </View>

          <View style={isDesktop ? styles.sideColumn : styles.stack}>
            <Card style={styles.actionsCard}>
              <SectionTitle icon="flash-outline" title="Atalhos rapidos" />
              <QuickAction
                icon="add-circle-outline"
                title="Novo projeto"
                body="Abra o cadastro com equipe, prazo e repositorio."
                onPress={() => navigation.navigate('Projects')}
              />
              <QuickAction
                icon="folder-open-outline"
                title="Ver todos"
                body="Filtre projetos por tipo, prazo e situacao."
                onPress={() => navigation.navigate('Projects')}
              />
              <QuickAction
                icon="sparkles-outline"
                title="Relatorios IA"
                body="Revise sinteses geradas para orientacao."
                onPress={() => navigation.navigate('Insights')}
              />
            </Card>

            <Card style={styles.syncCard}>
              <SectionTitle icon="cloud-done-outline" title="Resumo da base" />
              <SummaryLine label="Projetos com repositorio" value={`${projects.filter((p) => p.repositories.length > 0).length}/${active}`} />
              <SummaryLine label="Projetos com relatorio" value={`${projects.filter((p) => p.reports.length || p.lastReportSummary).length}/${active}`} />
              <SummaryLine label="Entregas cadastradas" value={String(projects.reduce((acc, p) => acc + p.deliveries.length, 0))} />
            </Card>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function pickFeaturedProject(projects: Project[]) {
  return [...projects].sort((a, b) => {
    const aDate = a.deadlineDate ? new Date(a.deadlineDate).getTime() : Number.MAX_SAFE_INTEGER;
    const bDate = b.deadlineDate ? new Date(b.deadlineDate).getTime() : Number.MAX_SAFE_INTEGER;
    return aDate - bDate;
  })[0];
}

function buildAttentionItems(projects: Project[]) {
  const today = new Date();
  return projects
    .flatMap((project) => {
      const overdueTasks = project.tasks.filter(
        (task) => task.dueDate && new Date(task.dueDate) < today && task.column !== 'done',
      );
      const reviewDeliveries = project.deliveries.filter(
        (delivery) => delivery.status === 'Enviada' || delivery.status === 'Em analise',
      );
      return [
        ...overdueTasks.map((task) => ({
          id: `${project.id}-${task.id}`,
          projectId: project.id,
          tone: 'danger' as const,
          title: task.title,
          body: `${project.title} - prazo ${task.dueLabel ?? project.deadlineLabel}`,
        })),
        ...reviewDeliveries.map((delivery) => ({
          id: `${project.id}-${delivery.id}`,
          projectId: project.id,
          tone: 'info' as const,
          title: delivery.title,
          body: `${project.title} - entrega ${delivery.status.toLowerCase()}`,
        })),
      ];
    })
    .slice(0, 4);
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function MetricTile({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <Card style={styles.metricCard}>
      <View style={styles.metricTop}>
        <View style={styles.metricIcon}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
      </View>
      <AppText weight="bold" style={styles.metricValue}>
        {value}
      </AppText>
      <AppText weight="medium" style={styles.metricLabel}>
        {label}
      </AppText>
    </Card>
  );
}

function SectionTitle({ icon, title }: { icon: keyof typeof Ionicons.glyphMap; title: string }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <AppText weight="bold" style={styles.sectionTitle}>
        {title}
      </AppText>
    </View>
  );
}

function InfoPill({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.infoPill}>
      <Ionicons name={icon} size={15} color="#fff" />
      <AppText weight="semibold" style={styles.infoPillText} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

function QuickAction({
  icon,
  title,
  body,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.quickAction, pressed && styles.cardPressed]}>
      <View style={styles.quickIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText weight="bold" style={styles.quickTitle}>
          {title}
        </AppText>
        <AppText weight="regular" style={styles.quickBody}>
          {body}
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryLine}>
      <AppText weight="medium" style={styles.summaryLabel}>
        {label}
      </AppText>
      <AppText weight="bold" style={styles.summaryValue}>
        {value}
      </AppText>
    </View>
  );
}

function EmptyProjectCard({ onCreate }: { onCreate: () => void }) {
  return (
    <Card style={styles.emptyCard}>
      <SectionTitle icon="folder-open-outline" title="Nenhum projeto ainda" />
      <AppText weight="regular" style={styles.emptyBody}>
        Crie o primeiro projeto para montar o painel com prazos, tarefas e entregas.
      </AppText>
      <Pressable onPress={onCreate} style={({ pressed }) => [styles.emptyButton, pressed && styles.cardPressed]}>
        <AppText weight="bold" style={styles.emptyButtonText}>
          Criar projeto
        </AppText>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  body: {
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  desktopBody: {
    width: '100%',
    maxWidth: 1240,
    alignSelf: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
    flexWrap: 'wrap',
  },
  eyebrow: { color: colors.primary, fontSize: 13, marginBottom: spacing.xs },
  title: { color: colors.text, fontSize: 30, lineHeight: 36 },
  desktopTitle: { color: colors.text, fontSize: 38, lineHeight: 44 },
  subtitle: { color: colors.textSecondary, fontSize: 15, lineHeight: 22, marginTop: spacing.sm, maxWidth: 560 },
  userPill: {
    minWidth: 280,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: { color: '#fff', fontSize: 13 },
  userTextWrap: { flex: 1, minWidth: 0 },
  userName: { fontSize: 14, color: colors.text },
  userRole: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  logoutButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryMuted,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metricCard: {
    flexGrow: 1,
    flexBasis: 190,
    minWidth: 150,
    padding: spacing.lg,
  },
  metricTop: { flexDirection: 'row', justifyContent: 'space-between' },
  metricIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  metricValue: { fontSize: 28, color: colors.text },
  metricLabel: { fontSize: 13, color: colors.textMuted, marginTop: spacing.xs },
  desktopMainRow: { flexDirection: 'row', gap: spacing.lg, alignItems: 'flex-start' },
  mainColumn: { flex: 1.7, gap: spacing.lg },
  sideColumn: { flex: 1, gap: spacing.lg, minWidth: 320 },
  stack: { gap: spacing.lg },
  featuredCard: {
    borderRadius: radius.lg,
    padding: spacing.xxl,
    minHeight: 280,
  },
  featuredTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  featuredPill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.32)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  featuredPillText: { color: '#fff', fontSize: 12 },
  featuredTitle: { color: '#fff', fontSize: 27, lineHeight: 34, marginTop: spacing.xxxl, maxWidth: 680 },
  featuredSubtitle: { color: 'rgba(255,255,255,0.86)', fontSize: 15, lineHeight: 22, marginTop: spacing.sm, maxWidth: 620 },
  featuredMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xl },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    maxWidth: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  infoPillText: { color: '#fff', fontSize: 12 },
  featuredProgress: { marginTop: spacing.xxl },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  progressLabelLight: { fontSize: 12, color: 'rgba(255,255,255,0.82)' },
  progressValueLight: { fontSize: 12, color: '#fff' },
  attentionCard: { padding: spacing.xl, gap: spacing.md },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  sectionTitle: { color: colors.text, fontSize: 16 },
  attentionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  attentionIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attentionIconDanger: { backgroundColor: '#FEF3F2' },
  attentionTitle: { color: colors.text, fontSize: 14 },
  attentionBody: { color: colors.textSecondary, fontSize: 13, lineHeight: 18, marginTop: 2 },
  actionsCard: { padding: spacing.xl, gap: spacing.sm },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  quickIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTitle: { color: colors.text, fontSize: 14 },
  quickBody: { color: colors.textSecondary, fontSize: 12, lineHeight: 17, marginTop: 2 },
  syncCard: { padding: spacing.xl },
  summaryLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  summaryLabel: { color: colors.textSecondary, fontSize: 13 },
  summaryValue: { color: colors.text, fontSize: 14 },
  emptyCard: { padding: spacing.xl },
  emptyBody: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginTop: spacing.sm },
  emptyButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  emptyButtonText: { color: '#fff', fontSize: 14 },
  cardPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
});
