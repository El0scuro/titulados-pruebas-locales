"use client";
import { useEffect, useState } from "react";
import React from 'react'
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { Asignacion } from '@/types/asignacion';
import axios from 'axios';
import __url from '@/lib/const';

function GuiaContent() {
  
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);

  useEffect(() => {
    const cargarAsignaciones = async () => {
    const response = await axios.get(`${__url}/asignaciones/todos`);
      setAsignaciones(response.data);
    };

    cargarAsignaciones();
  }, []);

  const columns: GridColDef[] = [
    
    { field: 'id', headerName: 'RUT', width: 90 },
    { field: 'title', headerName: 'Estudiante', width: 300 },
    { field: 'type', headerName: 'Asignación', width: 150 },
  ];

  /*const filas: GridRowsProp = [
    asignaciones.map(asig => 
    ({id: asig.id, 
    title: asig.estudianteRef.nombre, type: asig.rol}))
  ];
*/
  const rows: GridRowsProp = [
    { id: 1, title: 'Guía de Evaluación', type: 'PDF', link: 'https://example.com/guia-evaluacion.pdf' },
    { id: 2, title: 'Calendario Académico', type: 'Documento', link: 'https://example.com/calendario' },
    { id: 3, title: 'Formato de Acta', type: 'Plantilla', link: 'https://example.com/acta.docx' },
  ];

  return (
    <Box sx={{ p: 3, width: '100%', height: 400 }}>
      <Typography variant='h2'>Sección Guía</Typography>
      <Typography variant='body1' sx={{ mb: 2 }}>Aquí encontrarás información y recursos para guiarte.</Typography>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSizeOptions={[5, 10]}
        initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
      />
    </Box>
  )
}

export default GuiaContent