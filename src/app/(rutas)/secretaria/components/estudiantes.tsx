'use client'
import {Box, Card, Typography, Button, InputLabel, FormControl, Select, MenuItem, Input} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React, { useState, useEffect, useMemo} from 'react';
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
import { Estado } from '@/types/estados';
export interface filas{
    id: string;
    studentName: string;
    mail: string;
    estado: string;
    hora: string;
    fechaExamen: string;
}

function Estudiantes() {

    const [showPageNota, setShowPageNota] = useState(false);
    const [showPageEstado, setShowPageEstado] = useState(false); 
    const [showPageExamen, setShowPageExamen] = useState(false);
    const [filaSeleccionada, setFilaSeleccionada] = useState<filas>();
    //Sede de la secretaria que ingresó
    const searchParams = useSearchParams();
    const sede = searchParams.get("sede");
    
    const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
    const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
    const [notas, setNotas] = useState<Notas[]>([]);
    const [fichas, setFichas] = useState<Ficha[]>([]);
    const [guias, setGuias] = useState<Guia[]>([]);
    const [informantes, setInformantes] = useState<Informante[]>([]);
    const [tesis, setTesis] = useState<Tesis[]>([]);
    const [estados, setEstados] = useState<Estado[]>([]);
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
            const estRes = await axios.get(`${__url}/estados/todos`);
            setAsignaciones(asigRes.data);
            setEstudiantes(estuRes.data);
            setNotas(notaRes.data);
            setFichas(fichaRes.data);
            setGuias(guiaRes.data);
            setInformantes(infoRes.data);
            setTesis(tesRes.data);
            setEstados(estRes.data);
        } catch {
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

    const asigsUnicas = useMemo(() => {
            const asigUnicas: Asignacion[] = [];
            for(let i = 0; i < estudiantes.length; i++){
                const asigsEstu = asignaciones.filter(asig => asig.mailEstudiante === estudiantes[i].mail);
                if(asigsEstu.length >= 1){
                    asigUnicas.push(asigsEstu[0]);
                }
            }
            return asigUnicas;
        }, [asigsSede]);
    //Muestra si el estudiante tiene los documentos y las notas subidas, y revisa si estas ultimas son por encima del 4
    const docus_notas = (nombreEstu: string, rolNota: string) => {
        const mailestudiante = estudiantes.find(est => (est.nombre + " " + est.segundoNombre + " " + est.apellido + " " + est.segundoApellido) === nombreEstu)?.mail;
        if(!mailestudiante){
            return;
        }
        const asig = asigsSede.find(asig => asig.mailEstudiante === mailestudiante);
        if(!asig){
            return "";
        }
        const grupoNotas = notas.find(nota => nota.mailEstudiante === asig.mailEstudiante);
        
        const notaGuia = grupoNotas?.notaGuia;
        const notaInformante = grupoNotas?.notaInformante
        const notaTesis = grupoNotas?.notaTesis;
        const notaOral = grupoNotas?.notaExamenOral;
        const notaFinal = grupoNotas?.notaFinal;
        if(!nombreEstu){
            return ""
        }
        
        let fila1;
        let fila2;
        let caja;
        switch (rolNota){
            case "notaGuia":
                const guia = guias.find(gui => gui.mailEstudiante === mailestudiante)?.nombreArchivo;
                if(guia){
                    fila1 = 
                    <Box sx = {{display:'flex', flexDirection:'row', alignItems:'center', width:'50%', }}>
                        <p className={estilo.p}>Rúbrica: </p>
                        <MoodTwoToneIcon sx={{color:'green'}}/>
                    </Box>
                    ;
                }
                else{
                    fila1 =
                        <Box sx = {{display:'flex', flexDirection:'row', alignItems:'center', width:'50%', }}>
                            <p className={estilo.p}>Rúbrica: </p>
                            <MoodBadTwoToneIcon sx={{color:'red'}}/>
                        </Box>
                    ;
                }

                if(Number(notaGuia) >= 4){
                    fila2 = 
                    <Box sx = {{display:'flex', flexDirection:'row', alignItems:'center', width:'100%', }}>
                        <p className={estilo.p}>Nota: {notaGuia} </p>
                        <MoodTwoToneIcon sx={{color:'green'}}/>
                    </Box>
                }else if(Number(notaGuia) < 4 || !notaGuia){
                    fila2 = 
                    <Box sx = {{display:'flex', flexDirection:'row', alignItems:'center', width:'100%', }}>
                        <p className={estilo.p}>Nota: {notaGuia} </p>
                        <MoodBadTwoToneIcon sx={{color:'red'}}/>
                    </Box>
                }
                caja = 
                    <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    justifyContent: 'center', 
                    width: '100%',
                    height: '100%',
                    gap: 0.5,
                    paddingY: '2px'}}
                    >
                        {fila1}
                        {fila2}
                    </Box>
                    return caja;
            case "notaInformante":
                const informante = informantes.find(inf => inf.mailEstudiante === mailestudiante)?.nombreArchivo;
                if(informante){
                    fila1 = 
                    <Box sx = {{display:'flex', flexDirection:'row', alignItems:'center', width:'100%', }}>
                        <p className={estilo.p}>Rúbrica: </p>
                        <MoodTwoToneIcon sx={{color:'green'}}/>
                    </Box>
                    ;
                }
                else{
                    fila1 =
                        <Box sx = {{display:'flex', flexDirection:'row', alignItems:'center', width:'50%', }}>
                            <p className={estilo.p}>Rúbrica: </p>
                            <MoodBadTwoToneIcon sx={{color:'red'}}/>
                        </Box>
                    ;
                }

                if(Number(notaInformante) >= 4){
                    fila2 = 
                    <Box sx = {{display:'flex', flexDirection:'row', alignItems:'center', width:'100%', }}>
                        <p className={estilo.p}>Nota: {notaInformante} </p>
                        <MoodTwoToneIcon sx={{color:'green'}}/>
                    </Box>
                }else if(Number(notaInformante) < 4 || !notaInformante){
                    fila2 = 
                    <Box sx = {{display:'flex', flexDirection:'row', alignItems:'center', width:'100%', }}>
                        <p className={estilo.p}>Nota: {notaInformante} </p>
                        <MoodBadTwoToneIcon sx={{color:'red'}}/>
                    </Box>
                }
                caja = 
                    <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    justifyContent: 'center', 
                    width: '100%',
                    height: '100%',
                    gap: 0.5,
                    paddingY: '2px'}}
                    >
                        {fila1}
                        {fila2}
                    </Box>
                    return caja;
            
            case "notaTesis":
                const tesi = tesis.find(tes => tes.mailEstudiante === mailestudiante)?.nombreArchivo;
                if(tesi){
                    fila1 = 
                    <Box sx = {{display:'flex', flexDirection:'row', alignItems:'center', width:'50%', }}>
                        <p className={estilo.p}>Tesis: </p>
                        <MoodTwoToneIcon sx={{color:'green'}}/>
                    </Box>
                    ;
                }
                else{
                    fila1 =
                        <Box sx = {{display:'flex', flexDirection:'row', alignItems:'center', width:'50%', }}>
                            <p className={estilo.p}>Tesis: </p>
                            <MoodBadTwoToneIcon sx={{color:'red'}}/>
                        </Box>
                    ;
                }

                if(Number(notaTesis) >= 4){
                    fila2 = 
                    <Box sx = {{display:'flex', flexDirection:'row', alignItems:'center', width:'100%', }}>
                        <p className={estilo.p}>Nota: {notaTesis} </p>
                        <MoodTwoToneIcon sx={{color:'green'}}/>
                    </Box>
                }else if(Number(notaTesis) < 4 || !notaTesis){
                    fila2 = 
                    <Box sx = {{display:'flex', flexDirection:'row', alignItems:'center', width:'100%', }}>
                        <p className={estilo.p}>Nota: {notaTesis} </p>
                        <MoodBadTwoToneIcon sx={{color:'red'}}/>
                    </Box>
                }
                caja = 
                    <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    gap: 0.5,
                    paddingY: '2px'}}
                    >
                        {fila1}
                        {fila2}
                    </Box>
                    return caja;
            
            case "ficha":
                const ficha = fichas.find(fic => fic.mailEstudiante === mailestudiante)?.nombreArchivo;
                if(ficha){
                    return <MoodTwoToneIcon sx={{color:'green'}} />
                }
                else{
                    return <MoodBadTwoToneIcon sx={{color:'red'}}/>
                }
            break;
            case "notaExamenOral":
                if(Number(notaOral) >= 4){
                    return(
                        <Box sx = {{display:'flex', flexDirection:'row', alignItems:'center', width:'100%', }}>
                            <p className={estilo.p}>Defensa: {notaOral} </p>
                            <MoodTwoToneIcon sx={{color:'green'}}/>
                        </Box>
                    )
                }else if(Number(notaOral) < 4 || !notaOral){
                    return( 
                        <Box sx = {{display:'flex', flexDirection:'row', alignItems:'center', width:'100%', }}>
                            <p className={estilo.p}>Defensa: {notaOral} </p>
                            <MoodBadTwoToneIcon sx={{color:'red'}}/>
                        </Box>
                    )
                }
                break;
            case "notaFinal":
                if(Number(notaFinal) >= 4){
                    return(
                        <Box sx = {{display:'flex', flexDirection:'row', alignItems:'center', width:'100%', }}>
                            <p className={estilo.p}>Nota: {notaFinal} </p>
                            <MoodTwoToneIcon sx={{color:'green'}}/>
                        </Box>
                    )
                }else if(Number(notaFinal) < 4 || !notaFinal){
                    return( 
                        <Box sx = {{display:'flex', flexDirection:'row', alignItems:'center', width:'100%', }}>
                            <p className={estilo.p}>Nota: {notaFinal} </p>
                            <MoodBadTwoToneIcon sx={{color:'red'}}/>
                        </Box>
                    )
                }
                break;
            default:
            break;
        }
    }

    const assignmentColumns: GridColDef<filas>[] = [
    { field: 'id', headerName: 'id', width: 50},
        { field: 'studentName', headerName: 'Estudiante', width: 100, renderCell: (params) => (
            <Box style={{ 
                whiteSpace: 'pre-line',
                lineHeight: 1.4,
                display: 'flex',
                alignItems: 'center',
                height: '100%',
            }}>
                {params.value}
            </Box>
            )
        },
        { field: 'mail', headerName: 'Correo', width: 100},
        { field: 'estado', headerName: 'Estado', width: 90},
        { field: 'fechaExamen', headerName: 'Fecha Examen', width: 100},
        { field: 'hora', headerName: 'Hora Examen', width: 100},
        { field: 'ficha', headerName: 'Ficha Académica', width: 120, renderCell: (params) => {
            return(
                <Box sx = {{display:'flex', justifyContent:'center', alignItems:'center', width:'100%', height:'100%', gap:3}}>
                    {docus_notas(params.row.studentName, params.field)}
                </Box>
            )}
        },
        { field: 'notaGuia', headerName: 'Nota Guía', width: 100, renderCell: (params) => {
            return(
                <Box sx = {{display:'flex', justifyContent:'center', alignItems:'center', width:'100%', height:'100%', gap:3}}>
                        
                    {docus_notas(params.row.studentName, params.field)}
                </Box>
            )}
        },
        { field: 'notaInformante', headerName: 'Nota Informante', width: 120, renderCell: (params) => {
            return(
                <Box sx = {{display:'flex', justifyContent:'center', alignItems:'center', width:'100%', height:'100%', gap:3}}>
                    {docus_notas(params.row.studentName, params.field)}
                </Box>
            )}
        },
        { field: 'notaTesis', headerName: 'Nota Tesis', width: 100, renderCell: (params) => {
            return(
                <Box sx = {{display:'flex', justifyContent:'center', alignItems:'center', width:'100%', height:'100%', gap:3}}>
                    {docus_notas(params.row.studentName, params.field)}
                </Box>
            )}
        },
        { field: 'notaExamenOral', headerName: 'Nota Defensa', width: 120, renderCell: (params) => {
            return(
                <Box sx = {{display:'flex', justifyContent:'center', alignItems:'center', width:'100%', height:'100%', gap:3}}>
                    {docus_notas(params.row.studentName, params.field)}
                </Box>
            )
        }},
        { field: 'notaFinal', headerName: 'Nota Final', width: 90, renderCell: (params) => {
            return(
                <Box sx = {{display:'flex', justifyContent:'center', alignItems:'center', width:'100%', height:'100%', gap:3}}>
                    {docus_notas(params.row.studentName, params.field)}
                </Box>
            )
        }},
        { field: 'Gestionamiento', headerName: 'Gestionamiento', width: 250, renderCell: (params) => {
            return(
                <Box
                sx ={{
                        display:'flex',
                        flexDirection:'column',
                        justifyContent: 'center',
                        alignItems:'center',
                        height:'100%'
                    }}
                >
                    <Box
                    sx ={{
                        display:'flex',
                        flexDirection:'row',
                        justifyContent: 'center',
                        alignItems:'center'
                    }}
                    >
                        <Button
                        onClick={() => 
                        {
                            setShowPageNota(true);
                            setFilaSeleccionada(params.row);
                        }
                        }
                        >
                            Cambiar Nota
                        </Button>
                        <Button
                        onClick={() => {
                            setShowPageExamen(true);
                            setFilaSeleccionada(params.row)
                        }}>
                        Fecha examen
                        </Button>
                    </Box>
                    <Box
                    sx ={{
                        display:'flex',
                        flexDirection:'row',
                        justifyContent: 'center',
                        alignItems:'center'
                    }}
                    >
                    <Button
                    onClick={() => {
                        setShowPageEstado(true);
                        setFilaSeleccionada(params.row);
                    }}
                    >
                        Cambiar Estado
                    </Button>
                    <Button
                    onClick={() => descargarActa(params.row)}
                    >
                        Descargar Acta
                    </Button>
                    </Box>
                </Box>
            )
        }}
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
          if (!asigsUnicas.length) return [];
          const Filas = asigsUnicas.map(asig => {
                const estudiante = estudiantes.find(est => est.mail === asig.mailEstudiante);
                return {
                id: asig.id,
                studentName: nombreEstudiante(estudiante ?? null),
                mail: estudiante?.mail ?? '---',
                estado: estados.find(est => est.mailEstudiante === asig.mailEstudiante)?.estado ?? '',
                hora: estudiante?.hora ?? 'No establecido',
                fechaExamen: estudiante?.fechaExamen ?? 'No establecida'
            }
            
    });
          return Filas;
          }, [asigsUnicas, notas, estados, estudiantes]);
    
    const callActualizado = async(tipoCall: string) => {
        if(!tipoCall){
            return;
        }
        if(tipoCall === 'nota'){
            const actualizado = await axios.get(`${__url}/notas/todas`);
            setNotas(actualizado.data)
        }
        else if(tipoCall === 'estado'){
            const actualizado = await axios.get(`${__url}/notas/todas`);
            setEstados(actualizado.data)
        }
    }
    
    const descargarActa = async(fila: filas) => {
        const grupoNotas = notas.find(nota => nota.mailEstudiante === fila.mail);
        const notaGuia = grupoNotas?.notaGuia;
        const notaInformante = grupoNotas?.notaInformante
        const notaTesis = grupoNotas?.notaTesis;
        if(!notaGuia){
            alert('Falta la nota del Guia');
            return;
        }else if(!notaInformante){
            alert('Falta la nota del Informante');
            return;
        }else if(!notaTesis){
            alert('Falta la nota de la Tesis');
            return;
        }
        const response = await axios.post(`${__url}/word/acta`, {
            nombre: fila.studentName,
            notaGuia: String(notaGuia),
            notaInformante: String(notaInformante),
            notaFinal: String(notaTesis)
        },
    {
        responseType: 'blob'
    }
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `acta_${fila.studentName}.docx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    }
    return (
        <Box sx={{width: '100%' }}>
            <Card sx={{ mb: 3, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 3 }}>
                <Box sx={{ mt: 2, width: '100%' }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        A continuación se muestran los estudiantes actuales en el sistema
                    </Typography>
                    
                        {showPageNota && (
                            <ChangePage
                            action={() => setShowPageNota(false)}
                            fila={filaSeleccionada}
                            estudiantes={estusSede}
                            ActionAction={() => callActualizado('nota')}
                            />
                        )}
                        {showPageEstado && (
                            <StatePage
                            action={() => setShowPageEstado(false)}
                            fila={filaSeleccionada}
                            estudiantes={estusSede}
                            ActionAction={() => callActualizado('estado')}
                            />
                        )}
                        {showPageExamen && (
                            <ExamenPage
                            action={() => setShowPageExamen(false)}
                            fila={filaSeleccionada}
                            estudiantes={estudiantes}
                            ActionAction={() => callActualizado('examen')}
                            />
                        )}
                        <DataGrid
                            sx={{
                                position:'relative',
                                left:0
                            }}
                            rows={filasEstudiantes}
                            columns={assignmentColumns}
                            pageSizeOptions={[5, 10, 20]}
                            getRowId= {(row) => row.id }
                            rowHeight={100}
                            initialState={{
                                pagination: {
                                    paginationModel: { pageSize: 5 }
                                }
                            }}
                            checkboxSelection
                            disableRowSelectionOnClick
                        />
                    
                </Box>
            </Card >
        </Box >
    );
}

type PageProps = {
    fila: filas | undefined;
    estudiantes: Estudiante[];
    action: () => void;
    ActionAction: () => void;
}
export function ChangePage({action: onClose, fila, estudiantes, ActionAction: ActionAction}: PageProps){
    const [nota, setNota] = useState("");
    const [tipoNota, setTipoNota] = useState("")
    if(!fila){
        return;
    }
    const mailEstudiante = estudiantes.find(est => (est.nombre + " " + est.segundoNombre + " " + est.apellido + " " + est.segundoApellido) === fila.studentName)?.mail;
    console.log(mailEstudiante)
    if(!mailEstudiante){
        return null;
    }
    const guardar = async (nota: string) => {
        try {
            const valor = Number(nota);
            await axios.patch(`${__url}/notas/actualizar`, {
            mailEstudiante,
            tipoNota: tipoNota,
            valor
            });
            ActionAction();

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
              top:"70px",
              left:"1000px",
              height:"250px",
              width:"450px",
              borderRadius:'10px',
              borderColor:'black',
              border:1,
            }}>
            <Typography variant='h5' sx={{ mb: 2, textAlign: 'center' }}>
                Seleccione el tipo de nota que quiere cambiar
            </Typography>
            <FormControl fullWidth required> {/* Wrap rol Select in FormControl */}
                <InputLabel id="rol-select-label">Rol</InputLabel> {/* New InputLabel for Rol */}
                <Select
                    labelId="rol-select-label"
                    id="rol-select"
                    name="rol" // Important: Set the name to "rol"
                    value={tipoNota}
                    onChange={(e) => setTipoNota(e.target.value)}
                    label="Rol" // Label for the Select component
                    
                >
                    <MenuItem value=""><em>Selecciona una Nota</em></MenuItem>
                    <MenuItem value="notaGuia">Guía</MenuItem>
                    <MenuItem value="notaInformante">Informante</MenuItem>
                    <MenuItem value="notaExamenOral">Defensa</MenuItem>
                </Select>
            </FormControl>
            <Typography variant='h6' sx={{ mb: 2, textAlign: 'center' }}>
                Ingrese la nota
            </Typography>
            <Box sx = {{
                display: 'flex',
                justifyContent:'center'
            }}>
                <Input 
                placeholder='Ejemplo: 6.5'
                inputProps={{ style: { textAlign: 'center' } }}
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                />
            </Box>
            <Box
            sx={{
                display:'flex',
                flexDirection:'row',
                justifyContent:'center',
                alignItems:'center',
                position:'relative',
                top:'20px'
            }}
            >
                <Button
                onClick={() => guardar(nota)}
                >
                    GUARDAR    
                </Button>  
                <Button
                onClick={() => onClose()}>
                    CERRAR
                </Button>
            </Box>
            
        </Box>
    )
}

export function StatePage({action: onClose, fila, estudiantes, ActionAction: ActionAction}: PageProps){
    if(!fila){
        return;
    }
    const nombre = fila.studentName.split("\n")[0] + " " + fila.studentName.split("\n")[1];
    const mailEstudiante = estudiantes.find(est => (est.nombre + " " + est.segundoNombre + " " + est.apellido + " " + est.segundoApellido) === nombre)?.mail;
    const guardar = async(estado: string) => {
        try {
            await axios.patch(`${__url}/estados/actualizar`, {
                mailEstudiante,
                estado
            });
            ActionAction();
        } catch (error) {
            console.log(error);
        }
    }
    return(
        <Box
        sx={{
              backgroundColor:'white', 
              position:'absolute', 
              zIndex: 1001, 
              top:"70px",
              left:"1000px",
              height:"250px",
              width:"450px",
              borderRadius:'10px',
              borderColor:'black',
              border:1,
              display:'flex',
              flexDirection:'column',
              justifyContent:'center',
              alignItems:'center',
              gap:4
            }}
        >   
            <Box
            sx={{
                display:'flex',
                justifyContent:'center',
                alignItems:'center'
            }}
            >
                <Typography variant='h3'>
                    Escoja el estado
                </Typography>
            </Box>
            <Box
            sx={{
                display:'flex',
                justifyContent:'center',
                alignItems:'center',
                flexDirection:'row',
                gap:3
            }}
            >
                <Button
                onClick={() => guardar('aceptado')}
                sx={{
                    backgroundColor:'green',
                    color:'white'
                }}
                >
                    Aceptado
                </Button>
                <Button
                onClick={() => guardar('pendiente')}
                sx={{
                    backgroundColor:'chocolate',
                    color:'white'
                }}
                >
                    Pendiente
                </Button>
                <Button
                onClick={() => guardar('rechazado')}
                sx={{
                    backgroundColor:'red',
                    color:'white'
                }}
                >
                    Rechazado
                </Button>
            </Box>
            <Box
            sx={{
                position:'relative',
                left:'170px',
                top:'20px'
            }}
            >   
                <Button
                onClick={() => onClose()}
                >
                    Cerrar
                </Button>
            </Box>
        </Box>
    )
}

export function ExamenPage({action: onClose, fila, estudiantes, ActionAction: ActionAction}: PageProps){
    
    const [dia, setDia] = useState("");
    const [hora, setHora] = useState("");
    if(!fila){
        return;
    }
    
    const rutEstu = estudiantes.find(est => (est.nombre + " " + est.segundoNombre + " " + est.apellido + " " + est.segundoApellido) === fila.studentName)?.rut;
    const estudiante = estudiantes.find(est => (est.nombre + " " + est.segundoNombre + " " + est.apellido + " " + est.segundoApellido) === fila.studentName);
    if(!estudiante){
        return;
    }
    const guardar = async() => {
        try {
            console.log(estudiante)
            const diaExa = dia.split("/")[0];
            const mesExa = dia.split("/")[1];
            const añoExa = String(new Date().getFullYear());
            const fechaExamen = diaExa + "/" + mesExa + "/" + añoExa;
            console.log(rutEstu, "\n", estudiante.rut)
            await axios.patch(`${__url}/estudiante/actualizar/${estudiante.rut}`,{
                mail: estudiante.mail,
                nombre: estudiante.nombre,
                apellido: estudiante.apellido,
                rut: estudiante.rut,
                hora,
                fechaExamen
            })
            ActionAction();

        } catch (error) {
            console.log(error);
        }
    }
    return(
        <Box
        sx={{
            backgroundColor:'white', 
              position:'absolute', 
              zIndex: 1001, 
              top:"70px",
              left:"1000px",
              height:"250px",
              width:"450px",
              borderRadius:'10px',
              borderColor:'black',
              border:1,
              display:'flex',
              flexDirection:'column',
              justifyContent:'center',
              alignItems:'center',
              gap:4
        }}
        >
            <Typography variant='h5' textAlign={'center'}>
                Indique fecha y hora del examen del estudiante
                <br/>
                {fila.studentName}
            </Typography>
            <Box
            sx={{
                display:'flex',
                flexDirection:'row',
                justifyContent:'center',
                alignItems:'center',
                gap:3
            }}
            >
               <Input 
                placeholder='Ejemplo: 05/06'
                inputProps={{ style: { textAlign: 'center' } }}
                value={dia}
                onChange={(e) => setDia(e.target.value)}
                /> 
                <Input
                placeholder='Ejemplos: 15:45 , 09:20'
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                inputProps={{style: {width:'160px'}}}
                />
            </Box>
            <Box
            sx={{
                display:'flex',
                flexDirection:'row',
                justifyContent:'center',
                alignItems:'center',
                gap:2
            }}
            >
                <Button
                onClick={guardar}
                >
                    guardar
                </Button>
                <Button
                onClick={onClose}
                >
                    cerrar
                </Button>
            </Box>
            
        </Box>
    )
}
export default Estudiantes;