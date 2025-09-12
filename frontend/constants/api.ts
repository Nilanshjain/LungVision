// Export API URL constant
// Prefer EXPO_PUBLIC_API_URL so mobile devices can reach your backend over LAN.
// Fallback to localhost for development
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

// Any other API related constants can go here
export const API_ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  PREDICT: '/predict',
  HISTORY: '/history',
  STATS: '/stats',
}; 