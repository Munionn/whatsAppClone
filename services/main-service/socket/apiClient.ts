import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:3002', // your backend URL
    timeout: 5000,
    headers: {
        "Content-Type": "application/json",
    },
});

export default apiClient



