import * as React from "react";
import { client } from "./clients/client";
import { User } from "./types";

export interface AuthContext {
  isAuthenticated: boolean;
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  user: User | null;
}

const AuthContext = React.createContext<AuthContext | null>(null);

const STORAGE_AUTH_KEY = "auth.user";

/**
 * Get the stored user from localStorage
 * @returns The stored user or null if no user is stored
 */
function getStoredUser(): User | null {
  const user = localStorage.getItem(STORAGE_AUTH_KEY);
  if (!user) {
    return null;
  }
  return JSON.parse(user);
}

/**
 * Set the stored user in localStorage
 * @param user The user to store
 */
function setStoredUser(user: User | null) {
  if (user) {
    localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_AUTH_KEY);
  }
}

/**
 * The provider for the auth context
 * @param children The children to render
 * @returns The provider for the auth context
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(getStoredUser());
  const isAuthenticated = !!user;

  /**
   * Logout the user
   */
  const logout = React.useCallback(async () => {
    try {
      await client.logout();
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      setStoredUser(null);
      setUser(null);
    }
  }, []);

  /**
   * Login the user
   * @param user The user to login
   */
  const login = React.useCallback(async (user: User) => {
    try {
      await client.login(user);
      setStoredUser(user);
      setUser(user);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, []);

  React.useEffect(() => {
    setUser(getStoredUser());
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * The hook for the auth context
 * @returns The auth context
 */
export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
