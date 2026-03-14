import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PublicUserRole } from '../../../context/AuthContext';
import { getTheme } from '../../../styles/colors';
import { useSettings } from '../../../context/SettingsContext';

interface RoleSelectorProps {
  colors: ReturnType<typeof getTheme>;
  role: PublicUserRole;
  onChangeRole: (role: PublicUserRole) => void;
}

export default function RoleSelector({ colors, role, onChangeRole }: RoleSelectorProps) {
  const { t } = useSettings();

  return (
    <>
      <Text style={[styles.label, { color: colors.gray700 }]}>{t('auth.accountType')}</Text>
      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            role === 'passenger' && { backgroundColor: colors.primary },
            { borderColor: colors.gray300 },
          ]}
          onPress={() => onChangeRole('passenger')}
        >
          <Text style={[styles.roleButtonText, { color: role === 'passenger' ? colors.white : colors.gray700 }]}>
            {t('auth.passengerRole')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleButton,
            role === 'driver' && { backgroundColor: colors.primary },
            { borderColor: colors.gray300 },
          ]}
          onPress={() => onChangeRole('driver')}
        >
          <Text
            style={[
              styles.roleButtonText,
              { color: role === 'driver' ? colors.white : colors.gray700 },
            ]}
          >
            {t('auth.driverRole')}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  roleButton: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
