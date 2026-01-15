"use client";
import { useEffect, useState, useMemo, use} from "react";
import React from 'react'
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { Asignacion } from '@/types/asignacion';
import axios from 'axios';
import __url from '@/lib/const';
import { Estudiante } from "@/types/estudiante";
import { Profesor } from "@/types/profesor";
import { useSearchParams } from "next/navigation";

function GuiaContent() {
  
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
  let asigsProfe = asignaciones.filter(asig => asig.mailProfesor === mail).filter(asig => asig.rol === "guia");

  //columnas
  const columns: GridColDef[] = [
    { field: 'rut', headerName: 'RUT', width: 90 },
    { field: 'Estudiante', headerName: 'Estudiante', width: 300 },
    { field: 'fecha', headerName: 'Fecha', width:90}
  ];

  //encontrará al estudiante asociado a x asignacion
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
            fecha: asig.fechaAsignacion
      }));
      return Filas;
      }, [asignaciones, estudiantes, profesores]);

  return (
    <Box sx={{ p: 3, width: '100%', height: 400 }}>
      <Typography variant='h2'>Sección Guía</Typography>
      <Typography variant='body1' sx={{ mb: 2 }}>Aquí encontrarás información y recursos para guiarte.</Typography>
      <DataGrid
        rows={filas}
        columns={columns}
        pageSizeOptions={[5, 10]}
        getRowId= {(row) => row.rut }
        initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
      />
    </Box>
  )
}

export default GuiaContent