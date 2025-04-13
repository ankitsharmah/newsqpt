import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ExcelHandler from './ExcelHandler.jsx'
import ExcelToArray from './ExcelToArray.jsx'
import ExcelToJson from './ExceltoJson.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <ExcelHandler /> */}
  <App />
  </StrictMode>,
)
