// Clique Theme - Imperial Gold & Leather
// 15-25 year old aesthetic: raw, premium, Quebecois

export const colors = {
  // Imperial Gold palette
  gold: {
    DEFAULT: '#D4AF37',
    light: '#F4D03F',
    dark: '#B8860B',
    shimmer: '#FFE5A0'
  },
  
  // Leather textures
  leather: {
    black: '#0D0D0D',
    dark: '#1A1A1A',
    brown: '#3D2817',
    tan: '#C4A77D',
    cream: '#F5F0E8'
  },
  
  // Functional
  background: '#0A0A0A',
  surface: '#141414',
  surfaceHighlight: '#1E1E1E',
  
  // Accents
  accent: {
    red: '#FF3B30',      // notifications, alerts
    green: '#34C759',    // online, success
    orange: '#FF9500',   // streaks, warnings
    purple: '#AF52DE',   // premium features
    blue: '#007AFF'      // links, actions
  },
  
  // Text
  text: {
    primary: '#FFFFFF',
    secondary: '#8E8E93',
    muted: '#636366'
  }
};

export const typography = {
  // Raw, bold, no corporate fonts
  fontFamily: {
    display: 'System',  // Use bold system font
    body: 'System',
    mono: 'Courier'     // For codes, timestamps
  },
  
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 48
  }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999
};

export const shadows = {
  gold: {
    shadowColor: colors.gold.DEFAULT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10
  },
  
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  }
};

// Quebecois expressions for UI
export const cliquePhrases = {
  // Greetings
  hello: ['Yo', 'Wesh', 'Heille', 'Salut'],
  goodbye: ['Ciao', 'A+', 'Plus tard'],
  
  // Reactions
  cool: ['C\'est tiguidou', 'C\'est malade', 'L\'fun', 'C\'est d\'la bombe'],
  thanks: ['Merci ben', 'C\'est ça', 'Good'],
  
  // Loading
  loading: ['Un instant...', 'Ça charge...', 'Attends un peu...'],
  
  // Errors
  error: ['Oups!', 'C\'est cassé', 'Ça marche pas', 'Problème technique']
};
