'use client';
import estilo from "./style_boton.module.css"
import Link from "next/link";
import PersonIcon from '@mui/icons-material/Person';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import SchoolIcon from '@mui/icons-material/School';
import SettingsIcon from '@mui/icons-material/Settings';
const perfiles = [
    {
      id: 'estudiantes',
      title: 'Estudiantes',
      description: 'Suba sus documentos necesarios para iniciar su proceso de titulación.',
      icon: PersonIcon,
      link: '/auth/login?role=estudiante',
      
    },
    {
      id: 'secretarias',
      title: 'Secretari@s',
      description: 'Gestione alumnos.',
      icon: BusinessCenterIcon,
      link: '/auth/login?role=secretaria',
    },
    {
      id: 'academicos',
      title: 'Académicos',
      description: 'Gestione a sus alumnos.',
      icon: SchoolIcon,
      link: '/auth/login?role=academico',
    },
    {
      id: 'jefaturas',
      title: 'Jefaturas',
      description: 'Ver información generalizada del sistema.',
      icon: SettingsIcon,
      link: '/auth/login?role=jefatura',
    },
  ];
export default function Boton_Perfil() {
    return (
        <>
            {perfiles.map((perfil) => {
                const Icon = perfil.icon
                return(
                    <Link 
                      key={perfil.id} 
                      href={perfil.link} 
                      className={estilo.boton} 
                    >
                        <Icon sx={{
                          fontSize: 70,
                          color: "white",
                        }}/>
                        <h3 className={estilo.color}>{perfil.title} </h3>
                        <p className={estilo.color}>{perfil.description}</p>
                    </Link>
                );
            })}
        </>
    );
}
