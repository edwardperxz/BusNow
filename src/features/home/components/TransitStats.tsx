import React from 'react';
import { View, Text } from 'react-native';
import { CommonStyles, getTheme } from '../../../styles/colors';
import { HomeStat } from '../types';

interface TransitStatsProps {
  stats: HomeStat[];
  colors: ReturnType<typeof getTheme>;
}

export default function TransitStats({ stats, colors }: TransitStatsProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        marginBottom: CommonStyles.spacing.xl,
        paddingHorizontal: CommonStyles.spacing.xs,
      }}
    >
      {stats.map((stat) => (
        <View
          key={stat.label}
          style={{
            flex: 1,
            backgroundColor: colors.white,
            borderRadius: CommonStyles.borderRadius.medium,
            padding: CommonStyles.spacing.md,
            marginHorizontal: CommonStyles.spacing.xs,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: `${stat.color}25`,
            ...CommonStyles.softShadow,
          }}
        >
          <Text
            style={{
              ...CommonStyles.typography.h2,
              color: stat.color,
              marginBottom: 4,
            }}
          >
            {stat.value}
          </Text>
          <Text
            style={{
              ...CommonStyles.typography.small,
              color: colors.gray600,
              textAlign: 'center',
              lineHeight: 16,
            }}
          >
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
