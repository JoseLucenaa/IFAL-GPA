import React from 'react';
import { Text, TextProps } from 'react-native';
import { fontFamily } from '../theme/typography';

type Weight = 'regular' | 'medium' | 'semibold' | 'bold';

const weightMap: Record<Weight, string> = {
  regular: fontFamily.regular,
  medium: fontFamily.medium,
  semibold: fontFamily.semibold,
  bold: fontFamily.bold,
};

export function AppText({
  weight = 'regular',
  style,
  ...rest
}: TextProps & { weight?: Weight }) {
  return <Text {...rest} style={[{ fontFamily: weightMap[weight] }, style]} />;
}
