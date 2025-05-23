import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer, toast } from 'react-toastify';
import Dashboard from './Dashboard';
import SpreadsheetView from './SpreadsheetView';
import Header from './Header';
import MapComponent from './MapComponent';
import ExcelLikeSpreadsheet from './ExcelLikeSpreadsheet';
// import Handsone from './Handsone';
import "./App.css"

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    }, primaryy: {
      main: '#ff0000',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
       <ToastContainer
position="top-center"
autoClose={5000}
hideProgressBar={false}
newestOnTop={false}
closeOnClick={false}
rtl={false}
pauseOnFocusLoss
draggable
pauseOnHover
theme="colored"

/>
      <CssBaseline />
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/spreadsheet/:id" element={<ExcelLikeSpreadsheet />} />
          <Route path="/map" element={     <MapComponent />} />
          {/* <Route path="/d" element={     <Handsone/>} /> */}

          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
