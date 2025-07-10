import axios from 'axios';

export const API_URL = 'http://localhost:3000';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// REQUEST INTERCEPTOR
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (
            error.response &&
            error.response.status === 401 &&
            !originalRequest._isRetry
        ) {
            originalRequest._isRetry = true;
            try {
                const refreshResponse = await axios.get(
                    `${API_URL}/auth/refresh`,
                    { withCredentials: true }
                );
                localStorage.setItem('token', refreshResponse.data.accessToken);
                if (originalRequest.headers) {
                    originalRequest.headers['Authorization'] = `Bearer ${refreshResponse.data.accessToken}`;
                }
                return api.request(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('token');
                
                console.log('NOT AUTHORIZED');
            }
        }
        return Promise.reject(error);
    }
);

export default api;