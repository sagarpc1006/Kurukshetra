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
        // Fast timeout so requests never hang if Firebase is offline or slow
        await Promise.race([
          auth.authStateReady(),
          new Promise((res) => setTimeout(res, 500)),
        ]);
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
          const email = parsed?.user?.email || '';
          const name = parsed?.user?.displayName || parsed?.profile?.name || '';
          if (uid) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer mock_token_${uid}:${email}:${name}`;
            return config;
          }
        } catch (e) {}
      }

      // Guest / Dev fallback: ensure outbound request to protected Django endpoints has a valid auth token
      config.headers = config.headers || {};
      if (!config.headers.Authorization) {
        config.headers.Authorization = 'Bearer mock_token_guest_traveler:guest@ecotrail.test:Guest Traveler';
      }
    } catch (error) {
      console.error('Error attaching Firebase ID token for API request:', error);
      config.headers = config.headers || {};
      if (!config.headers.Authorization) {
        config.headers.Authorization = 'Bearer mock_token_guest_traveler:guest@ecotrail.test:Guest Traveler';
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

