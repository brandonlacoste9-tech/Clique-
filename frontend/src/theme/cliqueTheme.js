// Clique Theme - Imperial Gold & Leather
// Louis Vuitton meets Roots Canada: Luxury with Canadian heritage

export const colors = {
  // Imperial Gold - LV Hardware
  gold: {
    DEFAULT: '#C5A059',      // Rich gold (not too bright)
    light: '#E8D58C',         // Highlight
    dark: '#9A7A3D',          // Shadow
    shimmer: '#F2E6B8',       // Gloss
    metallic: '#D4AF37',      // Metallic gold
  },

  // Leather - Premium Canadian Leather
  leather: {
    black: '#0F0F0F',         // Obsidian black
    dark: '#1A1612',          // Dark leather
    brown: '#5C4033',         // Saddle leather
    tan: '#C4A484',           // Natural tan
    cream: '#F5E6D3',         // Cream leather
    texture: 'leather-texture', // Texture overlay
  },

  // Canadian Elements
  canadian: {
    maple: '#D62828',         // Maple leaf red
    white: '#FFFFFF',         // Maple leaf white
    navy: '#00205B',          // Canadian navy
    gold: '#FFD700',          // Canadian gold
  },

  // Functional
  background: '#0A0A0A',
  surface: '#141210',         // Dark leather surface
  surfaceHighlight: '#1E1A16',
  card: '#1A1612',

  // Accents
  accent: {
    red: '#D62828',           // Maple red
    green: '#008000',         // Canadian forest
    orange: '#FF8C00',        // Streaks
    purple: '#6B46C1',        // Premium features
    blue: '#007AFF',          // Links
  },

  // Text
  text: {
    primary: '#FFFFFF',
    secondary: '#A0A0A0',
    muted: '#707070',
    gold: '#C5A059',
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
