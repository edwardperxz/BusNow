import React, { useEffect, useRef } from 'react';
import { View, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonStyles } from '../styles/colors';
import { useAppTheme } from '../hooks/useAppTheme';
import { AppNavigation } from '../types/navigation';
import { useSettings } from '../context/SettingsContext';
import HomeHero from '../features/home/components/HomeHero';
import TransitStats from '../features/home/components/TransitStats';
import QuickActions from '../features/home/components/QuickActions';
import TipsCard from '../features/home/components/TipsCard';
import { HomeAction, HomeStat } from '../features/home/types';

interface HomeScreenProps {
  navigation: AppNavigation;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { colors } = useAppTheme();
  const { t } = useSettings();
  const heroAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(heroAnim, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
    ]).start();
  }, [contentAnim, heroAnim]);

  const quickActions: HomeAction[] = [
    {
      id: 'map',
      title: t('home.actionMapTitle'),
      subtitle: t('home.actionMapSubtitle'),
      icon: '🗺️',
      color: colors.primary,
      onPress: () => navigation.navigate('map'),
    },
    {
      id: 'routes',
      title: t('home.actionRoutesTitle'),
      subtitle: t('home.actionRoutesSubtitle'),
      icon: '🚌',
      color: colors.secondary,
      onPress: () => navigation.navigate('routes'),
    },
    {
      id: 'driver',
      title: t('home.actionDriverTitle'),
      subtitle: t('home.actionDriverSubtitle'),
      icon: '👨‍💼',
      color: colors.accent,
      onPress: () => navigation.navigate('driver'),
    },
  ];

  const stats: HomeStat[] = [
    { label: t('home.statActiveBuses'), value: '24', color: colors.primary },
    { label: t('home.statAvailableRoutes'), value: '8', color: colors.secondary },
    { label: t('home.statAverageTime'), value: '12min', color: colors.accent },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray100 }}>
      <View
        style={{
          position: 'absolute',
          top: -120,
          right: -80,
          width: 260,
          height: 260,
          borderRadius: 130,
          backgroundColor: `${colors.accent}24`,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 100,
          left: -90,
          width: 220,
          height: 220,
          borderRadius: 110,
          backgroundColor: `${colors.secondary}18`,
        }}
      />

      <ScrollView style={{ flex: 1, paddingHorizontal: CommonStyles.spacing.md, paddingTop: 84 }}>
        <Animated.View
          style={{
            opacity: heroAnim,
            transform: [
              {
                translateY: heroAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [18, 0],
                }),
              },
            ],
            marginBottom: CommonStyles.spacing.xl,
          }}
        >
          <HomeHero
            colors={colors}
            title={t('home.heroTitle')}
            subtitle={t('home.heroSubtitle')}
            statusLabel={t('home.heroStatus')}
          />
        </Animated.View>

        <Animated.View
          style={{
            opacity: contentAnim,
            transform: [
              {
                translateY: contentAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [24, 0],
                }),
              },
            ],
          }}
        >
        <TransitStats stats={stats} colors={colors} />
        <QuickActions actions={quickActions} colors={colors} sectionTitle={t('home.nextMove')} />
        <TipsCard colors={colors} title={t('home.tipTitle')} description={t('home.tipDescription')} />

        </Animated.View>
        <View style={{ height: CommonStyles.spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}