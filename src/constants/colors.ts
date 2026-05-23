export const colors = {
  // Main palette (soft muted purple + light neutrals)
  primary: '#9578C8',        // Soft muted purple — buttons, CTAs, key highlights
  primaryLight: '#B8A0E0',   // Lighter muted purple
  secondary: '#7E5FA8',      // Deeper muted purple — headers, section titles
  accent: '#D4C4EC',         // Very soft lavender — badges, verified, decorative

  // Gradients
  gradientStart: '#9578C8',
  gradientEnd: '#7E5FA8',

  // Backgrounds
  background: '#FAFAFE',     // Very light cool white — fresh, airy
  surface: 'rgba(255,255,255,0.78)',  // Glass white — semi-transparent for frosted effect

  // Text
  text: '#2D2640',           // Warm dark purple-black
  textSecondary: '#6E6590',  // Muted purple-gray
  textMuted: '#A098B8',      // Light purple-gray

  // Borders (glass-friendly)
  border: 'rgba(255,255,255,0.35)',
  borderLight: 'rgba(255,255,255,0.6)',

  // Semantic
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  alert: '#DC2626',
  verified: '#9578C8',       // Soft purple verified badge

  // Effects
  overlay: 'rgba(45, 38, 64, 0.3)',
  cardShadow: 'rgba(149, 120, 200, 0.08)',  // Soft purple-tinted shadow
};

export const darkColors: typeof colors = {
  // Main palette (brighter purple on dark bg for contrast)
  primary: '#B8A0E0',
  primaryLight: '#D4C4EC',
  secondary: '#9578C8',
  accent: '#6E6590',

  // Gradients
  gradientStart: '#B8A0E0',
  gradientEnd: '#9578C8',

  // Backgrounds — translucent black, not too dark
  background: 'rgba(20, 16, 30, 0.85)',
  surface: 'rgba(40, 34, 56, 0.7)',

  // Text — lighter on dark
  text: '#E8E4F0',
  textSecondary: '#B8B0CC',
  textMuted: '#8A80A0',

  // Borders
  border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.12)',

  // Semantic
  error: '#F87171',
  success: '#34D399',
  warning: '#FBBF24',
  alert: '#F87171',
  verified: '#B8A0E0',

  // Effects
  overlay: 'rgba(0, 0, 0, 0.5)',
  cardShadow: 'rgba(0, 0, 0, 0.3)',
};
