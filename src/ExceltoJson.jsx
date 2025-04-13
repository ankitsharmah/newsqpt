import React, { useState } from "react";
import * as XLSX from "xlsx";

const ExcelToJson = () => {
  const [subject, setSubject] = useState("");
  const [emails, setEmails] = useState([]);
  const [jsonOutput, setJsonOutput] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);
      
      const emailList = parsedData.map(row => row.Email).filter(email => email);
      setEmails(emailList);
      setJsonOutput([subject, emailList]);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <input 
        type="text" 
        placeholder="Enter Subject" 
        value={subject} 
        onChange={(e) => setSubject(e.target.value)}
      />
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      <pre>{jsonOutput ? JSON.stringify(jsonOutput, null, 2) : ""}</pre>
    </div>
  );
};

export default ExcelToJson;
