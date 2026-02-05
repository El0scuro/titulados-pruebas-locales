// components/SecretariaDashboardLayout.tsx
"use client"; // If using Next.js App Router

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Button } from '@mui/material';
import LogoutIcon from "@mui/icons-material/Logout";
// Icons for the lateral menu (choose relevant ones)
import DescriptionIcon from '@mui/icons-material/Description'; // For Archivos
import AssignmentIcon from '@mui/icons-material/Assignment';   // For Asignaciones
import GroupIcon from '@mui/icons-material/Group';             // For Estudiantes
import SchoolIcon from '@mui/icons-material/School';           // For Profesores
import HomeIcon from '@mui/icons-material/Home';               // For Inicio (Dashboard Overview)

// Import your existing components that will be displayed in the dashboard
import Archivos from './components/archivos';
import Asignaciones from './components/asignaciones';
import Estudiantes from './components/estudiantes';
import Profesores from './components/profesores';
import Inicio from './components/inicio'; // Assuming this is your dashboard overview component

// --- Dashboard Component Definitions (Placeholders if components not detailed yet) ---
// If your existing components (archivos.tsx, etc.) already have content, you can remove these
// and directly use the imported ones. These are just examples.

const ArchivosPage = () => (
    <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Gestión de Archivos</Typography>
        <Typography variant="body1">En esta sección se pueden cargar alumnos via un documento excel, o subir archivos manualmente a alumnos.</Typography>
         <Archivos /> {/* If Archivos.tsx contains the actual component */} 
    </Box>
);

const AsignacionesPage = () => (
    <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Asignaciones</Typography>
        <Typography variant="body1">Visualiza y gestiona las asignaciones de los docentes hacia los alumnos.</Typography>
         <Asignaciones />
    </Box>
);

const EstudiantesPage = () => (
    <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Directorio de Estudiantes</Typography>
        <Typography variant="body1">Accede a la información de los estudiantes.</Typography>
        <Estudiantes /> {/* If Estudiantes.tsx contains the actual component */}
    </Box>
);

const ProfesoresPage = () => (
    <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Gestión de Profesores</Typography>
        <Typography variant="body1">Administra la información del personal docente.</Typography>
        <Profesores /> {/* If Profesores.tsx contains the actual component */}
    </Box>
);

const InicioDashboardPage = () => (
        <Inicio /> 
);

// --- Drawer Width ---
const drawerWidth = 240;

export default function SecretariaDashboardLayout() {
  const [selectedComponent, setSelectedComponent] = useState('Inicio'); // Default selected item

  const renderCurrentComponent = () => {
    switch (selectedComponent) {
      case 'Inicio':
        return <InicioDashboardPage />;
      case 'Archivos':
        return <ArchivosPage />;
      case 'Asignaciones':
        return <AsignacionesPage />;
      case 'Estudiantes':
        return <EstudiantesPage />;
      case 'Profesores':
        return <ProfesoresPage />;
      default:
        return <InicioDashboardPage />;
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>

      <CssBaseline /> {/* Resets CSS for Material-UI */}
      
      {/* AppBar (Top Bar) - Optional, but common for dashboards */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Sistema de Seminario de Título
          </Typography>
          <Button
          href="/auth/logout"
          variant="contained"
          color="secondary"
          startIcon={<LogoutIcon />}
          style={{ position: "absolute", top: "20px", right: "20px" }}
        >
        Salir
        </Button>
        </Toolbar>
      </AppBar>
        
      {/* Drawer (Lateral Menu) */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar /> {/* Spacer to push content below the AppBar */}
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {[
              { text: 'Inicio', icon: <HomeIcon /> },
              { text: 'Archivos', icon: <DescriptionIcon /> },
              { text: 'Asignaciones', icon: <AssignmentIcon /> },
            ].map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={selectedComponent === item.text}
                  onClick={() => setSelectedComponent(item.text)}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            {[
              { text: 'Estudiantes', icon: <GroupIcon /> },
              { text: 'Profesores', icon: <SchoolIcon /> },
              
            ].map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={selectedComponent === item.text}
                  onClick={() => setSelectedComponent(item.text)}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}> {/* mt for toolbar height */}
        <Toolbar /> {/* Another spacer for content below AppBar */}
        {renderCurrentComponent()}
      </Box>
    </Box>
  );
}