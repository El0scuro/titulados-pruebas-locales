"use client"; // Required for client-side components in Next.js App Router
import { BottomNavigation, BottomNavigationAction, Box, Card, Typography, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React, { useEffect, useState, useMemo } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddBoxIcon from '@mui/icons-material/AddBox';
import SendIcon from '@mui/icons-material/Send';
import { SelectChangeEvent } from '@mui/material/Select';
import axios from 'axios';
import __url from '@/lib/const';
import { Estudiante } from '@/types/estudiante';
import { Profesor } from '@/types/profesor';
import { Asignacion } from '@/types/asignacion';
import { Estado } from '@/types/estados';
import { useSearchParams } from 'next/navigation';

function Asignaciones() {

    //Sede de la secretaria que ingresó
    const searchParams = useSearchParams();
    const sede = searchParams.get("sede");

    const [viewValue, setViewValue] = useState<'ver' | 'crear'>('ver');
    const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
    const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
    const [profesores, setProfesores] = useState<Profesor[]>([]);
    const [estados, setEstados] = useState<Estado[]>([]);
    const [finished, setFinished] = useState(true);

    //molde rellenable de la asignación
    const [newAssignment, setNewAssignment] = useState<NewAssignmentState>({
        mailEstudiante: '',
        mailProfesor: '',
        rol: '',
    });

    //cargo los estudiantes y los profesores desde el back
    useEffect(() => {
    const datos_todos = async () => {
        try {
            const [estRes, proRes, estaRes] = await Promise.all([
                axios.get(`${__url}/estudiante/todos`),
                axios.get(`${__url}/profesor/todos`),
                axios.get(`${__url}/estados/todos`)
            ]);
            setEstudiantes(estRes.data);
            setProfesores(proRes.data);
            setEstados(estaRes.data);
            
        } catch (error) {
            console.log(error);
        }
    };
    datos_todos();
}, []);
    
    //cargo las asignaciones cada vez que finished esté en true, y reinicia el estado de finished en caso de que cambie a true
    useEffect(() => {
        if(!finished){
            return;
        }

        const Asignaciones = async () => { 
            try{
                const datos = await axios.get(`${__url}/asignaciones/todas`);
                setAsignaciones(datos.data);
                setFinished(false);
            }catch(error){
                console.log(error);
            }
        };
        Asignaciones();
    }, [finished]);

    //filtro a los profesores y los estudiantes por la sede del secretario (valpo/santiago)
    const estusSede = useMemo(
    () => estudiantes.filter(est => est.sede === sede),
    [estudiantes, sede]
    );

    const profeSede = useMemo(
    () => profesores.filter(pro => pro.sede === sede),
    [profesores, sede]
    );

    //filtro las asignaciones que tengan a los profesores de la misma sede del secretario
    const asigs = useMemo(() => {
        if (!asignaciones.length || !profeSede.length) return [];

        return asignaciones.filter(asig =>
            profeSede.some(pro => pro.mail === asig.mailProfesor)
        );
    }, [asignaciones, profeSede]);

    
    const encuentraEstudiante = (asignacion: Asignacion)=>{
        const estudiante = estusSede.find(est => est.mail === asignacion.mailEstudiante)?.nombre
        + " " + estusSede.find(est => est.mail === asignacion.mailEstudiante)?.apellido
        + " " + estusSede.find(est => est.mail === asignacion.mailEstudiante)?.segundoApellido;
        return estudiante;
    }
    const encuentraProfe = (asignacion: Asignacion)=>{
        const profe = profeSede.find(pro => pro.mail === asignacion.mailProfesor)?.nombre
        + " " +  profeSede.find(pro => pro.mail === asignacion.mailProfesor)?.apellido
        + " " + profeSede.find(pro => pro.mail === asignacion.mailProfesor)?.segundoApellido;
        return profe;
    }
    const encuentraEstado = (asignacion: Asignacion) => {
        const esta = estados.find(est => est.mailEstudiante === asignacion.mailEstudiante)
        return esta?.estado;
    }
    

    // --- DataGrid for "Visualizar asignaciones" ---
    interface filas {
        id: string;
        studentName: string;
        professorName: string;
        rol: string; 
    }
    //filas de asignaciones
    const filas = useMemo(() => {
        if (!asigs.length) return [];
        
        return asigs.map(asig => ({
            id: asig.id,
            studentName: encuentraEstudiante(asig) ?? '-',
            professorName: encuentraProfe(asig) ?? '-',
            rol: asig.rol,
            status: encuentraEstado(asig) ?? '-',
        }));
        }, [asigs, estusSede, profeSede]);
    

        const profeMail = (nombre: string) => {

            if(!nombre){
                return;
            }
            const name = nombre.split(" ");
            const profe = profeSede.find(pro => pro.nombre === name[0])?.mail
            return profe;
        }
        const estuMail = (nombre: string) => {
            if(!nombre){
                return;
            }
            const name = nombre.split(" ");
            return estusSede.find(est => est.nombre === name[0])?.mail
        }
    const enviarCorreo = async(parametros: filas) => {
        const mailEstu = estuMail(parametros.studentName);
        if(!mailEstu){
            return;
        }
        const partMail = mailEstu.replace(/[^a-zA-Z0-9]/g, '_');
        const rutas: string[] = [];
        const archivos: string[] = [];
        let text;
        const mailProfe = profeMail(parametros.professorName);
        if(!mailProfe){
            return;
        }
        switch(parametros.rol){
            case 'guia':
                rutas.push(`archivos_guia`);
                archivos.push(`Rubrica_Guia.docx`);
                rutas.push('fichas_inscripcion');
                archivos.push(`${partMail}-Formulario_Inscripcion_Seminario_de_Titulo.docx`);
                text = `
                    Estimada(o) académica(o) ${parametros.professorName}<br><br> 
                    Se le recuerda que se le ha sido asignado a cargo de la tesis de ${parametros.studentName} con rol de ${parametros.rol}.<br><br>
                    Se adjunta Ficha del estudiante, y la plantilla de la Rúbrica.<br><br>
                    No responder a este correo.
                    `

                await axios.post(`${__url}/mail/enviar_adjunto`, {
                    toMail: `${mailProfe}`,
                    subject: `Asignación Profesor(a)  ${newAssignment.rol}`,
                    text,
                    rutas,
                    archivos
                });
                console.log("aaaa")
                break;
            case 'informante':
                rutas.push(`archivos_Tesis`);
                archivos.push(`${partMail}-documento_tesis.docx`);
                rutas.push('fichas_inscripcion');
                archivos.push(`${partMail}-Formulario_Inscripcion_Seminario_de_Titulo.docx`);
                text = `
                    Estimada(o) académica(o) ${parametros.professorName}<br><br> 
                    Se le recuerda que se le ha sido asignado a cargo de la tesis de ${parametros.studentName} con rol de ${parametros.rol}.<br><br>
                    Se adjunta Ficha y la Tesis del estudiante.<br><br>
                    Se le recuerda que la plantilla de la Rúbrica del rol Informante, se puede descargar desde el acceso de académicos<br><br>
                    No responder a este correo.
                    `

                await axios.post(`${__url}/mail/enviar_adjunto`, {
                    toMail: `${newAssignment.mailProfesor}`,
                    subject: `Asignación Profesor(a)  ${newAssignment.rol}`,
                    text,
                    rutas,
                    archivos
                });
                break;
        }
    }    
    //columnas de asignaciones
    const assignmentColumns: GridColDef<filas>[] = [
            { field: 'id', headerName: 'Id', width: 70 },
            { field: 'studentName', headerName: 'Estudiante', width: 200 },
            { field: 'professorName', headerName: 'Profesor', width: 200 },
            { field: 'rol', headerName: 'Rol', width: 250 }, 
            {field: 'eliminar', headerName: 'ACCIONES', width: 300, renderCell: (params)=>(
                <Box display="flex" gap={1} alignItems="center">
                    <Button 
                    size='small'
                    onClick={() => eliminarFila(params.row.id)}
                    >
                        eliminar
                    </Button>
                    <Box  >
                        <Button
                        onClick={() => enviarCorreo(params.row)}
                        size='small'
                        sx={{
                            textDecoration:'none',
                            display:'flex',
                            alignItems:'center',
                            justifyContent:'center'
                        }}
                        >
                            Notificar Profesor
                            
                        </Button>
                        
                    </Box>
                    
                </Box>
            )}
        ];
    
    // --- State for "Generar asignación" form ---
    interface NewAssignmentState {
        mailEstudiante: string;
        mailProfesor: string;
        rol: string; // 'rol' is now a direct field in the state
    }
    
    // Para Select (MUI)
    const handleSelectChange = (event: SelectChangeEvent) => {
        
    const { name, value } = event.target;
    setNewAssignment(prev => ({
        ...prev,
        [name as string]: value,
    }));

    };

    //envía la asignación a la db local
    const handleSubmitAssignment = async () => {
        // Validate required fields
        if (!newAssignment.mailEstudiante || !newAssignment.mailProfesor || !newAssignment.rol) {
            alert('Por favor, completa todos los campos requeridos para la asignación (Estudiante, Profesor, Rol).');
            return;
        }
        try {
            const profeMail = profesores.find(pro => pro.mail === newAssignment.mailProfesor)?.nombre
                + " " + profesores.find(pro => pro.mail === newAssignment.mailProfesor)?.apellido
                + " " + profesores.find(pro => pro.mail === newAssignment.mailProfesor)?.segundoApellido;
            const estuMail = estudiantes.find(est => est.mail === newAssignment.mailEstudiante)?.nombre
                + " " + estudiantes.find(est => est.mail === newAssignment.mailEstudiante)?.apellido
                + " " + estudiantes.find(est => est.mail === newAssignment.mailEstudiante)?.segundoApellido;
                console.log(newAssignment)
            await axios.post(
                `${__url}/asignaciones/crear`,
                newAssignment
            );
            alert('Asignación generada exitosamente (simulado)!');
            const partMail = newAssignment.mailEstudiante.replace(/[^a-zA-Z0-9]/g, '_');
            const rutas: string[] = [];
            const archivos: string[] = [];
            let text;
            switch (newAssignment.rol){
                case 'guia':
                    rutas.push(`archivos_guia`);
                    archivos.push(`Rubrica_Guia.docx`);
                    rutas.push('fichas_inscripcion');
                    archivos.push(`${partMail}-Formulario_Inscripcion_Seminario_de_Titulo.docx`);
                    text = `
                        Estimada(o) académica(o) ${profeMail}<br><br> 
                        se le ha asignado a cargo de la tesis de ${estuMail} con rol de ${newAssignment.rol}.<br><br>
                        Se adjunta Ficha del estudiante, y la plantilla de la Rúbrica.<br><br>
                        No responder a este correo.
                      `

                    await axios.post(`${__url}/mail/enviar_adjunto`, {
                        toMail: `${newAssignment.mailProfesor}`,
                        subject: `Asignación Profesor(a)  ${newAssignment.rol}`,
                        text,
                        rutas,
                        archivos
                    });
                    break;
                case 'informante':
                    rutas.push(`archivos_Tesis`);
                    archivos.push(`${partMail}-documento_tesis.docx`);
                    rutas.push('fichas_inscripcion');
                    archivos.push(`${partMail}-Formulario_Inscripcion_Seminario_de_Titulo.docx`);
                    text = `
                        Estimada(o) académica(o) ${profeMail}<br><br> 
                        Se le ha asignado a cargo de la tesis de ${estuMail} con rol de ${newAssignment.rol}.<br><br>
                        Se adjunta Ficha y la Tesis del estudiante.<br><br>
                        Se le recuerda que la plantilla de la Rúbrica del rol Informante, se puede descargar desde el acceso de académicos<br><br>
                        No responder a este correo.
                      `

                    await axios.post(`${__url}/mail/enviar_adjunto`, {
                        toMail: `${newAssignment.mailProfesor}`,
                        subject: `Asignación Profesor(a)  ${newAssignment.rol}`,
                        text,
                        rutas,
                        archivos
                    });
                    break;
            }
            console.log(rutas, " ", archivos)
            
            // Reset form after successful (simulated) submission
            setNewAssignment({
                mailEstudiante: '',
                mailProfesor: '',
                rol: ''
            });
            rutas.splice(0, rutas.length);
            archivos.splice(0, archivos.length);
            setFinished(true);
            
        } catch (error: any) {
            console.log('Error completo:', error.response?.data);
        }
    };

    //borrar fila por rut
    const eliminarFila = async (rut: string) => {
    await axios.delete(`${__url}/asignaciones/borrar/${rut}`);
    setFinished(true); // fuerza recarga desde el backend
    };

    return (
        <Box sx={{ p: 3, width: '100%', height: '100%'}}>
            <Box sx={{ display:'flex', width: '100%', maxWidth: 500, borderTopLeftRadius:1 }}>
                    <BottomNavigation
                        showLabels
                        value={viewValue}
                        onChange={(event, newValue) => {
                            setViewValue(newValue);
                        }}
                    >
                        <BottomNavigationAction label="Visualizar asignaciones" value="ver" icon={<VisibilityIcon />} />
                        <BottomNavigationAction label="Generar asignación" value="crear" icon={<AddBoxIcon />} />
                    </BottomNavigation>
                    
                </Box>
            <Card sx={{ mb: 3, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 3 }}>
                

                {viewValue === "ver" && (
                    <Box sx={{ mt: 2, width: '100%' }}>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            A continuación se muestran las asignaciones hechas de estudiantes a profesores.
                        </Typography>
                        <Box sx={{ height: 400, width: '100%' }}>
                            <DataGrid
                                rows={filas}
                                columns={assignmentColumns}
                                getRowId= {(row) => row.id }
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
                    </Box>
                )}

                {viewValue === "crear" && (
                    <Box sx={{ mt: 2, width: '100%', maxWidth: "600px", height:'100%'}}>
                        <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
                            Aquí puedes generar una nueva asignación para un estudiante.
                        </Typography>
                        <Typography variant='h5' sx={{ mb: 2, textAlign: 'center' }}>
                            Al generar la asignación se le notificará al profesor correspondiente
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                            <FormControl fullWidth required>
                                <InputLabel id="student-select-label">Estudiante</InputLabel>
                                <Select
                                    labelId="student-select-label"
                                    id="student-select"
                                    name="mailEstudiante" // Important for handleFormChange
                                    value={newAssignment.mailEstudiante}
                                    label="Estudiante"
                                    onChange={handleSelectChange} // Use generic handler
                                >
                                    <MenuItem value=""><em>Selecciona un estudiante</em></MenuItem>
                                    {estusSede.map(student => (
                                        <MenuItem key={student.rut} value={student.mail}>
                                            {student.nombre + " " + student.apellido + " " + student.segundoApellido}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth required>
                                <InputLabel id="professor-select-label">Profesor</InputLabel>
                                <Select
                                    labelId="professor-select-label"
                                    id="professor-select"
                                    name="mailProfesor" // Important for handleFormChange
                                    value={newAssignment.mailProfesor}
                                    label="Profesor"
                                    onChange={handleSelectChange} // Use generic handler
                                >
                                    <MenuItem value=""><em>Selecciona un profesor</em></MenuItem>
                                    {profeSede.map(professor => (
                                        <MenuItem key={professor.nombre} value={professor.mail}>
                                            {professor.nombre + " " + professor.apellido + " " + professor.segundoApellido}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth required> {/* Wrap rol Select in FormControl */}
                                <InputLabel id="rol-select-label">Rol</InputLabel> {/* New InputLabel for Rol */}
                                <Select
                                    labelId="rol-select-label"
                                    id="rol-select"
                                    name="rol" // Important: Set the name to "rol"
                                    value={newAssignment.rol}
                                    label="Rol" // Label for the Select component
                                    onChange={handleSelectChange} // Use the generic handler
                                >
                                    <MenuItem value=""><em>Selecciona un rol</em></MenuItem>
                                    <MenuItem value="guia">Guía</MenuItem>
                                    <MenuItem value="informante">Informante</MenuItem>
                                    <MenuItem value="secretario">Secretario</MenuItem>
                                    <MenuItem value="presidente">Presidente</MenuItem>
                                </Select>
                            </FormControl>

                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<SendIcon />}
                                onClick={handleSubmitAssignment}
                                sx={{ mt: 2 }}
                            >
                                Generar Asignación
                            </Button>
                        </Box>
                    </Box>
                )}
                
            </Card>
        </Box>
    );
}

export default Asignaciones;