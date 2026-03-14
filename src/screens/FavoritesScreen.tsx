import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonStyles, getTheme } from '../styles/colors';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../features/routes/hooks/useFavorites';
import { AppNavigation } from '../types/navigation';

interface FavoritesScreenProps {
  navigation: AppNavigation;
}

export default function FavoritesScreen({ navigation }: FavoritesScreenProps) {
  const { theme, t } = useSettings();
  const colors = getTheme(theme === 'dark');
  const { profile, isAnonymous } = useAuth();
  const uid = !isAnonymous && profile ? profile.uid : null;
  const { favorites, loading, removeFavorite } = useFavorites(uid);

  const handleBack = () => navigation.navigate('home');

  const renderEmpty = () => (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>⭐</Text>
      <Text
        style={{
          ...CommonStyles.typography.h3,
          color: colors.gray500,
          textAlign: 'center',
          paddingHorizontal: CommonStyles.spacing.xl,
        }}
      >
        {t('favorites.empty')}
      </Text>
    </View>
  );

  const renderLoginRequired = () => (
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
        {t('favorites.loginRequired')}
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
          {t('favorites.title')}
        </Text>
      </View>

      {/* Content */}
      {!uid ? (
        renderLoginRequired()
      ) : loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: CommonStyles.spacing.md,
            flexGrow: 1,
          }}
          ListEmptyComponent={renderEmpty}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.white,
                borderRadius: 12,
                padding: CommonStyles.spacing.md,
                marginBottom: CommonStyles.spacing.sm,
                ...CommonStyles.cardShadow,
              }}
            >
              <Text style={{ fontSize: 28, marginRight: CommonStyles.spacing.md }}>🚌</Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    ...CommonStyles.typography.bodyMedium,
                    color: colors.gray800,
                    fontWeight: '600',
                  }}
                >
                  {item.routeName}
                </Text>
                <Text style={{ ...CommonStyles.typography.caption, color: colors.gray500 }}>
                  {new Date(item.addedAt).toLocaleDateString()}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => removeFavorite(item.id)}
                style={{
                  padding: CommonStyles.spacing.sm,
                }}
                accessibilityLabel={t('favorites.remove')}
              >
                <Text style={{ fontSize: 20, color: '#E53935' }}>🗑️</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
