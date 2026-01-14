"use client"; // Required for client-side components in Next.js App Router

import Backdrop from '@mui/material/Backdrop';
import { Box, Button, Card, CardActionArea, Paper, Typography, Modal, Select, MenuItem, FormControl, InputLabel, Snackbar } from '@mui/material'; // Added Select, MenuItem, FormControl, InputLabel
import React, { useState } from 'react';
import SingleFileUploadButton from '@/app/components/singleFileButton'; // Ensure this path is correct
import SendIcon from '@mui/icons-material/Send';
import UploadFileIcon from '@mui/icons-material/UploadFile'; // Icon for upload action
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import type { GridColDef, GridActionsCellItemProps } from '@mui/x-data-grid';
import axios from 'axios';
import __url from '@/lib/const';
import Swal from 'sweetalert2';
import { useAccessToken } from '../../../context/TokenContext';
import RefreshIcon from '@mui/icons-material/Refresh';
function Archivos() {
    const [archivoExcel, setArchivoExcel] = useState<File | null>(null);
    const [selectedStudentIdForUpload, setSelectedStudentIdForUpload] = useState<string | null>(null);
    const [openModal, setOpenModal] = useState(false); // Renamed 'open' to 'openModal' for clarity
    const [selectedFileType, setSelectedFileType] = useState<string>(''); // State for selected file type in modal
    const [individualFileToUpload, setIndividualFileToUpload] = useState<File | null>(null); // State for the file chosen in the modal
    const token = useAccessToken();
    const [fileInputKey, setFileInputKey] = useState(0); // <-- Add this state
    const [rows, setRows] = useState<StudentRow[]>([]);

    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedFileType(''); // Reset selected file type on close
        setIndividualFileToUpload(null); // Reset file on close
        setSelectedStudentIdForUpload(null); // Reset student ID on close
    };

    interface DataGridProps {
        rows: StudentRow[];
        columns: GridColDef<StudentRow>[];
        pageSizeOptions: number[];
        initialState: {
            pagination: {
                paginationModel: {
                    pageSize: number;
                };
            };
        };
        checkboxSelection: boolean;
        disableRowSelectionOnClick: boolean;
        getRowId: (row: StudentRow) => string;
    }
    const handleSendExcelFile = async () => { // Renamed for clarity
        if (archivoExcel) {
            const formData = new FormData();
            formData.append('file', archivoExcel);

            try {
                const response = await axios.post(`${__url}/archivos/upload/alumnos`, formData, { headers: { Authorization: `Bearer ${token}` } });
                if (response.status) {
                    const result = response.data;
                    setSelectedFileType
                    setArchivoExcel(null);
                    setFileInputKey(prevKey => prevKey + 1);
                    Swal.fire({
                        icon: 'success',
                        title: 'Éxito',
                        text: `Archivo Excel enviado exitosamente.`,
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: `Error al enviar el archivo Excel`,
                    });
                    console.error('Error al enviar el archivo Excel:', response.status);
                    setFileInputKey(prevKey => prevKey + 1); // <-- Increment key to reset the child component
                    setArchivoExcel(null);


                }
            } catch (error) {
                console.error('Error de red al enviar el archivo Excel:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error de red al enviar el archivo Excel.',
                });
                setFileInputKey(prevKey => prevKey + 1); // <-- Increment key to reset the child component
                setArchivoExcel(null);
            }
            setFileInputKey(prevKey => prevKey + 1); // <-- Increment key to reset the child component
            setArchivoExcel(null);

        } else {
            console.warn('No hay archivo Excel para enviar.');
            setFileInputKey(prevKey => prevKey + 1); // <-- Increment key to reset the child component
            setArchivoExcel(null);


        }
        setFileInputKey(prevKey => prevKey + 1); // <-- Increment key to reset the child component
        setArchivoExcel(null);


    };

    const handleExcelFileSelect = (file: File | null) => { // Renamed for clarity
        setArchivoExcel(file);
        if (file) {
            console.log('Archivo Excel seleccionado:', file.name, file);
        } else {
            console.log('Archivo Excel limpiado.');
        }
    };

    // --- DataGrid Columns and Rows for Manual File Upload Section ---
    interface StudentRow {
        id: number;
        nombre: string;
        apellido: string;
        segundoApellido: string;
        mail: string;
        rut: string;
    }

    interface ActionParams {
        row: StudentRow;
    }

    const columns: GridColDef<StudentRow>[] = [
        { field: 'nombre', headerName: 'Nombre', width: 130, editable: true },
        { field: 'segundoNombre', headerName: 'Segundo Nombre', width: 130, editable: true },
        { field: 'apellido', headerName: 'Apellido Paterno', width: 130, editable: true },
        { field: 'segundoApellido', headerName: 'Apellido Materno', width: 130, editable: true },
        { field: 'mail', headerName: 'Correo', width: 200, editable: true },
        { field: 'rut', headerName: 'RUT', width: 120, editable: true },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Acciones',
            width: 120,
            getActions: (params: ActionParams): React.ReactElement<GridActionsCellItemProps>[] => [
                <GridActionsCellItem
                    icon={<UploadFileIcon />}
                    label="Subir Documento"
                    onClick={() => handleClickUpload(params.row.mail)} // Simpler click handler
                    showInMenu
                />,
            ],
        },
    ];

    const fetchStudents = async () => {
        try {
            const response = await axios.get(`${__url}/estudiante`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(response.data);
            if (response.data && Array.isArray(response.data)) {
                setRows(response.data);
            } else {
                setRows([]);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            setRows([]);
        }
    };

    React.useEffect(() => {
        fetchStudents();
    }, [token]);

    // Button to reload students

    const handleReloadStudents = () => {
        fetchStudents();
    };

    // Handler for the "Subir Documento" button click within DataGrid
    const handleClickUpload = (mail: string) => {
        setSelectedStudentIdForUpload(mail);
        console.log(mail)
        handleOpenModal(); // Open the modal
    };

    const handleFileTypeChange = (event: any) => { // Type 'any' for event from Select
        setSelectedFileType(event.target.value as string);
    };

    const handleIndividualFileSelect = (file: File | null) => {
        setIndividualFileToUpload(file);
        if (file) {
            console.log('Archivo individual seleccionado:', file.name, file);
        } else {
            console.log('Archivo individual limpiado.');
        }
    };

    const handleUploadIndividualFile = async () => {

        if (selectedStudentIdForUpload && selectedFileType && individualFileToUpload) {
            const formData = new FormData();
            formData.append('file', individualFileToUpload);
            formData.append('mail', selectedStudentIdForUpload.toString());
            

            try {
                const response = axios.post(`${__url}/files/upload/${selectedFileType}`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });
                Swal.fire({
                    icon: 'success',
                    title: `Archivo subido correctamente: ${individualFileToUpload.name}`
                })

            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al subir el archivo',
                    text: `No se pudo subir el archivo: ${individualFileToUpload.name}`,
                });
                console.error('Error de red al subir archivo individual:', error);
            }
                        
            handleCloseModal();

        } else {
            console.warn('Faltan datos para subir el archivo individual (estudiante, tipo de archivo o archivo).');
            alert('Por favor, selecciona el tipo de archivo y el archivo a subir.');
        }
    };

    // Style for the modal content Box
    const modalStyle = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
    };

    return (
        <Box sx={{ p: 3, width: '100%' }}>

            <Card sx={{ mb: 3, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 3 }}>
                <Typography variant="h5" sx={{ mb: 1, fontWeight: 600, textAlign: 'center' }}>
                    Carga de estudiantes vía archivo Excel
                </Typography>
                <a href="/subida.xlsx" download>
                    <CardActionArea sx={{ width: '100%', borderRadius: 2, boxShadow: 5, p: 1, mt: 1 }}>
                        <Typography variant="body1" sx={{ textAlign: 'center', color: 'primary.main', fontWeight: 500 }}>
                            Descargar plantilla para estudiantes
                        </Typography>
                    </CardActionArea>
                </a>
                <SingleFileUploadButton
                    key={fileInputKey}
                    onFileSelect={handleExcelFileSelect}
                    buttonText="Subir archivo de estudiantes en excel (.xlsx, .xls)"
                    acceptedFileTypes=".xlsx, .xls"
                />

                {archivoExcel && (
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" sx={{ color: 'text.primary' }}>
                            Archivo listo para enviar: <strong>{archivoExcel.name}</strong>
                        </Typography>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<SendIcon />}
                            onClick={handleSendExcelFile}
                            sx={{
                                borderRadius: '8px',
                                padding: '10px 20px',
                                fontSize: '1rem',
                                textTransform: 'none',
                                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                                '&:hover': {
                                    boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.2)',
                                },
                            }}
                        >
                            Subir Archivo
                        </Button>
                    </Box>
                )}
            </Card>

            <Card sx={{ mb: 3, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 3 }}>
                <Typography variant="h5" sx={{ mb: 1, fontWeight: 600, textAlign: 'center' }}>
                    Generar reporte
                </Typography>
                <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary', mb: 2 }}>
                    En esta sección se podrá generar un reporte de los estudiantes que se encuentran en el Sistema de Seminario de Título UV.
                </Typography>
                <CardActionArea sx={{ width: '100%', borderRadius: 2, boxShadow: 5, p: 1, mt: 1 }}>
                    <Typography variant="body1" sx={{ textAlign: 'center', color: 'primary.main', fontWeight: 500 }}>
                        Descargar reporte de estudiantes
                    </Typography>
                </CardActionArea>
            </Card>

            <Card sx={{ mb: 2, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 3 }}>
                <Typography variant="h5" sx={{ mb: 1, fontWeight: 600, textAlign: 'center' }}>
                    Gestión de Documentos Individuales
                </Typography>
                <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary', mb: 2 }}>
                    Aquí puedes subir archivos específicos para cada estudiante.
                </Typography>
                {/* DataGrid for manual student data entry/view with actions */}
                <Box sx={{ height: '100%', width: '100%' }}>
                    <Button onClick={handleReloadStudents} startIcon={<RefreshIcon />}>
                        Recargar Estudiantes
                    </Button>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        pageSizeOptions={[10, 20, 30]}
                        initialState={{
                            pagination: {
                                paginationModel: { pageSize: 10 }
                            }
                        }}
                        checkboxSelection={true}
                        disableRowSelectionOnClick={true}
                        getRowId={(row: StudentRow) => row.rut}
                        showToolbar={true}
                    />

                </Box>
            </Card>

            {/* Modal for individual file upload */}
            <Modal
                aria-labelledby="upload-modal-title"
                aria-describedby="upload-modal-description"
                open={openModal} // Use openModal state
                onClose={handleCloseModal}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{
                    backdrop: {
                        timeout: 500,
                    },
                }}
            >
                <Box sx={modalStyle}>
                    <Typography id="upload-modal-title" variant="h6" component="h2" sx={{ textAlign: 'center', mb: 2 }}>
                        Subir Documento para el Estudiante : {selectedStudentIdForUpload}
                    </Typography>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="file-type-select-label">Tipo de Documento</InputLabel>
                        <Select
                            labelId="file-type-select-label"
                            id="file-type-select"
                            value={selectedFileType}
                            label="Tipo de Documento"
                            onChange={handleFileTypeChange}
                        >
                            <MenuItem value=""><em>Selecciona un tipo</em></MenuItem>
                            <MenuItem value="ficha">Ficha de Ingreso</MenuItem>
                            <MenuItem value="tesis">Tesis</MenuItem>
                            <MenuItem value="guia">Rubrica Guía</MenuItem>
                            <MenuItem value="informante">Rubrica Informante</MenuItem>
                        </Select>
                    </FormControl>

                    <SingleFileUploadButton
                        key={fileInputKey}
                        onFileSelect={handleIndividualFileSelect}
                        buttonText={individualFileToUpload ? `Cambiar Archivo: ${individualFileToUpload.name}` : "Seleccionar Archivo"}
                        acceptedFileTypes=".pdf, .doc, .docx, .xlsx, .xls"
                    />

                    {individualFileToUpload && (
                        <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                            Archivo seleccionado: <strong>{individualFileToUpload.name}</strong>
                        </Typography>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, gap: 2 }}>
                        <Button variant="outlined" onClick={handleCloseModal} sx={{ flexGrow: 1 }}>
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<SendIcon />}
                            onClick={handleUploadIndividualFile}
                            disabled={!selectedFileType || !individualFileToUpload} // Disable if type or file not selected
                            sx={{ flexGrow: 1 }}
                        >
                            Subir
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
}

export default Archivos;