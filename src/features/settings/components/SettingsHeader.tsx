import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CommonStyles, getTheme } from '../../../styles/colors';

interface SettingsHeaderProps {
  colors: ReturnType<typeof getTheme>;
  title: string;
  onBack: () => void;
}

export default function SettingsHeader({ colors, title, onBack }: SettingsHeaderProps) {
  return (
    <View style={[styles.header, { backgroundColor: colors.primary }]}> 
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={[styles.backText, { color: colors.white === '#1F1F1F' ? '#FFFFFF' : colors.white }]}>←</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: colors.white === '#1F1F1F' ? '#FFFFFF' : colors.white }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: CommonStyles.spacing.md,
    paddingVertical: CommonStyles.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 18,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
});
