import axios from 'axios';
import Log from './logService';
import getToken from './authService';

const api = axios.create({
  baseURL: 'http://4.224.186.213/evaluation-service',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err: any) {
      console.error('Error attaching token:', err.message);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    Log(
      'frontend',
      'info',
      'api-client',
      `API request succeeded: ${response.config.method?.toUpperCase()} ${response.config.url}`
    );
    return response;
  },
  (error) => {
    const errorMsg = error.response
      ? `HTTP ${error.response.status} - ${JSON.stringify(error.response.data)}`
      : error.message;
      
    Log(
      'frontend',
      'error',
      'api-client',
      `API request failed: ${error.config?.method?.toUpperCase() || ''} ${error.config?.url || 'Unknown URL'} - ${errorMsg}`
    );
    return Promise.reject(error);
  }
);

export default api;
