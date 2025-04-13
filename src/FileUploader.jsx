import React, { useRef, useState } from 'react';
import { Box, Button, Typography, LinearProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const FileUploader = ({ onFileSelected, disabled }) => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;
    
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(fileExtension)) {
      alert('Please select a valid Excel (.xlsx, .xls) or CSV (.csv) file');
      return;
    }
    
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    try {
      await onFileSelected(file);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        hidden
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={disabled}
      />
      
      <Box
        sx={{
          border: '2px dashed #ccc',
          borderRadius: 2,
          padding: 3,
          textAlign: 'center',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'rgba(25, 118, 210, 0.04)'
          }
        }}
        onClick={() => !disabled && fileInputRef.current.click()}
      >
        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="h6" gutterBottom>
          Drop Excel or CSV file here
        </Typography>
        <Typography variant="body2" color="textSecondary">
          or click to browse files
        </Typography>
        
        {file && (
          <Box mt={2}>
            <Typography variant="subtitle2">
              Selected file: {file.name}
            </Typography>
          </Box>
        )}
      </Box>
      
      {file && (
        <Box mt={2}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleUpload}
            disabled={disabled}
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
        </Box>
      )}
      
      {uploading && (
        <Box mt={2}>
          <LinearProgress />
        </Box>
      )}
    </Box>
  );
};

export default FileUploader;
