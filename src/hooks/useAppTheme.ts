import { getTheme } from '../styles/colors';
import { useSettings } from '../context/SettingsContext';

export function useAppTheme() {
  const { theme } = useSettings();
  const isDark = theme === 'dark';
  const colors = getTheme(isDark);

  return {
    colors,
    isDark,
  };
}
