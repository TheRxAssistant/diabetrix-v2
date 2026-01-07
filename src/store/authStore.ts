/**
 * Simple auth store for managing user authentication and phone number storage
 * This store manages user session data including phone numbers for SMS functionality
 * Also manages auth_token and access_token stored in session storage
 */

interface User {
  phoneNumber?: string;
  isAuthenticated?: boolean;
  userData?: any;
}

interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  setPhoneNumber: (phoneNumber: string) => void;
  getPhoneNumber: () => string | undefined;
  updateAuthToken: (token: string) => void;
  updateAccessToken: (token: string) => void;
  getAuthToken: () => string;
  getAccessToken: () => string;
  setAuthenticated: (authenticated: boolean) => void;
  isAuthenticated: () => boolean;
  clear: () => void;
}

class AuthStore {
  private state: AuthState;

  constructor() {
    // Initialize with data from localStorage if available
    const storedUser = this.getStoredUser();

    this.state = {
      user: storedUser,
      setUser: (user: User) => {
        this.state.user = user;
        this.persistUser(user);
      },
      setPhoneNumber: (phoneNumber: string) => {
        const currentUser = this.state.user || {};
        const updatedUser = { ...currentUser, phoneNumber };
        this.state.user = updatedUser;
        this.persistUser(updatedUser);
      },
      getPhoneNumber: () => {
        return this.state.user?.phoneNumber;
      },
      updateAuthToken: (token: string) => {
        this.persistTokens({ auth_token: token });
      },
      updateAccessToken: (token: string) => {
        this.persistTokens({ access_token: token });
      },
      getAuthToken: () => {
        return this.getStoredTokens().auth_token || '';
      },
      getAccessToken: () => {
        return this.getStoredTokens().access_token || '';
      },
      setAuthenticated: (authenticated: boolean) => {
        localStorage.setItem("diabetrix_authenticated", JSON.stringify(authenticated));
      },
      isAuthenticated: () => {
        try {
          const stored = localStorage.getItem("diabetrix_authenticated");
          return stored ? JSON.parse(stored) : false;
        } catch (error) {
          console.error("Error loading auth status:", error);
          return false;
        }
      },
      clear: () => {
        this.state.user = null;
        localStorage.removeItem("diabetrix_user");
        localStorage.removeItem("diabetrix_authenticated");
        sessionStorage.removeItem("diabetrix_auth_tokens");
      },
    };
  }

  private getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem("diabetrix_user");
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Error loading stored user:", error);
      return null;
    }
  }

  private persistUser(user: User): void {
    try {
      localStorage.setItem("diabetrix_user", JSON.stringify(user));
    } catch (error) {
      console.error("Error storing user:", error);
    }
  }

  private getStoredTokens(): { auth_token: string; access_token: string } {
    try {
      const stored = sessionStorage.getItem("diabetrix_auth_tokens");
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          auth_token: parsed.auth_token || '',
          access_token: parsed.access_token || '',
        };
      }
    } catch (error) {
      console.error("Error loading stored tokens:", error);
    }
    return { auth_token: '', access_token: '' };
  }

  private persistTokens(tokens: { auth_token?: string; access_token?: string }): void {
    try {
      const currentTokens = this.getStoredTokens();
      const updatedTokens = {
        auth_token: tokens.auth_token !== undefined ? tokens.auth_token : currentTokens.auth_token,
        access_token: tokens.access_token !== undefined ? tokens.access_token : currentTokens.access_token,
      };
      sessionStorage.setItem("diabetrix_auth_tokens", JSON.stringify(updatedTokens));
    } catch (error) {
      console.error("Error storing tokens:", error);
    }
  }

  getState(): AuthState {
    return this.state;
  }
}

// Create singleton instance
const authStoreInstance = new AuthStore();

// Export store functions that mimic a useAuthStore pattern
export const useAuthStore = {
  getState: () => authStoreInstance.getState(),

  // Subscribe function for compatibility (simplified version)
  subscribe: (callback: () => void) => {
    // For now, return a simple unsubscribe function
    return () => {};
  },
};

// Export individual functions for convenience
export const { setUser, setPhoneNumber, getPhoneNumber, updateAuthToken, updateAccessToken, getAuthToken, getAccessToken, setAuthenticated, isAuthenticated, clear } =
  authStoreInstance.getState();

export default authStoreInstance;

