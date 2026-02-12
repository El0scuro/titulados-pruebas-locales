"use client";
import { BottomNavigation, BottomNavigationAction, Box, Card, Typography, TextField, Button} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React, { useEffect, useState, useMemo } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddBoxIcon from '@mui/icons-material/AddBox';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import __url from '@/lib/const';
import { Profesor } from '@/types/profesor';
import { Asignacion } from '@/types/asignacion';

export default function Profesores(){

    const [viewValue, setViewValue] = useState<'ver' | 'crear'>('ver');
    const [profesores, setProfesores] = useState<Profesor[]>([]);
    const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
    const [finished, setFinished] = useState(true);
    
    //molde rellenable de la asignación
    const [newProfessor, setNewProfessor] = useState<NewProfessorState>({
        nombre: '',
        segundoNombre: '',
        apellido: '',
        segundoApellido: '',
        mail: '',
        sede: ''
    });
    
    //importo a todos los profesores
    useEffect(() => {
    const datos_todos = async () => {
        try {
            const [proRes, asigRes] = await Promise.all([
                axios.get(`${__url}/profesor/todos`),
                axios.get(`${__url}/asignaciones/todas`)
            ]);
            
            setProfesores(proRes.data);
            setAsignaciones(asigRes.data);
            
        } catch (error) {
            console.log(error);
        }
    };
    datos_todos();
}, []);
    //cargo los Profesores cada vez que finished esté en true, y reinicia el estado de finished en caso de que cambie a true
    useEffect(() => {
        if(!finished){
            return;
        }

        const Profesores = async () => { 
            try{
                const datos = await axios.get(`${__url}/profesor/todos`);
                setProfesores(datos.data);
                setFinished(false);
            }catch(error){
                console.log(error);
            }
        };
        Profesores();
    }, [finished]);

    const asigs = useMemo(() => {
            if (!asignaciones.length || !profesores.length) return [];
    
            return asignaciones.filter(asig =>
                profesores.some(pro => pro.mail === asig.mailProfesor)
            );
        }, [asignaciones, profesores]);

    interface filas {
        professorName: string;
        mail: string;
    }

    //filas de asignaciones
    const filas = useMemo(() => {
        if (!profesores.length) return [];
        
        return profesores.map(pro => ({
            professorName: pro.nombre + " " +  pro.apellido + " " + pro.segundoApellido,
            mail: pro.mail,
        }));
        }, [asigs, profesores]);
    
    interface NewProfessorState {
        nombre: string;
        segundoNombre: string;
        apellido: string;
        segundoApellido: string;
        mail: string;
        sede: string;
    }
    
    //columnas de asignaciones
    const ProfessorColumns: GridColDef<filas>[] = [
        { field: 'professorName', headerName: 'Profesor', width: 200 },
        { field: 'mail', headerName: 'Correo', width: 200},
        {field: 'eliminar', headerName: 'ACCIONES', width: 300, renderCell: (params)=>(
            <>
                <Button 
                size='small'
                onClick={() => eliminarFila(params.row.mail)}
                >
                    eliminar
                </Button>
            </>
        )}
    ];

    //borrar fila por mail
    const eliminarFila = async (mail: string) => {
    await axios.delete(`${__url}/profesor/borrar/${mail}`);
    setFinished(true); // fuerza recarga desde el backend
    };

    //envía la asignación a la db local
    const handleSubmitProfessor = async () => {
        // Validate required fields
        if (!newProfessor.mail || !newProfessor.nombre || !newProfessor.segundoNombre || !newProfessor.apellido || !newProfessor.segundoApellido || !newProfessor.sede) {
            alert('Por favor, completa todos los campos requeridos');
            return;
        }
        try {
            
            await axios.post(
                `${__url}/profesor/crear`,
                newProfessor
            );
            alert('Profesor agregado al sistema exitósamente!');
            // Reset form after successful (simulated) submission
            setNewProfessor({
                nombre: '',
                segundoNombre: '',
                apellido: '',
                segundoApellido: '',
                mail: '',
                sede: ''
            });
            setFinished(true);
        } catch (error) {
            console.log(error);
        }
    };
    return(
        <Box sx={{ p: 3, width: '100%', height: '100%'}}>
            <Box sx={{ display:'flex', width: '100%', maxWidth: 500, borderTopLeftRadius:1 }}>
                    <BottomNavigation
                        showLabels
                        value={viewValue}
                        onChange={(event, newValue) => {
                            setViewValue(newValue);
                        }}
                    >
                        <BottomNavigationAction label="Visualizar Profesores" value="ver" icon={<VisibilityIcon />} />
                        <BottomNavigationAction label="Agregar Profesor" value="crear" icon={<AddBoxIcon />} />
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
                                columns={ProfessorColumns}
                                getRowId= {(row) => row.mail }
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
                            Aquí puedes agregar a los profesores nuevos.
                        </Typography>
                        <Typography variant='h5' sx={{ mb: 2, textAlign: 'center' }}>
                            Al agregar a un profesor, se le permite la capacidad de ser asignado a un estudiante
                        </Typography>
                        <Box sx={{
                                display: 'grid',
                                gridTemplateRows: '1fr', // una columna para label+input
                                gap: 1,
                                p: 2, 
                                border: '1px solid #e0e0e0', 
                                borderRadius: 2 }}>
                            {/*Nombre completo del Profesor */}
                            <Box
                             sx={{
                                display:'grid',
                                gridTemplateColumns: '1fr 1fr 1fr 1fr',
                                gap:1,
                                justifyContent:'center'                             }}
                            >
                                <TextField
                                fullWidth
                                sx={{
                                    width:'130px'
                                }}
                                label="Primer Nombre"
                                value={newProfessor.nombre}
                                onChange={(e) =>
                                    setNewProfessor({
                                    ...newProfessor,
                                    nombre: e.target.value,
                                    })
                                }
                                size="small"
                                />
                                <TextField
                                fullWidth
                                sx={{
                                    width:'130px'
                                }}
                                label="Segundo Nombre"
                                value={newProfessor.segundoNombre}
                                onChange={(e) =>
                                    setNewProfessor({
                                    ...newProfessor,
                                    segundoNombre: e.target.value,
                                    })
                                }
                                size="small"
                                />
                                <TextField
                                fullWidth
                                sx={{
                                    width:'130px'
                                }}
                                label="Primer Apellido"
                                value={newProfessor.apellido}
                                onChange={(e) =>
                                    setNewProfessor({
                                    ...newProfessor,
                                    apellido: e.target.value,
                                    })
                                }
                                size="small"
                                />
                                <TextField
                                fullWidth
                                sx={{
                                    width:'130px'
                                }}
                                label="Segundo Apellido"
                                value={newProfessor.segundoApellido}
                                onChange={(e) =>
                                    setNewProfessor({
                                    ...newProfessor,
                                    segundoApellido: e.target.value,
                                    })
                                }
                                size="small"
                                />
                            </Box>
                            <Box
                             sx={{
                                display:'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap:3
                             }}
                            >
                            <Box
                            sx={{
                                display:'grid',
                                gridTemplateColumns: '1fr 2fr 1fr ',
                                gap:3
                             }}>
                            <TextField
                            fullWidth
                            sx={{
                                width:'190px'
                            }}
                            label="Sede (en minúsculas)"
                            value={newProfessor.sede}
                            onChange={(e) =>
                                setNewProfessor({
                                ...newProfessor,
                                sede: e.target.value,
                                })
                            }
                            size="small"
                            />
                            </Box>
                            <TextField
                            fullWidth
                            sx={{
                                width:'140px'
                            }}
                            label="Correo Profesor"
                            value={newProfessor.mail}
                            onChange={(e) =>
                                setNewProfessor({
                                ...newProfessor,
                                mail: e.target.value,
                                })
                            }
                            size="small"
                            />
                            </Box>
                            

                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<SendIcon />}
                                onClick={handleSubmitProfessor}
                                sx={{ mt: 2 }}
                            >
                                Agregar Profesor
                            </Button>
                        </Box>
                    </Box>
                )}
                
            </Card>
        </Box>
    )
}