import axios from "axios";
import { useAuthStore } from "../store/auth.store";

export const base_url =
  "https://80402f698a5a.ngrok-free.app" ||
  process.env.BASE_URL ||
  "http://localhost:5000";

const headers = {
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "true",
};
export const axiosInstance = axios.create({
  baseURL: base_url,
  headers,
});

export const authAxios = axios.create({
  baseURL: base_url,
  headers,
});

authAxios.interceptors.request.use(
  (config) => {
    // Try to get token from Zustand store first
    const { token } = useAuthStore.getState();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

authAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Helper functions for token management
export const setAuthToken = (token) => {
  useAuthStore.getState().setAuth(token, useAuthStore.getState().user);
};

export const removeAuthToken = () => {
  useAuthStore.getState().clearAuth();
};
