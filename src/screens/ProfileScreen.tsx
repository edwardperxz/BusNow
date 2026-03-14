import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonStyles, getTheme } from '../styles/colors';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { AppNavigation } from '../types/navigation';

interface ProfileScreenProps {
  navigation: AppNavigation;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { theme, t } = useSettings();
  const colors = getTheme(theme === 'dark');
  const { profile, isAnonymous, updateProfile } = useAuth();
  const roleLabels: Record<string, string> = {
    passenger: `👤 ${t('auth.passengerRole')}`,
    driver: `🚌 ${t('auth.driverRole')}`,
    admin: `🛠️ ${t('auth.adminRole')}`,
  };

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(profile?.name ?? '');
  const [saving, setSaving] = useState(false);

  const handleBack = () => navigation.navigate('settings');

  const handleSaveName = async () => {
    try {
      setSaving(true);
      await updateProfile(nameValue);
      setEditingName(false);
    } catch (e: any) {
      Alert.alert(t('common.error'), e?.message ?? t('profile.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const renderAnonymous = () => (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>🔒</Text>
      <Text
        style={{
          ...CommonStyles.typography.h3,
          color: colors.gray500,
          textAlign: 'center',
          paddingHorizontal: CommonStyles.spacing.xl,
        }}
      >
        {t('profile.loginRequired')}
      </Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('auth')}
        style={{
          marginTop: 24,
          backgroundColor: colors.primary,
          paddingHorizontal: CommonStyles.spacing.xl,
          paddingVertical: CommonStyles.spacing.md,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>
          {t('auth.loginButton')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray100 }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: CommonStyles.spacing.md,
          paddingVertical: CommonStyles.spacing.md,
          backgroundColor: colors.white,
          ...CommonStyles.cardShadow,
        }}
      >
        <TouchableOpacity onPress={handleBack} style={{ marginRight: CommonStyles.spacing.md }}>
          <Text style={{ fontSize: 20, color: colors.primary }}>←</Text>
        </TouchableOpacity>
        <Text style={{ ...CommonStyles.typography.h2, color: colors.gray800, flex: 1 }}>
          {t('profile.title')}
        </Text>
      </View>

      {isAnonymous || !profile ? (
        renderAnonymous()
      ) : (
        <ScrollView contentContainerStyle={{ padding: CommonStyles.spacing.md }}>
          {/* Avatar */}
          <View style={{ alignItems: 'center', marginVertical: CommonStyles.spacing.xl }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: CommonStyles.spacing.sm,
              }}
            >
              <Text style={{ fontSize: 36, color: '#FFFFFF' }}>
                {(profile.name ?? profile.email ?? '?')[0].toUpperCase()}
              </Text>
            </View>
            <Text style={{ ...CommonStyles.typography.caption, color: colors.gray500 }}>
              {roleLabels[profile.role ?? ''] ?? ''}
            </Text>
          </View>

          {/* Campos */}
          <View
            style={{
              backgroundColor: colors.white,
              borderRadius: 12,
              padding: CommonStyles.spacing.md,
              ...CommonStyles.cardShadow,
              gap: CommonStyles.spacing.md,
            }}
          >
            {/* Nombre */}
            <View>
              <Text
                style={{
                  ...CommonStyles.typography.caption,
                  color: colors.gray500,
                  marginBottom: 4,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                {t('profile.name')}
              </Text>
              {editingName ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TextInput
                    value={nameValue}
                    onChangeText={setNameValue}
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: colors.primary,
                      borderRadius: 8,
                      paddingHorizontal: CommonStyles.spacing.md,
                      paddingVertical: CommonStyles.spacing.sm,
                      color: colors.gray800,
                      fontSize: 16,
                    }}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={handleSaveName}
                  />
                  <TouchableOpacity
                    onPress={handleSaveName}
                    disabled={saving}
                    style={{
                      backgroundColor: colors.primary,
                      paddingHorizontal: CommonStyles.spacing.md,
                      paddingVertical: CommonStyles.spacing.sm,
                      borderRadius: 8,
                    }}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
                        {t('common.save')}
                      </Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setNameValue(profile.name ?? '');
                      setEditingName(false);
                    }}
                  >
                    <Text style={{ color: colors.gray500, fontSize: 16 }}>✕</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    setNameValue(profile.name ?? '');
                    setEditingName(true);
                  }}
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Text style={{ ...CommonStyles.typography.bodyMedium, color: colors.gray800 }}>
                    {profile.name || t('profile.noName')}
                  </Text>
                  <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>
                    {t('profile.editName')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Email */}
            {profile.email ? (
              <View>
                <Text
                  style={{
                    ...CommonStyles.typography.caption,
                    color: colors.gray500,
                    marginBottom: 4,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  {t('profile.email')}
                </Text>
                <Text style={{ ...CommonStyles.typography.bodyMedium, color: colors.gray800 }}>
                  {profile.email}
                </Text>
              </View>
            ) : null}

            {/* Rol */}
            <View>
              <Text
                style={{
                  ...CommonStyles.typography.caption,
                  color: colors.gray500,
                  marginBottom: 4,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                {t('profile.role')}
              </Text>
              <Text style={{ ...CommonStyles.typography.bodyMedium, color: colors.gray800 }}>
                {roleLabels[profile.role ?? ''] ?? '—'}
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
