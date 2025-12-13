import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

export const API_URL = 'https://8ec47177-4071-40f8-9c7a-f64803516488-00-2z7o4xrlajvin.janeway.replit.dev';

const SESSION_TOKEN_KEY = 'snapnow_session_token';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add session token to every request
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const sessionToken = await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
      if (sessionToken && config.headers) {
        config.headers['X-Session-Token'] = sessionToken;
      }
    } catch (error) {
      console.log('Error reading session token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper to save session token from login response
export const saveSessionToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
  } catch (error) {
    console.log('Error saving session token:', error);
  }
};

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const config = error.config;
    const retryCount = (config as any)?._retryCount || 0;
    
    // Handle network errors (server sleeping or unreachable)
    if (!error.response && config && retryCount < 3) {
      (config as any)._retryCount = retryCount + 1;
      console.log(`Network error, retrying (${retryCount + 1}/3) in 2s...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return api(config);
    }
    
    // Handle server temporarily unavailable
    if ((status === 502 || status === 503 || status === 504) && config && retryCount < 3) {
      (config as any)._retryCount = retryCount + 1;
      console.log(`Server temporarily unavailable (${status}), retrying in 2s...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return api(config);
    }
    
    // Handle 401 unauthorized - clear session token
    if (status === 401) {
      await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
    }
    
    if (error.response?.data) {
      console.log('API Error:', status, JSON.stringify(error.response.data).substring(0, 200));
    } else if (error.message) {
      console.log('API Error:', error.message);
    }
    
    // Provide user-friendly error message for network issues
    if (!error.response) {
      error.message = 'Could not connect to the server. Please check your internet connection and try again.';
    }
    
    return Promise.reject(error);
  }
);

// Helper to clear session token on logout
export const clearSessionToken = async () => {
  await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
};

// Generic API client function for direct calls
export async function apiClient<T>(
  endpoint: string,
  options?: { method?: string; body?: any }
): Promise<T> {
  const method = options?.method || 'GET';
  const url = endpoint.startsWith('http') ? endpoint : endpoint;
  
  if (method === 'GET') {
    const response = await api.get<T>(url);
    return response.data;
  } else if (method === 'POST') {
    const response = await api.post<T>(url, options?.body);
    return response.data;
  } else if (method === 'PUT') {
    const response = await api.put<T>(url, options?.body);
    return response.data;
  } else if (method === 'DELETE') {
    const response = await api.delete<T>(url);
    return response.data;
  } else if (method === 'PATCH') {
    const response = await api.patch<T>(url, options?.body);
    return response.data;
  }
  
  throw new Error(`Unsupported method: ${method}`);
}

export default api;
