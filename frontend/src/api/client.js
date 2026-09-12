import axios from 'axios';
import { auth } from '../firebase/config';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Firebase ID token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      if (auth && typeof auth.authStateReady === 'function') {
        await Promise.race([
          auth.authStateReady(),
          new Promise((res) => setTimeout(res, 500)),
        ]);
      }
      const currentUser = auth?.currentUser;
      if (currentUser && typeof currentUser.getIdToken === 'function') {
        const token = await currentUser.getIdToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          return config;
        }
      }
      const saved = localStorage.getItem('ecotrail_session');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const uid = parsed?.user?.uid;
          const email = parsed?.user?.email || '';
          const name = parsed?.user?.displayName || parsed?.profile?.name || '';
          if (uid) {
            config.headers.Authorization = `Bearer mock_token_${uid}:${email}:${name}`;
            return config;
          }
        } catch (e) {}
      }

      config.headers = config.headers || {};
      if (!config.headers.Authorization) {
        config.headers.Authorization = 'Bearer mock_token_guest_traveler:guest@ecotrail.test:Guest Traveler';
      }
    } catch (error) {
      console.error('Error fetching Firebase ID token for request:', error);
      config.headers = config.headers || {};
      if (!config.headers.Authorization) {
        config.headers.Authorization = 'Bearer mock_token_guest_traveler:guest@ecotrail.test:Guest Traveler';
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const syncFirebaseAuth = async (idToken) => {
  const response = await apiClient.post('/api/auth/firebase/', { id_token: idToken });
  return response.data;
};

export const fetchCurrentUserProfile = async () => {
  const response = await apiClient.get('/api/auth/me/');
  return response.data;
};

export default apiClient;
