import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { User, UserRole } from '../types/auth';

const SESSION_KEY = '@ifal-gpa/auth/session';
const USERS_KEY = '@ifal-gpa/auth/users';

type StoredUser = User & {
  password: string;
};

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

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const seedUsers: StoredUser[] = [
  {
    id: 'u_demo_student',
    name: 'Ana Souza',
    email: 'ana@ifal.edu.br',
    password: '123456',
    role: 'Estudante',
    course: 'Analise e Desenvolvimento de Sistemas',
    registration: '20260001',
    createdAt: '2026-05-11T00:00:00.000Z',
  },
  {
    id: 'u_demo_advisor',
    name: 'Profa. Helena',
    email: 'helena@ifal.edu.br',
    password: '123456',
    role: 'Professor orientador',
    course: 'Analise e Desenvolvimento de Sistemas',
    registration: 'SIAPE-0001',
    createdAt: '2026-05-11T00:00:00.000Z',
  },
];

function publicUser(stored: StoredUser): User {
  const { password: _password, ...user } = stored;
  return user;
}

function makeId(): string {
  return `u_${Math.random().toString(36).slice(2, 10)}`;
}

async function readStoredUsers(): Promise<StoredUser[]> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  if (!raw) {
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(seedUsers));
    return seedUsers;
  }

  try {
    const parsed = JSON.parse(raw) as StoredUser[];
    if (!Array.isArray(parsed)) return seedUsers;
    return parsed;
  } catch {
    return seedUsers;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        await readStoredUsers();
        const raw = await AsyncStorage.getItem(SESSION_KEY);
        if (raw && mounted) {
          setUser(JSON.parse(raw) as User);
        }
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  const persistSession = useCallback(async (nextUser: User) => {
    setUser(nextUser);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const normalizedEmail = email.trim().toLowerCase();
      const users = await readStoredUsers();
      const found = users.find((u) => u.email.toLowerCase() === normalizedEmail);

      if (!found || found.password !== password) {
        throw new Error('E-mail ou senha invalidos.');
      }

      await persistSession(publicUser(found));
    },
    [persistSession],
  );

  const register = useCallback(
    async (input: {
      name: string;
      email: string;
      password: string;
      role: UserRole;
      course?: string;
      registration?: string;
    }) => {
      const normalizedEmail = input.email.trim().toLowerCase();
      const users = await readStoredUsers();
      const exists = users.some((u) => u.email.toLowerCase() === normalizedEmail);

      if (exists) {
        throw new Error('Ja existe uma conta com este e-mail.');
      }

      const stored: StoredUser = {
        id: makeId(),
        name: input.name.trim(),
        email: normalizedEmail,
        password: input.password,
        role: input.role,
        course: input.course?.trim() || undefined,
        registration: input.registration?.trim() || undefined,
        createdAt: new Date().toISOString(),
      };

      const nextUsers = [stored, ...users];
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(nextUsers));
      await persistSession(publicUser(stored));
    },
    [persistSession],
  );

  const logout = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem(SESSION_KEY);
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

