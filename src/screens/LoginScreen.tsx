import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { fontFamily } from '../theme/typography';
import { useAuth } from '../context/AuthContext';
import type { RootStackScreenProps } from '../navigation/types';

export function LoginScreen({ navigation }: RootStackScreenProps<'Login'>) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const { login } = useAuth();
  const [email, setEmail] = useState('ana@ifal.edu.br');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) {
      setError('Informe e-mail e senha.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel entrar.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={isDesktop ? styles.desktopRoot : styles.root}>
      <LinearGradient
        colors={[colors.primaryDark, colors.primary, colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={isDesktop ? styles.desktopHero : [styles.hero, { paddingTop: insets.top + spacing.xxl }]}
      >
        <AppText weight="medium" style={styles.badge}>
          IFAL Projetos
        </AppText>
        <AppText weight="bold" style={styles.title}>
          Entre para acompanhar seus projetos.
        </AppText>
      </LinearGradient>

      <KeyboardAvoidingView
        style={isDesktop ? styles.desktopFormContainer : { flex: 1 }}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={isDesktop ? styles.desktopScrollForm : [styles.body, { paddingBottom: insets.bottom + spacing.xxxl }]}
        >
          <View style={isDesktop ? styles.formWrapper : undefined}>
            <Card style={styles.form}>
              <Input
                label="E-mail"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                placeholder="nome@ifal.edu.br"
              />
              <Input
                label="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textContentType="password"
                placeholder="Sua senha"
              />

              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
                  <AppText weight="medium" style={styles.errorText}>
                    {error}
                  </AppText>
                </View>
              ) : null}

              <PrimaryButton label="Entrar" loading={submitting} onPress={submit} />
              <PrimaryButton
                label="Criar conta"
                variant="outline"
                onPress={() => navigation.navigate('Register')}
                style={{ marginTop: spacing.sm }}
              />

              <AppText weight="regular" style={styles.demoHint}>
                Conta demo: ana@ifal.edu.br / 123456
              </AppText>
            </Card>

            <Pressable onPress={() => navigation.navigate('Register')} style={styles.footerLink}>
              <AppText weight="semibold" style={styles.footerLinkText}>
                Novo no app? Cadastre-se
              </AppText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

type InputProps = React.ComponentProps<typeof TextInput> & {
  label: string;
};

function Input({ label, style, ...rest }: InputProps) {
  return (
    <View style={styles.field}>
      <AppText weight="semibold" style={styles.label}>
        {label}
      </AppText>
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, style]}
        {...rest}
      />
    </View>
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
  desktopRoot: { flex: 1, flexDirection: 'row', backgroundColor: colors.surface },
  desktopHero: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl * 2,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
  },
  desktopFormContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  desktopScrollForm: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  formWrapper: {
    width: '100%',
    maxWidth: 400,
  },
  badge: { color: 'rgba(255,255,255,0.86)', fontSize: 13, marginBottom: spacing.sm },
  title: { color: '#fff', fontSize: 28, lineHeight: 34, maxWidth: 330 },
  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  form: { gap: spacing.md },
  field: { gap: spacing.xs },
  label: { fontSize: 13, color: colors.textSecondary },
  input: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colors.text,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: '#FEF3F2',
    borderWidth: 1,
    borderColor: '#FECDCA',
  },
  errorText: { flex: 1, fontSize: 13, color: colors.danger },
  demoHint: { textAlign: 'center', fontSize: 12, color: colors.textMuted, marginTop: spacing.xs },
  footerLink: { paddingVertical: spacing.lg, alignItems: 'center' },
  footerLinkText: { color: colors.primary, fontSize: 14 },
});

