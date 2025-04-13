import React, { useState } from "react";
import * as XLSX from "xlsx";

const ExcelToArray = () => {
  const [emails, setEmails] = useState([]);

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
    };
    reader.readAsArrayBuffer(file);
  };
console.log(emails)
  return (
    <div>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      <ul>
        {emails.map((email, index) => (
          <li key={index}>{email}</li>
        ))}
      </ul>
    </div>
  );
};

export default ExcelToArray;
