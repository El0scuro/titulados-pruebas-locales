"use client";
import React from 'react'
import {Box, Button, Stack, TextField} from '@mui/material';
import { Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { GridColDef} from '@mui/x-data-grid';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Estudiante } from '@/types/estudiante'; 
import { Asignacion } from '@/types/asignacion';
import  axios from 'axios';
import __url from '@/lib/const';
import { Notas } from '@/types/notas';
import { useCallback } from "react";
import SingleFileUploadButton from "@/app/components/singleFileButton";
import SendIcon from '@mui/icons-material/Send';
import Swal from 'sweetalert2';
import { Secretario } from '@/types/secretario';
import { Jefatura } from '@/types/jefatura';

interface InformanteContentProps {
  sede: string;
  secretarios: Secretario[];
  jefaturas: Jefatura[];
  mailProfe: string;
}
export interface filas{
  rut: string;
    Estudiante: string;
    fecha: string;
    nota: number | string;
}
function InformanteContent({ sede, secretarios, jefaturas, mailProfe }: InformanteContentProps) {
  
  //state para sellecionar fila que se enviará al componente hijo
  const [filaSeleccionada, setFilaSeleccionada] = useState<filas>();
  //state para las filas de la tabla de informante
  const [filasInformante, setFilasInformante] = useState<filas[]>([]);
  //state para mostrar componente hijo 
  const [showpaginaGuia, setShowpaginaGuia] = useState(false);
  
  //states para la descarga de datos desde el back
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [notas, setNotas] = useState<Notas[]>([]);

  //Correo del profesor que ingresó
  const searchParams = useSearchParams();
  const mail = searchParams.get("mail");
  
  //importo los estudiantes, las notas, y las asignaciones
  useEffect(() => {
    const datos_todos = async () => {
        try {
            const [estRes, asigRes, notaRes] = await Promise.all([
                axios.get(`${__url}/estudiante/todos`),
                axios.get(`${__url}/asignaciones/todas`),
                axios.get(`${__url}/notas/todas`),
            ]);
            setEstudiantes(estRes.data);
            setAsignaciones(asigRes.data);
            setNotas(notaRes.data);
        } catch (error) {
            console.log(error);
        }
    };
    datos_todos();
}, []);

  //filtro las asignaciones con el profesor que ingresó, y las cuales sean con el rol 'informante'
  const asigsInformante = useMemo(() => {
    return asignaciones.filter(a => a.mailProfesor === mail && a.rol === 'informante');
  }, [asignaciones, mail]);

  const secresSede = useMemo(() => {
    return secretarios.filter(sec => sec.sede === sede);
  }, [secretarios, sede])
  
  const jefasSede = useMemo(() => {
    return jefaturas.filter(jef => jef.sede === sede);
  }, [jefaturas, sede])
  
  const remitentes = useMemo(() => {
    const correos: (Jefatura & Secretario)[] = [];

    for(let i = 0; i < secresSede.length; i++){
    correos.push(secresSede[i]);
    }
    
    for(let i = 0; i < jefasSede.length; i++){
      correos.push(jefasSede[i]);
    }

    return correos;
  }, [secresSede, jefasSede])

  //columnas informante
  const columnsInformante: GridColDef[] = [
    { field: 'rut', headerName: 'RUT', width: 90 },
    { field: 'Estudiante', headerName: 'Estudiante', width: 200 },
    { field: 'fecha', headerName: 'Fecha', width:90},
    { field: 'nota', headerName: 'Nota', width:50},
    { field: 'gestionamiento', headerName: 'Gestionamiento', width:300, renderCell: (params)=> <Button onClick={() => {
      setShowpaginaGuia(true); 
      setFilaSeleccionada(params.row); 
    }} 
    >
      Gestionar Documentos y Nota
    </Button>},
    
  ];

  //filas informante
  useEffect(() => {
  if (!asigsInformante.length) {
    setFilasInformante([]);
    return;
  }

  const nuevasFilas = asigsInformante.map(asig => ({
    rut: estudiantes.find(est => est.mail === asig.mailEstudiante)?.rut ?? '---',
    Estudiante: `${estudiantes.find(est => est.mail === asig.mailEstudiante)?.nombre} ${estudiantes.find(est => est.mail === asig.mailEstudiante)?.apellido} ${estudiantes.find(est => est.mail === asig.mailEstudiante)?.segundoApellido}`,
    fecha: asig.fechaAsignacion,
    nota: notas.find(not => not.mailEstudiante === asig.mailEstudiante)?.notaInformante ?? '---'
  }));

  setFilasInformante(nuevasFilas);
}, [asigsInformante, estudiantes, notas]);
  
  const handleGuardarNota = useCallback(
    (notaNueva: number) => {
      if (!filaSeleccionada) return;
        setFilasInformante(prev =>
          prev.map(f =>
            f.rut === filaSeleccionada.rut
              ? { ...f, nota: notaNueva}
              : f
          )
        );
      
    },
    [filaSeleccionada]
  );
  
  return (
    <Box sx={{ p: 3, width: '100%', height: 400 }}>
      <Typography variant='h2'>Sección Informante</Typography>
      <Typography variant='body1' sx={{ mb: 2 }}>Mantente al día con las últimas novedades e informes.</Typography>
      {showpaginaGuia && (
        <PageGestionamiento 
        fila={filaSeleccionada}
        onClose={() => setShowpaginaGuia(false)} 
        onGuardar={handleGuardarNota}
        estudiantes={estudiantes}
        correos={remitentes}
        mailProfe={mailProfe}
        />
        )}
      <DataGrid
        rows={filasInformante}
        columns={columnsInformante}
        getRowId= {(row) => row.rut }
        pageSizeOptions={[5, 10]}
        initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
      />
    </Box>
  )
}
type PageProps ={
  fila: filas | undefined;
  estudiantes: Estudiante[];
  onGuardar: (notaNueva: number) => void;
  onClose: () => void;
  correos: (Jefatura & Secretario)[];
  mailProfe: string;
}
function PageGestionamiento({ onGuardar, onClose, fila, estudiantes, correos, mailProfe}: PageProps){
  
  const [nota, setNota] = useState("");
  const [accion, setAccion] = useState("");
  const [mostrarCarga, setMostrarCarga] = useState(false);
  const [individualFileToUpload, setIndividualFileToUpload] = useState<File | null>(null); // State for the file chosen in the modal
  const [tipo, setTipo] = useState("");
  const [ruta, setRuta] = useState("");
  const [fileInputKey1] = useState('informante'); // <-- Add this state
  if(!fila){
    return;
  }
  const mailEstudiante = estudiantes.find(est => (est.nombre + " " + est.apellido + " " + est.segundoApellido) === fila.Estudiante)?.mail ?? null;
  if(!mailEstudiante){
    console.log(fila.Estudiante)
    return;
  }
  console.log('encontrado')
  const partMail = mailEstudiante.replace(/[^a-zA-Z0-9]/g, '_');
  const guardar = async (nota: string) => {
  try {
    const valor = Number(nota);
    await axios.patch(`${__url}/notas/actualizar`, {
      mailEstudiante,
      tipoNota: "notaInformante",
      valor
    });
    onGuardar(valor);

  } catch (error) {
    console.error(error);
    alert("Error al guardar la nota");
  }
  };
  const handleIndividualFileSelect = (file: File | null) => {
        setIndividualFileToUpload(file);
        if (file) {
            console.log('Archivo individual seleccionado:', file.name, file);
        } else {
            console.log('Archivo individual limpiado.');
        }
    };
  const cargando = () => {
    Swal.fire({
      title: "Cargando . . .",
      text: "Espere por favor",
      html: '<i class="fas fa-spinner fa-spin" style="font-size: 24px;"></i>',
      allowOutsideClick: false,
      showConfirmButton: false,
    });
  };
  const subir_descargar_Documento = async (accion: string, tipo: string, ruta: string) => {
    if(accion === 'cargar'){

      if(!individualFileToUpload){
        return;
      }
      if (!mailEstudiante) {
      Swal.fire("Error", "No se pudo obtener el correo del usuario", "error");
      return;
      }
      cargando();
      const formData = new FormData();
      formData.append("mail", mailEstudiante);
      formData.append("file", individualFileToUpload);
      try{
        await axios.post(`${__url}/${tipo}/${ruta}`, formData, {
          withCredentials: true
        });
        Swal.fire(
          "Subida exitosa",
          `Su archivo se ha cargado correctamente`,
          "success"
        );
        const profe= await axios.get(`${__url}/profesor/${mailProfe}`);
        console.log("a", profe)
        for(let i = 0; i < correos.length; i++){
          await axios.post(`${__url}/mail/enviar`, {
                    toMail: `${correos[i].mail}`,
                    subject: `Documento subido`,
                    text: `El académico ${profe.data.nombre} ${profe.data.apellido} ${profe.data.segundoApellido}, subió una Rúbrica para informante`
          });
        }
      }catch{
        Swal.fire(
          "Error",
          "Hubo un error al subir el archivo, pruebe nuevamente más tarde.",
          "error"
        );
      }
    }else if(accion === 'descargar'){
      try{
        const response = await axios.get(`${__url}/${tipo}/${ruta}`,
          {responseType:'blob'}
        );
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
    
        const a = document.createElement("a");
        a.href = url;
        if(ruta.includes('.xlsx')){
          a.download = `documento_${tipo}.xlsx`;
        }else{
          a.download = `documento_${tipo}.docx`;

        }
    
        document.body.appendChild(a);
        a.click();
    
        a.remove();
        window.URL.revokeObjectURL(url); // buena práctica
    
        Swal.fire("Descargado", "Archivo descargado correctamente", "success");
      } catch{
        Swal.fire(
          "ERROR",
          "El archivo no se ha subido a la base de datos",
          "error"
        );
      }
    }
  };

  return(
    <Box sx={{
      display:'flex',
      flexDirection:'column',
      justifyContent:'center',
      alignItems:'center',
      backgroundColor:'white', 
      position:'absolute', 
      zIndex: 1000, 
      top:"100px",
      left:"800px",
      height:"400px",
      width:"800px",
      borderColor:'black',
      border:1,
      borderRadius:'20px'
    }}>
      <Typography variant='h5' sx={{ mb: 2, textAlign: 'center' }}>
        Indique la acción que quiere realizar
      </Typography>
      
      <Box 
      sx={{
        display:'flex',
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        position:'relative',
        top:'20px',
        
      }}
      >
        

        <Box 
        sx={{
          width:'300px',
          height:'300px',
          border:1,
          borderRadius:'20px',
          display:'flex',
          flexDirection:'column',
          alignItems:'center'
        }}
        >

          <SingleFileUploadButton
          key={fileInputKey1}
          onFileSelect={(file) => {
            handleIndividualFileSelect(file); 
            setAccion('cargar');
            setTipo(fileInputKey1);
            setRuta('rubrica_informante');
            setMostrarCarga(true);
          }}
          onReset={() => setMostrarCarga(false)}
          disabled={fileInputKey1===""}
          buttonText={individualFileToUpload ? `Cambiar Archivo: ${individualFileToUpload.name}` : "Cargar Rúbrica"}
          acceptedFileTypes=".pdf, .doc, .docx, .xlsx, .xls"
          />
          {mostrarCarga && (
              <Box>
                <Box
                sx={{
                display:'flex',
                flexDirection:'row',
                justifyContent:'center',
                alignItems:'center',
                gap:3
                }}
                >
                  
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 2 }}>
                  <Button 
                  variant="outlined" 
                  onClick={onClose} 
                  sx={{width:'100px'}}
                  >
                      Cancelar
                  </Button>
                  <Button
                      variant="contained"
                      startIcon={<SendIcon />}
                      onClick={() => subir_descargar_Documento(accion, tipo, ruta)}
                      disabled={!individualFileToUpload} // Disable if type or file not selected
                      sx={{width:'100px'}}
                  >
                      Subir
                  </Button>
                </Box>
              </Box>
            )}
        </Box>

        <Box 
        sx={{
          width:'180px',
          height:'300px',
          border:1,
          borderRadius:'20px',
          display:'flex',
          flexDirection:'column',
          justifyContent:'center',
          alignItems:'center'
        }}
        >
          <Box 
        sx={{
          width:'300px',
          height:'150px',
          display:'flex',
          flexDirection:'column',
          justifyContent:'center',
          alignItems:'center',
          gap:3
        }}
        >
          <Button
          startIcon={<SendIcon />}
            onClick={() => {
            setAccion('descargar');
            setTipo('informante');
            setRuta('archivos_informante/molde.xlsx')
            subir_descargar_Documento(accion, tipo, "archivos_informante/molde.xlsx")
            }}
            sx={{
            position:'relative',
            backgroundColor:'#003C58', 
            color:'white',
            width:'150px',
            height:'50px',
            borderRadius:'10px',
            }}
            >
              Descargar Plantilla
            </Button>
            
            <Button
              startIcon={<SendIcon />}
              onClick={() => {
                setAccion('descargar');
                setTipo('informante');
                setRuta(`archivos_Informante/${partMail}-documento_informante.xlsx`);
                subir_descargar_Documento(accion, tipo, ruta);
              }}
              sx={{
              backgroundColor:'#003C58', 
              color:'white',
              width:'150px',
              height:'50px',
              borderRadius:'10px'
              }}
            >
              Descargar Rúbrica
            </Button>
          </Box>
          
        </Box>
    
        <Box 
        sx={{
          width:'180px',
          height:'300px',
          border:1,
          borderRadius:'20px',
          display:'flex',
          flexDirection:'column',
          justifyContent:'center',
          alignItems:'center'
        }}
        >
          <Box
          sx={{
            display:'flex',
            justifyContent:'center',
            flexDirection:'column',
            alignItems:'center'
          }}
          >
            <Typography variant='h6' sx={{ mb: 2, textAlign: 'center' }}>
                Ingrese Nota Informante
            </Typography>
            <TextField
              label="Ejemplo: 6.5" 
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              sx={{ width: '120px', height: '50px' }}
            />
            <p>Ingrese un valor entre 1 y 7. <br/> 
                (Con un solo decimal).
            </p>
            <Box sx={{
              display:'flex',
              flexDirection:'row'}}>
                <Stack spacing='30px' direction='row'>
                  <Button 
                  onClick={() => guardar(nota)} 
                  sx={{ 
                    color:'white', 
                    background:'blue'}}
                  >
                    GUARDAR
                  </Button>
                  <Button 
                  onClick={() => {onClose();}} 
                  sx={{ 
                    color:'white', 
                    background:'red'}}
                  >
                    CERRAR
                  </Button>
                </Stack>
            </Box>
          </Box>
        </Box>
      </Box>
      
      
      
    </Box>
  );
}
export default InformanteContent
