"use client";
import { useEffect, useState, useMemo} from "react";
import React from 'react'
import { Box, Button, Stack, TextField} from '@mui/material'; // Added Select, MenuItem, FormControl, InputLabel
import { Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { GridColDef} from '@mui/x-data-grid';
import { Asignacion } from '@/types/asignacion';
import axios from 'axios';
import __url from '@/lib/const';
import { Estudiante } from "@/types/estudiante";
import { useSearchParams } from "next/navigation";
import { Notas } from "@/types/notas";
import { useCallback } from "react";

export interface filas{
  rut: string;
    Estudiante: string;
    fecha: string;
    nota: number | string;
}
function PresidenteContent() {

  //state para mostrar componente hijo 
  const [showpaginaGuia, setShowpaginaGuia] = useState(false);
  //state para sellecionar fila que se enviará al componente hijo
  const [filaSeleccionada, setFilaSeleccionada] = useState<filas>();
  //state para las filas de la tabla de guia
  const [filasPresidente, setFilasGuia] = useState<filas[]>([]);

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
  const asigsPresidente = useMemo(() => {
    return asignaciones.filter(a => a.mailProfesor === mail && a.rol === 'guia');
  }, [asignaciones, mail]);

  //columnas presidente
  const columnsPresidente: GridColDef[] = [
    { field: 'rut', headerName: 'RUT', width: 90 },
    { field: 'Estudiante', headerName: 'Estudiante', width: 200 },
    { field: 'fecha', headerName: 'Fecha', width:90},
    { field: 'nota', headerName: 'Nota', width:50},
    { field: 'gestionamiento', headerName: 'Gestionamiento', width:300, renderCell: (params)=> <Button onClick={() => {
      setShowpaginaGuia(true); 
      setFilaSeleccionada(params.row); 
    }} 
    >
      Gestionar Nota
    </Button>},
  
  ];
  
  //filas presidente
    useEffect(() => {
    if (!asigsPresidente.length) {
      setFilasGuia([]);
      return;
    }
  
    const nuevasFilas = asigsPresidente.map(asig => ({
        rut: estudiantes.find(est => est.mail === asig.mailEstudiante)?.rut ?? "---",
        Estudiante: `${estudiantes.find(est => est.mail === asig.mailEstudiante)?.nombre} ${estudiantes.find(est => est.mail === asig.mailEstudiante)?.apellido} ${estudiantes.find(est => est.mail === asig.mailEstudiante)?.segundoApellido}`,
        fecha: asig.fechaAsignacion,
        nota: notas.find(not => not.mailEstudiante === asig.mailEstudiante)?.notaExamenOral ?? '---'
      }));
  
    setFilasGuia(nuevasFilas);
  }, [asigsPresidente, estudiantes, notas]);

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
        <Box sx={{ p: 3, width: '100%', height: 400 }}> {/* Ensure height is set for DataGrid */}
            <Typography variant='h2'>Sección Presidente</Typography>
            <Typography variant='body1'>Administra las decisiones y la dirección general.</Typography>
            {showpaginaGuia && (
            <PageGestionamiento 
            fila={filaSeleccionada}
            onClose={() => setShowpaginaGuia(false)} 
            onGuardar={handleGuardarNota}
            estudiantes={estudiantes}
            />
            )}
            <DataGrid
                rows={filasPresidente}
                columns={columnsPresidente}
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

export default PresidenteContent;
type PageProps ={
  fila: filas | undefined;
  estudiantes: Estudiante[];
  onGuardar: (notaNueva: number) => void;
  onClose: () => void;
}
function PageGestionamiento({ onGuardar, onClose, fila, estudiantes}: PageProps){
  
  const [nota, setNota] = useState("");
  if(!fila){
    return;
  }
  const mailEstudiante = estudiantes.find(est => (est.nombre + " " + est.apellido + " " + est.segundoApellido) === fila.Estudiante)?.mail ?? null;
  if(!mailEstudiante){
    return;
  }
  
  const guardar = async (nota: string) => {
    try {
      const valor = Number(nota);
      await axios.patch(`${__url}/notas/actualizar`, {
        mailEstudiante,
        tipoNota: "notaExamenOral",
        valor
      });
      onGuardar(valor);

    } catch{
      alert("Error al guardar la nota");
    }
  };
  
  return(
    <Box sx={{
      backgroundColor:'white', 
      position:'absolute', 
      zIndex: 1000, 
      top:"100px",
      left:"800px",
      height:"400px",
      width:"550px",
      borderColor:'black',
      border:1,
      borderRadius:'20px'
    }}>
      <Typography variant='h5' sx={{ mb: 2, textAlign: 'center' }}>
          Indique la acción que quiere realizar
      </Typography>
      <Box 
      sx={{
        display:'flex',
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center'
      }}
      >
      </Box>
      <Box
      position='relative'
      top='50px'
      >
        <Box
        sx={{
          display:'flex',
          justifyContent:'center',
          flexDirection:'column',
          alignItems:'center'
        }}
        >
          <Typography variant='h6' sx={{ mb: 2, textAlign: 'center' }}>
              Nota Defensa Oral
          </Typography>
          <TextField
            label="Ejemplo: 6.5" 
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            sx={{ width: '120px', height: '50px' }}
          />
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
      </Box>
      
      
    </Box>
  );
}