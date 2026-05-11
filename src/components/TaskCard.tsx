import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { KanbanColumn, Task } from '../types/project';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { AppText } from './AppText';

const columnsOrder: KanbanColumn[] = ['todo', 'doing', 'done'];

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

  return (
    <View style={styles.card}>
      <AppText weight="semibold" style={styles.title} numberOfLines={3}>
        {task.title}
      </AppText>
      {task.dueLabel ? (
        <AppText weight="medium" style={styles.due}>
          {task.dueLabel}
        </AppText>
      ) : null}
      {canAdvance && onAdvance ? (
        <Pressable
          onPress={() => onAdvance(task.id, next)}
          style={styles.advance}
          accessibilityLabel="Avançar tarefa no quadro"
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
  return 'Concluído';
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
  title: { fontSize: 14, color: colors.text },
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
