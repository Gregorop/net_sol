import axios, { AxiosInstance, AxiosError } from 'axios';
import { ErrorResponse } from '../types/index';

const API_BASE_URL = 'http://localhost:8000';


class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });


    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ErrorResponse>) => {
        const errorData = error.response?.data;
        const message = errorData?.detail || errorData?.message || error.message || 'Unknown error';
        return Promise.reject(new Error(typeof message === 'string' ? message : JSON.stringify(message)));
      }
    );
  }

  setAuth(username: string, password: string) {
    this.token = btoa(`${username}:${password}`);
    this.client.defaults.headers.common['Authorization'] = `Basic ${this.token}`;
  }

  clearAuth() {
    this.token = null;
    delete this.client.defaults.headers.common['Authorization'];
  }

  getClient() {
    return this.client;
  }
}

export const apiClient = new ApiClient();