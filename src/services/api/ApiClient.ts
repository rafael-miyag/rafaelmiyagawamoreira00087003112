import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { stateManager } from '../state/StateManager';

const API_BASE_URL = 'https://pet-manager-api.geia.vip';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - adiciona token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
        
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
      },
      (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - trata erros e refresh token
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`[API Response] ${response.status} ${response.config.url}`, response.data);
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        
        console.error(`[API Error] ${error.response?.status || 'Network Error'} ${originalRequest?.url}`, error.response?.data || error.message);

        // Se receber 401 e não for uma retry, tenta refresh
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/autenticacao/login') {
          if (this.isRefreshing) {
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(this.client(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.performRefreshToken();
            
            if (newToken) {
              this.refreshSubscribers.forEach((callback) => callback(newToken));
              this.refreshSubscribers = [];

              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            console.error('[API] Refresh token failed, redirecting to login');
            this.clearAuth();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    // Tenta obter do StateManager primeiro
    const token = stateManager.getToken();
    if (token) return token;
    
    // Fallback para localStorage
    try {
      const stored = localStorage.getItem('petmanager_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.token || null;
      }
    } catch (e) {
      console.error('[API] Error reading token from localStorage', e);
    }
    
    return null;
  }

  private getRefreshToken(): string | null {
    try {
      const stored = localStorage.getItem('petmanager_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.refreshToken || null;
      }
    } catch (e) {
      console.error('[API] Error reading refresh token from localStorage', e);
    }
    
    return null;
  }

  private async performRefreshToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      console.error('[API] No refresh token available');
      return null;
    }

    console.log('[API] Attempting to refresh token...');

    try {
      // Tenta diferentes formatos de refresh
      const response = await this.client.put('/autenticacao/refresh', {
        refreshToken: refreshToken,
      });

      const data = response.data;
      
      // Extrai o novo token da resposta
      const newToken = data.token || data.accessToken || data.access_token || data;
      const newRefreshToken = data.refreshToken || data.refresh_token || refreshToken;
      
      if (newToken && typeof newToken === 'string') {
        // Atualiza o StateManager
        const currentUser = stateManager.getState().user;
        stateManager.setUser({
          username: currentUser?.username || '',
          token: newToken,
          refreshToken: newRefreshToken,
        });
        
        console.log('[API] Token refreshed successfully');
        return newToken;
      }
    } catch (error) {
      console.error('[API] Refresh token request failed', error);
    }
    
    return null;
  }

  private clearAuth(): void {
    stateManager.reset();
    localStorage.removeItem('petmanager_user');
  }

  getInstance(): AxiosInstance {
    return this.client;
  }

  getBaseUrl(): string {
    return API_BASE_URL;
  }
}

const apiClientInstance = new ApiClient();
export const apiClient = apiClientInstance.getInstance();
export const API_BASE_URL_EXPORT = API_BASE_URL;
