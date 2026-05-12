import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { AppText } from '../components/AppText';
import { ProgressBar } from '../components/ProgressBar';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { textStyles } from '../theme/typography';
import { useProjects } from '../context/ProjectsContext';
import { useAuth } from '../context/AuthContext';
import { useAppNavigation } from '../navigation/useAppNavigation';

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();
  const { projects } = useProjects();
  const { user, logout } = useAuth();

  const active = projects.length;
  const avgProgress =
    active === 0
      ? 0
      : Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / active);
  const featured = projects[0];

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.primaryDark, colors.primary, colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + spacing.lg }]}
      >
        <AppText weight="medium" style={styles.badge}>
          IFAL Projetos
        </AppText>
        <AppText weight="bold" style={styles.heroTitle}>
          Gestão acadêmica{'\n'}sem ruído.
        </AppText>
        <AppText weight="regular" style={styles.heroSubtitle}>
          Acompanhe integradores e TCCs com equipe, prazos, entregas versionadas e apoio de IA.
        </AppText>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + spacing.xxxl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.metricsRow}>
          <MetricTile
            icon="folder-open"
            label="Projetos ativos"
            value={String(active)}
          />
          <MetricTile
            icon="trending-up"
            label="Progresso médio"
            value={`${avgProgress}%`}
          />
        </View>

        {user ? (
          <Card style={styles.userCard}>
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <AppText weight="bold" style={styles.userAvatarText}>
                  {initialsFromName(user.name)}
                </AppText>
              </View>
              <View style={{ flex: 1 }}>
                <AppText weight="bold" style={styles.userName} numberOfLines={1}>
                  {user.name}
                </AppText>
                <AppText weight="medium" style={styles.userRole} numberOfLines={1}>
                  {user.role}
                </AppText>
              </View>
            </View>
            <Pressable onPress={() => void logout()} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={18} color={colors.primary} />
              <AppText weight="semibold" style={styles.logoutText}>
                Sair
              </AppText>
            </Pressable>
          </Card>
        ) : null}

        <View style={styles.sectionHeader}>
          <AppText weight="bold" style={textStyles.title}>
            Destaque
          </AppText>
          <AppText weight="regular" style={styles.sectionHint}>
            Toque para abrir o quadro completo
          </AppText>
        </View>

        {featured ? (
          <Pressable
            onPress={() => navigation.navigate('ProjectDetail', { projectId: featured.id })}
            style={({ pressed }) => [pressed && styles.cardPressed]}
          >
            <Card style={styles.featuredCard}>
              <View style={styles.featuredTop}>
                <View style={styles.kindPill}>
                  <AppText weight="semibold" style={styles.kindPillText}>
                    {featured.kind}
                  </AppText>
                </View>
                <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
              </View>
              <AppText weight="bold" style={styles.featuredTitle} numberOfLines={2}>
                {featured.title}
              </AppText>
              <AppText weight="regular" style={styles.featuredSubtitle} numberOfLines={2}>
                {featured.subtitle}
              </AppText>
              <View style={{ marginTop: spacing.md }}>
                <View style={styles.progressLabels}>
                  <AppText weight="medium" style={styles.progressLabel}>
                    Andamento geral
                  </AppText>
                  <AppText weight="semibold" style={styles.progressValue}>
                    {featured.progress}%
                  </AppText>
                </View>
                <ProgressBar value={featured.progress} height={10} />
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
                <AppText weight="medium" style={styles.metaText}>
                  Prazo: {featured.deadlineLabel}
                </AppText>
              </View>
            </Card>
          </Pressable>
        ) : (
          <Card>
            <AppText weight="semibold" style={styles.emptyTitle}>
              Nenhum projeto ainda
            </AppText>
            <AppText weight="regular" style={styles.emptyBody}>
              Crie um projeto na aba Projetos para ver o painel aqui.
            </AppText>
          </Card>
        )}

        <View style={[styles.sectionHeader, { marginTop: spacing.xl }]}>
          <AppText weight="bold" style={textStyles.title}>
            Atalhos
          </AppText>
        </View>
        <View style={styles.shortcuts}>
          <ShortcutChip
            icon="git-branch-outline"
            label="Repositórios"
            onPress={() => navigation.navigate('Projects')}
          />
          <ShortcutChip
            icon="sparkles-outline"
            label="Relatórios IA"
            onPress={() => navigation.navigate('Insights')}
          />
        </View>
      </ScrollView>
    </View>
  );
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
      <View style={styles.metricIcon}>
        <Ionicons name={icon} size={20} color={colors.primary} />
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

function ShortcutChip({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.shortcut, pressed && styles.cardPressed]}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <AppText weight="semibold" style={styles.shortcutText}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  hero: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  badge: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginBottom: spacing.sm },
  heroTitle: { color: '#fff', fontSize: 28, lineHeight: 34, marginBottom: spacing.md },
  heroSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 15, lineHeight: 22, maxWidth: 340 },
  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, gap: spacing.md },
  metricsRow: { flexDirection: 'row', gap: spacing.md },
  metricCard: { flex: 1, padding: spacing.md },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  metricValue: { fontSize: 22, color: colors.text },
  metricLabel: { fontSize: 12, color: colors.textMuted, marginTop: spacing.xs },
  userCard: {
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  userAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: { color: '#fff', fontSize: 13 },
  userName: { fontSize: 15, color: colors.text },
  userRole: { fontSize: 12, color: colors.textMuted, marginTop: spacing.xs },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.primaryMuted,
  },
  logoutText: { color: colors.primary, fontSize: 13 },
  sectionHeader: { marginTop: spacing.sm },
  sectionHint: { ...textStyles.body, color: colors.textMuted, fontSize: 13, marginTop: spacing.xs },
  featuredCard: { padding: spacing.xl },
  featuredTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kindPill: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  kindPillText: { color: colors.primary, fontSize: 12 },
  featuredTitle: { fontSize: 20, marginTop: spacing.md, color: colors.text },
  featuredSubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressLabel: { fontSize: 12, color: colors.textMuted },
  progressValue: { fontSize: 12, color: colors.primary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg },
  metaText: { fontSize: 13, color: colors.textSecondary },
  emptyTitle: { fontSize: 16, color: colors.text },
  emptyBody: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.sm },
  shortcuts: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  shortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  shortcutText: { fontSize: 13, color: colors.primary },
  cardPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
});
