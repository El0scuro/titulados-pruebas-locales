"use client";
import LogoutIcon from "@mui/icons-material/Logout";
import {Button, Stack} from "@mui/material";
import * as React from 'react';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import SchoolIcon from '@mui/icons-material/School';
import InfoIcon from '@mui/icons-material/Info';
import DescriptionIcon from '@mui/icons-material/Description';
import GavelIcon from '@mui/icons-material/Gavel';
import { Typography } from '@mui/material';
import { Asignacion } from '@/types/asignacion';
import axios from 'axios';
import __url from '@/lib/const';
import { Estudiante } from "@/types/estudiante";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo} from "react";
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import estilo from "./style.module.css";
import GuiaContent from "./components/guia";
import InformanteContent from "./components/informante";
import PresidenteContent from "./components/presidente";
import SecretarioContent from "./components/secretario";
import { Secretario } from "@/types/secretario";
import { Jefatura } from "@/types/jefatura";


export default function CustomBottomNavigation() {

  //state para los diferentes valores que puede mostrar el componente padre
  const [value, setValue] = useState<'guia'|'informante'|'secretario'|'presidente'>('guia');
  
  //states para la descarga de datos desde el back
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [secretaria, setSecretaria] = useState<Secretario[]>([]);
  const [jefatura, setJefatura] = useState<Jefatura[]>([]);
  //Correo del profesor que ingresó
  const searchParams = useSearchParams();
  const mail = searchParams.get("mail");
  const sede = searchParams.get("sede");
  //importo las asignaciones
  useEffect(() => {
    const datos_todos = async () => {
        try {
            const [asigRes, secreRes, jefaRes] = await Promise.all([
                axios.get(`${__url}/asignaciones/todas`),
                axios.get(`${__url}/jefatura/todas`),
                axios.get(`${__url}/secretario/todos`),
            ]);
            setAsignaciones(asigRes.data);
            setSecretaria(secreRes.data);
            setJefatura(jefaRes.data);
        } catch (error) {
            console.log(error);
        }
    };
    datos_todos();
}, []);


  //filtro las asignaciones con el profesor que ingresó, y las cuales sean con el rol 'guia'
    const asigsGuia = useMemo(() => {
      return asignaciones.filter(a => a.mailProfesor === mail && a.rol === 'guia');
    }, [asignaciones, mail]);

  //filtro las asignaciones con el profesor que ingresó, y las cuales sean con el rol 'informante'
  const asigsInformante = useMemo(() => {
    return asignaciones.filter(a => a.mailProfesor === mail && a.rol === 'informante');
  }, [asignaciones, mail]);
  
  const asigsSecretaria = useMemo(() => {
    return asignaciones.filter(a => a.mailProfesor === mail && a.rol === 'secretaria' );
  }, [asignaciones, mail]);

  const asigsPresidente = useMemo(() => {
    return asignaciones.filter(a => a.mailProfesor === mail && a.rol === 'presidente');
  }, [asignaciones, mail]);
 
  //habilitar y bloquear botones
  let guiaColor: any;
  let inforColor: any;
  let secreColor: any;
  let presiColor: any;
  let guiaCond = true;
  let inforCond = true;
  let secreCond = true;
  let presiCond = true;
  if(asigsGuia.length === 0){
    guiaCond = false;
    guiaColor = 'red';
  }
  if(asigsInformante.length === 0){
    inforCond = false;
    inforColor = 'red';
  }
  if(asigsSecretaria.length === 0){
    secreCond = false;
    secreColor = 'red';
  }
  if(asigsPresidente.length === 0){
    presiCond = false;
    presiColor = 'red';
  }
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
    
    <Box sx={{ width: '100%'}}>
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
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        sx={{ width: '100%', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} // Fixed position at the bottom
      >
        <BottomNavigationAction disabled={guiaCond === false} label="Guía" value='guia' sx={{color: guiaColor}} icon={<SchoolIcon />}/>
        <BottomNavigationAction disabled={inforCond === false} label="Informante" value='informante' sx={{color: inforColor}} icon={<InfoIcon />} />
        <BottomNavigationAction disabled={secreCond === false} label="Secretario" value='secretaria' sx={{color: secreColor}} icon={<DescriptionIcon />} />
        <BottomNavigationAction disabled={presiCond === false} label="Presidente" value='presidente' sx={{color: presiColor}} icon={<GavelIcon />} />
      </BottomNavigation>
      <Box>
          {value === 'guia' && (
            <GuiaContent 
            sede={sede}
            secretarios={secretaria}
            jefaturas={jefatura}
            mailProfe={mail}
            />
          )}
          {value === 'informante' &&(
            <Box sx={{ p: 3, width: '100%', height: 400 }}>
              <InformanteContent
              sede={sede}
              secretarios={secretaria}
              jefaturas={jefatura}
              mailProfe={mail}
              />
            </Box>
          )}
          {value === 'secretario' &&(
            <Box sx={{ p: 3, width: '100%', height: 400 }}>
              <SecretarioContent/>
            </Box>
          )}
          {value === 'presidente' &&(
            <Box sx={{ p: 3, width: '100%', height: 400 }}> {/* Ensure height is set for DataGrid */}
            <PresidenteContent rows={presidenteRows} columns={presidenteColumns}/>
        </Box>
          )}
      </Box>
    </Box>
    
  );
}