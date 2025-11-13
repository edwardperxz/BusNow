import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { getTheme } from '../styles/colors';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

export default function ActivateDriverScreen({ navigation }: any) {
  const { theme } = useSettings();
  const { activateDriverMode, profile, updateProfile } = useAuth();
  const colors = getTheme(theme === 'dark');
  
  const [employeeId, setEmployeeId] = useState('');
  const [company, setCompany] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [loading, setLoading] = useState(false);

  // Si ya es conductor registrado, solo cambiar estado online/offline
  const isRegisteredDriver = profile?.isDriver && profile?.driverStatus === 'active';

  const handleToggleDriverMode = async (goOnline: boolean) => {
    if (!profile?.driverInfo) return;
    
    setLoading(true);
    try {
      await updateProfile({
        driverInfo: {
          ...profile.driverInfo,
          isOnline: goOnline,
          lastActive: new Date()
        }
      });

      if (goOnline) {
        Alert.alert(
          '🚌 Modo Conductor Activado',
          'Ahora estás visible en el mapa para los pasajeros',
          [
            {
              text: 'Ir al Panel',
              onPress: () => navigation.navigate('driver')
            }
          ]
        );
      } else {
        Alert.alert('Modo Conductor Desactivado', 'Ya no estás visible en el mapa');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!employeeId || !company || !licenseNumber) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      await activateDriverMode(employeeId.trim(), company.trim(), licenseNumber.trim());

      Alert.alert(
        '¡Cuenta de Conductor Registrada!',
        'Tu cuenta ha sido verificada exitosamente. Ahora puedes activar el modo conductor cuando estés en tu bus.',
        [
          {
            text: 'Entendido',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error de Activación', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Si ya es conductor registrado, mostrar controles de activación ON/OFF
  if (isRegisteredDriver) {
    const isOnline = profile.driverInfo?.isOnline || false;
    
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.white }]}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.icon, { fontSize: 64 }]}>🚌</Text>
            <Text style={[styles.title, { color: colors.gray900 }]}>
              Modo Conductor
            </Text>
            <Text style={[styles.subtitle, { color: colors.gray600 }]}>
              {isOnline ? 'Actualmente en servicio' : 'Actualmente fuera de servicio'}
            </Text>
          </View>

          {/* Estado actual */}
          <View style={[styles.statusBanner, { 
            backgroundColor: isOnline ? '#E8F5E9' : '#FFF3E0',
            borderColor: isOnline ? '#4CAF50' : '#FF9800',
            borderWidth: 2
          }]}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>
              {isOnline ? '🟢' : '🔴'}
            </Text>
            <Text style={[styles.statusBannerTitle, { 
              color: isOnline ? '#2E7D32' : '#E65100' 
            }]}>
              {isOnline ? 'Modo Conductor Activo' : 'Modo Conductor Inactivo'}
            </Text>
            <Text style={[styles.statusBannerText, { color: colors.gray700 }]}>
              {isOnline 
                ? 'Los pasajeros pueden ver tu ubicación en tiempo real'
                : 'No estás visible en el mapa para los pasajeros'
              }
            </Text>
          </View>

          {/* Info del conductor */}
          {profile.driverInfo && (
            <View style={[styles.infoCard, { backgroundColor: colors.gray100 }]}>
              <Text style={[styles.infoCardTitle, { color: colors.gray900 }]}>
                📋 Información del Conductor
              </Text>
              
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.gray600 }]}>Empresa:</Text>
                <Text style={[styles.infoValue, { color: colors.gray900 }]}>
                  {profile.driverInfo.company}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.gray600 }]}>Bus Asignado:</Text>
                <Text style={[styles.infoValue, { color: colors.gray900 }]}>
                  {profile.driverInfo.busNumber}
                </Text>
              </View>

              {profile.driverInfo.route && (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.gray600 }]}>Ruta:</Text>
                  <Text style={[styles.infoValue, { color: colors.gray900 }]}>
                    {profile.driverInfo.route}
                  </Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.gray600 }]}>Código de Empleado:</Text>
                <Text style={[styles.infoValue, { color: colors.gray900 }]}>
                  {profile.driverInfo.employeeId}
                </Text>
              </View>
            </View>
          )}

          {/* Botones de control */}
          {!isOnline ? (
            <TouchableOpacity
              style={[styles.bigButton, { backgroundColor: '#4CAF50' }]}
              onPress={() => handleToggleDriverMode(true)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.bigButtonIcon}>🚦</Text>
                  <Text style={styles.bigButtonText}>Iniciar Modo Conductor</Text>
                  <Text style={styles.bigButtonSubtext}>Activar y ser visible en el mapa</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.bigButton, { backgroundColor: '#F44336' }]}
              onPress={() => handleToggleDriverMode(false)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.bigButtonIcon}>🛑</Text>
                  <Text style={styles.bigButtonText}>Detener Modo Conductor</Text>
                  <Text style={styles.bigButtonSubtext}>Dejar de ser visible en el mapa</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.gray200, marginTop: 16 }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.buttonText, { color: colors.gray700 }]}>Volver</Text>
          </TouchableOpacity>

          <View style={[styles.infoBox, { backgroundColor: colors.gray100, marginTop: 24 }]}>
            <Text style={[styles.infoTitle, { color: colors.gray900 }]}>
              💡 Consejos
            </Text>
            <Text style={[styles.infoText, { color: colors.gray700 }]}>
              • Activa el modo cuando inicies tu ruta{'\n'}
              • Desactívalo al terminar tu turno{'\n'}
              • Mantén el GPS activo para mejor precisión{'\n'}
              • Los pasajeros verán tu ubicación en tiempo real
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Formulario de activación
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.white }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.icon, { fontSize: 64 }]}>🚌</Text>
          <Text style={[styles.title, { color: colors.gray900 }]}>
            Activar Modo Conductor
          </Text>
          <Text style={[styles.subtitle, { color: colors.gray600 }]}>
            Ingresa tus credenciales de conductor para activar tu cuenta
          </Text>
        </View>

        <View style={[styles.warningCard, { backgroundColor: '#E3F2FD' }]}>
          <Text style={[styles.warningText, { color: '#1976D2' }]}>
            ℹ️ Solo personal autorizado con credenciales válidas puede activar el modo conductor.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.gray700 }]}>
            Número de Empleado *
          </Text>
          <Text style={[styles.helpText, { color: colors.gray500 }]}>
            Tu código único de empleado proporcionado por la empresa
          </Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.gray100,
              borderColor: colors.gray300,
              color: colors.gray900
            }]}
            placeholder="Ej: EMP-2024-001"
            placeholderTextColor={colors.gray400}
            value={employeeId}
            onChangeText={setEmployeeId}
            autoCapitalize="characters"
          />

          <Text style={[styles.label, { color: colors.gray700, marginTop: 20 }]}>
            Empresa Transportista *
          </Text>
          <Text style={[styles.helpText, { color: colors.gray500 }]}>
            Nombre de la empresa para la que trabajas
          </Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.gray100,
              borderColor: colors.gray300,
              color: colors.gray900
            }]}
            placeholder="Ej: TransportesPTY"
            placeholderTextColor={colors.gray400}
            value={company}
            onChangeText={setCompany}
          />

          <Text style={[styles.label, { color: colors.gray700, marginTop: 20 }]}>
            Número de Licencia *
          </Text>
          <Text style={[styles.helpText, { color: colors.gray500 }]}>
            Tu número de licencia de conducir registrada
          </Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.gray100,
              borderColor: colors.gray300,
              color: colors.gray900
            }]}
            placeholder="Ej: PA-1234567"
            placeholderTextColor={colors.gray400}
            value={licenseNumber}
            onChangeText={setLicenseNumber}
            autoCapitalize="characters"
          />

          <View style={[styles.infoBox, { backgroundColor: colors.gray100 }]}>
            <Text style={[styles.infoTitle, { color: colors.gray900 }]}>
              📋 Cómo Funciona
            </Text>
            <Text style={[styles.infoText, { color: colors.gray700 }]}>
              • Tu número de empleado debe estar registrado en nuestro sistema
              {'\n'}
              • La empresa y licencia deben coincidir con nuestros registros
              {'\n'}
              • Una vez activado, podrás iniciar/detener el modo conductor
              {'\n'}
              • Cada código solo puede usarse una vez
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, { 
              backgroundColor: loading ? colors.gray300 : colors.primary 
            }]}
            onPress={handleActivate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Activar Modo Conductor</Text>
                <Text style={styles.submitButtonIcon}>🚀</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.cancelButtonText, { color: colors.gray600 }]}>
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.supportCard, { backgroundColor: colors.gray100 }]}>
          <Text style={[styles.supportTitle, { color: colors.gray900 }]}>
            ¿No tienes credenciales?
          </Text>
          <Text style={[styles.supportText, { color: colors.gray600 }]}>
            Contacta al administrador de tu empresa para obtener tu número de empleado.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  warningCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
  },
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  helpText: {
    fontSize: 13,
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  infoBox: {
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
  },
  submitButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    flexDirection: 'row',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  submitButtonIcon: {
    fontSize: 18,
  },
  cancelButton: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  supportCard: {
    padding: 20,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 32,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    lineHeight: 20,
  },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  statusIcon: {
    marginBottom: 24,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  statusMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  infoCard: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusBanner: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  statusBannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusBannerText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  bigButton: {
    width: '100%',
    minHeight: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  bigButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  bigButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  bigButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    textAlign: 'center',
  },
});
