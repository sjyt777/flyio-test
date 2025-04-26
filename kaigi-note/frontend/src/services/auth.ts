import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { User, UserCredentials, UserRegistration, Token, ApiError } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const TOKEN_KEY = 'kaigi_note_token';

// Register a new user
export const register = async (userData: UserRegistration): Promise<User> => {
  try {
    const response = await axios.post<User>(`${API_URL}/api/auth/register`, userData);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiError>;
    throw axiosError.response?.data || { detail: 'Registration failed' };
  }
};

// Login a user
export const login = async (credentials: UserCredentials): Promise<Token> => {
  try {
    // Convert credentials to form data for FastAPI OAuth2 compatibility
    const formData = new FormData();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const response = await axios.post<Token>(`${API_URL}/api/auth/login`, formData);
    
    // Save token to localStorage
    if (response.data.access_token) {
      localStorage.setItem(TOKEN_KEY, response.data.access_token);
    }
    
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiError>;
    throw axiosError.response?.data || { detail: 'Login failed' };
  }
};

// Logout a user
export const logout = async (): Promise<void> => {
  try {
    await axios.post(`${API_URL}/api/auth/logout`);
    removeToken();
  } catch (error) {
    console.error('Logout error:', error);
    // Still remove token even if API call fails
    removeToken();
  }
};

// Get current user info
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const token = getToken();
    if (!token) return null;

    const response = await axios.get<User>(`${API_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data;
  } catch (error) {
    console.error('Get current user error:', error);
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401) {
      // Token expired or invalid
      removeToken();
    }
    return null;
  }
};

// Get token from localStorage
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Remove token from localStorage
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// Create axios instance with auth header
export const authAxios = axios.create({
  baseURL: API_URL
});

// Add auth header to requests
authAxios.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Handle 401 responses
authAxios.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      removeToken();
      // Redirect to login page or refresh the page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
