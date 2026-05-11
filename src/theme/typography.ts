import { TextStyle } from 'react-native';

export const fontFamily = {
  regular: 'Fustat_400Regular',
  medium: 'Fustat_500Medium',
  semibold: 'Fustat_600SemiBold',
  bold: 'Fustat_700Bold',
} as const;

export const textStyles = {
  hero: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    letterSpacing: -0.5,
    color: '#0F1C14',
  } satisfies TextStyle,
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    letterSpacing: -0.3,
    color: '#0F1C14',
  } satisfies TextStyle,
  subtitle: {
    fontFamily: fontFamily.semibold,
    fontSize: 16,
    color: '#4A5D52',
  } satisfies TextStyle,
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: '#0F1C14',
  } satisfies TextStyle,
  caption: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    letterSpacing: 0.4,
    color: '#6B7F74',
    textTransform: 'uppercase' as const,
  } satisfies TextStyle,
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: '#4A5D52',
  } satisfies TextStyle,
  chip: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
  } satisfies TextStyle,
} as const;
