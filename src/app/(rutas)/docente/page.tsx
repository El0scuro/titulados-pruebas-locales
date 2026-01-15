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
import { DataGrid } from "@mui/x-data-grid";
import { Asignacion } from '@/types/asignacion';
import axios from 'axios';
import __url from '@/lib/const';
import { Estudiante } from "@/types/estudiante";
import { Profesor } from "@/types/profesor";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo, use} from "react";
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import CancelIcon from '@mui/icons-material/Cancel';
import { red } from "@mui/material/colors";

export default function CustomBottomNavigation() {
  const [value, setValue] = useState<'guia'|'informante'|'secretario'|'presidente'>('guia');
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
  const asigsGuia = asignaciones.filter(asig => asig.mailProfesor === mail).filter(asig => asig.rol === "guia");
  const asigsInformante = asignaciones.filter(asig => asig.mailProfesor === mail).filter(asig => asig.rol === "informante");
  const asigSecretario = asignaciones.filter(asig => asig.mailProfesor === mail).filter(asig => asig.rol === "secretario");
  const asigPresidente = null//asignaciones.filter(asig => asig.mailProfesor === mail).filter(asig => asig.rol === "presidente");

  let bloqueo1;
  let bloqueo2;
  let bloqueo3;
  let bloqueo4;

  if(!asigsGuia){
    bloqueo1 = <CancelIcon/>
  }
  if(!asigsInformante){
    bloqueo2 = <CancelIcon/>
  }
  if(!asigSecretario){
    bloqueo3 = <CancelIcon/>
  }
  if(!asigPresidente){
    bloqueo4 = <CancelIcon sx={{color: "red", position: "absolute", top:"700px", left:"500px"}}/>
  }
  //encontrará al estudiante asociado a x asignacion
  const encuentraEstudiante = (asignacion: Asignacion)=>{
    const estudiante = estudiantes.find(est => est.mail === asignacion.mailEstudiante);
    const nombre = estudiante?.nombre + " " + estudiante?.apellido + " " + estudiante?.segundoApellido
    return nombre;
  }

  //columnas guia
    const columnsGuia: GridColDef[] = [
      { field: 'rut', headerName: 'RUT', width: 90 },
      { field: 'Estudiante', headerName: 'Estudiante', width: 300 },
      { field: 'fecha', headerName: 'Fecha', width:90}
    ];

  //filas guia
  const filasGuia = useMemo(() => {
      if (!asigsGuia.length) return [];
      const Filas = asigsGuia.map(asig => ({
            rut: asig.id,
            Estudiante: encuentraEstudiante(asig) ?? '-',
            fecha: asig.fechaAsignacion
      }));
      return Filas;
      }, [asignaciones, estudiantes, profesores]);

  //columnas informante
  const columnsInformante: GridColDef[] = [
      { field: 'rut', headerName: 'RUT', width: 90 },
      { field: 'Estudiante', headerName: 'Estudiante', width: 300 },
      { field: 'estado', headerName: 'Estado', width: 150 },
      { field: 'fecha', headerName: 'Fecha', width: 150 },
    ];

  //filas informante
  const filasInformante = useMemo(() => {
      if (!asigsInformante.length) return [];
      const Filas = asigsInformante.map(asig => ({
            rut: asig.id,
            Estudiante: encuentraEstudiante(asig) ?? '-',
            estado: "Estado en producción",
            fecha: asig.fechaAsignacion
      }));
      return Filas;
      }, [asignaciones, estudiantes, profesores]);

  //columas secretario
  const columnsSecretario: GridColDef[] = [
      { field: 'id', headerName: 'ID', width: 90 },
      { field: 'docName', headerName: 'Documento', width: 300 },
      { field: 'type', headerName: 'Tipo', width: 150 },
      { field: 'uploaded', headerName: 'Subido', width: 150 },
    ];

  //filas secretario
  const rowsSecretario: GridRowsProp = [
    { id: 1, docName: 'Acta de reunión 01', type: 'Acta', uploaded: '2025-06-01' },
    { id: 2, docName: 'Lista de estudiantes', type: 'Excel', uploaded: '2025-05-20' },
    { id: 3, docName: 'Correspondencia oficial', type: 'Carta', uploaded: '2025-04-15' },
  ];


  //columnas presidente
  const presidenteRows = [
    { id: 1, decision: 'Aprobación presupuesto 2026', dateIssued: '2025-07-23' },
    { id: 2, decision: 'Nombramiento de comité', dateIssued: '2025-07-18' },
    { id: 3, decision: 'Plan estratégico Q4', dateIssued: '2025-07-10' },
    { id: 4, decision: 'Revisión de políticas', dateIssued: '2025-07-05' },
  ];

  //filas presidente
    const presidenteColumns = [
      { field: 'id', headerName: 'ID Decisión', width: 90 },
      { field: 'decision', headerName: 'Decisión', width: 300, editable: true },
      { field: 'dateIssued', headerName: 'Fecha Emisión', width: 150, editable: true },
    ];

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
      {bloqueo1}
      {bloqueo2}  
      {bloqueo3}
      {bloqueo4}
      
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        sx={{ width: '100%', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} // Fixed position at the bottom
      >
        
        <BottomNavigationAction label="Guía" value='guia' icon={<SchoolIcon />} />
        
        <BottomNavigationAction label="Informante" value='informante' icon={<InfoIcon />} />
        
        <BottomNavigationAction label="Secretario" value='secretario' icon={<DescriptionIcon />} />
        
        <BottomNavigationAction label="Presidente" value= 'presidente' icon={<GavelIcon />} />
      </BottomNavigation>
      <Box>
          {value === 'guia' && (
            <Box sx={{ p: 3, width: '100%', height: 400 }}>
              <Typography variant='h2'>Sección Guía</Typography>
              <Typography variant='body1' sx={{ mb: 2 }}>Aquí encontrarás información y recursos para guiarte.</Typography>
              <DataGrid
                rows={filasGuia}
                columns={columnsGuia}
                pageSizeOptions={[5, 10]}
                getRowId= {(row) => row.rut }
                initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
              />
            </Box>
          )}
          {value === 'informante' &&(
            <Box sx={{ p: 3, width: '100%', height: 400 }}>
              <Typography variant='h2'>Sección Informante</Typography>
              <Typography variant='body1' sx={{ mb: 2 }}>Mantente al día con las últimas novedades e informes.</Typography>
              <DataGrid
                rows={filasInformante}
                columns={columnsInformante}
                getRowId= {(row) => row.rut }
                pageSizeOptions={[5, 10]}
                initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
              />
            </Box>
          )}
          {value === 'secretario' &&(
            <Box sx={{ p: 3, width: '100%', height: 400 }}>
              <Typography variant='h2'>Sección Secretario</Typography>
              <Typography variant='body1' sx={{ mb: 2 }}>Gestiona documentos, actas y comunicaciones.</Typography>
              <DataGrid
                rows={rowsSecretario}
                columns={columnsSecretario}
                pageSizeOptions={[5, 10]}
                initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
              />
            </Box>
          )}
          {value === 'presidente' &&(
            <Box sx={{ p: 3, width: '100%', height: 400 }}> {/* Ensure height is set for DataGrid */}
            <Typography variant='h2'>Sección Presidente</Typography>
            <Typography variant='body1'>Administra las decisiones y la dirección general.</Typography>
            <DataGrid
                rows={presidenteRows}
                columns={presidenteColumns}
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
          )}
      </Box>
    </Box>
    
  );
}