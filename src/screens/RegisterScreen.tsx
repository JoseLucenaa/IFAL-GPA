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
import { fontFamily, textStyles } from '../theme/typography';
import { useAuth } from '../context/AuthContext';
import type { RootStackScreenProps } from '../navigation/types';
import type { UserRole } from '../types/auth';

const roles: UserRole[] = [
  'Estudante',
  'Professor orientador',
  'Coordenador',
  'Avaliador',
  'Administrador',
];

export function RegisterScreen({ navigation }: RootStackScreenProps<'Register'>) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Estudante');
  const [course, setCourse] = useState('');
  const [registration, setRegistration] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError('Preencha nome, e-mail e senha.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await register({ name, email, password, role, course, registration });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel criar a conta.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={isDesktop ? styles.desktopRoot : styles.root}>
      {isDesktop && (
        <LinearGradient
          colors={[colors.primaryDark, colors.primary, colors.primaryLight]}
          style={styles.desktopHero}
        >
          <AppText weight="medium" style={styles.heroBadge}>
            Junte-se à Plataforma
          </AppText>
          <AppText weight="bold" style={styles.heroTitle}>
            Cadastre seu perfil corporativo.
          </AppText>
        </LinearGradient>
      )}

      <KeyboardAvoidingView
        style={isDesktop ? styles.desktopFormContainer : { flex: 1 }}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={isDesktop ? styles.desktopScrollForm : [
            styles.body,
            { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xxxl },
          ]}
        >
          <View style={isDesktop ? styles.formWrapper : undefined}>
            <View style={styles.header}>
              <Pressable onPress={() => navigation.goBack()} style={styles.backButton} accessibilityLabel="Voltar">
                <Ionicons name="arrow-back" size={22} color={colors.primary} />
              </Pressable>
              <View style={{ flex: 1 }}>
                <AppText weight="bold" style={textStyles.title}>
                  Criar conta
                </AppText>
                <AppText weight="regular" style={styles.subtitle}>
                  Cadastre seu perfil para acessar os projetos academicos.
                </AppText>
              </View>
            </View>

            <Card style={styles.form}>
            <Input label="Nome" value={name} onChangeText={setName} placeholder="Seu nome completo" />
            <Input
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              placeholder="nome@ifal.edu.br"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
            />
            <Input
              label="Senha"
              value={password}
              onChangeText={setPassword}
              placeholder="Minimo de 6 caracteres"
              secureTextEntry
              textContentType="newPassword"
            />

            <View style={styles.field}>
              <AppText weight="semibold" style={styles.label}>
                Perfil
              </AppText>
              <View style={styles.roleGrid}>
                {roles.map((item) => {
                  const selected = item === role;
                  return (
                    <Pressable
                      key={item}
                      onPress={() => setRole(item)}
                      style={[styles.roleChip, selected && styles.roleChipSelected]}
                    >
                      <AppText
                        weight="semibold"
                        style={[styles.roleChipText, selected && styles.roleChipTextSelected]}
                      >
                        {item}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Input label="Curso" value={course} onChangeText={setCourse} placeholder="Ex.: ADS" />
            <Input
              label="Matricula ou SIAPE"
              value={registration}
              onChangeText={setRegistration}
              placeholder="Identificacao institucional"
            />

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
                <AppText weight="medium" style={styles.errorText}>
                  {error}
                </AppText>
              </View>
            ) : null}

            <PrimaryButton label="Salvar cadastro" loading={submitting} onPress={submit} />
          </Card>
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
  desktopRoot: { flex: 1, flexDirection: 'row', backgroundColor: colors.surface },
  desktopHero: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl * 2,
    maxWidth: '40%',
  },
  heroBadge: { color: 'rgba(255,255,255,0.86)', fontSize: 13, marginBottom: spacing.sm },
  heroTitle: { color: '#fff', fontSize: 28, lineHeight: 34, maxWidth: 330 },
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
    maxWidth: 500,
  },
  body: { paddingHorizontal: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.xl },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryMuted,
  },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs, lineHeight: 20 },
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
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  roleChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  roleChipSelected: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
  roleChipText: { fontSize: 12, color: colors.textSecondary },
  roleChipTextSelected: { color: colors.primary },
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
});

