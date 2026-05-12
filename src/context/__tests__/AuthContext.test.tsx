import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, render, waitFor } from '@testing-library/react-native';
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '../AuthContext';

const SESSION_KEY = '@ifal-gpa/auth/session';
const USERS_KEY = '@ifal-gpa/auth/users';

type AuthValue = ReturnType<typeof useAuth>;

function AuthProbe({ onValue }: { onValue: (value: AuthValue) => void }) {
  const auth = useAuth();

  useEffect(() => {
    onValue(auth);
  }, [auth, onValue]);

  return null;
}

async function renderAuthProvider() {
  let auth: AuthValue | undefined;

  render(
    <AuthProvider>
      <AuthProbe
        onValue={(value) => {
          auth = value;
        }}
      />
    </AuthProvider>,
  );

  await waitFor(() => {
    expect(auth?.loading).toBe(false);
  });

  if (!auth) throw new Error('Auth context was not rendered.');
  return () => auth as AuthValue;
}

describe('AuthContext', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('starts without a signed-in user and seeds local demo users', async () => {
    const getAuth = await renderAuthProvider();

    expect(getAuth().user).toBeNull();

    const usersRaw = await AsyncStorage.getItem(USERS_KEY);
    expect(usersRaw).not.toBeNull();
    expect(usersRaw).toContain('ana@ifal.edu.br');
    expect(usersRaw).toContain('helena@ifal.edu.br');
  });

  it('logs in with a cached demo user and stores the current session', async () => {
    const getAuth = await renderAuthProvider();

    await act(async () => {
      await getAuth().login('ana@ifal.edu.br', '123456');
    });

    expect(getAuth().user?.email).toBe('ana@ifal.edu.br');
    expect(getAuth().user?.role).toBe('Estudante');

    const sessionRaw = await AsyncStorage.getItem(SESSION_KEY);
    expect(sessionRaw).not.toBeNull();
    expect(sessionRaw).toContain('ana@ifal.edu.br');
  });

  it('rejects invalid credentials', async () => {
    const getAuth = await renderAuthProvider();

    await expect(getAuth().login('ana@ifal.edu.br', 'wrong-password')).rejects.toThrow(
      'E-mail ou senha invalidos.',
    );

    expect(getAuth().user).toBeNull();
    expect(await AsyncStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('registers a user, caches the account, and starts a session', async () => {
    const getAuth = await renderAuthProvider();

    await act(async () => {
      await getAuth().register({
        name: 'Novo Estudante',
        email: 'novo@ifal.edu.br',
        password: '123456',
        role: 'Estudante',
        course: 'ADS',
        registration: '20260002',
      });
    });

    expect(getAuth().user?.name).toBe('Novo Estudante');
    expect(getAuth().user?.email).toBe('novo@ifal.edu.br');
    expect(getAuth().user?.course).toBe('ADS');

    const usersRaw = await AsyncStorage.getItem(USERS_KEY);
    expect(usersRaw).toContain('novo@ifal.edu.br');

    const sessionRaw = await AsyncStorage.getItem(SESSION_KEY);
    expect(sessionRaw).toContain('novo@ifal.edu.br');
  });

  it('restores a cached session on startup', async () => {
    await AsyncStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        id: 'u_cached',
        name: 'Cached User',
        email: 'cached@ifal.edu.br',
        role: 'Coordenador',
        createdAt: '2026-05-12T00:00:00.000Z',
      }),
    );

    const getAuth = await renderAuthProvider();

    expect(getAuth().user?.email).toBe('cached@ifal.edu.br');
    expect(getAuth().user?.role).toBe('Coordenador');
  });

  it('logs out and removes only the current session', async () => {
    const getAuth = await renderAuthProvider();

    await act(async () => {
      await getAuth().login('helena@ifal.edu.br', '123456');
    });

    await act(async () => {
      await getAuth().logout();
    });

    expect(getAuth().user).toBeNull();
    expect(await AsyncStorage.getItem(SESSION_KEY)).toBeNull();
    expect(await AsyncStorage.getItem(USERS_KEY)).toContain('helena@ifal.edu.br');
  });
});

