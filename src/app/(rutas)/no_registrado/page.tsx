'use client';
import React, { useEffect, useState} from "react";
import { Box, Button, Grid, Paper, Typography } from "@mui/material";
import { useAccessToken } from "@/app/context/TokenContext"; // Assuming this path is correct
import { useUser } from "@auth0/nextjs-auth0";
import Alerta from "../../components/alerta/alert";
import Cargando from "../../components/loading/page";
import { useSearchParams } from "next/navigation";
import Estilo_login from "./estilos.module.css"

export default function Page(){
    const [alerta, setAlerta] = useState<{
        type: 'info' | 'error' | 'success' | 'warning';
        message: React.ReactNode;
        } | null>(null);
    const { user, isLoading } = useUser();
    const token = useAccessToken();

    const searchParams = useSearchParams();

    const codigo = searchParams.get("error");
    const rol = searchParams.get("rol");

    useEffect(() => {
      if (codigo === "404" && rol) {
        setAlerta({
          type: 'warning',
          message: (
            <>
              <b>{rol}</b> no registrado/a en el sistema.<br />
              Contactar al académico Sergio González al correo:<br />
              <a href="mailto:SERGIO.GONZALEZ@UV.CL?subject=Problema%20de%20acceso&body=No%20puedo%20ingresar%20al%20sistema">
                sergio.gonzales@uv.cl
              </a>
            </>
          ),
        });
      }
    }, [codigo, rol]);

    if(isLoading){
      return <Cargando/>;
    }

    return (
    <div className={Estilo_login.contenedor_page}>
      <Box
      sx={{
      position:'relative',
      top:'100px'
      }}
      >
      
        {/* Set page title and meta description for SEO */}
        <title>Confirmación de usuario</title>
        <meta name="description" content="Confirme su identidad para acceder al sistema de seguimientos académicos UV." />

        
        {user && (
          // Main container for the page, centered vertically and horizontally.
          // Uses Tailwind CSS classes for responsive padding and centering.
          <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 md:p-24">
            {/* Box component acts as a flexible wrapper for the Paper component,
                controlling its maximum width on larger screens for better readability. */}
            <Box sx={{ maxWidth: '450px', width: '100%', mx: 'auto' }}>
              <Paper
                elevation={6}
                sx={{
                  p: { xs: 4, md: 6 }, // Responsive padding
                  borderRadius: '12px', // Rounded corners
                  textAlign: 'center', // Center text and inline elements
                  boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.15)', // Enhanced shadow
                }}
              >
                <Grid
                  container
                  direction="column"
                  justifyContent="center"
                  alignItems="stretch"
                  spacing={3} // Increased spacing
                >
                  {/* Main title Typography */}
                  <Grid component="div">
                    <Typography
                      variant="h4"
                      component="h1"
                      sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}
                    >
                      Sistema de Seminario de Título
                    </Typography>
                    
                  </Grid>
                  {alerta && (
                    <Alerta 
                      type={alerta.type}  
                      message={alerta.message}
                    />
                  )}
                  {/* Logout Button */}
                  <Grid component="div">
                    <Button
                      variant="contained"
                      component="a"
                      href="/auth/logout"
                      disabled={!token}  // espera a que token exista
                      sx={{
                        width: '100%',
                        py: 1.75,
                        fontSize: '1.15rem',
                        borderRadius: '8px',
                        boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
                        '&:hover': {
                          boxShadow: '0 8px 16px rgba(0,0,0,0.25)',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease-in-out',
                        mb: 2, // Margin below this button
                      }}
                    >
                      Volver al Login
                    </Button>
                    
                  </Grid>
                  
                </Grid>
              </Paper>
            </Box>
          </main>
        )}
      </Box>
    </div>
      
      );
}