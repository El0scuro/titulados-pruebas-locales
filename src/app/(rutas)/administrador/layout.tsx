'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccessToken } from '../../context/TokenContext';
import { useUser } from '@auth0/nextjs-auth0';

export default function DocenteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const token = useAccessToken();
  const { user, isLoading } = useUser();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    //No logueado
    if (!token || !user) {
      router.replace('../../login');
      return;
    }
    setAuthorized(true)
  }, [token, user, isLoading, router]);

  if (isLoading || !authorized) return null; // o loading spinner

  return <>{children}</>;
}
