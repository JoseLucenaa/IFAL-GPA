import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppText } from '../components/AppText';
import { colors } from '../theme/colors';
import { MainTabs } from './MainTabs';
import { ProjectDetailScreen } from '../screens/ProjectDetailScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.surface,
    primary: colors.primary,
    text: colors.text,
    card: colors.surfaceElevated,
    border: colors.border,
  },
};

export function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerTitle: ({ children }) => {
            const label = Array.isArray(children) ? children.join('') : String(children ?? '');
            return (
              <AppText weight="bold" numberOfLines={1} style={{ fontSize: 18, color: colors.text, maxWidth: 280 }}>
                {label}
              </AppText>
            );
          },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.surface },
          contentStyle: { backgroundColor: colors.surface },
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="ProjectDetail"
          component={ProjectDetailScreen}
          options={{ title: 'Projeto' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
