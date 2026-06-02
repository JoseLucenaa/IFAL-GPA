import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { User, UserRole } from '../types/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    course?: string;
    registration?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

type ProfileRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  course: string | null;
  registration: string | null;
  created_at: string;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error('Configure EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY no arquivo .env.');
  }
}

function mapProfile(row: ProfileRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    course: row.course ?? undefined,
    registration: row.registration ?? undefined,
    createdAt: row.created_at,
  };
}

async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, role, course, registration, created_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapProfile(data as ProfileRow) : null;
}

async function upsertProfile(input: {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  course?: string;
  registration?: string;
}): Promise<User> {
  const payload = {
    id: input.id,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    role: input.role,
    course: input.course?.trim() || null,
    registration: input.registration?.trim() || null,
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select('id, name, email, role, course, registration, created_at')
    .single();

  if (error) throw error;
  return mapProfile(data as ProfileRow);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        assertSupabaseConfigured();
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        const sessionUser = data.session?.user;
        if (!sessionUser) {
          if (mounted) setUser(null);
          return;
        }

        const profile = await fetchProfile(sessionUser.id);
        if (mounted) setUser(profile);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (!session?.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      void fetchProfile(session.user.id)
        .then((profile) => {
          if (mounted) setUser(profile);
        })
        .catch(() => {
          if (mounted) setUser(null);
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    assertSupabaseConfigured();

    const normalizedEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      throw new Error('E-mail ou senha invalidos.');
    }

    if (!data.user) {
      throw new Error('Nao foi possivel iniciar a sessao.');
    }

    let profile = await fetchProfile(data.user.id);
    if (!profile) {
      const metadata = data.user.user_metadata as Partial<{
        name: string;
        role: UserRole;
        course: string;
        registration: string;
      }>;
      profile = await upsertProfile({
        id: data.user.id,
        name: metadata.name ?? normalizedEmail,
        email: data.user.email ?? normalizedEmail,
        role: metadata.role ?? 'Estudante',
        course: metadata.course,
        registration: metadata.registration,
      });
    }

    setUser(profile);
  }, []);

  const register = useCallback(
    async (input: {
      name: string;
      email: string;
      password: string;
      role: UserRole;
      course?: string;
      registration?: string;
    }) => {
      assertSupabaseConfigured();

      const normalizedEmail = input.email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: input.password,
        options: {
          data: {
            name: input.name.trim(),
            role: input.role,
            course: input.course?.trim() || undefined,
            registration: input.registration?.trim() || undefined,
          },
        },
      });

      if (error) {
        throw new Error(error.message.includes('already') ? 'Ja existe uma conta com este e-mail.' : error.message);
      }

      if (!data.user) {
        throw new Error('Nao foi possivel criar a conta.');
      }

      if (!data.session) {
        throw new Error('Conta criada. Confirme seu e-mail antes de entrar.');
      }

      const profile = await upsertProfile({
        id: data.user.id,
        name: input.name,
        email: normalizedEmail,
        role: input.role,
        course: input.course,
        registration: input.registration,
      });

      setUser(profile);
    },
    [],
  );

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
