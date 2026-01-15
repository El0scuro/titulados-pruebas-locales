import React from 'react'
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Estudiante } from '@/types/estudiante'; 
import { Asignacion } from '@/types/asignacion';
import { Profesor } from '@/types/profesor';
import  axios from 'axios';
import __url from '@/lib/const';

function InformanteContent() {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  //Correo del profesor que ingresó
  const searchParams = useSearchParams();
  const mail = searchParams.get("mail");
  
  //importo los estudiantes, los profesores, y las asignaciones
  useEffect(() => {
    const datos_todos = async () => {
        try {
            const [estRes, proRes, asigRes] = await Promise.all([
                axios.get(`${__url}/estudiante/todos`),
                axios.get(`${__url}/profesor/todos`),
                axios.get(`${__url}/asignaciones/todas`)
            ]);
            setEstudiantes(estRes.data);
            setProfesores(proRes.data);
            setAsignaciones(asigRes.data);
        } catch (error) {
            console.log(error);
        }
    };
    datos_todos();
}, []);

  //filtro las asignaciones con el profesor que ingresó, y las cuales sean con el rol 'guia'
  let asigsProfe = asignaciones.filter(asig => asig.mailProfesor === mail).filter(asig => asig.rol === "informante");

  const columns: GridColDef[] = [
    { field: 'rut', headerName: 'RUT', width: 90 },
    { field: 'Estudiante', headerName: 'Estudiante', width: 300 },
    { field: 'estado', headerName: 'Estado', width: 150 },
    { field: 'fecha', headerName: 'Fecha', width: 150 },
  ];

  const encuentraEstudiante = (asignacion: Asignacion)=>{
      const estudiante = estudiantes.find(est => est.mail === asignacion.mailEstudiante);
      const nombre = estudiante?.nombre + " " + estudiante?.apellido + " " + estudiante?.segundoApellido
      return nombre;
    }
  //filas
  const filas = useMemo(() => {
      if (!asigsProfe.length) return [];
      const Filas = asigsProfe.map(asig => ({
            rut: asig.id,
            Estudiante: encuentraEstudiante(asig) ?? '-',
            estado: "Estado en producción",
            fecha: asig.fechaAsignacion
      }));
      return Filas;
      }, [asignaciones, estudiantes, profesores]);

  return (
    <Box sx={{ p: 3, width: '100%', height: 400 }}>
      <Typography variant='h2'>Sección Informante</Typography>
      <Typography variant='body1' sx={{ mb: 2 }}>Mantente al día con las últimas novedades e informes.</Typography>
      <DataGrid
        rows={filas}
        columns={columns}
        getRowId= {(row) => row.rut }
        pageSizeOptions={[5, 10]}
        initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
      />
    </Box>
  )
}

export default InformanteContent