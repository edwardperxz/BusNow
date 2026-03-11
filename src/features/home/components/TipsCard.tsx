import React from 'react';
import { View, Text } from 'react-native';
import { CommonStyles, getTheme } from '../../../styles/colors';

interface TipsCardProps {
  colors: ReturnType<typeof getTheme>;
  title: string;
  description: string;
}

export default function TipsCard({ colors, title, description }: TipsCardProps) {
  return (
    <View
      style={{
        backgroundColor: colors.white,
        borderRadius: CommonStyles.borderRadius.large,
        padding: CommonStyles.spacing.lg,
        alignItems: 'center',
        marginBottom: CommonStyles.spacing.xxl,
        ...CommonStyles.softShadow,
      }}
    >
      <View
        style={{
          backgroundColor: `${colors.accent}20`,
          width: 48,
          height: 48,
          borderRadius: 24,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: CommonStyles.spacing.md,
        }}
      >
        <Text style={{ fontSize: 20, color: colors.accent }}>💡</Text>
      </View>

      <Text
        style={{
          ...CommonStyles.typography.bodyMedium,
          color: colors.gray800,
          marginBottom: CommonStyles.spacing.sm,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          ...CommonStyles.typography.caption,
          color: colors.gray600,
          textAlign: 'center',
          lineHeight: 20,
        }}
      >
        {description}
      </Text>
    </View>
  );
}
