import React, { useCallback, useState, useEffect } from 'react';
import { 
  Box, TextField, MenuItem, Select, Checkbox, 
  FormControl, IconButton
} from '@mui/material';
import { FixedSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

const SpreadsheetGrid = ({ data, columns, onCellChange, filteredIndices }) => {
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [gridKey, setGridKey] = useState(0); // Key to force Grid re-render

  // When columns change, force Grid to re-render
  useEffect(() => {
    setGridKey(prevKey => prevKey + 1);
  }, [columns.length]);

  // Get the actual data index from the filtered view index
  const getActualRowIndex = useCallback((viewIndex) => {
    // If filteredIndices is provided, use it to map viewIndex to actual index
    // Otherwise, viewIndex is the same as the actual index
    return filteredIndices ? filteredIndices[viewIndex] : viewIndex;
  }, [filteredIndices]);

  // Get the filtered data
  const getFilteredData = useCallback(() => {
    if (!filteredIndices) return data;
    return filteredIndices.map(index => data[index]);
  }, [data, filteredIndices]);

  // Start editing a cell
  const startEditing = useCallback((viewRowIndex, columnName, value) => {
    setEditingCell({ viewRowIndex, columnName });
    setEditValue(value !== null && value !== undefined ? value : '');
  }, []);

  // Save the edited value
  const saveEdit = useCallback(() => {
    if (editingCell) {
      // Convert view index to actual data index
      const actualRowIndex = getActualRowIndex(editingCell.viewRowIndex);
      onCellChange(actualRowIndex, editingCell.columnName, editValue);
      setEditingCell(null);
    }
  }, [editingCell, editValue, onCellChange, getActualRowIndex]);

  // Handle key presses while editing
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  }, [saveEdit]);

  // Handle checkbox change
  const handleCheckboxChange = useCallback((viewRowIndex, columnName, checked) => {
    const actualRowIndex = getActualRowIndex(viewRowIndex);
    onCellChange(actualRowIndex, columnName, checked);
  }, [onCellChange, getActualRowIndex]);

  // Handle dropdown change
  const handleDropdownChange = useCallback((viewRowIndex, columnName, value) => {
    const actualRowIndex = getActualRowIndex(viewRowIndex);
    onCellChange(actualRowIndex, columnName, value);
  }, [onCellChange, getActualRowIndex]);

  // Render a cell based on its type
  const renderCell = useCallback((viewRowIndex, columnIndex) => {
    const filteredData = getFilteredData();
    
    if (viewRowIndex >= filteredData.length || columnIndex >= columns.length) {
      return null;
    }

    const columnName = columns[columnIndex].name;
    const columnType = columns[columnIndex].type || 'text';
    const rowData = filteredData[viewRowIndex] || {};
    const cellValue = rowData[columnName];
    
    const isEditing = editingCell && 
                     editingCell.viewRowIndex === viewRowIndex && 
                     editingCell.columnName === columnName;
    const isLocked = columns[columnIndex].locked;

    // Handle rendering based on column type
    switch (columnType) {
      case 'checkbox':
        return (
          <Box sx={{ padding: 1, height: '100%', display: 'flex', alignItems: 'center' }}>
            <Checkbox
              checked={Boolean(cellValue)}
              onChange={(e) => handleCheckboxChange(viewRowIndex, columnName, e.target.checked)}
              disabled={isLocked}
            />
          </Box>
        );
        
      case 'dropdown':
        const options = columns[columnIndex].options || [];
        return (
          <Box sx={{ padding: 1, height: '100%', display: 'flex', alignItems: 'center' }}>
            <FormControl fullWidth size="small" disabled={isLocked}>
              <Select
                value={cellValue || ''}
                onChange={(e) => handleDropdownChange(viewRowIndex, columnName, e.target.value)}
                displayEmpty
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {options.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        );
        
      case 'date':
        if (isEditing) {
          return (
            <Box sx={{ padding: 1, height: '100%', display: 'flex', alignItems: 'center' }}>
              <TextField
                type="date"
                fullWidth
                size="small"
                value={editValue || ''}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={saveEdit}
                autoFocus
              />
            </Box>
          );
        }
        return (
          <Box 
            sx={{ 
              padding: 1, 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center',
              cursor: isLocked ? 'not-allowed' : 'pointer',
              '&:hover': { backgroundColor: isLocked ? 'inherit' : '#cdcdcd' }
            }}
            onClick={() => !isLocked && startEditing(viewRowIndex, columnName, cellValue)}
          >
            {cellValue || ''}
          </Box>
        );
        
      case 'number':
        if (isEditing) {
          return (
            <Box sx={{ padding: 1, height: '100%', display: 'flex', alignItems: 'center' }}>
              <TextField
                type="number"
                fullWidth
                size="small"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={saveEdit}
                autoFocus
              />
            </Box>
          );
        }
        return (
          <Box 
            sx={{ 
              padding: 1, 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center',
              cursor: isLocked ? 'not-allowed' : 'pointer',
              '&:hover': { backgroundColor: isLocked ? 'inherit' : '#cdcdcd' }
            }}
            onClick={() => !isLocked && startEditing(viewRowIndex, columnName, cellValue)}
          >
            {cellValue !== null && cellValue !== undefined ? cellValue : ''}
          </Box>
        );
        
      case 'text':
      default:
        if (isEditing) {
          return (
            <Box sx={{ padding: 1, height: '100%', display: 'flex', alignItems: 'center' }}>
              <TextField
                fullWidth
                size="small"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={saveEdit}
                autoFocus
              />
            </Box>
          );
        }
        return (
          <Box 
            sx={{ 
              padding: 1, 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center',
              backgroundColor: isLocked? '#cdcdcd' : 'inherit',
              cursor: isLocked ? 'not-allowed' : 'pointer',
              '&:hover': { backgroundColor: isLocked ? 'inherit' : '#cdcdcd' }
            }}
            onClick={() => !isLocked && startEditing(viewRowIndex, columnName, cellValue)}
          >
            {cellValue !== null && cellValue !== undefined ? cellValue : ''}
          </Box>
        );
    }
  }, [columns, editingCell, editValue, handleKeyPress, saveEdit, startEditing, handleCheckboxChange, handleDropdownChange, getFilteredData]);

  // Render cell using react-window for virtualization
  const Cell = useCallback(({ columnIndex, rowIndex, style }) => {
    return (
      <div 
        style={{
          ...style,
          borderBottom: '1px solid #e0e0e0',
          borderRight: '1px solid #e0e0e0',
          overflow: 'hidden'
        }}
      >
        {renderCell(rowIndex, columnIndex)}
      </div>
    );
  }, [renderCell]);

  // Get the displayed data
  const displayData = getFilteredData();

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <AutoSizer>
        {({ height, width }) => {
          // Calculate column width as a number
          const columnWidth = Math.max(200, width / columns.length);
          
          return (
            <Grid
              key={gridKey}
              columnCount={columns.length}
              columnWidth={columnWidth}
              height={height}
              rowCount={displayData.length}
              rowHeight={40}
              width={width}
            >
              {Cell}
            </Grid>
          );
        }}
      </AutoSizer>
    </Box>
  );
};

export default SpreadsheetGrid;