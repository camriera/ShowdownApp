export const COLORS = {
  primary: '#DC143C',
  primaryDark: '#8B0000',
  
  cardFrame: '#4a4a4a',
  cardBorder: '#808080',
  cardHighlight: '#a0a0a0',
  
  background: '#1a1a1a',
  backgroundLight: '#2a2a2a',
  surface: '#333333',
  
  fieldGreen: '#1a472a',
  fieldGreenLight: '#2d5a3d',
  dirt: '#8b7355',
  
  textPrimary: '#FFFFFF',
  textSecondary: '#b0b0b0',
  textMuted: '#666666',
  textGold: '#FFD700',
  
  homeTeam: '#1e90ff',
  awayTeam: '#ff6347',
  
  success: '#228B22',
  warning: '#FFA500',
  error: '#DC143C',
  
  advantage: '#FFD700',
  batting: '#32CD32',
  pitching: '#4169E1',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  title: 28,
  display: 36,
};

export const FONT_WEIGHTS = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  card: 12,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const CARD_DIMENSIONS = {
  width: 200,
  height: 280,
  miniWidth: 80,
  miniHeight: 112,
};
