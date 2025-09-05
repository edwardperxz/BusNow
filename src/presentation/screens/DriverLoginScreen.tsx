// =============================================================================
// DRIVER LOGIN SCREEN - MVP BusNow
// =============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../styles/colors';

interface DriverLoginScreenProps {
  navigation: any;
}

const DriverLoginScreen: React.FC<DriverLoginScreenProps> = ({ navigation }) => {
  const [driverId, setDriverId] = useState('');
  const [password, setPassword] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Datos de prueba para conductores
  const MOCK_DRIVERS = [
    { id: 'driver001', password: '1234', name: 'Juan Pérez', busNumber: 'BUS-001' },
    { id: 'driver002', password: '5678', name: 'María González', busNumber: 'BUS-002' },
    { id: 'driver003', password: '9999', name: 'Carlos López', busNumber: 'BUS-003' },
  ];

  const handleLogin = async () => {
    // Validaciones básicas
    if (!driverId.trim()) {
      Alert.alert('Error', 'Por favor ingrese su ID de conductor');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Por favor ingrese su contraseña');
      return;
    }

    if (!busNumber.trim()) {
      Alert.alert('Error', 'Por favor ingrese el número de bus');
      return;
    }

    setIsLoading(true);

    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verificar credenciales
      const driver = MOCK_DRIVERS.find(d => 
        d.id.toLowerCase() === driverId.toLowerCase() && 
        d.password === password &&
        d.busNumber.toLowerCase() === busNumber.toLowerCase()
      );

      if (driver) {
        Alert.alert(
          'Inicio Exitoso',
          `Bienvenido ${driver.name}! Has iniciado sesión como conductor.`,
          [
            {
              text: 'Continuar',
              onPress: () => {
                // En una aplicación real, aquí navegaríamos a la pantalla del conductor
                Alert.alert(
                  'Modo Conductor',
                  'Funcionalidad de conductor en desarrollo. Regresando al menú principal.',
                  [
                    {
                      text: 'OK',
                      onPress: () => navigation.navigate('Home')
                    }
                  ]
                );
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Error de Acceso',
          'Credenciales incorrectas. Verifique su ID de conductor, contraseña y número de bus.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al iniciar sesión. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const showCredentialsHelp = () => {
    Alert.alert(
      'Credenciales de Prueba',
      'Para demostración, puede usar:\n\n' +
      '• ID: driver001, Password: 1234, Bus: BUS-001\n' +
      '• ID: driver002, Password: 5678, Bus: BUS-002\n' +
      '• ID: driver003, Password: 9999, Bus: BUS-003',
      [{ text: 'Entendido' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>← Volver</Text>
            </TouchableOpacity>
          </View>

          {/* Logo y Título */}
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>🚌</Text>
            </View>
            <Text style={styles.title}>Acceso Conductor</Text>
            <Text style={styles.subtitle}>
              Ingrese sus credenciales para acceder al sistema de conductores
            </Text>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            {/* ID de Conductor */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>ID de Conductor</Text>
              <TextInput
                style={styles.input}
                value={driverId}
                onChangeText={setDriverId}
                placeholder="Ej: driver001"
                placeholderTextColor={colors.text.secondary}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Contraseña */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Ingrese su contraseña"
                  placeholderTextColor={colors.text.secondary}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.passwordToggleText}>
                    {showPassword ? '🙈' : '👁️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Número de Bus */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Número de Bus</Text>
              <TextInput
                style={styles.input}
                value={busNumber}
                onChangeText={setBusNumber}
                placeholder="Ej: BUS-001"
                placeholderTextColor={colors.text.secondary}
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>

            {/* Botón de Ayuda */}
            <TouchableOpacity
              style={styles.helpButton}
              onPress={showCredentialsHelp}
            >
              <Text style={styles.helpButtonText}>
                💡 Ver credenciales de prueba
              </Text>
            </TouchableOpacity>

            {/* Botón de Login */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                (!driverId || !password || !busNumber || isLoading) && styles.loginButtonDisabled
              ]}
              onPress={handleLogin}
              disabled={!driverId || !password || !busNumber || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.text.white} />
              ) : (
                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              ¿Problemas para acceder?
            </Text>
            <TouchableOpacity
              onPress={() => Alert.alert(
                'Soporte Técnico',
                'Contacte al administrador del sistema:\n• Teléfono: +1234567890\n• Email: soporte@busnow.com'
              )}
            >
              <Text style={styles.supportText}>Contactar Soporte</Text>
            </TouchableOpacity>
          </View>

          {/* Info de Seguridad */}
          <View style={styles.securityInfo}>
            <Text style={styles.securityTitle}>🔒 Información de Seguridad</Text>
            <Text style={styles.securityText}>
              • Sus credenciales están protegidas{'\n'}
              • No comparta su información de acceso{'\n'}
              • Cierre sesión al finalizar su turno{'\n'}
              • Reporte cualquier actividad sospechosa
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary.main,
    fontWeight: '600',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: colors.text.primary,
  },
  passwordToggle: {
    padding: 16,
  },
  passwordToggleText: {
    fontSize: 20,
  },
  helpButton: {
    backgroundColor: colors.info + '20',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  helpButtonText: {
    fontSize: 14,
    color: colors.info,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: colors.primary.main,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: colors.gray[400],
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.white,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  footerText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  supportText: {
    fontSize: 16,
    color: colors.primary.main,
    fontWeight: '600',
  },
  securityInfo: {
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    padding: 16,
    marginTop: 'auto',
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  securityText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});

export default DriverLoginScreen;
