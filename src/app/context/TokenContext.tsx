'use client';
import { createContext, useContext, useState } from 'react';

type TokenContextType = {
  token: string | null;
  fetchToken: () => Promise<void>;
  clearToken: () => void;
};

const TokenContext = createContext<TokenContextType | null>(null);

export const useAccessToken = () => {
  const ctx = useContext(TokenContext);
  if (!ctx) throw new Error('useAccessToken must be used within TokenProvider');
  return ctx;
};

export const TokenProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);

  const fetchToken = async () => {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) return;

      const data = await res.json();
      setToken(data.accessToken || null);
    } catch {
      setToken(null);
    }
  };

  const clearToken = () => setToken(null);

  return (
    <TokenContext.Provider value={{ token, fetchToken, clearToken }}>
      {children}
    </TokenContext.Provider>
  );
};
