import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { getTheme } from '../../../styles/colors';

interface AuthPrimaryButtonProps {
  colors: ReturnType<typeof getTheme>;
  label: string;
  loading?: boolean;
  onPress: () => void;
}

export default function AuthPrimaryButton({
  colors,
  label,
  loading = false,
  onPress,
}: AuthPrimaryButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors.primary }]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
