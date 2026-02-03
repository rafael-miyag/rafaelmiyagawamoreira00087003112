import { BehaviorSubject, Observable } from 'rxjs';
import { apiClient } from '../api/ApiClient';

export interface HealthStatus {
  status: 'UP' | 'DOWN' | 'UNKNOWN';
  checks?: {
    name: string;
    status: string;
  }[];
}

class HealthFacade {
  private static instance: HealthFacade;
  private healthStatus$ = new BehaviorSubject<HealthStatus>({ status: 'UNKNOWN' });
  private checkInterval: ReturnType<typeof setInterval> | null = null;

  private constructor() {}

  static getInstance(): HealthFacade {
    if (!HealthFacade.instance) {
      HealthFacade.instance = new HealthFacade();
    }
    return HealthFacade.instance;
  }

  getHealthStatus$(): Observable<HealthStatus> {
    return this.healthStatus$.asObservable();
  }

  getHealthStatus(): HealthStatus {
    return this.healthStatus$.getValue();
  }

  async checkHealth(): Promise<HealthStatus> {
    try {
      const response = await apiClient.get('/q/health');
      const status: HealthStatus = {
        status: response.data.status === 'UP' ? 'UP' : 'DOWN',
        checks: response.data.checks,
      };
      this.healthStatus$.next(status);
      return status;
    } catch {
      const status: HealthStatus = { status: 'DOWN' };
      this.healthStatus$.next(status);
      return status;
    }
  }

  async checkLiveness(): Promise<boolean> {
    try {
      const response = await apiClient.get('/q/health/live');
      return response.data.status === 'UP';
    } catch {
      return false;
    }
  }

  async checkReadiness(): Promise<boolean> {
    try {
      const response = await apiClient.get('/q/health/ready');
      return response.data.status === 'UP';
    } catch {
      return false;
    }
  }

  startPeriodicCheck(intervalMs: number = 30000): void {
    if (this.checkInterval) {
      this.stopPeriodicCheck();
    }
    
    // Check immediately
    this.checkHealth();
    
    // Then check periodically
    this.checkInterval = setInterval(() => {
      this.checkHealth();
    }, intervalMs);
  }

  stopPeriodicCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export const healthFacade = HealthFacade.getInstance();
