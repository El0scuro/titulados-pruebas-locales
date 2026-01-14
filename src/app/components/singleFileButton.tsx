import * as React from 'react';
import { useState, useRef } from 'react';
import { Button, Typography, Box, Input, IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ClearIcon from '@mui/icons-material/Clear';

interface SingleFileUploadButtonProps {
    onFileSelect: (file: File | null) => void;
    buttonText?: string;
    acceptedFileTypes?: string;
    onReset?: () => void; 
}


export default function SingleFileUploadButton({
    onFileSelect,
    buttonText = 'Subir Archivo',
    acceptedFileTypes = '*',
}: SingleFileUploadButtonProps) {
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleReset = () => {
    setSelectedFileName(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    onFileSelect(null);
};
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        if (file) {
            setSelectedFileName(file.name);
            onFileSelect(file);
        } else {
            setSelectedFileName(null);
            onFileSelect(null);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleClearFile = () => {
        setSelectedFileName(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onFileSelect(null);
    };

    return (
        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Input
                type="file"
                inputRef={fileInputRef}
                onChange={handleFileChange}
                sx={{ display: 'none' }}
                inputProps={{ accept: acceptedFileTypes }}
            />

            <Button
                variant="contained"
                component="span"
                startIcon={<CloudUploadIcon />}
                onClick={handleButtonClick}
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
                {buttonText}
            </Button>

            {selectedFileName && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, p: 1, border: '1px solid #e0e0e0', borderRadius: '8px', bgcolor: '#f5f5f5' }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                        Archivo seleccionado: <strong>{selectedFileName}</strong>
                    </Typography>
                    <IconButton onClick={handleClearFile} size="small" color="error">
                        <ClearIcon fontSize="small" />
                    </IconButton>
                </Box>
            )}
        </Box>
    );
}
