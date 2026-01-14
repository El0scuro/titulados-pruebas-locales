"use client";
import LogoutIcon from "@mui/icons-material/Logout";
import {Button} from "@mui/material";
import * as React from 'react';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import SchoolIcon from '@mui/icons-material/School';
import InfoIcon from '@mui/icons-material/Info';
import DescriptionIcon from '@mui/icons-material/Description';
import GavelIcon from '@mui/icons-material/Gavel';
import GuiaContent from './components/guia';
import InformanteContent from './components/informante';
import SecretarioContent from './components/secretario';
import PresidenteContent from './components/presidente';
import { Typography } from '@mui/material';

export default function CustomBottomNavigation() {
  const [value, setValue] = React.useState(0);
  const presidenteColumns = [
    { field: 'id', headerName: 'ID Decisión', width: 90 },
    { field: 'decision', headerName: 'Decisión', width: 300, editable: true },
    { field: 'dateIssued', headerName: 'Fecha Emisión', width: 150, editable: true },
  ];
  const presidenteRows = [
    { id: 1, decision: 'Aprobación presupuesto 2026', dateIssued: '2025-07-23' },
    { id: 2, decision: 'Nombramiento de comité', dateIssued: '2025-07-18' },
    { id: 3, decision: 'Plan estratégico Q4', dateIssued: '2025-07-10' },
    { id: 4, decision: 'Revisión de políticas', dateIssued: '2025-07-05' },
  ];

  const renderContent = () => {
    switch (value) {
      case 0:
        return <GuiaContent />;
      case 1:
        return <InformanteContent />;
      case 2:
        return <SecretarioContent />;
      case 3:
        return <PresidenteContent columns={presidenteColumns} rows={presidenteRows} />;
      default:
        return <GuiaContent />;
    }
  };

  return (
    
    <Box sx={{ width: '100%' }}>
      <Button
          href="/auth/logout"
          variant="contained"
          color="secondary"
          startIcon={<LogoutIcon />}
          style={{ position: "absolute", top: "20px", right: "20px" }}
        >
        Salir
        </Button>
      <Typography variant="h4" sx={{ textAlign: 'center', mt: 2 }}>
        Gestión De Notas Para Docente
      </Typography>


      <Box sx={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed grey', mb: 2 }}>
        {renderContent()}
      </Box>

      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        sx={{ width: '100%', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} // Fixed position at the bottom
      >
        <BottomNavigationAction label="Guía" icon={<SchoolIcon />} />
        <BottomNavigationAction label="Informante" icon={<InfoIcon />} />
        <BottomNavigationAction label="Secretario" icon={<DescriptionIcon />} />
        <BottomNavigationAction label="Presidente" icon={<GavelIcon />} />
      </BottomNavigation>
    </Box>
  );
}