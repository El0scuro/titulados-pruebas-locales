import { Box, Typography } from '@mui/material'
import React from 'react'

function inicio() {
  return (
    <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Inicio</Typography>
        <Typography variant="body1">Bienvenido al panel de control de secretarí@.
            A continuación en la barra lateral izquierda usted podrá navegar por las diferentes secciones.</Typography>
    </Box>
  )
}

export default inicio