/**
 * Simple auth store for managing user authentication and phone number storage
 * This store manages user session data including phone numbers for SMS functionality
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
      clear: () => {
        this.state.user = null;
        localStorage.removeItem("diabetrix_user");
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
export const { setUser, setPhoneNumber, getPhoneNumber, clear } =
  authStoreInstance.getState();

export default authStoreInstance;

