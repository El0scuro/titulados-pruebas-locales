import estilo from "./page.module.css";
import React from 'react';
type AlertType = 'info' | 'error' | 'success' | 'warning';

interface AlertProps {
  type: AlertType;
  message: React.ReactNode;
}

export default function Alert({message }: AlertProps) {
  return (
    <div className={estilo.structure}>
      {message}
    </div>
  );
}
