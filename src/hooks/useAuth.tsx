import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type FakeUser = {
  id: string;
  email: string;
  name: string;
  userType?: string;
  country?: string;
};

type AuthContextValue = {
  user: FakeUser | null;
  loading: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, userType?: string, country?: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FakeUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isGuest = !user;

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('fakeUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Fake sign in - just create a user object
    const fakeUser: FakeUser = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name: email.split('@')[0],
    };

    localStorage.setItem('fakeUser', JSON.stringify(fakeUser));
    setUser(fakeUser);
  };

  const signUp = async (name: string, email: string, password: string, userType?: string, country?: string) => {
    // Fake sign up - just create a user object
    const fakeUser: FakeUser = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      userType,
      country,
    };

    localStorage.setItem('fakeUser', JSON.stringify(fakeUser));
    setUser(fakeUser);
  };

  const signOut = () => {
    localStorage.removeItem('fakeUser');
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, isGuest, signIn, signUp, signOut }),
    [user, loading, isGuest]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
