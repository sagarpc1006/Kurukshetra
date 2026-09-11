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
      const currentUser = auth.currentUser;
      if (currentUser && typeof currentUser.getIdToken === 'function') {
        const token = await currentUser.getIdToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error('Error fetching Firebase ID token for request:', error);
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
