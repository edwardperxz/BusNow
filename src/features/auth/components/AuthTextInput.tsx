import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { getTheme } from '../../../styles/colors';

interface AuthTextInputProps extends TextInputProps {
  colors: ReturnType<typeof getTheme>;
}

export default function AuthTextInput({ colors, style, ...props }: AuthTextInputProps) {
  return (
    <TextInput
      {...props}
      style={[
        styles.input,
        {
          backgroundColor: colors.gray100,
          borderColor: colors.gray300,
          color: colors.gray900,
        },
        style,
      ]}
      placeholderTextColor={colors.gray500}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 16,
  },
});
