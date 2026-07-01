/**
 * Shared API base URL configuration.
 * Uses VITE_API_URL from .env if available,
 * otherwise dynamically infers the backend URL from the current hostname.
 */
const API_BASE = import.meta.env.VITE_API_URL;

export const API_URLS = {
  auth: {
    login: `${API_BASE}/auth/login`,
    me: `${API_BASE}/auth/me`,
    sendOtp: `${API_BASE}/auth/send-otp`,
    verifyOtp: `${API_BASE}/auth/verify-otp`,
    resetPassword: `${API_BASE}/auth/reset-password`,
  },
  memories: `${API_BASE}/memories`,
  feedback: `${API_BASE}/feedback`,
  feedbackStats: `${API_BASE}/feedback/stats`,
  health: `${API_BASE}/health`,
};

export default API_BASE;
