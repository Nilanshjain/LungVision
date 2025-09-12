

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  // Base colors
  background: '#000000' as const,
  surface: '#1A1A1A' as const,
  card: '#141414',
  
  // Text colors
  text: {
    primary: '#FFFFFF' as const,
    secondary: '#A0A0A0' as const,
    muted: '#666666' as const,
  },
  
  // Accent colors (from the Ghost Hand Kit)
  accent: {
    blue: '#0066CC' as const,    // Cyan neon
    purple: '#B14EFF' as const,  // Purple neon
    pink: '#FF1F71' as const,    // Pink neon
    green: '#00FF94' as const,   // Green neon
    orange: '#FF8A00' as const,  // Orange neon
  },
  
  // Border colors
  border: {
    default: '#333333' as const,
    active: '#00E5FF' as const,  // Using the cyan neon as active state
  },
  
  // Status colors
  status: {
    success: '#00FF94' as const,  // Green neon
    warning: '#FF8A00' as const,  // Orange neon
    error: '#FF3B30' as const,    // Pink neon
    info: '#00E5FF' as const,     // Cyan neon
  },
  
  // Gradient colors
  gradient: {
    start: '#000000',
    middle: '#0A0A0A',
    end: '#141414',
  },
  
  // Overlay colors
  overlay: {
    light: 'rgba(255, 255, 255, 0.1)',
    dark: 'rgba(0, 0, 0, 0.7)',
  }
} as const;

// Add type definitions
export type ColorScheme = typeof Colors;
export type ColorValue = typeof Colors.text.primary;
