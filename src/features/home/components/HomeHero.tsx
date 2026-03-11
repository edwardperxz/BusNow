import React from 'react';
import { View, Text } from 'react-native';
import { CommonStyles, getTheme } from '../../../styles/colors';

interface HomeHeroProps {
  colors: ReturnType<typeof getTheme>;
  title: string;
  subtitle: string;
  statusLabel: string;
}

export default function HomeHero({ colors, title, subtitle, statusLabel }: HomeHeroProps) {
  return (
    <View
      style={{
        backgroundColor: colors.primary,
        borderRadius: CommonStyles.borderRadius.extraLarge,
        padding: CommonStyles.spacing.lg,
        ...CommonStyles.cardShadow,
      }}
    >
      <Text style={{ fontSize: 30, marginBottom: CommonStyles.spacing.sm }}>🚌</Text>
      <Text
        style={{
          ...CommonStyles.typography.h2,
          color: '#FFFFFF',
          marginBottom: CommonStyles.spacing.xs,
          fontWeight: '700',
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          ...CommonStyles.typography.body,
          color: 'rgba(255,255,255,0.86)',
          marginBottom: CommonStyles.spacing.md,
        }}
      >
        {subtitle}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(255,255,255,0.14)',
          borderRadius: 999,
          alignSelf: 'flex-start',
          paddingVertical: 6,
          paddingHorizontal: 12,
        }}
      >
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            marginRight: 8,
            backgroundColor: '#6EE7B7',
          }}
        />
        <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>{statusLabel}</Text>
      </View>
    </View>
  );
}
