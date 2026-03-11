import React, { useState } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAuth, UserRole } from '../context/AuthContext';
import { useAppTheme } from '../hooks/useAppTheme';
import { useSettings } from '../context/SettingsContext';
import { AuthNavigation } from '../features/auth/types';
import AuthScreenLayout from '../features/auth/components/AuthScreenLayout';
import AuthTextInput from '../features/auth/components/AuthTextInput';
import AuthPrimaryButton from '../features/auth/components/AuthPrimaryButton';
import RoleSelector from '../features/auth/components/RoleSelector';

interface RegisterScreenProps {
  navigation: AuthNavigation;
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { signUp } = useAuth();
  const { colors } = useAppTheme();
  const { t } = useSettings();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [busNumber, setBusNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert(t('common.error'), t('auth.fillRequiredFields'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('common.error'), t('auth.passwordMismatch'));
      return;
    }

    if (password.length < 6) {
      Alert.alert(t('common.error'), t('auth.passwordMinLength'));
      return;
    }

    if (role === 'driver' && !busNumber) {
      Alert.alert(t('common.error'), t('auth.busNumberRequired'));
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, role, name, role === 'driver' ? busNumber : undefined);
      Alert.alert(t('auth.success'), t('auth.accountCreated'));
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout colors={colors} title={t('auth.registerTitle')} subtitle={t('auth.registerSubtitle')} scrollable>
        <RoleSelector colors={colors} role={role} onChangeRole={setRole} />

        <AuthTextInput
          colors={colors}
          placeholder={t('auth.fullNamePlaceholder')}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <AuthTextInput
          colors={colors}
          placeholder={t('auth.emailPlaceholder')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        {role === 'driver' && (
          <AuthTextInput
            colors={colors}
            placeholder={t('auth.busNumberPlaceholder')}
            value={busNumber}
            onChangeText={setBusNumber}
          />
        )}

        <AuthTextInput
          colors={colors}
          placeholder={t('auth.passwordPlaceholder')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <AuthTextInput
          colors={colors}
          placeholder={t('auth.confirmPasswordPlaceholder')}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <AuthPrimaryButton colors={colors} label={t('auth.registerButton')} loading={loading} onPress={handleRegister} />

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={[styles.linkText, { color: colors.primary }]}>
            {t('auth.hasAccount')}
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
