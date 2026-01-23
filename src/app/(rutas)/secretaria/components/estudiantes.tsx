"use client"; // Required for client-side components in Next.js App Router

import { BottomNavigation, BottomNavigationAction, Box, Card, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React, { useState, useEffect, useMemo } from 'react';
import { Asignacion } from '@/types/asignacion';
import { Estudiante } from '@/types/estudiante';
import axios from 'axios';
import __url from '@/lib/const';
import { useSearchParams } from 'next/navigation';
import { Notas } from '@/types/notas';
import { Ficha } from '@/types/fichas_inscripcion';
import MoodBadTwoToneIcon from '@mui/icons-material/ClearOutlined';
import MoodTwoToneIcon from '@mui/icons-material/Done';
import estilo from "../style.module.css";
import { Guia } from '@/types/guias';
import { Informante } from '@/types/informante';
import { Tesis } from '@/types/tesis';

function Estudiantes() {
    
    //Sede de la secretaria que ingresó
    const searchParams = useSearchParams();
    const sede = searchParams.get("sede");
    interface filas {
        rut: string;
        studentName: string;
        /*notaGuia: string;
        notaInformante: string;
        notaTesis: string;
        notaDefensa: string;
        notaFinal: string;*/
    }
    const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
    const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
    const [notas, setNotas] = useState<Notas[]>([]);
    const [fichas, setFichas] = useState<Ficha[]>([]);
    const [guias, setGuias] = useState<Guia[]>([]);
    const [informantes, setInformantes] = useState<Informante[]>([]);
    const [tesis, setTesis] = useState<Tesis[]>([]);
    //traigo las asignaciones, los estudiante, los profesores, y los estados
    useEffect(() => {
    const datos_todos = async () => {
        try {
            const asigRes = await axios.get(`${__url}/asignaciones/todas`);
            const estuRes = await axios.get(`${__url}/estudiante/todos`);
            const notaRes = await axios.get(`${__url}/notas/todas`);
            const fichaRes = await axios.get(`${__url}/ficha/todas`);
            const guiaRes = await axios.get(`${__url}/guia/todas`);
            const infoRes = await axios.get(`${__url}/informante/todas`);
            const tesRes = await axios.get(`${__url}/tesis/todas`);
            setAsignaciones(asigRes.data);
            setEstudiantes(estuRes.data);
            setNotas(notaRes.data);
            setFichas(fichaRes.data);
            setGuias(guiaRes.data);
            setInformantes(infoRes.data);
            setTesis(tesRes.data);
        } catch (error) {
            console.log(error);
        }
    };
    datos_todos();
}, []);

    //filtro a los estudiantes por la sede
    const estusSede = useMemo(
        () => estudiantes.filter(est => est.sede === sede),
        [estudiantes, sede]
        );

    //filtro las asignaciones que tengan a los estudiantes de la misma sede del secretario
    const asigsSede = useMemo(() => {
        if (!asignaciones.length || !estusSede.length) return [];

        return asignaciones.filter(asig =>
            estusSede.some(est => est.mail === asig.mailEstudiante)
        );
    }, [asignaciones, estusSede]);

    const documentos = (rut: string, rolNota: string) => {
        const asig = asigsSede.find(asig => asig.id === rut);
        if(!asig){
            return "";
        }
        const grupoNotas = notas.find(nota => nota.mailEstudiante === asig.mailEstudiante);
                const notaGuia = grupoNotas?.notaGuia;
                const notaInformante = grupoNotas?.notaInformante
                const notaTesis = grupoNotas?.notaTesis;
                const notaFinal = grupoNotas?.notaFinal;
        if(!rut){
            return ""
        }
        const mailestudiante = estusSede.find(est => est.rut === rut)?.mail ;
        let fila1;
        let fila2;
        let caja;
        switch (rolNota){
            case "notaGuia":
                const guia = guias.find(gui => gui.mailEstudiante === mailestudiante)?.nombreArchivo;
                if(guia){
                    fila1 = 
                    <Box sx = {{display:'flex', flexDirection:'row', alignItems:'center', width:'50%', }}>
                        <p className={estilo.p}>Rúbrica Guía: </p>
                        <MoodTwoToneIcon sx={{color:'green'}}/>
                    </Box>
                    ;
                }
                else{
                    fila1 =
                        <Box sx = {{display:'flex', flexDirection:'row', alignItems:'center', width:'50%', }}>
                            <p className={estilo.p}>Rúbrica Guía: </p>
                            <MoodBadTwoToneIcon sx={{color:'red'}}/>
                        </Box>
                    ;
                }

                if(Number(notaGuia) >= 4){
                    fila2 = 
                    <Box sx = {{display:'flex', flexDirection:'row', alignItems:'center', width:'100%', }}>
                        <p className={estilo.p}>Nota Guía: {notaGuia} </p>
                        <MoodTwoToneIcon sx={{color:'green'}}/>
                    </Box>
                }else if(Number(notaGuia) < 4 || !notaGuia){
                    fila2 = 
                    <Box sx = {{display:'flex', flexDirection:'row', alignItems:'center', width:'100%', }}>
                        <p className={estilo.p}>Nota Guía: {notaGuia} </p>
                        <MoodBadTwoToneIcon sx={{color:'red'}}/>
                    </Box>
                }
                caja = 
                    <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    justifyContent: 'flex-start', 
                    width: '100%',
                    height: '100%',
                    gap: 0.5,
                    paddingY: '2px'}}
                    >
                        {fila1}
                        {fila2}
                    </Box>
                    return caja;
            break;
            case "notaInformante":
                const informante = informantes.find(inf => inf.mailEstudiante === mailestudiante)?.nombreArchivo;
                if(informante){
                    fila1 = 
                    <Box sx = {{display:'flex', flexDirection:'row', alignItems:'center', width:'100%', }}>
                        <p className={estilo.p}>Rúbrica Informante: </p>
                        <MoodTwoToneIcon sx={{color:'green'}}/>
                    </Box>
                    ;
                }
                else{
                    fila1 =
                        <Box sx = {{display:'flex', flexDirection:'row', alignItems:'center', width:'50%', }}>
                            <p className={estilo.p}>Rúbrica Informante: </p>
                            <MoodBadTwoToneIcon sx={{color:'red'}}/>
                        </Box>
                    ;
                }

                if(Number(notaInformante) >= 4){
                    fila2 = 
                    <Box sx = {{display:'flex', flexDirection:'row', alignItems:'center', width:'100%', }}>
                        <p className={estilo.p}>Nota informante: {notaInformante} </p>
                        <MoodTwoToneIcon sx={{color:'green'}}/>
                    </Box>
                }else if(Number(notaInformante) < 4 || !notaInformante){
                    fila2 = 
                    <Box sx = {{display:'flex', flexDirection:'row', alignItems:'center', width:'100%', }}>
                        <p className={estilo.p}>Nota informante: {notaInformante} </p>
                        <MoodBadTwoToneIcon sx={{color:'red'}}/>
                    </Box>
                }
                caja = 
                    <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    justifyContent: 'flex-start', // 👈 CLAVE
                    width: '100%',
                    height: '100%',
                    gap: 0.5,
                    paddingY: '2px'}}
                    >
                        {fila1}
                        {fila2}
                    </Box>
                    return caja;
            break;
            case "notaTesis":
                const tesi = tesis.find(tes => tes.mailEstudiante === mailestudiante)?.nombreArchivo;
                if(tesi){
                    fila1 = 
                    <Box sx = {{display:'flex', flexDirection:'row', alignItems:'center', width:'50%', }}>
                        <p className={estilo.p}>Rúbrica Tesis: </p>
                        <MoodTwoToneIcon sx={{color:'green'}}/>
                    </Box>
                    ;
                }
                else{
                    fila1 =
                        <Box sx = {{display:'flex', flexDirection:'row', alignItems:'center', width:'50%', }}>
                            <p className={estilo.p}>Rúbrica Tesis: </p>
                            <MoodBadTwoToneIcon sx={{color:'red'}}/>
                        </Box>
                    ;
                }

                if(Number(notaGuia) >= 4){
                    fila2 = 
                    <Box sx = {{display:'flex', flexDirection:'row', alignItems:'center', width:'100%', }}>
                        <p className={estilo.p}>Nota Tesis: {notaTesis} </p>
                        <MoodTwoToneIcon sx={{color:'green'}}/>
                    </Box>
                }else if(Number(notaTesis) < 4 || !notaTesis){
                    fila2 = 
                    <Box sx = {{display:'flex', flexDirection:'row', alignItems:'center', width:'100%', }}>
                        <p className={estilo.p}>Nota Tesis: {notaTesis} </p>
                        <MoodBadTwoToneIcon sx={{color:'red'}}/>
                    </Box>
                }
                caja = 
                    <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    justifyContent: 'flex-start',
                    width: '100%',
                    height: '100%',
                    gap: 0.5,
                    paddingY: '2px'}}
                    >
                        {fila1}
                        {fila2}
                    </Box>
                    return caja;
            break;
            case "ficha":
                const ficha = fichas.find(fic => fic.mailEstudiante === mailestudiante)?.nombreArchivo;
                if(ficha){
                    return <MoodTwoToneIcon sx={{color:'green'}} />
                }
                else{
                    return <MoodBadTwoToneIcon sx={{color:'red'}}/>
                }
            break;
            default:
            break;
        }
        
        
    }


    const assignmentColumns: GridColDef<filas>[] = [
        { field: 'rut', headerName: 'rut', width: 100 },
        { field: 'studentName', headerName: 'Estudiante', width: 200 },
        { field: 'ficha', headerName: 'Ficha Académica', width: 120, renderCell: (params) => {
            return(
                <Box sx = {{display:'flex', justifyContent:'center', alignItems:'center', width:'100%', height:'100%', gap:3}}>
                    <p className = {estilo.p}>{documentos(params.row.rut, params.field)}</p>
                </Box>
            )}
        },
        { field: 'notaGuia', headerName: 'Nota Guía', width: 140, renderCell: (params) => {
            return(
                <Box sx = {{display:'flex', justifyContent:'center', alignItems:'center', width:'100%', height:'100%', gap:3}}>
                     
                    {documentos(params.row.rut, params.field)}
                </Box>
            )}
        },
        { field: 'notaInformante', headerName: 'Nota Informante', width: 140, renderCell: (params) => {
            return(
                <Box sx = {{display:'flex', justifyContent:'center', alignItems:'center', width:'100%', height:'100%', gap:3}}>
                    
                    <p className = {estilo.p}>{documentos(params.row.rut, params.field)}</p>
                </Box>
            )}
        },
        { field: 'notaTesis', headerName: 'Nota Tesis', width: 140, renderCell: (params) => {
            return(
                <Box sx = {{display:'flex', justifyContent:'center', alignItems:'center', width:'100%', height:'100%', gap:3}}>
                    {documentos(params.row.rut, params.field)}
                    <p className = {estilo.p}>{}</p>
                </Box>
            )}
        },
        { field: 'notaDefensa', headerName: 'Nota Defensa', width: 120},
        { field: 'notaFinal', headerName: 'Nota Final', width: 90 },
    ];
    const nombreEstudiante = (est: Estudiante | null) => {
        if(!est){
            return "";
        }
        const nombre = est.nombre 
        + " " 
        + est.segundoNombre 
        + " "
        + est.apellido
        + " "
        + est.segundoApellido
        return nombre;
    }

    
    const filasEstudiantes = useMemo(() => {
          if (!asigsSede.length) return [];
          const Filas = asignaciones.map(asig => {
                const estudiante = estusSede.find(est => est.mail === asig.mailEstudiante);
                const grupoNotas = notas.find(nota => nota.mailEstudiante === asig.mailEstudiante);
                const notaGuia = grupoNotas?.notaGuia;
                const notaInformante = grupoNotas?.notaInformante
                const notaTesis = grupoNotas?.notaTesis;
                const notaFinal = grupoNotas?.notaFinal;
                console.log(notaFinal)
                return {
                rut: estudiante?.rut ?? "",
                studentName: nombreEstudiante(estudiante ?? null),
                /*notaGuia: notaGuia ?? "---",
                notaInformante: notaInformante ?? "---", 
                notaTesis: notaTesis ?? "---",
                notaDefensa: "---",
                notaFinal: notaFinal ?? "---" */
                }
    });
          return Filas;
          }, [asignaciones]);
    

    interface NewAssignmentState {
        studentId: string;
        professorId: string;
        rol: string;
        description: string;
    }

    const [newAssignment, setNewAssignment] = useState<NewAssignmentState>({
        studentId: '',
        professorId: '',
        rol: '',
        description: '',
    });

    const handleFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
        const { name, value } = event.target;
        setNewAssignment(prev => ({ ...prev, [name as string]: value }));
    };

    const handleSubmitAssignment = async () => {
        // Validate required fields
        if (!newAssignment.studentId || !newAssignment.professorId || !newAssignment.rol) {
            alert('Por favor, completa todos los campos requeridos para la asignación (Estudiante, Profesor, Rol).');
            return;
        }

        // Here you would typically send this data to your backend API
        /*
        try {
            const response = await fetch('/api/create-assignment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newAssignment), // Send the entire newAssignment object
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Asignación creada exitosamente:', result);
                alert('Asignación creada exitosamente!');
                // Reset form
                setNewAssignment({
                    studentId: '',
                    professorId: '',
                    rol: '',
                    description: '',
                });
                // Optionally, refresh the DataGrid data if needed
            } else {
                const errorText = await response.text();
                console.error('Error al crear la asignación:', response.status, errorText);
                alert(`Error al crear la asignación: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('Error de red al crear la asignación:', error);
            alert('Error de red al crear la asignación.');
        }
        */
        alert('Asignación generada exitosamente (simulado)!');
        // Reset form after successful (simulated) submission
        setNewAssignment({
            studentId: '',
            professorId: '',
            rol: '',
            description: '',
        });
    };

    return (
        <Box sx={{ p: 3, width: '100%' }}>
            <Card sx={{ mb: 3, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 3 }}>
                <Box sx={{ mt: 2, width: '100%' }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        A continuación se muestran los estudiantes actuales en el sistema
                    </Typography>
                    <Box sx={{ height: 400, width: '100%' }}>
                        <DataGrid
                            rows={filasEstudiantes}
                            columns={assignmentColumns}
                            pageSizeOptions={[5, 10, 20]}
                            getRowId= {(row) => row.rut }
                            rowHeight={70}
                            initialState={{
                                pagination: {
                                    paginationModel: { pageSize: 5 }
                                }
                            }}
                            checkboxSelection
                            disableRowSelectionOnClick
                        />
                    </Box>
                </Box>
            </Card >
        </Box >
    );
}

export default Estudiantes;