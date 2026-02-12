"use client";
import { useEffect, useState, useMemo} from "react";
import React from 'react'
import { Box} from '@mui/material'; // Added Select, MenuItem, FormControl, InputLabel
import { Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { GridColDef} from '@mui/x-data-grid';
import { Asignacion } from '@/types/asignacion';
import axios from 'axios';
import __url from '@/lib/const';
import { Estudiante } from "@/types/estudiante";
import { useSearchParams } from "next/navigation";
import { Notas } from "@/types/notas";

export interface filas{
  rut: string;
    Estudiante: string;
    fecha: string;
}

function SecretarioContent() {
  
  //state para las filas de la tabla de guia
  const [filasSecretario, setFilasGuia] = useState<filas[]>([]);

  //states para la descarga de datos desde el back
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [notas, setNotas] = useState<Notas[]>([]);
  //Correo del profesor que ingresó
  const searchParams = useSearchParams();
  const mail = searchParams.get("mail");
  
  //importo los estudiantes, las notas, y las asignaciones
  useEffect(() => {
    const datos_todos = async () => {
        try {
            const [estRes, asigRes, notaRes] = await Promise.all([
                axios.get(`${__url}/estudiante/todos`),
                axios.get(`${__url}/asignaciones/todas`),
                axios.get(`${__url}/notas/todas`),
            ]);
            setEstudiantes(estRes.data);
            setAsignaciones(asigRes.data);
            setNotas(notaRes.data);
        } catch (error) {
            console.log(error);
        }
    };
    datos_todos();
}, []);

  //filtro las asignaciones con el profesor que ingresó, y las cuales sean con el rol 'secretario'
  const asigsSecretario = useMemo(() => {
    return asignaciones.filter(a => a.mailProfesor === mail && a.rol === 'secretario');
  }, [asignaciones, mail]);

  //columnas secretario
  const columnsSecretario: GridColDef[] = [
    { field: 'rut', headerName: 'RUT', width: 90 },
    { field: 'Estudiante', headerName: 'Estudiante', width: 200 },
    { field: 'fecha', headerName: 'Fecha', width:90},
  ];
  
  //filas secretario
    useEffect(() => {
    if (!asigsSecretario.length) {
      setFilasGuia([]);
      return;
    }
  
    const nuevasFilas = asigsSecretario.map(asig => ({
      rut: estudiantes.find(est => est.mail === asig.mailEstudiante)?.rut ?? "---",
      Estudiante: estudiantes.find(est => est.mail === asig.mailEstudiante)
                    ? `${estudiantes.find(est => est.mail === asig.mailEstudiante)?.nombre} 
                    ${estudiantes.find(est => est.mail === asig.mailEstudiante)?.apellido} 
                    ${estudiantes.find(est => est.mail === asig.mailEstudiante)?.segundoApellido}`
                    : '-',
      fecha: asig.fechaAsignacion
    }));
  
    setFilasGuia(nuevasFilas);
  }, [asigsSecretario, estudiantes, notas]);

    return (
        <Box sx={{ p: 3, width: '100%', height: 400 }}> {/* Ensure height is set for DataGrid */}
            <Typography variant='h2'>Sección Presidente</Typography>
            <Typography variant='body1'>Administra las decisiones y la dirección general.</Typography>
            <DataGrid
                rows={filasSecretario}
                columns={columnsSecretario}
                pageSizeOptions={[5, 10]}
                getRowId= {(row) => row.rut }
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

export default SecretarioContent
