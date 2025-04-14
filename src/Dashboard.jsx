import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Button, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Box,
  Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, CircularProgress
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import axios from 'axios';

import FileUploader from './FileUploader';

const Dashboard = () => {
  const [spreadsheets, setSpreadsheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSpreadsheets();
  }, []);
  
  const fetchSpreadsheets = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://excel-backend-wl01.onrender.com/api/spreadsheets');
      setSpreadsheets(response.data);
    } catch (error) {
      console.error('Error fetching spreadsheets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setUploading(true);
      const response = await axios.post('https://excel-backend-wl01.onrender.com/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setUploadDialogOpen(false);
      await fetchSpreadsheets();
      navigate(`/spreadsheet/${response.data.spreadsheetId}`);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  const openSpreadsheet = (id) => {
    navigate(`/spreadsheet/${id}`);
  };

  const confirmDelete = (spreadsheet) => {
    setSelectedSpreadsheet(spreadsheet);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedSpreadsheet) return;
    
    try {
      await axios.delete(`https://excel-backend-wl01.onrender.com/api/spreadsheets/${selectedSpreadsheet._id}`);
      setDeleteDialogOpen(false);
      setSelectedSpreadsheet(null);
      await fetchSpreadsheets();
    } catch (error) {
      console.error('Error deleting spreadsheet:', error);
      alert('Error deleting spreadsheet: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Excel Web App
          
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<UploadIcon />}
          onClick={() => setUploadDialogOpen(true)}
        >
          Upload Excel/CSV
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Your Spreadsheets
        </Typography>
        
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : spreadsheets.length === 0 ? (
          <Typography variant="body1" color="textSecondary" align="center" py={4}>
            No spreadsheets uploaded yet. Upload an Excel or CSV file to get started.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {spreadsheets.map((sheet) => (
                  <TableRow key={sheet._id} hover>
                    <TableCell 
                      sx={{ cursor: 'pointer' }}
                      onClick={() => openSpreadsheet(sheet._id)}
                    >
                      {sheet.name}
                    </TableCell>
                    <TableCell>
                      {format(new Date(sheet.createdAt), 'MMM d, yyyy h:mm a')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(sheet.updatedAt), 'MMM d, yyyy h:mm a')}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => confirmDelete(sheet)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* File Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => !uploading && setUploadDialogOpen(false)}>
        <DialogTitle>Upload Excel or CSV File</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Select an Excel (.xlsx, .xls) or CSV (.csv) file to upload. The first row will be used as column headers.
          </DialogContentText>
          <Box mt={2}>
            <FileUploader onFileSelected={handleFileUpload} disabled={uploading} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setUploadDialogOpen(false)} 
            disabled={uploading}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{selectedSpreadsheet?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;

