import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CommonStyles, getTheme } from '../../../styles/colors';

interface SettingsAppInfoCardProps {
  colors: ReturnType<typeof getTheme>;
  appName: string;
  version: string;
  tagline: string;
  copyright: string;
}

export default function SettingsAppInfoCard({
  colors,
  appName,
  version,
  tagline,
  copyright,
}: SettingsAppInfoCardProps) {
  return (
    <View style={[styles.container, { backgroundColor: colors.white }]}>
      <Text style={[styles.text, { color: colors.gray500 }]}>
        {`${appName} ${version}`}
        {'\n'}
        {tagline}
        {'\n'}
        {copyright}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: CommonStyles.borderRadius.large,
    padding: CommonStyles.spacing.lg,
    marginBottom: CommonStyles.spacing.xxl,
    ...CommonStyles.cardShadow,
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
