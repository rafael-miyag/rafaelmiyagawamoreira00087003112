import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('StateManager', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  it('should start with unauthenticated state', async () => {
    const { stateManager } = await import('../../services/state/StateManager');
    const state = stateManager.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('should set user correctly', async () => {
    const { stateManager } = await import('../../services/state/StateManager');
    
    const user = {
      username: 'testuser',
      token: 'test-token',
      refreshToken: 'refresh-token',
    };
    
    stateManager.setUser(user);
    
    const state = stateManager.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.username).toBe('testuser');
    expect(state.user?.token).toBe('test-token');
  });

  it('should get token correctly', async () => {
    const { stateManager } = await import('../../services/state/StateManager');
    
    const user = {
      username: 'testuser',
      token: 'my-token',
    };
    
    stateManager.setUser(user);
    
    expect(stateManager.getToken()).toBe('my-token');
  });

  it('should reset state correctly', async () => {
    const { stateManager } = await import('../../services/state/StateManager');
    
    stateManager.setUser({
      username: 'testuser',
      token: 'test-token',
    });
    
    stateManager.reset();
    
    const state = stateManager.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(stateManager.getToken()).toBeNull();
  });

  it('should update token correctly', async () => {
    const { stateManager } = await import('../../services/state/StateManager');
    
    stateManager.setUser({
      username: 'testuser',
      token: 'old-token',
    });
    
    stateManager.updateToken('new-token', 'new-refresh');
    
    expect(stateManager.getToken()).toBe('new-token');
    expect(stateManager.getRefreshToken()).toBe('new-refresh');
  });
});
