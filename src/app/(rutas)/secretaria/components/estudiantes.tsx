"use client"; // Required for client-side components in Next.js App Router

import { BottomNavigation, BottomNavigationAction, Box, Card, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React, { useState } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddBoxIcon from '@mui/icons-material/AddBox';
import SendIcon from '@mui/icons-material/Send';

function Estudiantes() {

    interface AssignmentRow {
        id: number;
        studentName: string;
        professorName: string;
        rol: string; // Correctly reflects the 'rol' column
        status: string;
    }

    const assignmentColumns: GridColDef<AssignmentRow>[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'studentName', headerName: 'Estudiante', width: 200 },
        { field: 'professorName', headerName: 'Profesor', width: 200 },
        { field: 'rol', headerName: 'Rol', width: 250 }, // DataGrid column for 'rol'
        { field: 'status', headerName: 'Estado', width: 130 },
    ];

    const assignmentRows: AssignmentRow[] = [
        { id: 1, studentName: 'Juan Pérez', professorName: 'Dr. García', rol: 'guía', status: 'Pendiente' },
        { id: 2, studentName: 'María López', professorName: 'Dra. Soto', rol: 'informante', status: 'En Proceso' },
        { id: 3, studentName: 'Carlos Díaz', professorName: 'Dr. Medina', rol: 'secretario', status: 'Pendiente' },
        { id: 4, studentName: 'Ana Ruiz', professorName: 'Dra. Castro', rol: 'presidente', status: 'Completado' },
    ];

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

    const students = [
        { id: 'est1', name: 'Juan Pérez' },
        { id: 'est2', name: 'María López' },
        { id: 'est3', name: 'Carlos Díaz' },
        { id: 'est4', name: 'Ana Ruiz' },
    ];

    const professors = [
        { id: 'prof1', name: 'Dr. García' },
        { id: 'prof2', name: 'Dra. Soto' },
        { id: 'prof3', name: 'Dr. Medina' },
        { id: 'prof4', name: 'Dra. Castro' },
    ];

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

        console.log('Generando nueva asignación:', newAssignment);

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
                            rows={assignmentRows}
                            columns={assignmentColumns}
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
            </Card >
        </Box >
    );
}

export default Estudiantes;