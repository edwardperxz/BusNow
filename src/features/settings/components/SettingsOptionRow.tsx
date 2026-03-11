import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CommonStyles, getTheme } from '../../../styles/colors';

interface SettingsOptionRowProps {
  colors: ReturnType<typeof getTheme>;
  icon: string;
  iconBgColor: string;
  borderColor: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  rightAccessory?: React.ReactNode;
}

export default function SettingsOptionRow({
  colors,
  icon,
  iconBgColor,
  borderColor,
  title,
  subtitle,
  onPress,
  rightAccessory,
}: SettingsOptionRowProps) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[
        styles.row,
        { backgroundColor: colors.gray100, borderColor },
      ]}
      onPress={onPress}
    >
      <View style={[styles.iconWrap, { backgroundColor: iconBgColor }]}>
        <Text style={[styles.iconText, { color: colors.white === '#1F1F1F' ? '#FFFFFF' : colors.white }]}>{icon}</Text>
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.gray800 }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: colors.gray500 }]}>{subtitle}</Text>
      </View>

      {rightAccessory}
    </Container>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: CommonStyles.spacing.md,
    paddingHorizontal: CommonStyles.spacing.md,
    borderRadius: CommonStyles.borderRadius.medium,
    borderWidth: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: CommonStyles.spacing.md,
  },
  iconText: {
    fontSize: 18,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});
