import { DefaultTheme, DarkTheme, Theme } from '@react-navigation/native';
import { ThemeMode } from '../store/themeStore';

export const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#faf8ff',
    card: '#ffffff',
    border: '#dae2fd',
    primary: '#005c55',
    text: '#131b2e',
  },
};

export const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0E1420',
    card: '#1A1F2E',
    border: '#2A3040',
    primary: '#0f766e',
    text: '#E8EAF0',
  },
};

export function getTheme(mode: ThemeMode): Theme {
  return mode === 'dark' ? DARK_THEME : LIGHT_THEME;
}
