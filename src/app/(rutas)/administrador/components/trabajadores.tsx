"use client"; // Required for client-side components in Next.js App Router
import { BottomNavigation, BottomNavigationAction, Box, Card, Typography, TextField, Button} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React, { useEffect, useState, useMemo } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddBoxIcon from '@mui/icons-material/AddBox';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import __url from '@/lib/const';
import { Jefatura } from '@/types/jefatura';
import { Secretario } from '@/types/secretario';
import { Trabajador } from '@/types/trabajador';

function Trabajadores() {

    const [viewValue, setViewValue] = useState<'ver' | 'crear'>('ver');
    const [jefaturas, setJefaturas] = useState<Jefatura[]>([]);
    const [secretarios, setSecretarios] = useState<Secretario[]>([]);
    const [finished, setFinished] = useState(true);
    //molde rellenable de la asignación
    const [newTrabajo, setNewTrabajo] = useState<Trabajador>({
        id: '',
        nombre: '',
        apellido: '',
        correo: '',
        rol: '',
        sede: ''
    });

    // --- DataGrid for "Visualizar asignaciones" ---
    interface filas {
        id: string;
        nombre: string;
        correo: string;
        rol: string; 
        sede: string;
    }

    //cargo los secretarios y jefatura desde el back
    useEffect(() => {
    if(!finished){
        return;
    }
    const datos_todos = async () => {
        try {
            const [secRes, jefRes] = await Promise.all([
                axios.get(`${__url}/secretario/todos`),
                axios.get(`${__url}/jefatura/todas`)
            ]);
            setJefaturas(jefRes.data);
            setSecretarios(secRes.data);
            setFinished(false)
        } catch (error) {
            console.log(error);
        }
    };
    datos_todos();
    }, [finished]);

    interface filas{
        id: string;
        nombre: string;
        correo: string;
        rol: string;
        sede: string;
    }
    //filas de asignaciones
    const filas = useMemo(() => {
        const trabajadores: filas[] = [];
        let valor = secretarios.length;
        
        for(let i = 0; i < secretarios.length; i++){
            trabajadores.push({
                id: String(i + 1),
                nombre: (secretarios[i].nombre + " " + secretarios[i].apellido),
                correo: secretarios[i].mail,
                rol: 'Secretario',
                sede: secretarios[i].sede
            })     
                  
        }
        for(let i = 0; i < jefaturas.length; i++){
            trabajadores.push({
                id: String(valor + 1),
                nombre: (jefaturas[i].nombre + " " + jefaturas[i].apellido),
                correo: jefaturas[i].mail,
                rol: 'Jefatura',
                sede: jefaturas[i].sede
            })   
            valor = valor + 1;          
        }
        return trabajadores;
        }, [jefaturas, secretarios]);
    

    const secreMail = (nombre: string) => {

        if(!nombre){
            return;
        }
        
        const secre = secretarios.find(sec => (sec.nombre + " " + sec.apellido) === nombre)?.mail
        return secre;
    }
    const jefaMail = (nombre: string) => {
        if(!nombre){
            return;
        }
        return jefaturas.find(jef => (jef.nombre + " " + jef.apellido) === nombre)?.mail
    }
    const enviarCorreo = async(parametros: filas) => {
        let toMail;
        if(parametros.rol === 'Jefatura'){
            toMail = jefaMail(parametros.nombre);
        }else if(parametros.rol === 'Secretario'){
            toMail = secreMail(parametros.nombre);
        }

        await axios.post(`${__url}/mail/enviar`,{
            toMail,
            subject: 'Eres parte del sistema!',
            text:   `
                    Estimado(a) ${parametros.nombre}<br><br>
                    Se le recuerda que ha sido agregado al sistema de la Universidad de Valparaíso con el rol de ${parametros.rol}<br><br>
                    Se le asignó la sede de ${parametros.sede}.<br><br>
                    No responder a este correo. 
                    `
        }
        )
    }    
    //columnas de asignaciones
    const assignmentColumns: GridColDef<filas>[] = [
        { field: 'id', headerName: 'Id', width: 100},
        { field: 'nombre', headerName: 'Nombre', width: 150 },
        { field: 'correo', headerName: 'Correo', width: 100 },
        { field: 'rol', headerName: 'Rol', width: 100 }, 
        { field: 'sede', headerName: 'Sede', width: 100},
        {field: 'eliminar', headerName: 'ACCIONES', width: 300, renderCell: (params)=>(
            <Box display="flex" gap={1} alignItems="center">
                <Button 
                size='small'
                onClick={() => eliminarFila(params.row)
                }
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
                        Notificar funcionario
                        
                    </Button>
                    
                </Box>
                
            </Box>
        )}
    ];

    //envía la asignación a la db local
    const handleSubmitAssignment = async () => {
        
        // Validate required fields
        if (!newTrabajo.nombre || !newTrabajo.apellido || !newTrabajo.rol || !newTrabajo.correo) {
            alert('Por favor, completa todos los campos requeridos.');
            return;
        }
        try {
            await axios.post(
                `${__url}/${newTrabajo.rol}/crear`,{
                    nombre: newTrabajo.nombre,
                    apellido: newTrabajo.apellido,
                    mail: newTrabajo.correo,
                    sede: newTrabajo.sede
                }
            
            );
            
            await axios.post(`${__url}/mail/enviar`,{
                toMail: newTrabajo.correo,
                subject: 'Eres parte del sistema!',
                text:   `
                        Estimado(a) ${newTrabajo.nombre} ${newTrabajo.apellido}<br><br>
                        Se le ha agregado al sistema de la Universidad de Valparaíso con el rol de ${newTrabajo.rol}<br><br>
                        Se le asignó la sede de ${newTrabajo.sede}.<br><br>
                        No responder a este correo. 
                        `
            })

            alert('Funcionario agregado exitósamente!');
            // Reset form after successful (simulated) submission
            setNewTrabajo({
                id: '',
                nombre: '',
                apellido: '',
                correo: '',
                rol: '',
                sede: ''
            });
            setFinished(true);
            
        } catch (error) {
            console.log(error);
        }
    };

    //borrar fila por id
    const eliminarFila = async (fila: filas) => {
    const id = fila.correo;
    if(fila.rol === 'Jefatura'){
        await axios.delete(`${__url}/jefatura/borrar/${id}`);
        setFinished(true)
    }
    else if(fila.rol === 'Secretario'){
        await axios.delete(`${__url}/secretario/borrar/${id}`);
        setFinished(true);
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
                        <BottomNavigationAction label="Visualizar funcionarios" value="ver" icon={<VisibilityIcon />} />
                        <BottomNavigationAction label="Agregar funcionario" value="crear" icon={<AddBoxIcon />} />
                    </BottomNavigation>
                    
                </Box>
            <Card sx={{ mb: 3, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 3 }}>
                

                {viewValue === "ver" && (
                    <Box sx={{ mt: 2, width: '100%' }}>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            A continuación se muestran la jefatura y los secretarios agregados al sistema.
                        </Typography>
                        <Box sx={{ height: 400, width: '100%' }}>
                            <DataGrid
                                rows={filas}
                                columns={assignmentColumns}
                                getRowId= {(row) => row.id}
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
                            Aquí puedes agregar a un nuevo funcionario al sistema.
                        </Typography>
                        <Typography variant='h5' sx={{ mb: 2, textAlign: 'center' }}>
                            Tras ser agregado al sistema se notificará, el funcionario será notificado
                        </Typography>
                        <Box sx={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column'}}>
                            <Box sx={{ display: 'flex', flexDirection: 'row',justifyContent:'center', gap: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 2, width:'1000px'}}>
                                <TextField
                                    fullWidth
                                    sx={{
                                        width:'200px'
                                    }}
                                    label="Nombre"
                                    value={newTrabajo.nombre}
                                    onChange={(e) =>
                                        setNewTrabajo({
                                        ...newTrabajo,
                                        nombre: e.target.value,
                                        })
                                    }
                                    size="small"
                                    />

                                    <TextField
                                    fullWidth
                                    sx={{
                                        width:'200px'
                                    }}
                                    label="Apellido"
                                    value={newTrabajo.apellido}
                                    onChange={(e) =>
                                        setNewTrabajo({
                                        ...newTrabajo,
                                        apellido: e.target.value,
                                        })
                                    }
                                    size="small"
                                    />
                                    
                                    <TextField
                                    fullWidth
                                    sx={{
                                        width:'200px'
                                    }}
                                    label="Correo"
                                    value={newTrabajo.correo}
                                    onChange={(e) =>
                                        setNewTrabajo({
                                        ...newTrabajo,
                                        correo: e.target.value,
                                        })
                                    }
                                    size="small"
                                    />
                                
                                    <TextField
                                    fullWidth
                                    sx={{
                                        width:'200px'
                                    }}
                                    label="Rol (jefatura, secretario)"
                                    value={newTrabajo.rol}
                                    onChange={(e) =>
                                        setNewTrabajo({
                                        ...newTrabajo,
                                        rol: e.target.value,
                                        })
                                    }
                                    size="small"
                                    />
                                    <TextField
                                    fullWidth
                                    sx={{
                                        width:'200px'
                                    }}
                                    label="Sede (en minúsculas)"
                                    value={newTrabajo.sede}
                                    onChange={(e) =>
                                        setNewTrabajo({
                                        ...newTrabajo,
                                        sede: e.target.value,
                                        })
                                    }
                                    size="small"
                                    />
                            </Box>
                            <Box sx={{display:'flex', justifyContent:'center', alignItems:'center', gap: 3, p: 2}}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<SendIcon />}
                                    onClick={handleSubmitAssignment}
                                    sx={{ mt: 2 }}
                                >
                                    Agregar Trabajador
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                )}
                
            </Card>
        </Box>
    );
}

export default Trabajadores;