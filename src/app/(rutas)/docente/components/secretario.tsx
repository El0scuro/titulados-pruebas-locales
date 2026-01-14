import React from 'react'
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';

function SecretarioContent() {
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'docName', headerName: 'Documento', width: 300 },
    { field: 'type', headerName: 'Tipo', width: 150 },
    { field: 'uploaded', headerName: 'Subido', width: 150 },
  ];

  const rows: GridRowsProp = [
    { id: 1, docName: 'Acta de reunión 01', type: 'Acta', uploaded: '2025-06-01' },
    { id: 2, docName: 'Lista de estudiantes', type: 'Excel', uploaded: '2025-05-20' },
    { id: 3, docName: 'Correspondencia oficial', type: 'Carta', uploaded: '2025-04-15' },
  ];

  return (
    <Box sx={{ p: 3, width: '100%', height: 400 }}>
      <Typography variant='h2'>Sección Secretario</Typography>
      <Typography variant='body1' sx={{ mb: 2 }}>Gestiona documentos, actas y comunicaciones.</Typography>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSizeOptions={[5, 10]}
        initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
      />
    </Box>
  )
}

export default SecretarioContent