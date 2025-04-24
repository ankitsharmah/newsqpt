import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './ModernExcel.css';

const ModernExcel = () => {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [newColumnDialog, setNewColumnDialog] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState('text');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`https://excel-backend-wl01.onrender.com/api/api/spreadsheets/${id}`);
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
      await axios.put(`https://excel-backend-wl01.onrender.com/api/api/spreadsheets/${id}/data`, {
        rowIndex,
        columnName,
        value
      });
    } catch (error) {
      console.error('Error saving cell:', error);
    }
  };

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) {
      alert('Please enter a column name');
      return;
    }

    try {
      const columnData = {
        name: newColumnName,
        type: newColumnType
      };

      await axios.post(`https://excel-backend-wl01.onrender.com/api/api/spreadsheets/${id}/column`, columnData);
      
      const newColumn = {
        name: newColumnName,
        type: newColumnType,
        locked: false
      };
      
      setColumns([...columns, newColumn]);
      
      const updatedData = data.map(row => ({
        ...row,
        [newColumnName]: null
      }));
      
      setData(updatedData);
      setNewColumnDialog(false);
      setNewColumnName('');
      setNewColumnType('text');
    } catch (error) {
      console.error('Error adding column:', error);
      alert('Error adding column: ' + error.message);
    }
  };

  const handleAddRow = () => {
    const newRow = columns.reduce((acc, col) => {
      acc[col.name] = null;
      return acc;
    }, {});
    setData([...data, newRow]);
  };

  const handleSave = async () => {
    try {
      await axios.put(`https://excel-backend-wl01.onrender.com/api/api/spreadsheets/${id}/data`, {
        data
      });
      alert('Changes saved successfully!');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data: ' + error.message);
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
    <div className="modern-excel">
      <div className="toolbar">
        <div className="title">Excel Sheet</div>
        <div className="actions">
          <button className="btn primary" onClick={() => setNewColumnDialog(true)}>
            Add Column
          </button>
          <button className="btn secondary" onClick={handleAddRow}>
            Add Row
          </button>
          <button className="btn success" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>

      <div className="grid-container">
        <div className="grid-header">
          {columns.map((column, index) => (
            <div key={column.name} className="header-cell">
              <span className="column-name">{column.name}</span>
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

      {newColumnDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h3>Add New Column</h3>
            <div className="dialog-content">
              <input
                type="text"
                placeholder="Column Name"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                className="dialog-input"
              />
              <select
                value={newColumnType}
                onChange={(e) => setNewColumnType(e.target.value)}
                className="dialog-select"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="checkbox">Checkbox</option>
              </select>
            </div>
            <div className="dialog-actions">
              <button className="btn cancel" onClick={() => setNewColumnDialog(false)}>
                Cancel
              </button>
              <button className="btn primary" onClick={handleAddColumn}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernExcel; 