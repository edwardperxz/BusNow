import React from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { getTheme } from '../../../styles/colors';
import { useSettings } from '../../../context/SettingsContext';

interface RoutesListStateProps {
  colors: ReturnType<typeof getTheme>;
  loading: boolean;
  isEmpty: boolean;
}

export default function RoutesListState({ colors, loading, isEmpty }: RoutesListStateProps) {
  const { t } = useSettings();

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 32 }} />;
  }

  if (isEmpty) {
    return (
      <Text style={{ color: colors.gray500, textAlign: 'center', marginTop: 32 }}>
        {t('routes.noRoutes')}
      </Text>
    );
  }

  return null;
}
