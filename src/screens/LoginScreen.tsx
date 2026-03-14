import React, { useState } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../hooks/useAppTheme';
import { useSettings } from '../context/SettingsContext';
import { AuthNavigation } from '../features/auth/types';
import AuthScreenLayout from '../features/auth/components/AuthScreenLayout';
import AuthTextInput from '../features/auth/components/AuthTextInput';
import AuthPrimaryButton from '../features/auth/components/AuthPrimaryButton';

interface LoginScreenProps {
  navigation: AuthNavigation;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { signIn } = useAuth();
  const { colors } = useAppTheme();
  const { t } = useSettings();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('common.error'), t('auth.fillAllFields'));
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout colors={colors} title="BusNow" subtitle={t('auth.loginSubtitle')}>
        <AuthTextInput
          colors={colors}
          placeholder={t('auth.emailPlaceholder')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <AuthTextInput
          colors={colors}
          placeholder={t('auth.passwordPlaceholder')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />

        <AuthPrimaryButton colors={colors} label={t('auth.loginButton')} loading={loading} onPress={handleLogin} />

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={[styles.linkText, { color: colors.primary }]}>
            {t('auth.noAccount')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.linkButton, { marginTop: 8 }]}
          onPress={() => navigation.navigate('map')}
        >
          <Text style={[styles.linkText, { color: colors.gray600 }]}>
            {t('auth.backToMap')}
          </Text>
        </TouchableOpacity>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
