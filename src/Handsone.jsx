// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import Handsontable from 'handsontable';
// import { HotTable } from '@handsontable/react';
// import 'handsontable/dist/handsontable.full.min.css';

// const Handsone = () => {
//   const [columns, setColumns] = useState([]);
//   const [rowData, setRowData] = useState([]);

//   useEffect(() => {
//     const fetchSheet = async () => {
//       try {
//         const res = await axios.get(
//           'https://excel-backend-wl01.onrender.com/api/spreadsheets/67ff64fa2da0bee947139386'
//         );

//         const data = res.data;
//         const cols = data.columns.map((col) => ({
//           data: col.name,
//           title: col.name,
//           type: col.type || 'text',
//         }));

//         // Convert array of arrays into array of objects
//         const rowObjects = data.data.map((rowArr) => {
//           const rowObj = {};
//           cols.forEach((col, idx) => {
//             rowObj[col.data] = rowArr[idx] ?? '';
//           });
//           return rowObj;
//         });

//         setColumns(cols);
//         setRowData(rowObjects);
//       } catch (err) {
//         console.error('Failed to fetch sheet:', err);
//       }
//     };

//     fetchSheet();
//   }, []);

//   return (
//     <div>
//       <h1>Handsontable Sheet</h1>
//       <HotTable
//         data={rowData}
//         columns={columns}
//         colHeaders={columns.map((c) => c.title)}
//         rowHeaders={true}
//         stretchH="all"
//         width="100%"
//         height="auto"
//         licenseKey="non-commercial-and-evaluation"
//         manualColumnResize={true}
//         manualRowResize={true}
//         manualColumnMove={true}
//         contextMenu={true}
//         filters={true}
//         dropdownMenu={true}
//       />
//     </div>
//   );
// };

// export default Handsone;

import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.min.css';

 const Handsone = () => {
  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    const fetchSheet = async () => {
      try {
        const res = await axios.get(
          'https://excel-backend-wl01.onrender.com/api/spreadsheets/67ff64fa2da0bee947139386'
        );
        setRowData(res.data.data);
      } catch (err) {
        console.error('Failed to fetch spreadsheet:', err);
      }
    };

    fetchSheet();
  }, []);

  const columns = rowData.length
    ? Object.keys(rowData[0]).map((key) => ({
        data: key,
        title: key,
        type: 'text',
      }))
    : [];

  return (
    <div style={{ padding: '20px' }}>
      <h2>Spreadsheet Viewer</h2>
      {rowData.length > 0 ? (
        <HotTable
          data={rowData}
          columns={columns}
          colHeaders={columns.map((col) => col.title)}
          rowHeaders={true}
          stretchH="all"
          width="100%"
          height="600px"
          licenseKey="non-commercial-and-evaluation"
          manualColumnResize={true}
          manualRowResize={true}
          manualColumnMove={true}
          contextMenu={true}
          filters={true}
          dropdownMenu={true}
        />
      ) : (
        'Loading...'
      )}
    </div>
  );
};
export default Handsone

