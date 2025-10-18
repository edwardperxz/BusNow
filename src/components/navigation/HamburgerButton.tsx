import React from 'react';
import { View, TouchableOpacity, Text, Platform } from 'react-native';
import { BusNowColors, CommonStyles } from '../../styles/colors';

interface HamburgerButtonProps {
  onPress: () => void;
  isOpen: boolean;
}

const HamburgerButton: React.FC<HamburgerButtonProps> = ({ onPress, isOpen }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 50,
        left: 20,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: BusNowColors.white,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 12,
      }}
    >
      <View style={{
        width: 22,
        height: 16,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Líneas del hamburger */}
        <View style={{
          width: 22,
          height: 3,
          backgroundColor: BusNowColors.primary,
          borderRadius: 1.5,
        }} />
        <View style={{
          width: 22,
          height: 3,
          backgroundColor: BusNowColors.primary,
          borderRadius: 1.5,
        }} />
        <View style={{
          width: 22,
          height: 3,
          backgroundColor: BusNowColors.primary,
          borderRadius: 1.5,
        }} />
      </View>
    </TouchableOpacity>
  );
};

export default HamburgerButton;