import React from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonStyles } from '../styles/colors';
import { useSettings } from '../context/SettingsContext';
import { useAppTheme } from '../hooks/useAppTheme';
import { AppNavigation } from '../types/navigation';
import SettingsHeader from '../features/settings/components/SettingsHeader';
import SettingsSectionCard from '../features/settings/components/SettingsSectionCard';
import SettingsOptionRow from '../features/settings/components/SettingsOptionRow';
import SettingsAppInfoCard from '../features/settings/components/SettingsAppInfoCard';

interface SettingsScreenProps {
  navigation: AppNavigation;
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { language, theme, setLanguage, setTheme, t } = useSettings();
  const { colors } = useAppTheme();
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
      <SettingsHeader colors={colors} title={t('settings.title')} onBack={handleBackPress} />

      <ScrollView style={{ flex: 1 }}>
        <View style={{ 
          paddingHorizontal: CommonStyles.spacing.md,
          paddingTop: CommonStyles.spacing.lg 
        }}>
          
          <SettingsSectionCard colors={colors} title={t('settings.language')}>
            <SettingsOptionRow
              colors={colors}
              icon={language === 'es' ? '🇪🇸' : '🇺🇸'}
              iconBgColor={colors.primary}
              borderColor={colors.primary}
              title={language === 'es' ? t('settings.spanish') : t('settings.english')}
              subtitle={language === 'es' ? t('settings.changeToEnglish') : t('settings.changeToSpanish')}
              onPress={toggleLanguage}
              rightAccessory={<Text style={{ fontSize: 16, color: colors.primary, fontWeight: '600' }}>›</Text>}
            />
          </SettingsSectionCard>

          <SettingsSectionCard colors={colors} title={t('settings.theme')}>
            <SettingsOptionRow
              colors={colors}
              icon={isDark ? '🌙' : '☀️'}
              iconBgColor={colors.secondary}
              borderColor={colors.secondary}
              title={isDark ? t('settings.darkMode') : t('settings.lightMode')}
              subtitle={isDark ? t('settings.darkInterfaceActive') : t('settings.lightInterfaceActive')}
              rightAccessory={
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: colors.gray300, true: colors.secondary }}
                  thumbColor={isDark ? (colors.white === '#1F1F1F' ? '#FFFFFF' : colors.white) : colors.gray100}
                />
              }
            />
          </SettingsSectionCard>

          <SettingsSectionCard colors={colors} title={t('settings.notifications')} marginBottom={CommonStyles.spacing.lg}>
            <SettingsOptionRow
              colors={colors}
              icon="🔔"
              iconBgColor={colors.accent}
              borderColor={colors.accent}
              title={t('settings.busArrivalTitle')}
              subtitle={t('settings.busArrivalSubtitle')}
              rightAccessory={
                <Switch
                  value={true}
                  onValueChange={() => {}}
                  trackColor={{ false: colors.gray300, true: colors.accent }}
                  thumbColor={colors.white === '#1F1F1F' ? '#FFFFFF' : colors.white}
                />
              }
            />
          </SettingsSectionCard>

          <SettingsAppInfoCard
            colors={colors}
            appName="BusNow"
            version="v1.0.0"
            tagline={t('settings.appTagline')}
            copyright="© 2025 BusNow Team"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}