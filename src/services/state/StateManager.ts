import { BehaviorSubject } from 'rxjs';

interface UserState {
  username: string;
  token: string;
  refreshToken?: string;
}

interface AppState {
  user: UserState | null;
  isAuthenticated: boolean;
}

const STORAGE_KEY = 'petmanager_user';

const loadInitialState = (): AppState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const user = JSON.parse(stored) as UserState;
      if (user && user.token) {
        return {
          user,
          isAuthenticated: true,
        };
      }
    }
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
    localStorage.removeItem(STORAGE_KEY);
  }
  return {
    user: null,
    isAuthenticated: false,
  };
};

class StateManager {
  private static instance: StateManager;
  private state$ = new BehaviorSubject<AppState>(loadInitialState());

  private constructor() {}

  static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  getState(): AppState {
    return this.state$.getValue();
  }

  getState$() {
    return this.state$.asObservable();
  }

  getToken(): string | null {
    const state = this.state$.getValue();
    
    // Primeiro tenta pegar do estado
    if (state.user?.token) {
      return state.user.token;
    }
    
    // Fallback para localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const user = JSON.parse(stored) as UserState;
        if (user?.token) {
          // Atualiza o estado com os dados do localStorage
          this.state$.next({
            user,
            isAuthenticated: true,
          });
          return user.token;
        }
      }
    } catch (error) {
      console.error('Error reading token from localStorage:', error);
    }
    
    return null;
  }

  getRefreshToken(): string | null {
    const state = this.state$.getValue();
    
    if (state.user?.refreshToken) {
      return state.user.refreshToken;
    }
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const user = JSON.parse(stored) as UserState;
        return user?.refreshToken || null;
      }
    } catch (error) {
      console.error('Error reading refresh token from localStorage:', error);
    }
    
    return null;
  }

  setUser(user: UserState): void {
    console.log('StateManager: Setting user', { username: user.username, hasToken: !!user.token });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    
    this.state$.next({
      user,
      isAuthenticated: true,
    });
  }

  updateToken(token: string, refreshToken?: string): void {
    const currentState = this.state$.getValue();
    
    if (currentState.user) {
      const updatedUser: UserState = {
        ...currentState.user,
        token,
        refreshToken: refreshToken || currentState.user.refreshToken,
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      
      this.state$.next({
        user: updatedUser,
        isAuthenticated: true,
      });
    }
  }

  reset(): void {
    console.log('StateManager: Resetting state');
    localStorage.removeItem(STORAGE_KEY);
    
    this.state$.next({
      user: null,
      isAuthenticated: false,
    });
  }

  isAuthenticated(): boolean {
    return this.state$.getValue().isAuthenticated;
  }
}

export const stateManager = StateManager.getInstance();
