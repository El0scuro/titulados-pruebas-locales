'use client'
import {Box, Card, Typography, Button, InputLabel, FormControl, Select, MenuItem, SelectChangeEvent, Input} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

function Estudiantes() {
    
    const [showPageNota, setShowPageNota] = useState(false);
    const [showPageEstado, setShowPageEstado] = useState(false); 
    const [filaSeleccionada, setFilaSeleccionada] = useState<any>("");
    //Sede de la secretaria que ingresó
    const searchParams = useSearchParams();
    const sede = searchParams.get("sede");
    interface filas {
        rut: string;
        studentName: string;
        estado: string;
    }
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

    //Muestra si el estudiante tiene los documentos y las notas subidas, y revisa si estas ultimas son por encima del 4
    const docus_notas = (rut: string, rolNota: string) => {
        const asig = asigsSede.find(asig => asig.id === rut);
        if(!asig){
            return "";
        }
        const grupoNotas = notas.find(nota => nota.mailEstudiante === asig.mailEstudiante);
        const notaGuia = grupoNotas?.notaGuia;
        const notaInformante = grupoNotas?.notaInformante
        const notaTesis = grupoNotas?.notaTesis;
        const notaOral = grupoNotas?.notaExamenOral;
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
                            <p className={estilo.p}>Tesis: </p>
                            <MoodBadTwoToneIcon sx={{color:'red'}}/>
                        </Box>
                    ;
                }

                if(Number(notaTesis) >= 4){
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
            case "notaExamenOral":
                if(Number(notaOral) >= 4){
                    return(
                        <Box sx = {{display:'flex', flexDirection:'row', alignItems:'center', width:'100%', }}>
                            <p className={estilo.p}>Nota Defensa: {notaOral} </p>
                            <MoodTwoToneIcon sx={{color:'green'}}/>
                        </Box>
                    )
                }else if(Number(notaOral) < 4 || !notaOral){
                    return( 
                        <Box sx = {{display:'flex', flexDirection:'row', alignItems:'center', width:'100%', }}>
                            <p className={estilo.p}>Nota Defensa: {notaOral} </p>
                            <MoodBadTwoToneIcon sx={{color:'red'}}/>
                        </Box>
                    )
                }
                break;
            case "notaFinal":
                if(Number(notaFinal) >= 4){
                    return(
                        <Box sx = {{display:'flex', flexDirection:'row', alignItems:'center', width:'100%', }}>
                            <p className={estilo.p}>Nota Final: {notaFinal} </p>
                            <MoodTwoToneIcon sx={{color:'green'}}/>
                        </Box>
                    )
                }else if(Number(notaFinal) < 4 || !notaFinal){
                    return( 
                        <Box sx = {{display:'flex', flexDirection:'row', alignItems:'center', width:'100%', }}>
                            <p className={estilo.p}>Nota Final: {notaFinal} </p>
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
        { field: 'rut', headerName: 'rut', width: 100 },
        { field: 'studentName', headerName: 'Estudiante', width: 200 },
        { field: 'estado', headerName: 'Estado', width: 90},
        { field: 'ficha', headerName: 'Ficha Académica', width: 120, renderCell: (params) => {
            return(
                <Box sx = {{display:'flex', justifyContent:'center', alignItems:'center', width:'100%', height:'100%', gap:3}}>
                    {docus_notas(params.row.rut, params.field)}
                </Box>
            )}
        },
        { field: 'notaGuia', headerName: 'Nota Guía', width: 140, renderCell: (params) => {
            return(
                <Box sx = {{display:'flex', justifyContent:'center', alignItems:'center', width:'100%', height:'100%', gap:3}}>
                     
                    {docus_notas(params.row.rut, params.field)}
                </Box>
            )}
        },
        { field: 'notaInformante', headerName: 'Nota Informante', width: 150, renderCell: (params) => {
            return(
                <Box sx = {{display:'flex', justifyContent:'center', alignItems:'center', width:'100%', height:'100%', gap:3}}>
                    {docus_notas(params.row.rut, params.field)}
                </Box>
            )}
        },
        { field: 'notaTesis', headerName: 'Nota Tesis', width: 140, renderCell: (params) => {
            return(
                <Box sx = {{display:'flex', justifyContent:'center', alignItems:'center', width:'100%', height:'100%', gap:3}}>
                    {docus_notas(params.row.rut, params.field)}
                </Box>
            )}
        },
        { field: 'notaExamenOral', headerName: 'Nota Defensa', width: 120, renderCell: (params) => {
            return(
                <Box sx = {{display:'flex', justifyContent:'center', alignItems:'center', width:'100%', height:'100%', gap:3}}>
                    {docus_notas(params.row.rut, params.field)}
                </Box>
            )
        }},
        { field: 'notaFinal', headerName: 'Nota Final', width: 90, renderCell: (params) => {
            return(
                <Box sx = {{display:'flex', justifyContent:'center', alignItems:'center', width:'100%', height:'100%', gap:3}}>
                    {docus_notas(params.row.rut, params.field)}
                </Box>
            )
        }},
        { field: 'Gestionamiento', headerName: 'Gestionamiento', width: 120, renderCell: (params) => {
            return(
                <Box
                sx ={{
                        display:'flex',
                        flexDirection:'column',
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
                    onClick={() => descargarActa(params.row)}
                    >
                        Descargar Acta
                    </Button>
                    <Button
                    onClick={() => {
                        setShowPageEstado(true);
                        setFilaSeleccionada(params.row);
                    }}
                    >
                        Cambiar Estado
                    </Button>
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
          if (!asigsSede.length) return [];
          const Filas = asignaciones.map(asig => {
                const estudiante = estusSede.find(est => est.mail === asig.mailEstudiante);
                return {
                rut: estudiante?.rut ?? "",
                studentName: nombreEstudiante(estudiante ?? null),
                estado: estados.find(est => est.mailEstudiante === asig.mailEstudiante)?.estado ?? '' 
                }
    });
          return Filas;
          }, [asignaciones, notas]);
    
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
    
    const descargarActa = async(fila: any) => {
        const grupoNotas = notas.find(nota => nota.id === fila.rut);
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
        <Box sx={{ p: 3, width: '100%' }}>
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
                        <DataGrid
                            rows={filasEstudiantes}
                            columns={assignmentColumns}
                            pageSizeOptions={[5, 10, 20]}
                            getRowId= {(row) => row.rut }
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
    fila: any;
    estudiantes: Estudiante[];
    action: () => void;
    ActionAction: (notaNueva: number, mailEstudiante: string, tipoNota: string) => void;
}
export function ChangePage({action: onClose, fila, estudiantes, ActionAction: ActionAction}: PageProps){
    const [nota, setNota] = useState("");
    const [tipoNota, setTipoNota] = useState("")
    const mailEstudiante = estudiantes.find(est => est.rut === fila.rut)?.mail ?? null;
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
    ActionAction(valor, mailEstudiante, tipoNota);

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
              border:1
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
export function StatePage({action: onClose}: PageProps){
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
              border:1
            }}
        >
            <h1>
                aaaaaaaaaaaa
            </h1>
            <Box
            sx={{
                display:'flex',
                flexDirection:'row',
                justifyContent:'center',
                alignItems:'center',
                gap:2
            }}
            >   
                <Button>
                    Guardar
                </Button>
                <Button
                onClick={() => onClose()}
                >
                    Cerrar
                </Button>
            </Box>
        </Box>
    )
}
export default Estudiantes;