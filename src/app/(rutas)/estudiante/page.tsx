'use client';
import React from 'react'
import axios from "axios";
import LogoutIcon from "@mui/icons-material/Logout";
import Swal from "sweetalert2";
import { Box, Dialog, DialogActions, 
        DialogContent, DialogContentText,
        DialogTitle, Button, Typography} from '@mui/material'
import estilo from "./style.module.css";
import { useSearchParams } from "next/navigation";
import __url from "../../../lib/const";
import { useUser } from '@auth0/nextjs-auth0';

function Page() {
  const searchParams = useSearchParams();
  const mail = searchParams.get("mail");
  if(!mail){
    return;
  }
  console.log(mail)
  
  const {user,isLoading} = useUser();
  const [open, setOpen] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const handleClose = () => {
  setOpen(false);
  };
  const handleClose2 = () => {
  setOpen2(false);
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
  const handleFileUpload = async (e:React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }
    const file = files[0];

    cargando();

    const formData = new FormData();
    formData.append("mail", mail);
    formData.append("file", file);
    

    if (!mail) {
    Swal.fire("Error", "No se pudo obtener el correo del usuario", "error");
    return;
  }

    const endpoint = `${__url}/archivos`;


    try {
      const response = await axios.post(endpoint, formData, {
        withCredentials: true,
      });
      Swal.fire(
        "Subida exitosa",
        "Su ficha ha sido subida correctamente",
        "success"
      );
    } catch (err:any) {
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
  };
  const handleFileDownload = async () => {
    const url = `${__url}/archivos/molde`;

    try {
      const response = await axios.get(url, {
        responseType: "blob",
      });

      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute(
        "download",
        "Formulario Inscripción Seminario de Título.docx"
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);

      Swal.fire(
        "Descargado",
        "El archivo se ha descargado correctamente.",
        "success"
      );
    } catch (error: any) {
      console.log("Error durante la descarga:", error);
      Swal.fire(
        "Error",
        "Hubo un error al descargar el archivo, pruebe nuevamente más tarde.",
        "error"
      );
    }
  };
  if(isLoading){
    return cargando;
  }
  return (
      <>
        <Button
          href="/auth/logout"
          variant="contained"
          color="secondary"
          startIcon={<LogoutIcon />}
          style={{ position: "absolute", top: "20px", right: "20px" }}
        >
        Salir
        </Button>
        <Box sx={{
          display:"flex", 
          flexDirection:"column", 
          justifyContent:"center", 
          alignItems:"center", 
          gap:"100px"}} 
          className={estilo.contenedor_page}
        >
          <Box sx={{
            width:"550px", 
            height:"250px", 
            backgroundColor:"lightgray", 
            display:"flex", 
            flexDirection:"column", 
            justifyContent:"center", 
            alignItems:"center",
            gap:"10px",
            borderRadius:"3%"}}
          >
            <Box sx={{ 
              padding: 2, 
              display: "flex", 
              position:"relative",
              bottom:"10px",
              textAlign: 'center',
              alignItems:"flex-start", 
              justifyContent:"center"}}>
              <Typography variant="h4" >Bienvenido al Sistema de Titulación</Typography>
            </Box>
            <Box sx={{ 
              padding: 2, 
              height:"70px", 
              width:"500px", 
              display:"flex",
              textAlign:"center",
              position:"relative",
              bottom:"50px"}} >
              <Typography variant='body1' sx={{ marginTop: 2}}>
                  Por favor, complete la ficha de inscripción para alumnos. Asegúrese 
                  de proporcionar toda la información requerida de manera precisa y completa. 
              </Typography>
            </Box>
            <Box sx={{
              display:"flex", 
              justifyContent:"center", 
              alignItems:"center",
              position:"relative",
              bottom:"30px",
              gap:"15px",
              textAlign:"center"}}>
              <Button
                onClick={handleFileDownload}
                variant="contained"
                sx={{
                  backgroundColor: "rgba(0, 150, 136, 1)",
                  height:"50px",
                  width:"180px",
                  transition: "transform 0.3s ease-out, box-shadow 0.3s ease-out",
                  "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6}
                }}      
              >
                Descargar Ficha de Inscripción
              </Button>
              <input
                className={estilo.input}
                accept="*"
                id="upload-ficha"
                type="file"
                onChange={(e) => handleFileUpload(e)}
              ></input>
              <label
                htmlFor="upload-ficha"
              >
              <Button
                variant="contained"
                component="span"
                sx={{ 
                  backgroundColor: "rgba(0, 60, 88, 1)",
                  height:"50px",
                  width:"180px",
                  transition: "transform 0.3s ease-out, box-shadow 0.3s ease-out",
                  "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6}
                }}
              >
                Subir Ficha de Inscripción
              </Button>
                </label>
            </Box>
          </Box>
          <Dialog open={open} onClose={handleClose}>
              <DialogTitle>Notificación</DialogTitle>
              <DialogContent>
                  <DialogContentText>¡Archivo subido con éxito!</DialogContentText>
              </DialogContent>
              <DialogActions>
                  <Button onClick={handleClose}>Cerrar</Button>
              </DialogActions>
          </Dialog>
          <Dialog open={open2} onClose={handleClose2}>
              <DialogTitle>Notificación</DialogTitle>
              <DialogContent>
                  <DialogContentText>
                      Hubo un error al subir el archivo, pruebe nuevamente más tarde
                  </DialogContentText>
              </DialogContent>
              <DialogActions>
                  <Button onClick={handleClose2}>Cerrar</Button>
              </DialogActions>
          </Dialog>
        </Box>
      </>
  )


}
export default Page
