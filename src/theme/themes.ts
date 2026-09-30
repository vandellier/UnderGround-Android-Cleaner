import { ThemeConfig, ThemeId } from '../types/cleaner';

export const THEMES: Record<ThemeId, ThemeConfig> = {
  matrix: {
    id: 'matrix',
    name: 'Matrix (Default)',
    accent: '#00FF41',
    accentGlow: 'rgba(0, 255, 65, 0.25)',
    bg: '#000000',
    surface: '#080e08',
    surfaceElevated: '#0f180f',
    border: '#00FF41',
    borderStrong: '#00FF41',
    textMuted: '#66aa77',
    textPrimary: '#d4ffd9',
    terminalPrompt: 'matrix@underground:~#',
  },
  pink: {
    id: 'pink',
    name: 'Cyber Pink / Black',
    accent: '#FF2D95',
    accentGlow: 'rgba(255, 45, 149, 0.25)',
    bg: '#0A0A0A',
    surface: '#140c11',
    surfaceElevated: '#1f101a',
    border: '#FF2D95',
    borderStrong: '#FF2D95',
    textMuted: '#b86d94',
    textPrimary: '#ffe3f1',
    terminalPrompt: 'neon@underground:~#',
  },
  red: {
    id: 'red',
    name: 'Crimson / Black',
    accent: '#FF1A1A',
    accentGlow: 'rgba(255, 26, 26, 0.25)',
    bg: '#0A0A0A',
    surface: '#150909',
    surfaceElevated: '#200e0e',
    border: '#FF1A1A',
    borderStrong: '#FF1A1A',
    textMuted: '#b86b6b',
    textPrimary: '#ffe3e3',
    terminalPrompt: 'root@underground:~#',
  },
  orange: {
    id: 'orange',
    name: 'Amber / Black',
    accent: '#FF7A00',
    accentGlow: 'rgba(255, 122, 0, 0.25)',
    bg: '#0A0A0A',
    surface: '#150e07',
    surfaceElevated: '#20160b',
    border: '#FF7A00',
    borderStrong: '#FF7A00',
    textMuted: '#b8895b',
    textPrimary: '#ffeacc',
    terminalPrompt: 'amber@underground:~#',
  },
};

export const formatBytes = (bytes: number, decimals = 1): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};
