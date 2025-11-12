import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { getTheme } from '../styles/colors';
import { useSettings } from '../context/SettingsContext';
import { useAuth, UserRole } from '../context/AuthContext';

export default function RegisterScreen({ navigation }: any) {
  const { theme } = useSettings();
  const { signUp } = useAuth();
  const colors = getTheme(theme === 'dark');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [busNumber, setBusNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (role === 'driver' && !busNumber) {
      Alert.alert('Error', 'Por favor ingresa el número de bus');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, role, name, role === 'driver' ? busNumber : undefined);
      Alert.alert('Éxito', 'Cuenta creada correctamente');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.white }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.gray900 }]}>Crear Cuenta</Text>
        <Text style={[styles.subtitle, { color: colors.gray600 }]}>
          Regístrate para empezar
        </Text>

        <Text style={[styles.label, { color: colors.gray700 }]}>Tipo de cuenta</Text>
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              role === 'user' && { backgroundColor: colors.primary },
              { borderColor: colors.gray300 }
            ]}
            onPress={() => setRole('user')}
          >
            <Text style={[
              styles.roleButtonText,
              { color: role === 'user' ? colors.white : colors.gray700 }
            ]}>
              🧑 Usuario
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleButton,
              role === 'driver' && { backgroundColor: colors.primary },
              { borderColor: colors.gray300 }
            ]}
            onPress={() => setRole('driver')}
          >
            <Text style={[
              styles.roleButtonText,
              { color: role === 'driver' ? colors.white : colors.gray700 }
            ]}>
              🚌 Conductor
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.gray100,
            borderColor: colors.gray300,
            color: colors.gray900
          }]}
          placeholder="Nombre completo"
          placeholderTextColor={colors.gray500}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.gray100,
            borderColor: colors.gray300,
            color: colors.gray900
          }]}
          placeholder="Correo electrónico"
          placeholderTextColor={colors.gray500}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        {role === 'driver' && (
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.gray100,
              borderColor: colors.gray300,
              color: colors.gray900
            }]}
            placeholder="Número de bus"
            placeholderTextColor={colors.gray500}
            value={busNumber}
            onChangeText={setBusNumber}
          />
        )}

        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.gray100,
            borderColor: colors.gray300,
            color: colors.gray900
          }]}
          placeholder="Contraseña"
          placeholderTextColor={colors.gray500}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.gray100,
            borderColor: colors.gray300,
            color: colors.gray900
          }]}
          placeholder="Confirmar contraseña"
          placeholderTextColor={colors.gray500}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Registrarse</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={[styles.linkText, { color: colors.primary }]}>
            ¿Ya tienes cuenta? Inicia sesión
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.linkButton, { marginTop: 8 }]}
          onPress={() => navigation.navigate('map')}
        >
          <Text style={[styles.linkText, { color: colors.gray600 }]}>
            ← Volver al mapa
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  roleButton: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 16,
  },
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
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
