export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  xxxl: 32,
  title: 38,
} as const;

export const shadow = {
  card: {
    shadowColor: '#9578C8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  elevated: {
    shadowColor: '#9578C8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 6,
  },
  button: {
    shadowColor: '#9578C8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;
