import axios from "axios";

const API_URL = 'http://localhost:3000';

const api  = axios.create({
  baseURL: API_URL,
  headers:{
    'Content-Type': 'application/json',
  },
  withCredentials: true
})

api.interceptors.request.use(
  (config) => {
    // Example: Attach token from localStorage
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Example: Handle 401 errors globally
    if (error.response && error.response.status === 401) {
      // Redirect to login or refresh token
    }
    return Promise.reject(error);
  }
);

export default api; 