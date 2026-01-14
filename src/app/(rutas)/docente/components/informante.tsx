import React from 'react'
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';

function InformanteContent() {
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'report', headerName: 'Informe', width: 300 },
    { field: 'status', headerName: 'Estado', width: 150 },
    { field: 'date', headerName: 'Fecha', width: 150 },
  ];

  const rows: GridRowsProp = [
    { id: 1, report: 'Informe de asistencia', status: 'Publicado', date: '2025-06-10' },
    { id: 2, report: 'Resumen de evaluaciones', status: 'Borrador', date: '2025-06-02' },
    { id: 3, report: 'Reporte de actividades', status: 'Publicado', date: '2025-05-28' },
  ];

  return (
    <Box sx={{ p: 3, width: '100%', height: 400 }}>
      <Typography variant='h2'>Sección Informante</Typography>
      <Typography variant='body1' sx={{ mb: 2 }}>Mantente al día con las últimas novedades e informes.</Typography>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSizeOptions={[5, 10]}
        initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
      />
    </Box>
  )
}

export default InformanteContent