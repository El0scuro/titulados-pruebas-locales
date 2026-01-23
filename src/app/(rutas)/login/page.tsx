'use client';
import Botones from "../../components/botones_login/botones";
import Estilo_login from "./estilos.module.css"
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedinIcon from '@mui/icons-material/LinkedIn';
import Image from "next/image";
import Foto1 from "../../components/Fotos_info/LOGO-UV-APU-AZUL_1.png";
import Foto2 from "../../components/Fotos_info/logo1.png";
import { IconButton } from "@mui/material";

export default function LoginPage(){
  
    return (
        <div className= {Estilo_login.contenedor_page}>
            <header className={Estilo_login.header}>
                <h1 className= {Estilo_login.titulo}>Sistema de titulados UV</h1>
                <p className={Estilo_login.subtitulo}>Seleccione su perfil para entrar al sistema</p>
            </header>
            
            <div className={Estilo_login.contenedor_botones}>
                <Botones/>
            </div>
            <div className={Estilo_login.contenedor_info}>
                <div className={Estilo_login.div_left}>
                    <p className= {Estilo_login.info}>
                        Escuela de Administración Pública, Casa Central - Las Heras 6, Valparaíso | +56 (32) 250 7961
                        Campus Santiago - Gran Avenida José Miguel Carrera 4160, San Miguel | +56 (2) 2329 2149
                        Universidad de Valparaíso. Blanco 951, Valparaíso, Chile. Fono: +56 (32) 250 7000.
                    </p>
                    <div className={Estilo_login.redes}>
                        <IconButton color="secondary" component="a" href="https://www.instagram.com/administracionpublicauv/">
                            <InstagramIcon  />
                        </IconButton>
                        <IconButton color="secondary" component="a" href="https://www.facebook.com/admpublicauv">
                            <FacebookIcon />
                        </IconButton>
                        <IconButton color="secondary" component="a" href="https://www.linkedin.com/in/administraci%C3%B3n-p%C3%BAblica-universidad-de-valpara%C3%ADso-b785a4b4/">
                            <LinkedinIcon />
                        </IconButton>
                    </div>
                </div>
                <div className={Estilo_login.color}>
                    <div className={Estilo_login.div_right}>
                    <Image src={Foto1} alt="Logo 1" className={Estilo_login.foto1}/>
                    <Image src={Foto2} alt="Logo 2" className={Estilo_login.foto2}/>
                    </div>
                </div>  
                
            </div>
        </div>
    );
}