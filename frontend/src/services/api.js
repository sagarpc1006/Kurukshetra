import axios from 'axios';
import { auth } from '../firebase/config';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Interceptor to attach Firebase ID token to all outbound requests
api.interceptors.request.use(
  async (config) => {
    try {
      if (auth && typeof auth.authStateReady === 'function') {
        await auth.authStateReady();
      }
      const currentUser = auth?.currentUser;
      if (currentUser && typeof currentUser.getIdToken === 'function') {
        const token = await currentUser.getIdToken();
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
          return config;
        }
      }
      // Fallback: check localStorage for saved dev session
      const saved = localStorage.getItem('ecotrail_session');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const uid = parsed?.user?.uid;
          if (uid) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer mock_token_${uid}`;
          }
        } catch (e) {}
      }
    } catch (error) {
      console.error('Error attaching Firebase ID token for API request:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
