import axios, { AxiosError } from 'axios';

export const API_URL = 'https://8ec47177-4071-40f8-9c7a-f64803516488-00-2z7o4xrlajvin.janeway.replit.dev';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const config = error.config;
    
    if ((status === 502 || status === 503 || status === 504) && config && !(config as any)._retry) {
      (config as any)._retry = true;
      console.log(`Server temporarily unavailable (${status}), retrying in 2s...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return api(config);
    }
    
    if (error.response?.data) {
      console.log('API Error:', status, JSON.stringify(error.response.data).substring(0, 200));
    } else if (error.message) {
      console.log('API Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
