import { BehaviorSubject } from 'rxjs';
import { User, AuthState } from '@/types';
import { authApi } from '../api/endpoints';

const STORAGE_KEY = 'petmanager_user';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

class AuthFacade {
  private state$ = new BehaviorSubject<AuthState>(initialState);

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const user: User = JSON.parse(stored);
        if (user && user.token) {
          this.state$.next({
            user,
            isAuthenticated: true,
            loading: false,
            error: null,
          });
          console.log('[AuthFacade] User loaded from storage:', user.username);
        }
      }
    } catch (error) {
      console.error('[AuthFacade] Error loading from storage:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  private saveToStorage(user: User): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      console.log('[AuthFacade] User saved to storage');
    } catch (error) {
      console.error('[AuthFacade] Error saving to storage:', error);
    }
  }

  getState$() {
    return this.state$.asObservable();
  }

  getState(): AuthState {
    return this.state$.getValue();
  }

  isAuthenticated(): boolean {
    return this.state$.getValue().isAuthenticated;
  }

  getToken(): string | null {
    return this.state$.getValue().user?.token || null;
  }

  getRefreshToken(): string | null {
    return this.state$.getValue().user?.refreshToken || null;
  }

  async login(username: string, password: string): Promise<boolean> {
    this.state$.next({
      ...this.state$.getValue(),
      loading: true,
      error: null,
    });

    try {
      console.log('[AuthFacade] Attempting login for:', username);
      
      const { token, refreshToken } = await authApi.login(username, password);

      console.log('[AuthFacade] Login successful, token received');

      const user: User = {
        username,
        token,
        refreshToken,
      };

      this.saveToStorage(user);

      this.state$.next({
        user,
        isAuthenticated: true,
        loading: false,
        error: null,
      });

      return true;
    } catch (error: unknown) {
      console.error('[AuthFacade] Login error:', error);
      
      let errorMessage = 'Erro ao fazer login';

      if (error && typeof error === 'object') {
        const axiosError = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
        
        if (axiosError.response) {
          const status = axiosError.response.status;
          const data = axiosError.response.data;
          
          if (status === 401 || status === 403) {
            errorMessage = 'Usuário ou senha inválidos';
          } else if (status === 400) {
            errorMessage = data?.message || 'Dados inválidos';
          } else if (status && status >= 500) {
            errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
          } else {
            errorMessage = data?.message || 'Erro ao fazer login';
          }
        } else if (axiosError.message?.includes('Network Error')) {
          errorMessage = 'Não foi possível conectar ao servidor';
        }
      }

      this.state$.next({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: errorMessage,
      });

      return false;
    }
  }

  async refreshToken(): Promise<boolean> {
    const currentRefreshToken = this.getRefreshToken();
    
    if (!currentRefreshToken) {
      console.log('[AuthFacade] No refresh token available');
      return false;
    }

    try {
      console.log('[AuthFacade] Refreshing token...');
      
      const { token, refreshToken } = await authApi.refresh(currentRefreshToken);
      
      const currentUser = this.state$.getValue().user;
      
      const user: User = {
        username: currentUser?.username || '',
        token,
        refreshToken: refreshToken || currentRefreshToken,
      };

      this.saveToStorage(user);

      this.state$.next({
        ...this.state$.getValue(),
        user,
      });

      console.log('[AuthFacade] Token refreshed successfully');
      return true;
    } catch (error) {
      console.error('[AuthFacade] Refresh token error:', error);
      this.logout();
      return false;
    }
  }

  logout(): void {
    console.log('[AuthFacade] Logging out');
    localStorage.removeItem(STORAGE_KEY);
    this.state$.next(initialState);
  }

  clearError(): void {
    this.state$.next({
      ...this.state$.getValue(),
      error: null,
    });
  }
}

export const authFacade = new AuthFacade();
