import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './ExcelView.css';

const ExcelView = () => {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`https://excel-backend-wl01.onrender.com/api/spreadsheets/${id}`);
      setData(response.data.data || []);
      setColumns(response.data.columns || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = (rowIndex, colIndex) => {
    setSelectedCell({ rowIndex, colIndex });
  };

  const handleCellDoubleClick = (rowIndex, colIndex) => {
    const cellValue = data[rowIndex]?.[columns[colIndex].name] || '';
    setEditingCell({ rowIndex, colIndex });
    setEditValue(cellValue);
  };

  const handleCellChange = async (rowIndex, colIndex, value) => {
    const columnName = columns[colIndex].name;
    const newData = [...data];
    if (!newData[rowIndex]) {
      newData[rowIndex] = {};
    }
    newData[rowIndex][columnName] = value;
    setData(newData);
    setEditingCell(null);

    try {
      await axios.put(`https://excel-backend-wl01.onrender.com/api/spreadsheets/${id}/data`, {
        rowIndex,
        columnName,
        value
      });
    } catch (error) {
      console.error('Error saving cell:', error);
    }
  };

  const renderCell = (rowIndex, colIndex) => {
    const column = columns[colIndex];
    const cellValue = data[rowIndex]?.[column.name] || '';
    const isSelected = selectedCell?.rowIndex === rowIndex && selectedCell?.colIndex === colIndex;
    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.colIndex === colIndex;

    if (isEditing) {
      return (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => handleCellChange(rowIndex, colIndex, editValue)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleCellChange(rowIndex, colIndex, editValue);
            } else if (e.key === 'Escape') {
              setEditingCell(null);
            }
          }}
          autoFocus
          className="cell-input"
        />
      );
    }

    return (
      <div
        className={`cell ${isSelected ? 'selected' : ''} ${column.locked ? 'locked' : ''}`}
        onClick={() => handleCellClick(rowIndex, colIndex)}
        onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
      >
        {cellValue}
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="excel-container">
      <div className="excel-header">
        <div className="excel-title">Excel Sheet</div>
        <div className="excel-actions">
          <button className="action-btn add-col">Add Column</button>
          <button className="action-btn add-row">Add Row</button>
          <button className="action-btn save">Save</button>
        </div>
      </div>

      <div className="excel-grid">
        <div className="grid-header">
          {columns.map((column, index) => (
            <div key={column.name} className="header-cell">
              {column.name}
              {column.locked && <span className="lock-icon">🔒</span>}
            </div>
          ))}
        </div>

        <div className="grid-body">
          {data.map((row, rowIndex) => (
            <div key={rowIndex} className="grid-row">
              {columns.map((column, colIndex) => (
                <div key={`${rowIndex}-${colIndex}`} className="cell-container">
                  {renderCell(rowIndex, colIndex)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExcelView; 