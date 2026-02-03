import { BehaviorSubject, Observable } from 'rxjs';

class ConnectivityService {
  private isOnline$ = new BehaviorSubject<boolean>(navigator.onLine);
  private apiAvailable$ = new BehaviorSubject<boolean>(true);
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Escuta eventos de conectividade do navegador
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    
    // Inicia verificação periódica da API
    this.startApiCheck();
  }

  private handleOnline(): void {
    this.isOnline$.next(true);
    this.checkApiAvailability();
  }

  private handleOffline(): void {
    this.isOnline$.next(false);
    this.apiAvailable$.next(false);
  }

  private startApiCheck(): void {
    // Verifica a disponibilidade da API a cada 30 segundos
    this.checkInterval = setInterval(() => {
      if (this.isOnline$.value) {
        this.checkApiAvailability();
      }
    }, 30000);
  }

  async checkApiAvailability(): Promise<boolean> {
    if (!navigator.onLine) {
      this.apiAvailable$.next(false);
      return false;
    }

    try {
      const response = await fetch('https://pet-manager-api.geia.vip/q/health/ready', {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      const available = response.ok;
      this.apiAvailable$.next(available);
      return available;
    } catch {
      this.apiAvailable$.next(false);
      return false;
    }
  }

  getOnlineStatus(): Observable<boolean> {
    return this.isOnline$.asObservable();
  }

  getApiStatus(): Observable<boolean> {
    return this.apiAvailable$.asObservable();
  }

  isOnline(): boolean {
    return this.isOnline$.value;
  }

  isApiAvailable(): boolean {
    return this.apiAvailable$.value && this.isOnline$.value;
  }

  destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    window.removeEventListener('online', () => this.handleOnline());
    window.removeEventListener('offline', () => this.handleOffline());
  }
}

export const connectivityService = new ConnectivityService();
