"use client";
import LogoutIcon from "@mui/icons-material/Logout";
import {Button, Color, Stack} from "@mui/material";
import * as React from 'react';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import SchoolIcon from '@mui/icons-material/School';
import InfoIcon from '@mui/icons-material/Info';
import DescriptionIcon from '@mui/icons-material/Description';
import GavelIcon from '@mui/icons-material/Gavel';
import { Typography } from '@mui/material';
import { DataGrid } from "@mui/x-data-grid";
import { Asignacion } from '@/types/asignacion';
import axios, { isCancel } from 'axios';
import __url from '@/lib/const';
import { Estudiante } from "@/types/estudiante";
import { Estado } from "@/types/estados"; 
import { Notas } from "@/types/notas";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo, use} from "react";
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { Parastoo } from "next/font/google";
import { useCallback } from "react";



export default function CustomBottomNavigation() {

  //state para sellecionar fila que se enviará al componente hijo
  const [filaSeleccionada, setFilaSeleccionada] = useState<any>("");
  
  //state para las filas de la tabla de guia
  const [filasGuia, setFilasGuia] = useState<any[]>([]);

  //state para las filas de la tabla de informante
  const [filasInformante, setFilasInformante] = useState<any[]>([]);

  //state para mostrar componente hijo 
  const [showpaginaGuia, setShowpaginaGuia] = useState(false);
  
  //state para los diferentes valores que puede mostrar el componente padre
  const [value, setValue] = useState<'guia'|'informante'|'secretario'|'presidente'>('guia');
  
  //states para la descarga de datos desde el back
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [notas, setNotas] = useState<Notas[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  
  //Correo del profesor que ingresó
  const searchParams = useSearchParams();
  const mail = searchParams.get("mail");
  
  //importo los estudiantes, los profesores, las notas, y las asignaciones
  useEffect(() => {
    const datos_todos = async () => {
        try {
            const [estRes, asigRes, notaRes, estaRes] = await Promise.all([
                axios.get(`${__url}/estudiante/todos`),
                axios.get(`${__url}/asignaciones/todas`),
                axios.get(`${__url}/notas/todas`),
                axios.get(`${__url}/estados/todos`)
            ]);
            setEstudiantes(estRes.data);
            setAsignaciones(asigRes.data);
            setNotas(notaRes.data);
            setEstados(estaRes.data);
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

  const asigSecretario = asignaciones.filter(asig => asig.mailProfesor === mail).filter(asig => asig.rol === "secretario");
  const asigPresidente = null//asignaciones.filter(asig => asig.mailProfesor === mail).filter(asig => asig.rol === "presidente");

  //habilitar y bloquear botones
  let guiaColor: any;
  let inforColor: any;
  let guiaCond = true;
  let inforCond = true;
  if(asigsGuia.length === 0){
    guiaCond = false;
    guiaColor = 'red';
  }
  if(asigsInformante.length === 0){
    inforCond = false;
    inforColor = 'red';
  }
  
  //columnas guia
  const columnsGuia: GridColDef[] = [
    { field: 'rut', headerName: 'RUT', width: 90 },
    { field: 'Estudiante', headerName: 'Estudiante', width: 200 },
    { field: 'fecha', headerName: 'Fecha', width:90},
    { field: 'nota', headerName: 'Nota', width:50},
    { field: 'estado', headerName: 'Estado', width: 90},
    { field: 'gestionamiento', headerName: 'Gestionamiento', width:300, renderCell: (params)=> <Button onClick={() => {
      setShowpaginaGuia(true); 
      setFilaSeleccionada(params.row); 
    }} 
    >
      Gestionar Documentos y Nota
    </Button>},
    
  ];

  //filas guia
  useEffect(() => {
  if (!asigsGuia.length) {
    setFilasGuia([]);
    return;
  }

  const nuevasFilas = asigsGuia.map(asig => ({
    rut: asig.id,
    Estudiante: estudiantes.find(est => est.mail === asig.mailEstudiante)
                  ? `${estudiantes.find(est => est.mail === asig.mailEstudiante)?.nombre} 
                  ${estudiantes.find(est => est.mail === asig.mailEstudiante)?.apellido} 
                  ${estudiantes.find(est => est.mail === asig.mailEstudiante)?.segundoApellido}`
                  : '-',
    fecha: asig.fechaAsignacion,
    nota: notas.find(not => not.mailEstudiante === asig.mailEstudiante)?.notaGuia ?? '---',
    estado: estados.find(est => est.mailEstudiante === asig.mailEstudiante)?.estado 
  }));

  setFilasGuia(nuevasFilas);
}, [asigsGuia, estudiantes, notas]);


  //columnas informante
  const columnsInformante: GridColDef[] = [
    { field: 'rut', headerName: 'RUT', width: 90 },
    { field: 'Estudiante', headerName: 'Estudiante', width: 200 },
    { field: 'fecha', headerName: 'Fecha', width:90},
    { field: 'nota', headerName: 'Nota', width:50},
    { field: 'estado', headerName: 'Estado', width: 90},
    { field: 'gestionamiento', headerName: 'Gestionamiento', width:300, renderCell: (params)=> <Button onClick={() => {
      setShowpaginaGuia(true); 
      setFilaSeleccionada(params.row); 
    }} 
    >
      Gestionar Documentos y Nota
    </Button>},
    
  ];

  //filas informante
  useEffect(() => {
  if (!asigsInformante.length) {
    setFilasInformante([]);
    return;
  }

  const nuevasFilas = asigsInformante.map(asig => ({
    rut: asig.id,
    Estudiante: estudiantes.find(est => est.mail === asig.mailEstudiante)
                  ? `${estudiantes.find(est => est.mail === asig.mailEstudiante)?.nombre} 
                  ${estudiantes.find(est => est.mail === asig.mailEstudiante)?.apellido} 
                  ${estudiantes.find(est => est.mail === asig.mailEstudiante)?.segundoApellido}`
                  : '-',
    fecha: asig.fechaAsignacion,
    nota: notas.find(not => not.mailEstudiante === asig.mailEstudiante)?.notaGuia ?? '---',
    estado: estados.find(est => est.mailEstudiante === asig.mailEstudiante)?.estado
  }));

  setFilasInformante(nuevasFilas);
}, [asigsInformante, estudiantes, notas]);

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

    const handleGuardarNota = useCallback(
  (notaNueva: number, estadoNuevo: string) => {
    if (!filaSeleccionada) return;

    if (value === 'guia') {
      setFilasGuia(prev =>
        prev.map(f =>
          f.rut === filaSeleccionada.rut
            ? { ...f, nota: notaNueva, estado: estadoNuevo }
            : f
        )
      );
    }

    if (value === 'informante') {
      setFilasInformante(prev =>
        prev.map(f =>
          f.rut === filaSeleccionada.rut
            ? { ...f, nota: notaNueva, estado: estadoNuevo }
            : f
        )
      );
    }
  },
  [filaSeleccionada, value]
);


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
        
      </BottomNavigation>
      <Box>
        {showpaginaGuia && (
          <PageGestionamiento 
          fila={filaSeleccionada}
          onClose={() => setShowpaginaGuia(false)} 
          onGuardar={handleGuardarNota}
          estudiantes={estudiantes}
          />
          )}
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
type PageProps ={
  fila: any;
  estudiantes: Estudiante[];
  onGuardar: (notaNueva: number, estado:string) => void;
  onClose: () => void;
}
function PageGestionamiento({ onGuardar, onClose, fila, estudiantes}: PageProps){
  const [nota, setNota] = useState("");
  const mailEstudiante = estudiantes.find(est => est.rut === fila.rut)?.mail ?? null;
  const guardar = async (nota: string) => {
  try {
    const valor = Number(nota);
    let estadoNuevo: string;

    await axios.patch(`${__url}/notas/actualizar`, {
      mailEstudiante,
      tipoNota: "notaGuia",
      valor
    });

    if (valor >= 4) {
      estadoNuevo = "aceptado";
      await axios.patch(`${__url}/estados/actualizar`, {
        mailEstudiante,
        estado: estadoNuevo
      });
    } else {
      estadoNuevo = "rechazado";
      await axios.patch(`${__url}/estados/actualizar`, {
        mailEstudiante,
        estado: estadoNuevo
      });
    }

    
    onGuardar(valor, estadoNuevo);

  } catch (error) {
    console.error(error);
    alert("Error al guardar la nota");
  }
};


  return(
    <Box sx={{
      backgroundColor:'white', 
      position:'absolute', 
      zIndex: 1000, 
      top:"200px",
      left:"700px",
      height:"300px",
      width:"450px",
      borderRadius:'2px'
    }}>
      {/*Fila uno*/}
      <Box sx={{display:'flex', flexDirection:'row', }}>
        <Box sx={{backgroundColor: 'white', 
          display:'flex', 
          justifyContent:'center', 
          alignItems:'center', 
          width:'225px', 
          height:'50px',
          border:'1px solid black',}}
        >
          <h3>Gestión de Documentos</h3>
        </Box>
        <Box sx={{backgroundColor: 'white', 
          display:'flex', 
          justifyContent:'center', 
          alignItems:'center', 
          width:'225px', 
          height:'50px',
          border:'1px solid black',}}
        >
          <h3>Gestión Nota</h3>
        </Box>
      </Box>
      {/*Fila dos*/}
      <Box sx={{display:'flex', flexDirection:'row'}}>
        <Box sx={{
          display:'flex',
          flexDirection:'column',
          justifyContent:'center',
          alignItems:'center',
          width:'225px',
          height:'250px',
          textAlign:'center',
          border:'1px solid black',
        }}>
          <h4>Nota del guía</h4>
          <input type='text' value={nota} onChange={(e) => setNota(e.target.value)} placeholder="ejem: 6,3" style={{height:'30px',width:'100px', borderRadius:'10px', textAlign:'center'}}/>
          <p>Ingrese un valor entre 1 y 7. <br/> 
              (Con un solo decimal).
          </p>
          <Box sx={{
            display:'flex',
            flexDirection:'row'}}>
              <Stack spacing='30px' direction='row'>
                <Button 
                onClick={() => guardar(nota)} 
                sx={{ 
                  color:'white', 
                  background:'blue'}}
                >
                  GUARDAR
                </Button>
                <Button 
                onClick={() => {onClose();}} 
                sx={{ 
                  color:'white', 
                  background:'red'}}
                >
                  CERRAR
                </Button>
              </Stack>
            
          </Box>
        
        </Box>
        <Box sx={{
          display:'flex',
          flexDirection:'column',
          justifyContent:'center',
          alignItems:'center',
          width:'225px',
          height:'250px',
          border:'1px solid black',
          }}>
          <Stack spacing='8px'>
            <Button sx={{backgroundColor:'white', border:'2px solid black', color:'white', background:'blue', height:'40px', width:'190px'}}>Descargar Rúbrica</Button>
            <Button sx={{backgroundColor:'white', border:'2px solid black', color:'white', background:'blue', height:'40px', width:'190px'}}>Subir Rúbrica</Button>
            <Button sx={{backgroundColor:'white', border:'2px solid black', color:'white', background:'blue', height:'40px', width:'190px'}}>Descargar Tesis</Button>
            <Button sx={{backgroundColor:'white', border:'2px solid black', color:'white', background:'blue', height:'40px', width:'190px'}}>Subir Tesis</Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}