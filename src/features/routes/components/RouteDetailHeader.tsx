import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BusNowColors, CommonStyles, getTheme } from '../../../styles/colors';

interface RouteDetailHeaderProps {
  colors: ReturnType<typeof getTheme>;
  title: string;
  onBack?: () => void;
}

export default function RouteDetailHeader({ colors, title, onBack }: RouteDetailHeaderProps) {
  return (
    <View style={[styles.header, { backgroundColor: colors.white, borderBottomColor: colors.gray200 }]}> 
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={[styles.backButtonText, { color: colors.gray800 }]}>←</Text>
      </TouchableOpacity>
      <View style={styles.routeHeader}>
        <Text style={[styles.routeTitle, { color: colors.gray800 }]}>{title}</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Text style={[styles.moreButtonText, { color: colors.gray600 }]}>⋮</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: CommonStyles.spacing.md,
    paddingVertical: CommonStyles.spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BusNowColors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: CommonStyles.spacing.sm,
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeTitle: {
    ...CommonStyles.typography.h2,
    flex: 1,
  },
  moreButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
});
