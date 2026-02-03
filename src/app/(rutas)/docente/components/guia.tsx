"use client";
import { useEffect, useState, useMemo, use} from "react";
import React from 'react'
import { Box, Button, Stack, TextField} from '@mui/material'; // Added Select, MenuItem, FormControl, InputLabel
import { Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { Asignacion } from '@/types/asignacion';
import axios from 'axios';
import __url from '@/lib/const';
import { Estudiante } from "@/types/estudiante";
import { useSearchParams } from "next/navigation";
import { Notas } from "@/types/notas";
import { useCallback } from "react";
import Swal from "sweetalert2";
import SingleFileUploadButton from "@/app/components/singleFileButton";
import SendIcon from '@mui/icons-material/Send';
import { Secretario } from "@/types/secretario";
import { Jefatura } from "@/types/jefatura";

interface GuiaContentProps {
  sede: any;
  secretarios: Secretario[];
  jefaturas: Jefatura[];
  mailProfe: any;
}

function GuiaContent({ sede, secretarios, jefaturas, mailProfe }: GuiaContentProps) {

  //state para mostrar componente hijo 
  const [showpaginaGuia, setShowpaginaGuia] = useState(false);
  //state para sellecionar fila que se enviará al componente hijo
  const [filaSeleccionada, setFilaSeleccionada] = useState<any>("");
  //state para las filas de la tabla de guia
  const [filasGuia, setFilasGuia] = useState<any[]>([]);

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

  //filtro las asignaciones con el profesor que ingresó, y las cuales sean con el rol 'guia'
  const asigsGuia = useMemo(() => {
    return asignaciones.filter(a => a.mailProfesor === mail && a.rol === 'guia');
  }, [asignaciones, mail]);

  const secresSede = useMemo(() => {
    return secretarios.filter(sec => sec.sede === sede);
  }, [secretarios, sede]);
  
  const jefasSede = useMemo(() => {
    return jefaturas.filter(jef => jef.sede === sede);
  }, [jefaturas, sede]);
  
  const remitentes = useMemo(() => {
    const correos: any[] = [];

    for(let i = 0; i < secresSede.length; i++){
    correos.push(secresSede[i]);
    }
    
    for(let i = 0; i < jefasSede.length; i++){
      correos.push(jefasSede[i]);
    }

    return correos;
  }, [secresSede, jefasSede]);
  
  //columnas guia
  const columnsGuia: GridColDef[] = [
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
  
  //filas guia
    useEffect(() => {
    if (!asigsGuia.length) {
      setFilasGuia([]);
      return;
    }
  
    const nuevasFilas = asigsGuia.map(asig => ({
      rut: asig.id,
      Estudiante: estudiantes.find(est => est.mail === asig.mailEstudiante)
                    ? `${estudiantes.find(est => est.mail === asig.mailEstudiante)?.nombre} 
                    ${estudiantes.find(est => est.mail === asig.mailEstudiante)?.apellido} 
                    ${estudiantes.find(est => est.mail === asig.mailEstudiante)?.segundoApellido}`
                    : '-',
      fecha: asig.fechaAsignacion,
      nota: notas.find(not => not.mailEstudiante === asig.mailEstudiante)?.notaGuia ?? '---',
    }));
  
    setFilasGuia(nuevasFilas);
  }, [asigsGuia, estudiantes, notas]);

  const handleGuardarNota = useCallback(
    (notaNueva: number) => {
      if (!filaSeleccionada) return;
        setFilasGuia(prev =>
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
      <Typography variant='h2'>Sección Guía</Typography>
      <Typography variant='body1' sx={{ mb: 2 }}>
        Aquí encontrarás información y recursos para guiarte.
      </Typography>
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
        rows={filasGuia}
        columns={columnsGuia}
        pageSizeOptions={[5, 10]}
        getRowId= {(row) => row.rut }
        initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
      />
    </Box>
  )
}
type PageProps ={
  fila: any;
  estudiantes: Estudiante[];
  onGuardar: (notaNueva: number) => void;
  onClose: () => void;
  correos: any[];
  mailProfe: any;
}
function PageGestionamiento({ onGuardar, onClose, fila, estudiantes, correos, mailProfe}: PageProps){
  const [nota, setNota] = useState("");
  const [accion, setAccion] = useState("");
  const [mostrarCarga, setMostrarCarga] = useState(false);
  const [mostrarDescarga, setMostrarDescarga] = useState(false);
  const [mostrarCambio, setMostrarCambio] = useState(false);
  const [individualFileToUpload, setIndividualFileToUpload] = useState<File | null>(null); // State for the file chosen in the modal
  const [tipo, setTipo] = useState("");
  const [ruta, setRuta] = useState("");
  const [fileInputKey1, setFileInputKey1] = useState('tesis'); // <-- Add this state
  const [fileInputKey2, setFileInputKey2] = useState('guia'); // <-- Add this state
  const [tesisVisible, setTesisVisible] = useState(true);
  const [guiaVisible, setGuiaVisible] = useState(true);
  const mailEstudiante = estudiantes.find(est => est.rut === fila.rut)?.mail ?? null;
  if(!mailEstudiante){
    return;
  }
  const partMail = mailEstudiante.replace(/[^a-zA-Z0-9]/g, '_');
  console.log(partMail)
  const guardar = async (nota: string) => {
  try {
    const valor = Number(nota);
    await axios.patch(`${__url}/notas/actualizar`, {
      mailEstudiante,
      tipoNota: "notaGuia",
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
  const subir_descargar_Documento = async (accion: string, tipo: string, ruta: string, e?: React.ChangeEvent<HTMLInputElement>) => {
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
        const response = await axios.post(`${__url}/${tipo}/${ruta}`, formData, {
          withCredentials: true
        });
        Swal.fire(
          "Subida exitosa",
          `Su ${tipo} ha sido subida correctamente`,
          "success"
        );
        const profe= await axios.get(`${__url}/profesor/${mailProfe}`);
        console.log("a", profe)
        for(let i = 0; i < correos.length; i++){
          await axios.post(`${__url}/mail/enviar`, {
                    toMail: `${correos[i].mail}`,
                    subject: `Documento subido`,
                    text: `El académico ${profe.data.nombre} ${profe.data.apellido} ${profe.data.segundoApellido}, subió una Rúbrica para guía`
          });
        }
        
      }catch(err: any){
        console.log(
          "Error al subir el archivo:",
          err.response?.data ?? err.message
        );
        Swal.fire(
          "Error",
          "Hubo un error al subir el archivo, pruebe nuevamente más tarde.",
          "error"
        );
      }
    }else if(accion === 'descargar'){
      try{
        console.log(`${__url}/${tipo}/${ruta}`)
        const response = await axios.get(`${__url}/${tipo}/${ruta}`,
          {responseType:'blob'}
        );
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
    
        const a = document.createElement("a");
        a.href = url;
        a.download = `documento_${tipo}.docx`;
    
        document.body.appendChild(a);
        a.click();
    
        a.remove();
        window.URL.revokeObjectURL(url); // buena práctica
    
        Swal.fire("Descargado", "Archivo descargado correctamente", "success");
      } catch (error) {
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
      backgroundColor:'white', 
      position:'absolute', 
      zIndex: 1000, 
      top:"100px",
      left:"800px",
      height:"400px",
      width:"550px",
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
        alignItems:'center'
      }}
      >
        <Button
        onClick={() => {
          setAccion("descargar");
          setMostrarCarga(false);
          setMostrarCambio(false);
          setMostrarDescarga(true)
        }}
        >
          Descargar Archivo 
        </Button>
        <Button
        onClick={() => {
          setAccion("cargar");
          setMostrarCarga(true);
          setMostrarCambio(false);
          setMostrarDescarga(false);
        }}
        >
          Cargar Archivo
        </Button>
        <Button
        onClick={() => {
          setMostrarCambio(true);
          setMostrarCarga(false);
          setMostrarDescarga(false);
        }}
        >
          Cambiar Nota
        </Button>
      </Box>
      
      {mostrarCarga && (
        <Box
        position='relative'
        top='20px'
        >
          <Typography variant='h6' sx={{ mb: 2, textAlign: 'center' }}>
            Indique el tipo de archivo que quiere cargar
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
            {guiaVisible && (
              <SingleFileUploadButton
                key={fileInputKey1}
                onFileSelect={(file) => {
                  handleIndividualFileSelect(file); 
                  setTipo(fileInputKey1);
                  setRuta('Tesis');
                  setFileInputKey2("");
                  setTesisVisible(false)
                }}
                onReset={() => {
                  setFileInputKey2('guia');
                  setTesisVisible(true);
                }}
                disabled={fileInputKey1===""}
                buttonText={individualFileToUpload ? `Cambiar Archivo: ${individualFileToUpload.name}` : "Tesis"}
                acceptedFileTypes=".pdf, .doc, .docx, .xlsx, .xls"
              />
            )}
            
            {tesisVisible && (
              <SingleFileUploadButton
                key={fileInputKey2}
                disabled={fileInputKey2===""}
                onFileSelect={(file) => {
                  handleIndividualFileSelect(file); 
                  setTipo(fileInputKey2);
                  setRuta('rubrica_guia');
                  setFileInputKey1("");
                  setGuiaVisible(false);
                }}
                onReset={() => {
                  setFileInputKey1('tesis');
                  setGuiaVisible(true)
                }}
                buttonText={individualFileToUpload ? `Cambiar Archivo: ${individualFileToUpload.name}` : "Rúbrica"}
                acceptedFileTypes=".pdf, .doc, .docx, .xlsx, .xls"
              />
            )}
            
            
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 2 }}>
              <Button 
              variant="outlined" 
              onClick={onClose} 
              sx={{width:'250px'}}
              >
                  Cancelar
              </Button>
              <Button
                  variant="contained"
                  startIcon={<SendIcon />}
                  onClick={() => subir_descargar_Documento(accion, tipo, ruta)}
                  disabled={!individualFileToUpload} // Disable if type or file not selected
                  sx={{width:'250px'}}
              >
                  Subir
              </Button>
          </Box>
        </Box>
      )}
      {mostrarCambio && (
        <Box
        position='relative'
        top='50px'
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
                Nota Guía
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
      )}
      {mostrarDescarga && (
        <Box
        position='relative'
        top='60px'
        >
          <Typography variant='h6' sx={{ mb: 2, textAlign: 'center' }}>
            Indique el tipo de archivo que quiere descargar
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
            <Button
                startIcon={<SendIcon />}
                onClick={() => {
                  setTipo('tesis');
                  setRuta(`archivos_Tesis/${partMail}-documento_tesis.docx`);
                  subir_descargar_Documento(accion, tipo, ruta)
                }}
                sx={{backgroundColor:'#003C58', color:'white'}}
            >
                Rúbrica
            </Button>
            <Button
                startIcon={<SendIcon />}
                onClick={() => {
                  setTipo('tesis');
                  setRuta(`archivos_Tesis/${partMail}-documento_tesis.docx`);
                  subir_descargar_Documento(accion, tipo, ruta)
                }}
                sx={{
                  backgroundColor:'#003C58', 
                  color:'white'}}
            >
                Tesis
            </Button>
            <Button 
            onClick={() => {onClose();}} 
            sx={{ 
            position:'absolute',
            top:'200px',
            left:'450px',
            color:'white', 
            background:'red'}}
            >
              CERRAR
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
export default GuiaContent