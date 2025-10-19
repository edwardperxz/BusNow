import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { BusNowColors, CommonStyles, getTheme } from '../styles/colors';
import { useSettings } from '../context/SettingsContext';

interface DriverLoginScreenProps {
  onLogin?: (email: string, password: string) => void;
  onStartAsDriver?: () => void;
  onBackToMap?: () => void;
}

const DriverLoginScreen: React.FC<DriverLoginScreenProps> = ({
  onLogin,
  onStartAsDriver,
  onBackToMap,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { theme, t } = useSettings();
  const colors = getTheme(theme === 'dark');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Por favor ingresa un correo válido');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simular llamada de autenticación
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (onLogin) {
        onLogin(email, password);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo iniciar sesión. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartAsDriver = () => {
    if (onStartAsDriver) {
      onStartAsDriver();
    }
  };

  const handleBackToMap = () => {
    if (onBackToMap) {
      onBackToMap();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.gray100 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Background Road Design */}
        <View style={styles.backgroundContainer}>
          <View style={styles.roadContainer}>
            <View style={[styles.road, { backgroundColor: colors.gray500 }]} />
            <View style={[styles.roadLine, { backgroundColor: colors.white }]} />
          </View>
        </View>

        {/* Bus Icon */}
        <View style={styles.iconContainer}>
          <Image 
            source={require('../../assets/icon.png')} 
            style={styles.busIcon}
            resizeMode="contain"
          />
        </View>

        {/* Login Form */}
        <View style={[styles.formContainer, { backgroundColor: colors.white }]}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { color: colors.gray800, backgroundColor: colors.white }]}
              placeholder="Correo electrónico"
              placeholderTextColor={colors.gray400}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { color: colors.gray800, backgroundColor: colors.white }]}
              placeholder="Contraseña"
              placeholderTextColor={colors.gray400}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Start as Driver Button */}
          <TouchableOpacity 
            style={[styles.driverButton, { backgroundColor: colors.primary }, isLoading && styles.buttonDisabled]}
            onPress={handleStartAsDriver}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={[styles.driverButtonText, { color: colors.white }]}>
              Iniciar como conductor
            </Text>
          </TouchableOpacity>

          {/* Back to Map Link */}
          <TouchableOpacity 
            style={styles.backToMapContainer}
            onPress={handleBackToMap}
            activeOpacity={0.7}
          >
            <Text style={[styles.backToMapText, { color: colors.primary }]}>
              Volver al mapa
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor removed - handled dynamically
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: CommonStyles.spacing.lg,
    paddingVertical: CommonStyles.spacing.xxl,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roadContainer: {
    width: '120%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.1,
  },
  road: {
    width: '100%',
    height: 80,
    // backgroundColor removed - handled dynamically
    borderRadius: 40,
    transform: [{ perspective: 1000 }, { rotateX: '60deg' }],
  },
  roadLine: {
    position: 'absolute',
    width: '80%',
    height: 4,
    // backgroundColor removed - handled dynamically
    borderRadius: 2,
    top: '50%',
    marginTop: -2,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: CommonStyles.spacing.xxl * 2,
  },
  busIcon: {
    width: 80,
    height: 80,
    // tintColor removed - icon color handled by theme
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    // backgroundColor removed - handled dynamically
  },
  inputContainer: {
    marginBottom: CommonStyles.spacing.md,
  },
  input: {
    // backgroundColor removed - handled dynamically
    borderRadius: CommonStyles.borderRadius.large,
    paddingHorizontal: CommonStyles.spacing.lg,
    paddingVertical: CommonStyles.spacing.md + 2,
    fontSize: 16,
    // color removed - handled dynamically
    borderWidth: 1,
    borderColor: 'transparent',
    ...CommonStyles.softShadow,
  },
  driverButton: {
    // backgroundColor removed - handled dynamically
    borderRadius: CommonStyles.borderRadius.large,
    paddingVertical: CommonStyles.spacing.md + 2,
    paddingHorizontal: CommonStyles.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: CommonStyles.spacing.md,
    marginBottom: CommonStyles.spacing.lg,
    ...CommonStyles.cardShadow,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  driverButtonText: {
    // color removed - handled dynamically
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  backToMapContainer: {
    alignItems: 'center',
    paddingVertical: CommonStyles.spacing.sm,
  },
  backToMapText: {
    // color removed - handled dynamically
    fontSize: 16,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});

export default DriverLoginScreen;