import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

export const API_URL = 'https://8ec47177-4071-40f8-9c7a-f64803516488-00-2z7o4xrlajvin.janeway.replit.dev';

const COOKIE_KEY = 'snapnow_session_cookie';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add cookie to every request
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const cookie = await SecureStore.getItemAsync(COOKIE_KEY);
      if (cookie && config.headers) {
        config.headers.Cookie = cookie;
      }
    } catch (error) {
      console.log('Error reading cookie:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to capture and store session cookie
api.interceptors.response.use(
  async (response) => {
    try {
      const setCookie = response.headers['set-cookie'];
      if (setCookie && setCookie.length > 0) {
        // Extract the connect.sid cookie
        const sessionCookie = setCookie.find((c: string) => c.includes('connect.sid'));
        if (sessionCookie) {
          // Store just the cookie value (e.g., connect.sid=xxx)
          const cookiePart = sessionCookie.split(';')[0];
          await SecureStore.setItemAsync(COOKIE_KEY, cookiePart);
        }
      }
    } catch (error) {
      console.log('Error saving cookie:', error);
    }
    return response;
  },
  async (error: AxiosError) => {
    const status = error.response?.status;
    const config = error.config;
    
    // Handle server temporarily unavailable
    if ((status === 502 || status === 503 || status === 504) && config && !(config as any)._retry) {
      (config as any)._retry = true;
      console.log(`Server temporarily unavailable (${status}), retrying in 2s...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return api(config);
    }
    
    // Handle 401 unauthorized - clear cookie
    if (status === 401) {
      await SecureStore.deleteItemAsync(COOKIE_KEY);
    }
    
    if (error.response?.data) {
      console.log('API Error:', status, JSON.stringify(error.response.data).substring(0, 200));
    } else if (error.message) {
      console.log('API Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Helper to clear cookie on logout
export const clearSessionCookie = async () => {
  await SecureStore.deleteItemAsync(COOKIE_KEY);
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
  }
  
  throw new Error(`Unsupported method: ${method}`);
}

export default api;
