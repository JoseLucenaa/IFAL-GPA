import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  PressableStateCallbackType,
  StyleSheet,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { AppText } from './AppText';

type Props = PressableProps & {
  label: string;
  variant?: 'solid' | 'outline' | 'ghost';
  loading?: boolean;
  icon?: React.ReactNode;
};

export function PrimaryButton({
  label,
  variant = 'solid',
  loading,
  icon,
  disabled,
  style,
  ...rest
}: Props) {
  const isDisabled = disabled || loading;

  const resolveOuterStyle = (state: PressableStateCallbackType) => [
    styles.pressable,
    state.pressed && !isDisabled && styles.pressed,
    isDisabled && styles.disabled,
    typeof style === 'function' ? style(state) : style,
  ];

  if (variant === 'solid') {
    return (
      <Pressable
        accessibilityRole="button"
        disabled={isDisabled}
        style={resolveOuterStyle}
        {...rest}
      >
        <LinearGradient
          colors={
            isDisabled ? ['#9BB3A8', '#7D9A8E'] : [colors.primaryLight, colors.primary, colors.primaryDark]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.inner}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                {icon}
                <AppText weight="semibold" style={styles.labelSolid}>
                  {label}
                </AppText>
              </>
            )}
          </View>
        </LinearGradient>
      </Pressable>
    );
  }

  if (variant === 'outline') {
    return (
      <Pressable
        accessibilityRole="button"
        disabled={isDisabled}
        style={(state) => [
          styles.outline,
          state.pressed && !isDisabled && styles.outlinePressed,
          isDisabled && styles.outlineDisabled,
          typeof style === 'function' ? style(state) : style,
        ]}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <View style={styles.inner}>
            {icon}
            <AppText weight="semibold" style={styles.labelOutline}>
              {label}
            </AppText>
          </View>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={(state) => [typeof style === 'function' ? style(state) : style]}
      {...rest}
    >
      <AppText weight="semibold" style={[styles.labelGhost, isDisabled && styles.labelGhostDisabled]}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  pressed: { transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.85 },
  gradient: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  labelSolid: { color: '#fff', fontSize: 15 },
  outline: {
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.surfaceElevated,
  },
  outlinePressed: { backgroundColor: colors.primaryMuted },
  outlineDisabled: { borderColor: colors.borderStrong, opacity: 0.55 },
  labelOutline: { color: colors.primary, fontSize: 15 },
  labelGhost: { color: colors.primary, fontSize: 15 },
  labelGhostDisabled: { color: colors.textMuted },
});
