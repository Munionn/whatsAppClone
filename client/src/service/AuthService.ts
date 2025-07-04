import api from "./api";
import type { AuthResponse } from "../models/AuthResponse";
import { parseHtmlError } from "../utils/error.utils";

// Define a custom error type
export type AuthError = {
    message: string;
};

export default class AuthService {
    static async login(phone: string, name: string, password: string): Promise<AuthResponse> {
        try {
            const response = await api.post<AuthResponse>('/auth/login', { phone, name, password });
            return response.data;
        } catch (error: any) {
            if (error.response) {
                const { status, data } = error.response;

                // If server returned HTML error page
                if (status >= 500 && typeof data === 'string' && data.includes('<pre')) {
                    const errorMessage = parseHtmlError(data);
                    throw new Error(errorMessage); // e.g., "Invalid password"
                }

                // For other server-side errors
                throw new Error(`Server responded with ${status}`);
            } else if (error.request) {
                throw new Error('No response received from server');
            } else {
                throw new Error(error.message || 'An unexpected error occurred');
            }
        }
    }

    static async register(phone: string, name: string, password: string): Promise<AuthResponse> {
        try {
            const response = await api.post<AuthResponse>('/auth/register', { phone, name, password });
            return response.data;
        } catch (error: any) {
            if (error.response?.data) {
                const { data } = error.response;

                if (typeof data === 'string' && data.includes('<pre')) {
                    const errorMessage = parseHtmlError(data);
                    throw new Error(errorMessage);
                }

                if (data.message) {
                    throw new Error(data.message);
                }
            }

            if (error.request) {
                throw new Error('No response received from server');
            }

            throw new Error(error.message || 'Registration failed');
        }
    }

    static async logout(): Promise<void> {
        try {
            await api.post('/auth/logout');
        } catch (error: any) {
            console.error('Logout error:', error);
            throw new Error('Failed to log out');
        }
    }
}