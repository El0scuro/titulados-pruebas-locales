'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const TokenContext = createContext<string | null>(null);
export const useAccessToken = () => useContext(TokenContext);

export const TokenProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    async function fetchToken() {
      try {
        const res = await fetch('/api/users'); // tu route que obtiene getSession()
        const data = await res.json();
        setToken(data.accessToken || null);
      } catch (err) {
        console.error('Error al obtener token:', err);
        setToken(null);
      }
    }

    fetchToken();
  }, []); // ya no depende de user, se llama al montar

  return (
    <TokenContext.Provider value={token}>
      {children}
    </TokenContext.Provider>
  );
};

