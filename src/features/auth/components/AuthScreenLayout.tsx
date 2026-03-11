import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getTheme } from '../../../styles/colors';

interface AuthScreenLayoutProps {
  colors: ReturnType<typeof getTheme>;
  title: string;
  subtitle: string;
  scrollable?: boolean;
  children: React.ReactNode;
}

export default function AuthScreenLayout({
  colors,
  title,
  subtitle,
  scrollable = false,
  children,
}: AuthScreenLayoutProps) {
  const content = (
    <View style={styles.content}>
      <Text style={[styles.title, { color: colors.gray900 }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.gray600 }]}>{subtitle}</Text>
      {children}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.white }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {scrollable ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>{content}</ScrollView>
      ) : (
        content
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
});
