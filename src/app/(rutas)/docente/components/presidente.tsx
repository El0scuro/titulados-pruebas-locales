import React from 'react';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import { GridColDef, GridRowsProp } from '@mui/x-data-grid';

interface PresidenteContentProps {
    columns: GridColDef[];
    rows: GridRowsProp;
}

function PresidenteContent({ columns, rows }: PresidenteContentProps) {

    if (!columns || !rows) {
        return <Typography>Cargando datos del Presidente...</Typography>;
    }

    return (
        <Box sx={{ p: 3, width: '100%', height: 400 }}> {/* Ensure height is set for DataGrid */}
            <Typography variant='h2'>Sección Presidente</Typography>
            <Typography variant='body1'>Administra las decisiones y la dirección general.</Typography>
            <DataGrid
                rows={rows}
                columns={columns}
                pageSizeOptions={[5, 10, 20]}
                initialState={{
                    pagination: {
                        paginationModel: { pageSize: 5 }
                    }
                }}
                checkboxSelection
                disableRowSelectionOnClick
            />
        </Box>
    );
}

export default PresidenteContent;