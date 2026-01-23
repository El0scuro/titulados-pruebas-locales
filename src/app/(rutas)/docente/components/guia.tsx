"use client";
import { useEffect, useState, useMemo, use} from "react";
import React from 'react'
import { Box, Button, Stack} from '@mui/material'; // Added Select, MenuItem, FormControl, InputLabel
import { Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { Asignacion } from '@/types/asignacion';
import axios from 'axios';
import __url from '@/lib/const';
import { Estudiante } from "@/types/estudiante";
import { Profesor } from "@/types/profesor";
import { useSearchParams } from "next/navigation";
import { Notas } from "@/types/notas";
import { useCallback } from "react";
import estilo from "../style.module.css";


function GuiaContent() {
  
  //state para mostrar componente hijo 
  const [showpaginaGuia, setShowpaginaGuia] = useState(false);
  //state para sellecionar fila que se enviará al componente hijo
  const [filaSeleccionada, setFilaSeleccionada] = useState<any>("");

  //state para las filas de la tabla de guia
  const [filasGuia, setFilasGuia] = useState<any[]>([]);

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

  //filtro las asignaciones con el profesor que ingresó, y las cuales sean con el rol 'guia'
  const asigsGuia = useMemo(() => {
    return asignaciones.filter(a => a.mailProfesor === mail && a.rol === 'guia');
  }, [asignaciones, mail]);
  //columnas guia
  const columnsGuia: GridColDef[] = [
    { field: 'rut', headerName: 'RUT', width: 90 },
    { field: 'Estudiante', headerName: 'Estudiante', width: 200 },
    { field: 'fecha', headerName: 'Fecha', width:90},
    { field: 'nota', headerName: 'Nota', width:50},
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
    }));
  
    setFilasGuia(nuevasFilas);
  }, [asigsGuia, estudiantes, notas]);

  const handleGuardarNota = useCallback(
    (notaNueva: number) => {
      if (!filaSeleccionada) return;
        setFilasGuia(prev =>
          prev.map(f =>
            f.rut === filaSeleccionada.rut
              ? { ...f, nota: notaNueva}
              : f
          )
        );
      
    },
    [filaSeleccionada]
  );

  return (
    <Box sx={{ p: 3, width: '100%', height: 400 }}>
      <Typography variant='h2'>Sección Guía</Typography>
      <Typography variant='body1' sx={{ mb: 2 }}>Aquí encontrarás información y recursos para guiarte.</Typography>
      {showpaginaGuia && (
          <PageGestionamiento 
          fila={filaSeleccionada}
          onClose={() => setShowpaginaGuia(false)} 
          onGuardar={handleGuardarNota}
          estudiantes={estudiantes}
          />
          )}
      <DataGrid
        rows={filasGuia}
        columns={columnsGuia}
        pageSizeOptions={[5, 10]}
        getRowId= {(row) => row.rut }
        initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
      />
    </Box>
  )
}
type PageProps ={
  fila: any;
  estudiantes: Estudiante[];
  onGuardar: (notaNueva: number) => void;
  onClose: () => void;
}
function PageGestionamiento({ onGuardar, onClose, fila, estudiantes}: PageProps){
  const [nota, setNota] = useState("");
  const mailEstudiante = estudiantes.find(est => est.rut === fila.rut)?.mail ?? null;
  const guardar = async (nota: string) => {
  try {
    const valor = Number(nota);
    await axios.patch(`${__url}/notas/actualizar`, {
      mailEstudiante,
      tipoNota: "notaGuia",
      valor
    });
    onGuardar(valor);

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
          <input type='text' value={nota} onChange={(e) => setNota(e.target.value)} placeholder="ejem: 6,3" className={estilo.style}/>
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
export default GuiaContent