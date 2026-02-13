'use client';
import __url from "../../../lib/const"; // Assuming this path is correct for your project
import axios from "axios";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export default async function handleLogin(token: string, router: AppRouterInstance) {
    
    interface ErrorResponse {
      message: string;
      user?: string;
    }

    try {
      // Make an API call to validate the user's role, including the access token
      const response = await axios.get(`${__url}/user/validate`, {
      headers: { Authorization: `Bearer ${token}` }
      });
     

      // Redirect based on the user's role
      const lista: string[] = ["docente", "estudiante", "jefatura", "secretaria", "administrador"];
      for (let i = 0; i < lista.length; i++) {
        if (response.data?.user === lista[i]) {
        router.push(`/${lista[i]}?rol=${lista[i]}&mail=${response.data?.mail}&sede=${response.data?.sede}`); // Redirect to rol dashboard
      }
      }
    } catch (error: unknown) {
        if (axios.isAxiosError<ErrorResponse>(error)) {
          const rol = error.response?.data?.user;
          const codigo = error.response?.status;
          router.push(`/no_registrado?rol=${rol}&error=${codigo}`);
        }
    }

  }
