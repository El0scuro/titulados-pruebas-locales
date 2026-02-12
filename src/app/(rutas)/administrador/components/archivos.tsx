"use client"; // Required for client-side components in Next.js App Router
import CloudDownloadDualColor from '@/app/components/downloadIcon';
import Backdrop from '@mui/material/Backdrop';
import { Box, Button, Card, Typography, Modal, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent} from '@mui/material'; // Added Select, MenuItem, FormControl, InputLabel
import React, { useEffect, useMemo, useState } from 'react';
import SingleFileUploadButton from '@/app/components/singleFileButton'; // Ensure this path is correct
import SendIcon from '@mui/icons-material/Send';

import { DataGrid} from '@mui/x-data-grid';
import type { GridColDef} from '@mui/x-data-grid';
import axios from 'axios';
import __url from '@/lib/const';
import Swal from 'sweetalert2';
import RefreshIcon from '@mui/icons-material/Refresh';
import * as XLSX from 'xlsx';
import { Estudiante } from '@/types/estudiante';
import { Profesor } from '@/types/profesor';
import { Asignacion } from '@/types/asignacion';
import { Notas } from '@/types/notas';
import { Tesis } from '@/types/tesis';
function Archivos() {

    const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
    const [profesores, setProfesores] = useState<Profesor[]>([]);
    const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
    const [notas, setNotas] = useState<Notas[]>([]);
    const [tesis, setTesis] = useState<Tesis[]>([]);
    //Aquí se guardará la plantilla excel
    const [archivoExcel, setArchivoExcel] = useState<File | null>(null);

    const [selectedStudentIdForUpload, setSelectedStudentIdForUpload] = useState<string | null>(null);

    const [openUploadModal, setOpenUploadModal] = useState(false); // Renamed 'open' to 'openModal' for clarity

    const [openDownloadModal, setOpenDownloadModal] = useState(false);

    const [selectedFileType, setSelectedFileType] = useState<string>(''); // State for selected file type in modal

    const [individualFileToUpload, setIndividualFileToUpload] = useState<File | null>(null); // State for the file chosen in the modal

    const [fileInputKey] = useState(0); // <-- Add this state
    
    const [finished, setFinished] = useState(true);

    useEffect(() => {
        if(!finished){
            return;
        }
        const datos_todos = async() => {
            const [estRes, proRes, asiRes, notRes, tesRes] = await Promise.all([
                axios.get(`${__url}/estudiante/todos`),
                axios.get(`${__url}/profesor/todos`),
                axios.get(`${__url}/asignaciones/todas`),
                axios.get(`${__url}/notas/todas`),
                axios.get(`${__url}/tesis/todas`)
            ]);
            setEstudiantes(estRes.data);
            setProfesores(proRes.data);
            setAsignaciones(asiRes.data);
            setNotas(notRes.data);
            setTesis(tesRes.data);
            setFinished(false);
        }
        datos_todos();
    }, [finished]);

    //selecciona el archivo excel y lo guarda en ArchivoExcel
    const handleExcelFileSelect = (file: File | null) => { // Renamed for clarity
        setArchivoExcel(file);
        if (file) {
            console.log('Archivo Excel seleccionado:', file.name, file);
        } else {
            console.log('Archivo Excel limpiado.');
        }
    };

    const handleFileDownload = async () => {
  try {
    const response = await axios.get(
      `${__url}/secretario/archivos_secretaria/plantilla.xlsx`,
      { responseType: "blob" }
    );

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "ficha_de_estudiantes.xlsx";

    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url); // buena práctica

    Swal.fire("Descargado", "Archivo descargado correctamente", "success");
  } catch (error) {
    console.log(error);
    Swal.fire(
      "Error",
      "Hubo un error al descargar el archivo",
      "error"
    );
  }
};

    const handleExcel = (file: File) => {
        const reader = new FileReader();  
        //se ejecuta cuando se termine de leer el archivo
        reader.onload = async(e) => {
            const data = e.target?.result;
            if (!data) return;

            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const json = XLSX.utils.sheet_to_json(worksheet);
            await axios.post(`${__url}/estudiante/varios`, json, {
                withCredentials: true
            })
            
        };
        //Lee el archivo
        reader.readAsArrayBuffer(file);
    };
    //Abrir y  cerrar ventana para subir archivos individuales
    const handleOpenUploadModal = () => setOpenUploadModal(true);
    const handleCloseUploadModal = () => {
        setOpenUploadModal(false);
        setSelectedFileType(''); // Reset selected file type on close
        setIndividualFileToUpload(null); // Reset file on close
        setSelectedStudentIdForUpload(null); // Reset student ID on close
    };

    //Abrir y cerrar ventana para bajar archivos individuales

    const handleOpenDownloadModal = () => setOpenDownloadModal(true);
    const handleCloseDownloadModal = () => {
        setOpenDownloadModal(false);
        setSelectedFileType(''); // Reset selected file type on close
        setIndividualFileToUpload(null); // Reset file on close
        setSelectedStudentIdForUpload(null); // Reset student ID on close
    };

    // --- DataGrid Columns and Rows for Manual File Upload Section ---
    interface StudentRow {
        nombre: string;
        apellido: string;
        segundoApellido: string;
        mail: string;
        rut: string;
        sede: string;
    }

    const columns: GridColDef<StudentRow>[] = [
        { field: 'nombre', headerName: 'Nombre', width: 130, editable: true },
        { field: 'segundoNombre', headerName: 'Segundo Nombre', width: 130, editable: true },
        { field: 'apellido', headerName: 'Apellido Paterno', width: 130, editable: true },
        { field: 'segundoApellido', headerName: 'Apellido Materno', width: 130, editable: true },
        { field: 'mail', headerName: 'Correo', width: 200, editable: true },
        { field: 'rut', headerName: 'RUT', width: 120, editable: true },
        { field: 'sede', headerName: 'Sede', width: 120},
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Acciones',
            width: 120,
            renderCell: (params) => (
                <Box
                sx={{
                    display:'flex',
                    flexDirection:'column',
                    justifyContent:'center',
                    height:'100%',
                }}
                >
                    <Button
                    sx={{display:'flex',
                        justifyContent:'center',
                        alignItems:'center',
                        height:'20px'
                    }}
                    onClick={() => handleClickUpload(params.row.mail)}
                    
                    >
                        Subir Documento
                    </Button>
                    <Button
                    sx={{display:'flex',
                        justifyContent:'center',
                        alignItems:'center',
                        height:'20px'
                    }}
                    onClick={() => handleClickDownload(params.row.mail)}
                    >
                        Bajar Documento
                    </Button>
                </Box>
                
            )
        },
    ];

    const filas = useMemo(() => {
        if(!estudiantes.length) return [];
        const Filas = estudiantes.map(est => {
            return {
                nombre: est.nombre,
                segundoNombre: est.segundoNombre,
                apellido: est.apellido,
                segundoApellido: est.segundoApellido,
                mail: est.mail,
                rut: est.rut,
                sede: est.sede
            }
        });
        return Filas
    }, [estudiantes])

    // Handler for the "Subir Documento" button click within DataGrid
    const handleClickUpload = (mail: string) => {
        setSelectedStudentIdForUpload(mail);
        handleOpenUploadModal(); // Open the modal
    };
    // Handler for the "Bajar Documento" button click within DataGrid
    const handleClickDownload = (mail: string) => {
        setSelectedStudentIdForUpload(mail);
        handleOpenDownloadModal(); // Open the modal
    };

    const handleFileTypeChange = (event: SelectChangeEvent) => {
  setSelectedFileType(event.target.value);
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
            formData.append('mail', selectedStudentIdForUpload);
            formData.append('file', individualFileToUpload);
            try {
                
                switch (selectedFileType){
                case "ficha":
                    axios.post(`${__url}/${selectedFileType}/ficha_inscripcion`, formData, {
                        withCredentials: true,
                    });
                    break;
                case "tesis":
                    axios.post(`${__url}/${selectedFileType}/Tesis`, formData, {
                        withCredentials: true,
                    });
                    break;
                case "guia":
                    axios.post(`${__url}/${selectedFileType}/rubrica_guia`, formData, {
                        withCredentials: true,
                    });
                    break;
                case "informante":
                    axios.post(`${__url}/${selectedFileType}/rubrica_informante`, formData, {
                        withCredentials: true,
                    });
                    break;
                default:
                    break;
            }
                
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
                        
            handleCloseUploadModal();

        } else {
            console.warn('Faltan datos para subir el archivo individual (estudiante, tipo de archivo o archivo).');
            alert('Por favor, selecciona el tipo de archivo y el archivo a subir.');
        }
    };
    
    const handleReporteFileDownload = async() => {
        try{
            //datos que se suirán al reporte
            const datos: any[] = [];

            let mailGuia: string;
            let guia;
            let mailInformante: string;
            let informante;
            let mailPresidente: string;
            let presidente;
            let mailSecretario: string;
            let secretario;
            
            let notasEstudiante: Notas | undefined;
            let notaGuia;
            let notaInformante;
            let notaTesis;
            let notaDefensa;
            let notaFinal;

            let tesisEstudiante;

            let fechaExamen;
            let horaExamen;
            for(let i = 0; i < estudiantes.length; i++){
                //asignaciones del estudiante filtrada por los roles
                mailGuia = asignaciones.filter(asig => asig.mailEstudiante === estudiantes[i].mail).find(asig => asig.rol === 'guia')?.mailProfesor ?? '---';
                guia = profesores.find(pro => pro.mail === mailGuia)?.nombre + " " + profesores.find(pro => pro.mail === mailGuia)?.apellido + " " + profesores.find(pro => pro.mail === mailGuia)?.segundoApellido;
                
                mailInformante = asignaciones.filter(asig => asig.mailEstudiante === estudiantes[i].mail).find(asig => asig.rol === 'informante')?.mailProfesor ?? '---';
                informante = profesores.find(pro => pro.mail === mailInformante)?.nombre + " " + profesores.find(pro => pro.mail === mailInformante)?.apellido + " " + profesores.find(pro => pro.mail === mailInformante)?.segundoApellido;
                
                mailPresidente = asignaciones.filter(asig => asig.mailEstudiante === estudiantes[i].mail).find(asig => asig.rol === 'presidente')?.mailProfesor ?? '---';
                presidente = profesores.find(pro => pro.mail === mailPresidente)?.nombre + " " + profesores.find(pro => pro.mail === mailPresidente)?.apellido + " " + profesores.find(pro => pro.mail === mailPresidente)?.segundoApellido;
                
                mailSecretario = asignaciones.filter(asig => asig.mailEstudiante === estudiantes[i].mail).find(asig => asig.rol === 'secretario')?.mailProfesor ?? '---';
                secretario = profesores.find(pro => pro.mail === mailSecretario)?.nombre + " " + profesores.find(pro => pro.mail === mailSecretario)?.apellido + " "  + profesores.find(pro => pro.mail === mailSecretario)?.segundoApellido;
                
                //notas del estudiante
                notasEstudiante = notas.find(not => not.mailEstudiante === estudiantes[i].mail);
                notaGuia = notasEstudiante?.notaGuia;
                notaInformante = notasEstudiante?.notaInformante;
                notaTesis = notasEstudiante?.notaTesis;
                notaDefensa = notasEstudiante?.notaExamenOral;
                notaFinal = notasEstudiante?.notaFinal;
                if(mailGuia === undefined){
                    guia = 'Ninguno';
                }
                if(mailInformante === undefined){
                    informante = 'Ninguno';
                }
                if(mailPresidente === undefined){
                    presidente = 'Ninguno';
                }
                if(mailSecretario === undefined){
                    secretario = 'Ninguno';
                }
                
                if(!tesisEstudiante){
                    tesisEstudiante = 'No se ha subido'
                }

                if(!notaGuia){
                    notaGuia = 1
                }
                if(!notaInformante){
                    notaInformante = 1
                }
                if(!notaTesis){
                    notaTesis = 1
                }
                if(!notaDefensa){
                    notaDefensa = 1
                }
                if(!notaFinal){
                    notaFinal = 1
                }
                fechaExamen = estudiantes[i].fechaExamen;
                horaExamen = estudiantes[i].hora;
                if(!fechaExamen){
                    fechaExamen = 'No establecida aún'
                }
                if(!horaExamen){
                    horaExamen = 'No establecida aún'
                }
                const numero = i + 1;
                const alumno = estudiantes[i].nombre + " " + estudiantes[i].segundoNombre + " " + estudiantes[i].apellido + " " + estudiantes[i].segundoApellido;
                tesisEstudiante = tesis.find(tes => tes.mailEstudiante === estudiantes[i].mail)?.nombreArchivo;
                if(!tesisEstudiante){
                    tesisEstudiante = 'No se ha subido'
                }
                
                datos.push({
                    numero,
                    semestre: estudiantes[i].semestre,
                    alumno,
                    rut: estudiantes[i].rut,
                    codCarrera: estudiantes[i].codigo,
                    ingreso: estudiantes[i].agnoIngreso,
                    egreso: estudiantes[i].agnoEgreso,
                    fechaExamen,
                    horaExamen,
                    mailEstudiante: estudiantes[i].mail,
                    celular: estudiantes[i].celular,
                    guia,
                    informante,
                    presidente,
                    secretario,
                    tesis: tesisEstudiante,
                    notaGuia,
                    notaInformante,
                    notaTesis,
                    notaDefensa,
                    notaFinal
                })
            }
            const response = await axios.post(`${__url}/excel/reporte`, datos, {
                responseType: 'blob'
            })
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `Reporte_Estudiantes.xlsx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.log(error);
        }
    }

    const handleStudentFileDownload = async () => {
    try {
        if (selectedStudentIdForUpload && selectedFileType) {
            const partMail = selectedStudentIdForUpload.replace(/[^a-zA-Z0-9]/g, '_');
            try {
                let response;
                let blob;
                let url;
                let a;
                switch (selectedFileType){
                case 'fichas_inscripcion':
                    
                    response = await axios.get(`${__url}/ficha/${selectedFileType}/${partMail}-Formulario_Inscripcion_Seminario_de_Titulo.docx`, 
                        { responseType: "blob" }
                    );
                    blob = new Blob([response.data]);
                    url = window.URL.createObjectURL(blob);

                    a = document.createElement("a");
                    a.href = url;
                    a.download = partMail + "-Formulario_Inscripcion_Seminario_de_Titulo.docx";

                    document.body.appendChild(a);
                    a.click();

                    a.remove();
                    window.URL.revokeObjectURL(url); // buena práctica
                    break;
                case "archivos_Tesis":
                    console.log('tesis')
                    response = await axios.get(`${__url}/tesis/${selectedFileType}/${partMail}-documento_tesis.xlsx`, 
                        { responseType: "blob" }
                    );
                    blob = new Blob([response.data]);
                    url = window.URL.createObjectURL(blob);

                    a = document.createElement("a");
                    a.href = url;
                    a.download = partMail + "-Tesis.docx";

                    document.body.appendChild(a);
                    a.click();

                    a.remove();
                    window.URL.revokeObjectURL(url); // buena práctica
                    break;
                case "archivos_Guia":
                    response = await axios.get(`${__url}/${selectedFileType}/${partMail}-documento_guia.docx`, 
                        { responseType: "blob" }
                    );
                    blob = new Blob([response.data]);
                    url = window.URL.createObjectURL(blob);

                    a = document.createElement("a");
                    a.href = url;
                    a.download = partMail + "-Formulario_Inscripcion_Seminario_de_Titulo.docx";

                    document.body.appendChild(a);
                    a.click();

                    a.remove();
                    window.URL.revokeObjectURL(url); // buena práctica
                    break;
                case "archivos_Informante":
                    response = await axios.get(`${__url}/${selectedFileType}/${partMail}`, 
                        { responseType: "blob" }
                    );
                    blob = new Blob([response.data]);
                    url = window.URL.createObjectURL(blob);

                    a = document.createElement("a");
                    a.href = url;
                    a.download = partMail + "-Formulario_Inscripcion_Seminario_de_Titulo.docx";

                    document.body.appendChild(a);
                    a.click();

                    a.remove();
                    window.URL.revokeObjectURL(url); // buena práctica
                    break;
                default:
                    break;
            }
                
                Swal.fire({
                    icon: 'success',
                    title: `Archivo bajado correctamente`
                })

            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al subir el archivo',
                    text: `No se pudo subir el archivo`,
                });
                console.error('Error de red al subir archivo individual:', error);
            }
                        
            handleCloseDownloadModal();
        } else {
            console.warn('Faltan datos para subir el archivo individual (estudiante, tipo de archivo o archivo).');
            alert('Por favor, selecciona el tipo de archivo y el archivo a subir.');
        }
        Swal.fire("Descargado", "Archivo descargado correctamente", "success");
    } catch (error) {
        console.log(error)
        Swal.fire(
        "Error",
        "Hubo un error al descargar el archivo",
        "error"
        );
    }
    };
    return (
        <Box sx={{ p: 3, width: '100%' }}>

            <Card sx={{ mb: 3, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 3 }}>
                <Typography variant="h5" sx={{ mb: 1, fontWeight: 600, textAlign: 'center' }}>
                    Carga de estudiantes vía archivo Excel
                </Typography>
                <Button
                    variant="contained"
                    component="span"
                    startIcon={<CloudDownloadDualColor />}
                    onClick={handleFileDownload}
                    sx={{
                        color:'#003c58',
                        backgroundColor:'white',
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
                    Descargar plantilla para estudiantes
                </Button>
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
                            onClick={() => handleExcel(archivoExcel)}
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
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<SendIcon />}
                            onClick={handleReporteFileDownload}
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
                            Descargar reporte de estudiantes
                        </Button>
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
                    <Button onClick={() => setFinished(true)} startIcon={<RefreshIcon />}>
                        Recargar Estudiantes
                    </Button>
                    <DataGrid
                        rows={filas}
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
                open={openUploadModal} // Use openModal state
                onClose={handleCloseUploadModal}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{
                    backdrop: {
                        timeout: 500,
                    },
                }}
            >
                <Box sx={{
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
                }}>
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
                        <Button variant="outlined" onClick={handleCloseUploadModal} sx={{ flexGrow: 1 }}>
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

            {/* Modal for individual file download */}
            <Modal
                aria-labelledby="upload-modal-title"
                aria-describedby="upload-modal-description"
                open={openDownloadModal} // Use openModal state
                onClose={handleCloseDownloadModal}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{
                    backdrop: {
                        timeout: 500,
                    },
                }}
            >
                <Box sx={{
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
                }}>
                    <Typography id="upload-modal-title" variant="h6" component="h2" sx={{ textAlign: 'center', mb: 2 }}>
                        Bajar Documento de él Estudiante : {selectedStudentIdForUpload}
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
                            <MenuItem value="fichas_inscripcion">Ficha de Ingreso</MenuItem>
                            <MenuItem value="archivos_Tesis">Tesis</MenuItem>
                            <MenuItem value="archivos_Guia">Rubrica Guía</MenuItem>
                            <MenuItem value="archivos_Informante">Rubrica Informante</MenuItem>
                        </Select>
                    </FormControl>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, gap: 2 }}>
                        <Button variant="outlined" onClick={handleCloseDownloadModal} sx={{ flexGrow: 1 }}>
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<SendIcon />}
                            onClick={handleStudentFileDownload}
                            disabled={!selectedFileType} // Disable if type not selected
                            sx={{ flexGrow: 1 }}
                        >
                            Bajar
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
}

export default Archivos;