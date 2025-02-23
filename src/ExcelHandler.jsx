import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./ExcelHandler.css"
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
    console.log("called")
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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Excel File Editor</h2>

      <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-md mb-4">
        Upload Excel File
        <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="hidden" />
      </label>

      <div className="flex items-center space-x-2 mb-4">
        <input
          type="text"
          placeholder="Enter new column name"
          value={newField}
          onChange={(e) => setNewField(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-300"
        />
        <button onClick={addNewField} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md shadow-md">
          Add Column
        </button>
      </div>

      <div className="flex space-x-3 mb-4">
        <input
          type="text"
          placeholder="Enter file name"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2"
        />
        <select value={fileFormat} onChange={(e) => setFileFormat(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2">
          <option value="xlsx">Excel (.xlsx)</option>
          <option value="csv">CSV (.csv)</option>
          <option value="pdf">PDF (.pdf)</option>
          <option value="json">JSON (.json)</option>
        </select>
        <button onClick={exportData} className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-md shadow-md">
          Export
        </button>
      </div>

      {rows.length > 0 && (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4">
          <table className="w-full border border-gray-300 rounded-md">
            <thead>
              <tr className="bg-gray-200">
                {columns.map((col, index) => (
                  <th key={index} className="border border-gray-300 px-4 py-2 text-left font-semibold">
                    {col} {editableColumns.includes(col) ? "(Editable)" : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-100">
                  {row.map((cell, colIndex) => (
                    <td key={colIndex} className="border border-gray-300 px-4 py-2">
                      <input
                        type="text"
                        value={cell || ""}
                        onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                        className={`w-full border-none bg-transparent focus:outline-none ${
                          editableColumns.includes(columns[colIndex]) ? "text-black" : "text-gray-500 cursor-not-allowed"
                        }`}
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
