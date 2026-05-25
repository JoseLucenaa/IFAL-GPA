import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { KanbanColumn, Task } from '../types/project';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { AppText } from './AppText';

const columnsOrder: KanbanColumn[] = ['todo', 'doing', 'review', 'done'];

function nextColumn(current: KanbanColumn): KanbanColumn {
  const i = columnsOrder.indexOf(current);
  if (i < 0 || i >= columnsOrder.length - 1) return current;
  return columnsOrder[i + 1]!;
}

type Props = {
  task: Task;
  onAdvance?: (taskId: string, next: KanbanColumn) => void;
};

export function TaskCard({ task, onAdvance }: Props) {
  const next = nextColumn(task.column);
  const canAdvance = task.column !== 'done';
  const overdue = Boolean(task.dueDate && new Date(task.dueDate) < new Date() && task.column !== 'done');

  return (
    <View style={[styles.card, overdue && styles.overdueCard]}>
      <View style={styles.metaRow}>
        <View style={[styles.priorityPill, priorityStyle(task.priority)]}>
          <AppText weight="semibold" style={styles.priorityText}>
            {task.priority}
          </AppText>
        </View>
        {overdue ? (
          <View style={styles.overduePill}>
            <AppText weight="semibold" style={styles.overdueText}>
              Atrasada
            </AppText>
          </View>
        ) : null}
      </View>

      <AppText weight="semibold" style={styles.title} numberOfLines={3}>
        {task.title}
      </AppText>
      {task.description ? (
        <AppText weight="regular" style={styles.description} numberOfLines={3}>
          {task.description}
        </AppText>
      ) : null}
      {task.dueLabel ? (
        <AppText weight="medium" style={styles.due}>
          {task.dueLabel}
        </AppText>
      ) : null}
      {canAdvance && onAdvance ? (
        <Pressable
          onPress={() => onAdvance(task.id, next)}
          style={styles.advance}
          accessibilityLabel="Avancar tarefa no quadro"
        >
          <AppText weight="semibold" style={styles.advanceText}>
            Mover para {labelFor(next)}
          </AppText>
          <Ionicons name="arrow-forward-circle" size={20} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

function labelFor(col: KanbanColumn): string {
  if (col === 'todo') return 'A fazer';
  if (col === 'doing') return 'Em progresso';
  if (col === 'review') return 'Em revisao';
  return 'Concluido';
}

function priorityStyle(priority: Task['priority']) {
  if (priority === 'Critica') return { backgroundColor: '#FEE4E2' };
  if (priority === 'Alta') return { backgroundColor: '#FEF0C7' };
  if (priority === 'Media') return { backgroundColor: colors.primaryMuted };
  return { backgroundColor: colors.surface };
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  overdueCard: { borderColor: colors.danger },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  priorityPill: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  priorityText: { fontSize: 11, color: colors.textSecondary },
  overduePill: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: '#FEE4E2',
  },
  overdueText: { fontSize: 11, color: colors.danger },
  title: { fontSize: 14, color: colors.text },
  description: { fontSize: 12, color: colors.textSecondary, lineHeight: 17 },
  due: { fontSize: 12, color: colors.textMuted, marginTop: spacing.xs },
  advance: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  advanceText: { fontSize: 12, color: colors.primary },
});
