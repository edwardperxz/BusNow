import React from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BusNowColors, getTheme, CommonStyles } from '../styles/colors';
import { useSettings } from '../context/SettingsContext';

export default function SettingsScreen({ navigation }: any) {
  const { language, theme, setLanguage, setTheme, t } = useSettings();
  const colors = getTheme(theme === 'dark');
  const isDark = theme === 'dark';

  const handleBackPress = () => {
    navigation.navigate('map');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <SafeAreaView style={{ 
      flex: 1, 
      backgroundColor: colors.gray100 
    }}>
      {/* Header */}
      <View style={{
        backgroundColor: colors.primary,
        paddingHorizontal: CommonStyles.spacing.md,
        paddingVertical: CommonStyles.spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{
            fontSize: 18,
            color: colors.white === '#1F1F1F' ? '#FFFFFF' : colors.white,
            fontWeight: '600'
          }}>←</Text>
        </TouchableOpacity>

        <Text style={{
          fontSize: 20,
          fontWeight: '700',
          color: colors.white === '#1F1F1F' ? '#FFFFFF' : colors.white,
          flex: 1,
          textAlign: 'center',
          marginRight: 40,
        }}>
          {t('settings.title')}
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={{ 
          paddingHorizontal: CommonStyles.spacing.md,
          paddingTop: CommonStyles.spacing.lg 
        }}>
          
          {/* Sección de Idioma */}
          <View style={{
            backgroundColor: colors.white,
            borderRadius: CommonStyles.borderRadius.large,
            padding: CommonStyles.spacing.lg,
            marginBottom: CommonStyles.spacing.md,
            ...CommonStyles.cardShadow,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: colors.gray800,
              marginBottom: CommonStyles.spacing.md,
            }}>
              {t('settings.language')}
            </Text>

            <TouchableOpacity
              onPress={toggleLanguage}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: CommonStyles.spacing.md,
                paddingHorizontal: CommonStyles.spacing.md,
                backgroundColor: colors.gray100,
                borderRadius: CommonStyles.borderRadius.medium,
                borderWidth: 2,
                borderColor: colors.primary,
              }}
            >
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: CommonStyles.spacing.md,
              }}>
                <Text style={{
                  fontSize: 18,
                  color: colors.white === '#1F1F1F' ? '#FFFFFF' : colors.white,
                }}>
                  {language === 'es' ? '🇪🇸' : '🇺🇸'}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: colors.gray800,
                }}>
                  {language === 'es' ? t('settings.spanish') : t('settings.english')}
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: colors.gray500,
                  marginTop: 2,
                }}>
                  {language === 'es' ? 'Cambiar a inglés' : 'Switch to Spanish'}
                </Text>
              </View>

              <Text style={{
                fontSize: 16,
                color: colors.primary,
                fontWeight: '600',
              }}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Sección de Tema */}
          <View style={{
            backgroundColor: colors.white,
            borderRadius: CommonStyles.borderRadius.large,
            padding: CommonStyles.spacing.lg,
            marginBottom: CommonStyles.spacing.md,
            ...CommonStyles.cardShadow,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: colors.gray800,
              marginBottom: CommonStyles.spacing.md,
            }}>
              {t('settings.theme')}
            </Text>

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: CommonStyles.spacing.md,
              paddingHorizontal: CommonStyles.spacing.md,
              backgroundColor: colors.gray100,
              borderRadius: CommonStyles.borderRadius.medium,
              borderWidth: 2,
              borderColor: colors.secondary,
            }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.secondary,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: CommonStyles.spacing.md,
              }}>
                <Text style={{
                  fontSize: 18,
                  color: colors.white === '#1F1F1F' ? '#FFFFFF' : colors.white,
                }}>
                  {isDark ? '🌙' : '☀️'}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: colors.gray800,
                }}>
                  {isDark ? t('settings.darkMode') : t('settings.lightMode')}
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: colors.gray500,
                  marginTop: 2,
                }}>
                  {isDark ? 'Interfaz oscura activa' : 'Interfaz clara activa'}
                </Text>
              </View>

              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{
                  false: colors.gray300,
                  true: colors.secondary
                }}
                thumbColor={isDark ? colors.white === '#1F1F1F' ? '#FFFFFF' : colors.white : colors.gray100}
              />
            </View>
          </View>

          {/* Sección de Notificaciones */}
          <View style={{
            backgroundColor: colors.white,
            borderRadius: CommonStyles.borderRadius.large,
            padding: CommonStyles.spacing.lg,
            marginBottom: CommonStyles.spacing.lg,
            ...CommonStyles.cardShadow,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: colors.gray800,
              marginBottom: CommonStyles.spacing.md,
            }}>
              {t('settings.notifications')}
            </Text>

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: CommonStyles.spacing.md,
              paddingHorizontal: CommonStyles.spacing.md,
              backgroundColor: colors.gray100,
              borderRadius: CommonStyles.borderRadius.medium,
              borderWidth: 2,
              borderColor: colors.accent,
            }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.accent,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: CommonStyles.spacing.md,
              }}>
                <Text style={{
                  fontSize: 18,
                  color: colors.white === '#1F1F1F' ? '#FFFFFF' : colors.white,
                }}>🔔</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: colors.gray800,
                }}>
                  Llegada de buses
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: colors.gray500,
                  marginTop: 2,
                }}>
                  Recibe alertas cuando tu bus esté cerca
                </Text>
              </View>

              <Switch
                value={true}
                onValueChange={() => {}}
                trackColor={{
                  false: colors.gray300,
                  true: colors.accent
                }}
                thumbColor={colors.white === '#1F1F1F' ? '#FFFFFF' : colors.white}
              />
            </View>
          </View>

          {/* Información de la app */}
          <View style={{
            backgroundColor: colors.white,
            borderRadius: CommonStyles.borderRadius.large,
            padding: CommonStyles.spacing.lg,
            marginBottom: CommonStyles.spacing.xxl,
            ...CommonStyles.cardShadow,
          }}>
            <Text style={{
              fontSize: 14,
              color: colors.gray500,
              textAlign: 'center',
              lineHeight: 20,
            }}>
              BusNow v1.0.0{'\n'}
              Transporte inteligente para todos{'\n'}
              © 2025 BusNow Team
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}