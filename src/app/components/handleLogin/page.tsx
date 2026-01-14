'use client';
import React, { useState} from "react";
import __url from "../../../lib/const"; // Assuming this path is correct for your project
import axios from "axios";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export default async function handleLogin(token: string, router: AppRouterInstance) {
    
    
    try {
      // Make an API call to validate the user's role, including the access token
      const response = await axios.get(`${__url}/user/validate`, {
      headers: { Authorization: `Bearer ${token}` }
      });
      console.log(response);

      // Redirect based on the user's role
      let lista: string[] = ["docente", "estudiante", "jefatura", "secretaria"];
      console.log(response.data?.mail);
      for (let i = 0; i < lista.length; i++) {
        if (response.data?.user === lista[i]) {
        router.push(`/${lista[i]}?rol=${lista[i]}&mail=${response.data?.mail}`); // Redirect to rol dashboard
      }
      }
    } catch (error:any) {
      const rol = error.response.data?.user;
      const codigo = error.response.status;
      // Log any errors that occur during the login process
      router.push(`/no_registrado?rol=${rol}&error=${codigo}`);
    }
  }
export function alertaLogin(rol:any){
  const [alerta, setAlerta] = useState<{
    type: 'info' | 'error' | 'success' | 'warning';
    message: React.ReactNode;
    } | null>(null);
  setAlerta({
        type: 'warning',
        message:(
          <>
             <b>{rol}</b> no registrado/a en el sistema.<br/>
            Contactar al académico Sergio González al correo:<br/>
            <a href="mailto:sergio.gonzalez@uv.cl?subject=Problema%20de%20acceso&body=No%20puedo%20ingresar%20al%20sistema">
              sergio.gonzales@uv.cl
            </a>
          </> 
        )
    });
}