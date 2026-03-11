import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CommonStyles, getTheme } from '../../../styles/colors';
import { HomeAction } from '../types';

interface QuickActionsProps {
  actions: HomeAction[];
  colors: ReturnType<typeof getTheme>;
  sectionTitle: string;
}

export default function QuickActions({ actions, colors, sectionTitle }: QuickActionsProps) {
  return (
    <View style={{ marginBottom: CommonStyles.spacing.xl }}>
      <Text
        style={{
          ...CommonStyles.typography.h3,
          marginBottom: CommonStyles.spacing.md,
          color: colors.gray700,
          paddingLeft: CommonStyles.spacing.xs,
        }}
      >
        {sectionTitle}
      </Text>

      {actions.map((action) => (
        <TouchableOpacity
          key={action.id}
          style={{
            backgroundColor: colors.white,
            borderRadius: CommonStyles.borderRadius.large,
            padding: CommonStyles.spacing.lg,
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: CommonStyles.spacing.md,
            borderWidth: 1,
            borderColor: `${action.color}20`,
            ...CommonStyles.cardShadow,
          }}
          onPress={action.onPress}
        >
          <View
            style={{
              width: 56,
              height: 56,
              backgroundColor: action.color,
              borderRadius: CommonStyles.borderRadius.medium,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: CommonStyles.spacing.md,
            }}
          >
            <Text style={{ fontSize: 24, color: colors.white === '#1F1F1F' ? '#FFFFFF' : colors.white }}>
              {action.icon}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                ...CommonStyles.typography.bodyMedium,
                color: colors.gray800,
                marginBottom: 2,
              }}
            >
              {action.title}
            </Text>
            <Text
              style={{
                ...CommonStyles.typography.caption,
                color: colors.gray500,
              }}
            >
              {action.subtitle}
            </Text>
          </View>

          <Text style={{ fontSize: 20, color: action.color, fontWeight: '700' }}>›</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
