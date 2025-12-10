import axios from 'axios';

export const API_URL = 'https://8ec47177-4071-40f8-9c7a-f64803516488-00-2z7o4xrlajvin.janeway.replit.dev';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;
