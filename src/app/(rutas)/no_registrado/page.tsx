'use client';
import React, { useEffect, useState} from "react";
import { Box, Button, Card, Grid, Paper, Typography } from "@mui/material";
import __url from "../../../lib/const"; // Assuming this path is correct for your project
import { useAccessToken } from '../../context/TokenContext'; // Assuming this path is correct
import { useUser } from "@auth0/nextjs-auth0";
import Alerta from "../../components/alerta/alert";
import Cargando from "../../components/loading/page";
import { useSearchParams } from "next/navigation";


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
    
    let mensaje : any;

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
    
    <>
    
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
            {/* Paper component provides a distinct, elevated surface for the form.
                - `elevation={6}` for a pronounced shadow.
                - `sx` for responsive padding, rounded corners, and enhanced shadow. */}
            <Paper
              elevation={6}
              sx={{
                p: { xs: 4, md: 6 }, // Responsive padding
                borderRadius: '12px', // Rounded corners
                textAlign: 'center', // Center text and inline elements
                boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.15)', // Enhanced shadow
              }}
            >
              {/* Grid container for arranging elements in a column.
                  - `direction="column"` stacks items vertically.
                  - `justifyContent="center"` centers items vertically.
                  - `alignItems="stretch"` makes items fill the width.
                  - `spacing={3}` adds consistent vertical spacing. */}
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

                {/* Instruction Typography */}
                <Grid component="div">
                  <Typography
                    variant="body1"
                    sx={{ mb: 3, color: 'text.secondary' }}
                  >
                    Confirme que usted es la siguiente persona:
                  </Typography>
                </Grid>

                {/* Card displaying user information */}
                <Grid component="div">
                  <Card
                    sx={{
                      p: 3, // Padding within the card
                      mb: 4, // Margin below the card
                      borderRadius: '8px', // Rounded corners for the card
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)', // Subtle shadow for the card
                      backgroundColor: 'background.paper', // Use theme background color
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                      {user.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Card>
                </Grid>
                  {alerta && (
                    <Alerta 
                      type={alerta.type}  
                      message={alerta.message}
                    />
                  )}
               
                {/* Confirm Button */}
                <Grid component="div">
                  <Button
                    variant="contained"
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
                    Confirmar
                  </Button>
                  
                </Grid>

                {/* Logout Button */}
                <Grid component="div">
                  <Button
                    variant="outlined"
                    component="a"
                    href="/auth/logout"
                    sx={{
                      width: '100%',
                      py: 1.5,
                      fontSize: '1rem',
                      borderRadius: '8px',
                      borderColor: 'divider', // Use theme divider color for border
                      color: 'text.primary', // Use theme primary text color
                      '&:hover': {
                        backgroundColor: 'action.hover', // Use theme hover color
                        borderColor: 'primary.main', // Highlight border on hover
                      },
                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    No soy {user.name}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </main>
      )}
    </>
      );
}