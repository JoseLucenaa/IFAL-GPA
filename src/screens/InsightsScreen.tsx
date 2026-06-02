import React from 'react';
import { FlatList, Platform, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { AppText } from '../components/AppText';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { textStyles } from '../theme/typography';
import { useProjects } from '../context/ProjectsContext';
import type { Project } from '../types/project';
import { useAppNavigation } from '../navigation/useAppNavigation';

export function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const navigation = useAppNavigation();
  const { projects } = useProjects();

  const withReports = projects.filter((p) => p.reports.length > 0 || (p.lastReportSummary?.length ?? 0) > 0);

  return (
    <View style={[styles.root, { paddingTop: insets.top + (isDesktop ? spacing.xxxl : spacing.md) }]}>
      <View style={[styles.header, isDesktop && styles.desktopHeader]}>
        <AppText weight="medium" style={styles.eyebrow}>
          Inteligencia
        </AppText>
        <AppText weight="bold" style={textStyles.title}>
          Relatorios com IA
        </AppText>
        <AppText weight="regular" style={styles.subtitle}>
          Sinteses prontas para orientacao, acompanhamento e fechamento de ciclos.
        </AppText>
      </View>

      <FlatList
        key={isDesktop ? 'insights-grid' : 'insights-list'}
        numColumns={isDesktop ? 2 : 1}
        columnWrapperStyle={isDesktop ? { gap: spacing.md, paddingHorizontal: spacing.xs } : undefined}
        data={withReports.length ? withReports : projects}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          { paddingHorizontal: spacing.xl, paddingBottom: insets.bottom + spacing.xxxl, gap: isDesktop ? spacing.md : undefined },
          isDesktop && { maxWidth: 1200, width: '100%', alignSelf: 'center' },
        ]}
        ItemSeparatorComponent={isDesktop ? null : () => <View style={{ height: spacing.md }} />}
        ListEmptyComponent={
          <Card>
            <AppText weight="semibold" style={styles.emptyTitle}>
              Sem projetos para analisar
            </AppText>
            <AppText weight="regular" style={styles.emptyBody}>
              Cadastre um projeto na aba Projetos para habilitar relatorios automaticos.
            </AppText>
          </Card>
        }
        renderItem={({ item }) => (
          <View style={isDesktop ? { flex: 1, padding: spacing.xs } : undefined}>
            <InsightCard
              project={item}
              placeholder={!item.reports.length && !item.lastReportSummary}
              onOpen={() => navigation.navigate('ProjectDetail', { projectId: item.id })}
            />
          </View>
        )}
      />
    </View>
  );
}

function InsightCard({
  project,
  placeholder,
  onOpen,
}: {
  project: Project;
  placeholder: boolean;
  onOpen: () => void;
}) {
  const latest = project.reports[0];

  return (
    <Pressable onPress={onOpen} style={({ pressed }) => [pressed && styles.cardPressed, { flex: 1 }]}>
    <Card style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.iconWrap}>
          <Ionicons name="sparkles" size={18} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText weight="bold" style={styles.cardTitle} numberOfLines={2}>
            {project.title}
          </AppText>
          <AppText weight="medium" style={styles.cardKind}>
            {latest ? latest.type : project.kind}
          </AppText>
        </View>
      </View>

      <View style={styles.quote}>
        <AppText weight="regular" style={styles.quoteText}>
          {placeholder
            ? 'Nenhum relatorio gerado ainda. Abra o projeto e use Gerar relatorio para criar a primeira sintese.'
            : latest?.content ?? project.lastReportSummary}
        </AppText>
      </View>

      <AppText weight="semibold" style={styles.link}>
        Abrir workspace do projeto {'->'}
      </AppText>
    </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  desktopHeader: { maxWidth: 1200, width: '100%', alignSelf: 'center' },
  eyebrow: { color: colors.primary, fontSize: 13, marginBottom: spacing.xs },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 20 },
  card: { padding: spacing.xl, height: '100%' },
  cardTop: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 16, color: colors.text },
  cardKind: { fontSize: 12, color: colors.textMuted, marginTop: spacing.xs },
  quote: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quoteText: { fontSize: 14, color: colors.textSecondary, lineHeight: 21 },
  link: { marginTop: spacing.lg, color: colors.primary, fontSize: 14 },
  cardPressed: { opacity: 0.94, transform: [{ scale: 0.995 }] },
  emptyTitle: { fontSize: 16, color: colors.text },
  emptyBody: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 20 },
});
