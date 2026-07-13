export const lightTheme = {
  background: '#ffffff',
  surface: '#f9f9f9',
  surfaceAlt: '#f0f0f0',
  text: '#333333',
  textSecondary: '#888888',
  textMuted: '#999999',
  border: '#e0e0e0',
  primary: '#4CAF50',
  primaryLight: '#f0f8f0',
  secondary: '#2196F3',
  accent: '#FF9800',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#f44336',
};

export const darkTheme = {
  background: '#1a1a1a',
  surface: '#2a2a2a',
  surfaceAlt: '#333333',
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  textMuted: '#808080',
  border: '#404040',
  primary: '#66BB6A',
  primaryLight: '#1b5e20',
  secondary: '#42A5F5',
  accent: '#FFB74D',
  success: '#66BB6A',
  warning: '#FFB74D',
  error: '#ef5350',
};

export type Theme = typeof lightTheme;

export const getTheme = (isDark: boolean): Theme => (isDark ? darkTheme : lightTheme);
