import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FixedSizeGrid as Grid } from 'react-window';

const columnWidth = 140;
const rowHeight = 35;
const gridHeight = 600;
const gridWidth = 1000; // Width of viewport (scrolling will handle overflow)

const Cell = ({ columnIndex, rowIndex, style, data }) => {
  const row = data.rows[rowIndex];
  const columnKey = data.columns[columnIndex]?.name;
  return (
    <div
      style={{
        ...style,
        boxSizing: 'border-box',
        border: '1px solid #ddd',
        padding: '6px',
        backgroundColor: rowIndex % 2 === 0 ? '#fff' : '#f9f9f9',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {row?.[columnKey] ?? ''}
    </div>
  );
};

const HeaderCell = ({ columnIndex, style, data }) => {
  const columnName = data.columns[columnIndex]?.name;
  return (
    <div
      style={{
        ...style,
        boxSizing: 'border-box',
        border: '1px solid #ccc',
        fontWeight: 'bold',
        backgroundColor: '#f3f3f3',
        padding: '6px',
        whiteSpace: 'nowrap',
      }}
    >
      {columnName}
    </div>
  );
};

const ExcelStyleGrid = () => {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(
        'https://excel-backend-wl01.onrender.com/api/spreadsheets/67fb9e3099cdc37b2013323c'
      );
      setColumns(res.data.columns || []);
      setRows(res.data.data || []);
    };

    fetchData();
  }, []);

  const columnCount = columns.length;
  const rowCount = rows.length;
  const totalGridWidth = columnCount * columnWidth;

  if (!columnCount || !rowCount) return <div>Loading...</div>;

  return (
    <div style={{ width: gridWidth, height: gridHeight, overflow: 'auto' }}>
      <div style={{ width: totalGridWidth }}>
        {/* Header */}
        <div style={{ position: 'sticky', top: 0, zIndex: 2 }}>
          <Grid
            columnCount={columnCount}
            rowCount={1}
            columnWidth={columnWidth}
            rowHeight={rowHeight}
            height={rowHeight}
            width={totalGridWidth}
            itemData={{ columns }}
            style={{ overflow: 'hidden' }}
          >
            {({ columnIndex, style, data }) => (
              <HeaderCell columnIndex={columnIndex} style={style} data={data} />
            )}
          </Grid>
        </div>

        {/* Body */}
        <Grid
          columnCount={columnCount}
          rowCount={rowCount}
          columnWidth={columnWidth}
          rowHeight={rowHeight}
          height={gridHeight - rowHeight}
          width={totalGridWidth}
          itemData={{ columns, rows }}
        >
          {({ columnIndex, rowIndex, style, data }) => (
            <Cell columnIndex={columnIndex} rowIndex={rowIndex} style={style} data={data} />
          )}
        </Grid>
      </div>
    </div>
  );
};

export default ExcelStyleGrid;
