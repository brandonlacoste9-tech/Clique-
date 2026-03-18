export const colors = {
  // The Hive & Imperial Gold
  gold: {
    DEFAULT: '#D4AF37',
    light: '#F4D03F',
    dark: '#B8860B',
    shimmer: '#FFE5A0',
    hive: '#FCD116' // Vibrant Hive Yellow
  },
  
  // Leather & Hive textures
  leather: {
    black: '#0D0D0D',
    dark: '#1A1A1A',
    brown: '#3D2817',
    tan: '#C4A77D',
    cream: '#F5F0E8'
  },
  
  // Hive Elements
  hive: {
    yellow: '#FCD116',
    border: 'rgba(252, 209, 22, 0.3)',
    glow: 'rgba(252, 209, 22, 0.5)'
  },
  
  // Functional
  background: '#070707', // Darker for high contrast yellow
  surface: '#121212',
  surfaceHighlight: '#1A1A1A',
  
  // Accents
  accent: {
    red: '#FF3B30',      
    green: '#34C759',    
    orange: '#FF9500',   
    purple: '#AF52DE',   
    blue: '#007AFF'      
  },
  
  // Text
  text: {
    primary: '#FFFFFF',
    secondary: '#A1A1A1',
    muted: '#707070'
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
  },

  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
  },

  premium: {
    shadowColor: colors.gold.DEFAULT,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 20
  }
};

// Quebecois & English expressions for UI
export const cliquePhrases = {
  // Greetings
  hello: ['Yo 🐝', 'Wesh Hive', 'Heille Sovereign', 'Salut Architect', 'Enter the Hive'],
  goodbye: ['Ciao', 'A+ Hive', 'Plus tard', 'Return to Hive'],
  
  // States
  typing: ['Écrit... / buzz...', 'Tape...', 'Compose...'],
  online: ['Actif dans la ruche / Active in the Hive', 'Connecté'],
  cool: ['C\'est d\'la bombe 🐝', 'Hive approved', 'Sovereign tier', 'Royal Jelly'],
  thanks: ['Merci ben', 'Hive gratitude', 'Good'],
  
  // Navigation / CTA
  join: ['REJOINDRE LA RUCHE', 'JOIN THE HIVE'],
  leave: ['QUITTER', 'LEAVE'],
  territory: ['LA RUCHE / THE HIVE', 'TERRITORY'],
  elite: ['LES SOUVERAINS', 'THE SOVEREIGN'],
  messages: ['INSIGHTS', 'INSIGHTS'],
  ghostMode: ['MODE DISCRET', 'DISCREET MODE'],
  
  // Loading
  loading: ['Préparation de la ruche...', 'Concentration...', 'Buzzing...', 'Loading...'],
  
  // Errors
  error: ['Oups Hive!', 'Broken link', 'Failure in the hive', 'Technical Glitch']
};
