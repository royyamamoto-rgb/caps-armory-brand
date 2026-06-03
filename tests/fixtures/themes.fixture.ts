/**
 * themes.fixture.ts — TS source fixtures matching the real shape of
 * caps-armory-app/constants/themes.ts at the pinned blob SHA.
 */

export const VALID_THEMES_TS = `
export interface ThemeColors {
  background: string;
  gold: string;
}

export const DarkColors: ThemeColors = {
  background: '#0A0A0A',
  surface: '#141414',
  surfaceElevated: '#1E1E1E',
  border: '#2A2A2A',
  gold: '#C8A96E',
  goldLight: '#D4BC8A',
  olive: '#7A8B5C',
  oliveLight: '#96A878',
  oliveMuted: '#5C6B42',
  white: '#FFFFFF',
  black: '#000000',
  darkGrey: '#333333',
  textPrimary: '#F0EDE6',
  textSecondary: '#ADA89C',
  textMuted: '#A8A29E',
  success: '#7A8B5C',
  warning: '#D4A44E',
  danger: '#D65B4F',
  info: '#6B8DA8',
  cancelled: '#7A7A7A',
};

export const LightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F5F3EF',
  surfaceElevated: '#FFFFFF',
  border: '#E0DDD6',
  gold: '#9E8451',
  goldLight: '#B8A070',
  olive: '#5C7A3C',
  oliveLight: '#7A9A5C',
  oliveMuted: '#4A6630',
  white: '#FFFFFF',
  black: '#000000',
  darkGrey: '#333333',
  textPrimary: '#1A1A1A',
  textSecondary: '#5A5650',
  textMuted: '#8A8580',
  success: '#5C7A3C',
  warning: '#B8872E',
  danger: '#C44030',
  info: '#4A7A9A',
  cancelled: '#7A7A7A',
};
`;

export const SPREAD_THEMES_TS = `
const base = { background: '#000000' };
export const DarkColors = { ...base, gold: '#D4A24C' };
export const LightColors = {};
`;
