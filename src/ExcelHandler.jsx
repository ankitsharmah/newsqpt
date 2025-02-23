import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./ExcelHandler.css"; // Import the CSS file

const ExcelHandler = () => {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [newField, setNewField] = useState("");
  const [editableColumns, setEditableColumns] = useState([]);
  const [fileName, setFileName] = useState("exported_data");
  const [fileFormat, setFileFormat] = useState("xlsx");

  useEffect(() => {
    const savedColumns = sessionStorage.getItem("excel_columns");
    const savedRows = sessionStorage.getItem("excel_rows");
    const savedEditableColumns = sessionStorage.getItem("editable_columns");

    if (savedColumns && savedRows && savedEditableColumns) {
      setColumns(JSON.parse(savedColumns));
      setRows(JSON.parse(savedRows));
      setEditableColumns(JSON.parse(savedEditableColumns));
    }
  }, []);

  useEffect(() => {
    if (columns.length > 0) {
      sessionStorage.setItem("excel_columns", JSON.stringify(columns));
      sessionStorage.setItem("excel_rows", JSON.stringify(rows));
      sessionStorage.setItem("editable_columns", JSON.stringify(editableColumns));
    }
  }, [columns, rows, editableColumns]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length > 0) {
        setColumns(jsonData[0]); 
        setRows(jsonData.slice(1)); 
        setEditableColumns([]); 
      }
    };
    reader.readAsBinaryString(file);
  };

  const addNewField = () => {
    if (!newField.trim()) return;
    setColumns([...columns, newField]);
    setRows(rows.map((row) => [...row, ""]));
    setEditableColumns([...editableColumns, newField]); 
    setNewField("");
  };

  const handleCellChange = (rowIndex, colIndex, value) => {
    if (!editableColumns.includes(columns[colIndex])) return; 

    const updatedRows = [...rows];
    updatedRows[rowIndex][colIndex] = value;
    setRows(updatedRows);
  };

  const exportData = () => {
    if (fileFormat === "xlsx" || fileFormat === "csv") {
      const sheetData = [columns, ...rows];
      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

      const excelBuffer = XLSX.write(workbook, { bookType: fileFormat, type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(blob, `${fileName}.${fileFormat}`);
    } else if (fileFormat === "pdf") {
      const doc = new jsPDF();
      doc.autoTable({ head: [columns], body: rows });
      doc.save(`${fileName}.pdf`);
    } else if (fileFormat === "json") {
      const jsonData = rows.map((row) => {
        let obj = {};
        columns.forEach((col, index) => {
          obj[col] = row[index] || "";
        });
        return obj;
      });
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
      saveAs(blob, `${fileName}.json`);
    }
  };

  return (
    <div className="file-handler-container">
      <h2 className="file-handler-title">Excel File Editor</h2>

      <label className="file-handler-upload-btn">
        Upload Excel File
        <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="file-handler-hidden-input" />
      </label>

      <div className="file-handler-input-group">
        <input
          type="text"
          placeholder="Enter new column name"
          value={newField}
          onChange={(e) => setNewField(e.target.value)}
          className="file-handler-input"
        />
        <button onClick={addNewField} className="file-handler-add-btn">Add Column</button>
      </div>

      <div className="file-handler-export-group">
        <input
          type="text"
          placeholder="Enter file name"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="file-handler-input"
        />
        <select value={fileFormat} onChange={(e) => setFileFormat(e.target.value)} className="file-handler-select">
          <option value="xlsx">Excel (.xlsx)</option>
          <option value="csv">CSV (.csv)</option>
          <option value="pdf">PDF (.pdf)</option>
          <option value="json">JSON (.json)</option>
        </select>
        <button onClick={exportData} className="file-handler-export-btn">Export</button>
      </div>

      {rows.length > 0 && (
        <div className="file-handler-table-container">
          <table className="file-handler-table">
           
          <thead>
  <tr>
    <th className="file-handler-table-header">Sno.</th>
    {columns.map((col, index) =>
      index !== 0 && (
        <th key={index} className="file-handler-table-header">
          {col} {editableColumns.includes(col) ? "(Editable)" : ""}
        </th>
      )
    )}
  </tr>
</thead>


            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="file-handler-table-row">
                  {row.map((cell, colIndex) => (
                    <td key={colIndex} className="file-handler-table-cell">
                      <input
                        type="text"
                        value={cell || ""}
                        onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                        className={`file-handler-table-input ${!editableColumns.includes(columns[colIndex]) ? "not-editable":""}`} 
                        
                        readOnly={!editableColumns.includes(columns[colIndex])}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExcelHandler;
