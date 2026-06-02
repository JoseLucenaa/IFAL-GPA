import React from 'react';
import { Platform, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';
import { HomeScreen } from '../screens/HomeScreen';
import { ProjectsScreen } from '../screens/ProjectsScreen';
import { InsightsScreen } from '../screens/InsightsScreen';
import type { MainTabParamList } from './types';
import { AppText } from '../components/AppText';

const Tab = createBottomTabNavigator<MainTabParamList>();
const DESKTOP_SIDEBAR_WIDTH = 280;

function titleForRoute(routeName: string) {
  if (routeName === 'Home') return 'Inicio';
  if (routeName === 'Insights') return 'Relatorios';
  return 'Projetos';
}

function iconForRoute(routeName: string, focused: boolean) {
  if (routeName === 'Home') return focused ? 'home' : 'home-outline';
  if (routeName === 'Insights') return focused ? 'sparkles' : 'sparkles-outline';
  return focused ? 'folder' : 'folder-outline';
}

function DesktopTabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.desktopSidebar}>
      <View style={styles.sidebarHeader}>
        <View style={styles.logoMark}>
          <AppText weight="bold" style={styles.logoText}>
            GPA
          </AppText>
        </View>
        <View>
          <AppText weight="bold" style={styles.sidebarTitle}>
            IFAL GPA
          </AppText>
          <AppText weight="medium" style={styles.sidebarSubtitle}>
            Gestao academica de projetos
          </AppText>
        </View>
      </View>

      <View style={styles.sidebarNav}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              style={({ pressed }) => [
                styles.sidebarItem,
                isFocused && styles.sidebarItemSelected,
                pressed && styles.sidebarItemPressed,
              ]}
            >
              <View style={[styles.sidebarIcon, isFocused && styles.sidebarIconSelected]}>
                <Ionicons
                  name={iconForRoute(route.name, isFocused) as keyof typeof Ionicons.glyphMap}
                  color={isFocused ? '#fff' : colors.textMuted}
                  size={18}
                />
              </View>
              <AppText
                weight={isFocused ? 'bold' : 'medium'}
                style={[styles.sidebarItemText, { color: isFocused ? colors.text : colors.textSecondary }]}
              >
                {titleForRoute(route.name)}
              </AppText>
              {isFocused ? <Ionicons name="chevron-forward" color={colors.primary} size={16} /> : null}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.sidebarFooter}>
        <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
        <AppText weight="medium" style={styles.sidebarFooterText}>
          Dados sincronizados com Supabase
        </AppText>
      </View>
    </View>
  );
}

export function MainTabs() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        tabBar={isDesktop ? (props) => <DesktopTabBar {...props} /> : undefined}
        screenOptions={{
          headerShown: false,
          sceneStyle: isDesktop ? { marginLeft: DESKTOP_SIDEBAR_WIDTH } : undefined,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: { fontFamily: fontFamily.semibold, fontSize: 12 },
          tabBarStyle: {
            backgroundColor: colors.surfaceElevated,
            borderTopColor: colors.border,
            height: 62,
            paddingBottom: 8,
            paddingTop: 6,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Projects"
          component={ProjectsScreen}
          options={{
            title: 'Projetos',
            tabBarIcon: ({ color, size }) => <Ionicons name="folder" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Insights"
          component={InsightsScreen}
          options={{
            title: 'Relatorios',
            tabBarIcon: ({ color, size }) => <Ionicons name="sparkles" color={color} size={size} />,
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  desktopSidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DESKTOP_SIDEBAR_WIDTH,
    backgroundColor: colors.surfaceElevated,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingTop: 32,
    paddingHorizontal: 20,
    paddingBottom: 24,
    zIndex: 10,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
  },
  logoMark: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#fff', fontSize: 13 },
  sidebarTitle: {
    fontSize: 19,
    color: colors.primaryDark,
  },
  sidebarSubtitle: {
    maxWidth: 168,
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  sidebarNav: { flex: 1 },
  sidebarItem: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  sidebarItemSelected: {
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sidebarItemPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  sidebarIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  sidebarIconSelected: {
    backgroundColor: colors.primary,
  },
  sidebarItemText: {
    flex: 1,
    fontSize: 15,
  },
  sidebarFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.primaryMuted,
  },
  sidebarFooterText: {
    flex: 1,
    color: colors.primaryDark,
    fontSize: 12,
    lineHeight: 17,
  },
});
