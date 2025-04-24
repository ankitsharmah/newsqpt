// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:9000/api/api';

const api = {
  // Get all spreadsheets
  getSpreadsheets: async () => {
    try {
      const response = await axios.get(`${API_URL}/spreadsheets`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get a single spreadsheet by ID
  getSpreadsheet: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/spreadsheets/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Upload a new spreadsheet file
  uploadFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Update cell data (batch update)
  updateCells: async (spreadsheetId, updates) => {
    try {
      const response = await axios.put(`${API_URL}/spreadsheets/${spreadsheetId}/data`, {
        updates
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Toggle column lock status
  toggleColumnLock: async (spreadsheetId, columnName, locked) => {
    try {
      const response = await axios.put(
        `${API_URL}/spreadsheets/${spreadsheetId}/columns/${columnName}/lock`,
        { locked }
      );
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Add a new row
  addRow: async (spreadsheetId, rowData) => {
    try {
      const response = await axios.post(
        `${API_URL}/spreadsheets/${spreadsheetId}/row`,
        rowData
      );
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Add a new column
  addColumn: async (spreadsheetId, columnData) => {
    try {
      const response = await axios.post(
        `${API_URL}/spreadsheets/${spreadsheetId}/column`,
        columnData
      );
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Delete a spreadsheet
  deleteSpreadsheet: async (spreadsheetId) => {
    try {
      const response = await axios.delete(`${API_URL}/spreadsheets/${spreadsheetId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Download a spreadsheet
  downloadSpreadsheet: (spreadsheetId) => {
    window.open(`${API_URL}/spreadsheets/${spreadsheetId}/download`, '_blank');
  }
};

export default api;