'use client';
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0";
import { useAccessToken } from "./context/TokenContext";
import handleLogin from "./components/handleLogin/handleLogin";
import carga from "./components/loading/page";
import Login from "./(rutas)/login/page";

export default function Home() {
  const { user, isLoading } = useUser();
  const { token, fetchToken } = useAccessToken();
  const router = useRouter();

  //Cuando Auth0 ya cargó al usuario, decide si pedir token
  useEffect(() => {
    if (!isLoading && user && !token) {
      fetchToken();
    }
  }, [isLoading, user, token]);

  //Cuando ya hay token, ejecuta tu lógica de roles
  useEffect(() => {
    if (token) {
      handleLogin(token, router);
    }
  }, [token]);

  //Estados visuales
  if (isLoading) {
    return carga();
  }

  if (!user) {
    return <Login />;
  }

  return null; // o loader mientras decide
}
