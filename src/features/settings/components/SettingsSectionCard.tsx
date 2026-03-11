import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CommonStyles, getTheme } from '../../../styles/colors';

interface SettingsSectionCardProps {
  colors: ReturnType<typeof getTheme>;
  title: string;
  children: React.ReactNode;
  marginBottom?: number;
}

export default function SettingsSectionCard({
  colors,
  title,
  children,
  marginBottom = CommonStyles.spacing.md,
}: SettingsSectionCardProps) {
  return (
    <View style={[styles.container, { backgroundColor: colors.white, marginBottom }]}> 
      <Text style={[styles.title, { color: colors.gray800 }]}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: CommonStyles.borderRadius.large,
    padding: CommonStyles.spacing.lg,
    ...CommonStyles.cardShadow,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: CommonStyles.spacing.md,
  },
});
