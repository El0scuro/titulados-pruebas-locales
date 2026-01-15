"use client"; // Required for client-side components in Next.js App Router

import { BottomNavigation, BottomNavigationAction, Box, Card, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import Swal from 'sweetalert2';
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

// Removed DatePicker related imports as they are not used in the current form structure

function Asignaciones() {
    // Controls which tab is active (Visualizar or Generar)
    const [viewValue, setViewValue] = useState<'ver' | 'crear'>('ver');
    
    const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
    const [newAssignment, setNewAssignment] = useState<NewAssignmentState>({
        id: '',
        mailEstudiante: '',
        mailProfesor: '',
        rol: '',
    });

    const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
    const [profesores, setProfesores] = useState<Profesor[]>([]);
    const [finished, setFinished] = useState(false);

    useEffect(() => {
    const datos_todos = async () => {
        try {
            const [estRes, proRes] = await Promise.all([
                axios.get(`${__url}/estudiante/todos`),
                axios.get(`${__url}/profesor/todos`)
            ]);
            setEstudiantes(estRes.data);
            setProfesores(proRes.data);
            
            
        } catch (error) {
            console.log(error);
        }
    };
    datos_todos();
}, []);

    useEffect(() => {
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
    }, [finished, estudiantes, profesores]);
    useEffect(() => {
    if (!newAssignment.mailEstudiante) return;

    const estudiante = estudiantes.find(
        est => est.mail === newAssignment.mailEstudiante
    );

    if (!estudiante) return;

    setNewAssignment(prev => ({
        ...prev,
        id: estudiante.rut
    }));
    }, [newAssignment.mailEstudiante]);

    // --- DataGrid for "Visualizar asignaciones" ---
    interface filas {
        rut: string;
        studentName: string;
        professorName: string;
        rol: string; // Correctly reflects the 'rol' column
        status: string;
    }

    
    const encuentraEstudiante = (asignacion: Asignacion)=>{
        const estudiante = estudiantes.find(est => est.mail === asignacion.mailEstudiante);
        return estudiante?.nombre;
    }
    const encuentraProfe = (asignacion: Asignacion)=>{
        const profe = profesores.find(pro => pro.mail === asignacion.mailProfesor);
        return profe?.nombre;
    }
    const filas = useMemo(() => {
        if (!asignaciones.length) return [];
        
        return asignaciones.map(asig => ({
            rut: asig.id,
            studentName: encuentraEstudiante(asig) ?? '-',
            professorName: encuentraProfe(asig) ?? '-',
            rol: asig.rol,
            status: "pendiente"
        }));
        }, [asignaciones, estudiantes, profesores]);
    const assignmentColumns: GridColDef<filas>[] = [
        { field: 'rut', headerName: 'Rut', width: 70 },
        { field: 'studentName', headerName: 'Estudiante', width: 200 },
        { field: 'professorName', headerName: 'Profesor', width: 200 },
        { field: 'rol', headerName: 'Rol', width: 250 }, // DataGrid column for 'rol'
        { field: 'status', headerName: 'Estado', width: 130 },
    ];
    

    // --- State for "Generar asignación" form ---
    interface NewAssignmentState {
        id: string;
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

    const handleSubmitAssignment = async () => {
        let response: any;
        // Validate required fields
        if (!newAssignment.mailEstudiante || !newAssignment.mailProfesor || !newAssignment.rol) {
            alert('Por favor, completa todos los campos requeridos para la asignación (Estudiante, Profesor, Rol).');
            return;
        }
        try {
            response = await axios.post(
                `${__url}/asignaciones/crear`,
                newAssignment
            );
            alert('Asignación generada exitosamente (simulado)!');
            // Reset form after successful (simulated) submission
            setNewAssignment({
                id: '',
                mailEstudiante: '',
                mailProfesor: '',
                rol: ''
            });
            setFinished(true);
        } catch (error: any) {
            console.log('Error completo:', error.response?.data);
        }
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
                                getRowId= {(row) => row.rut }
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
                                    {estudiantes.map(student => (
                                        <MenuItem key={student.rut} value={student.mail}>
                                            {student.nombre}
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
                                    {profesores.map(professor => (
                                        <MenuItem key={professor.nombre} value={professor.mail}>
                                            {professor.nombre}
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