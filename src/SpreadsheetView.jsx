import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Container, Box, Typography, CircularProgress,
  Button, IconButton, Tooltip, Paper, Menu, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl,
  TextField, Select, InputLabel, FormControlLabel, Checkbox, FormGroup
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { VariableSizeGrid as Grid } from 'react-window';

import FilterDialog from './FilterDialog';

// Custom Cell component
const Cell = ({ columnIndex, rowIndex, style, data }) => {
  // Special case for sequence number column (columnIndex === 0)
  if (columnIndex === 0) {
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          color: '#666'
        }}
      >
        {rowIndex + 1}
      </div>
    );
  }
  
  // Adjust columnIndex to get the actual column (subtract 1 because of seq column)
  const actualColumnIndex = columnIndex - 1;
  
  const { rows, columns, onCellChange, editingCell, setEditingCell, 
          editValue, setEditValue, saveEdit, handleKeyPress } = data;
  
  const row = rows[rowIndex];
  const column = columns[actualColumnIndex];
  const columnKey = column?.name;
  const columnType = column?.type || 'text';
  const cellValue = row?.[columnKey];
  const isLocked = column?.locked;
  
  const isEditing = editingCell && 
                   editingCell.rowIndex === rowIndex && 
                   editingCell.columnName === columnKey;

  const startEditing = () => {
    if (isLocked) return;
    setEditingCell({ rowIndex, columnName: columnKey });
    setEditValue(cellValue !== null && cellValue !== undefined ? cellValue : '');
  };

  // Handle different cell types
  const renderCellContent = () => {
    switch (columnType) {
      case 'checkbox':
        return (
          <Checkbox
            checked={Boolean(cellValue)}
            onChange={(e) => onCellChange(rowIndex, columnKey, e.target.checked)}
            disabled={isLocked}
          />
        );
        
      case 'dropdown':
        const options = column.options || [];
        return (
          <FormControl fullWidth size="small" disabled={isLocked}>
            <Select
              value={cellValue || ''}
              onChange={(e) => onCellChange(rowIndex, columnKey, e.target.value)}
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
        );
        
      case 'date':
        if (isEditing) {
          return (
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
          );
        }
        return cellValue || '';
        
      case 'number':
        if (isEditing) {
          return (
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
          );
        }
        return cellValue !== null && cellValue !== undefined ? cellValue : '';
        
      case 'text':
      default:
        if (isEditing) {
          return (
            <TextField
              fullWidth
              size="small"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={saveEdit}
              autoFocus
            />
          );
        }
        return cellValue !== null && cellValue !== undefined ? cellValue : '';
    }
  };

  return (
    <div
      style={{
        ...style,
        boxSizing: 'border-box',
        border: '1px solid #ddd',
        padding: isEditing ? '2px' : '6px',
        backgroundColor: isLocked ? '#f0f0f0' : (rowIndex % 2 === 0 ? '#fff' : '#f9f9f9'),
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        cursor: isLocked ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center'
      }}
      onClick={() => !isLocked && !isEditing && startEditing()}
    >
      {renderCellContent()}
    </div>
  );
};

// Custom HeaderCell component
const HeaderCell = ({ columnIndex, style, data }) => {
  const { columns, handleColumnClick, sortConfig, filters } = data;
  
  // Special case for sequence number column (columnIndex === 0)
  if (columnIndex === 0) {
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <span>#</span>
      </div>
    );
  }
  
  // Adjust columnIndex to get the actual column (subtract 1 because of seq column)
  const actualColumnIndex = columnIndex - 1;
  const column = columns[actualColumnIndex];
  const columnName = column?.name;
  const isLocked = column?.locked;
  
  const getSortIcon = () => {
    if (sortConfig.key !== columnName) return null;
    return sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;
  };

  const getFilterIcon = () => {
    return filters[columnName] ? <FilterListIcon color="primaryy" fontSize="small" /> : <FilterListIcon fontSize="small" />;
  };

  return (
    <div
      style={{
        ...style,
        boxSizing: 'border-box',
        border: '1px solid #ccc',
        fontWeight: 'bold',
        backgroundColor: isLocked ? '#e0e0e0' : '#f3f3f3',
        padding: '6px',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer'
      }}
      onClick={(e) => handleColumnClick(e, columnName)}
    >
      <span>{columnName}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px'}}>
        {isLocked && <LockIcon fontSize="small" style={{ color: '#555' }} />}
        {getFilterIcon()}
        {getSortIcon()}
      </div>
    </div>
  );
};

const SpreadsheetView = () => {
  const { id } = useParams();
  const [spreadsheet, setSpreadsheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [pendingUpdates, setPendingUpdates] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [filteredIndices, setFilteredIndices] = useState(null);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [activeFilterColumn, setActiveFilterColumn] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [columnContextMenu, setColumnContextMenu] = useState(null);
  const [newColumnDialogOpen, setNewColumnDialogOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState('text');
  const [dropdownOptions, setDropdownOptions] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  
  useEffect(() => {
    fetchSpreadsheetData();
  }, [id]);

  const fetchSpreadsheetData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:9000/api/spreadsheets/${id}`);
      
      // Set all state
      setSpreadsheet(response.data);
      setColumns(response.data.columns);
      setData(response.data.data);
      setFilteredData(response.data.data);
      setFilteredIndices(null); // Reset filtered indices
    } catch (error) {
      console.error('Error fetching spreadsheet:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to data
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    let result = [...data];
    let indices = [];
    
    // First collect indices of all rows that match the filters
    data.forEach((row, index) => {
      let includeRow = true;
      
      // Check each filter
      for (const key of Object.keys(filters)) {
        const filter = filters[key];
        if (!filter) continue; // Skip null filters (cleared ones)
        
        if (filter.type === 'text' && filter.value) {
          const cellValue = String(row[key] || '').toLowerCase();
          if (!cellValue.includes(filter.value.toLowerCase())) {
            includeRow = false;
            break;
          }
        } else if (filter.type === 'number') {
          if (filter.min !== null && Number(row[key] || 0) < filter.min) {
            includeRow = false;
            break;
          }
          if (filter.max !== null && Number(row[key] || 0) > filter.max) {
            includeRow = false;
            break;
          }
        }
      }
      
      if (includeRow) {
        indices.push(index);
      }
    });
    
    // Get the filtered data using indices
    result = indices.map(index => data[index]);
    
    // Apply sorting
    if (sortConfig.key) {
      // Sort both the filtered data and keep track of indices
      const sortedWithIndices = result.map((item, index) => ({
        item,
        originalIndex: indices[index]
      }));
      
      sortedWithIndices.sort((a, b) => {
        const aValue = a.item[sortConfig.key] || '';
        const bValue = b.item[sortConfig.key] || '';
        
        // Check if values are numbers
        const aNum = Number(aValue);
        const bNum = Number(bValue);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
        }
        
        // String comparison
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
      
      // Update filtered data and indices
      result = sortedWithIndices.map(item => item.item);
      indices = sortedWithIndices.map(item => item.originalIndex);
    }
    
    setFilteredData(result);
    setFilteredIndices(indices.length > 0 ? indices : null);
  }, [data, filters, sortConfig]);

  const handleColumnClick = (e, columnName) => {
    setAnchorEl(e.currentTarget);
    setColumnContextMenu(columnName);
  };

  const closeColumnMenu = () => {
    setAnchorEl(null);
    setColumnContextMenu(null);
  };

  const handleCellChange = useCallback((rowIndex, field, value) => {
    // Get the actual index if we're looking at filtered data
    const actualIndex = filteredIndices ? filteredIndices[rowIndex] : rowIndex;
    
    // Update the main data array
    setData(prevData => {
      const newData = [...prevData];
      newData[actualIndex] = {
        ...newData[actualIndex],
        [field]: value
      };
      return newData;
    });
    
    // IMPORTANT: Update the filtered data too so UI reflects changes immediately
    if (filteredIndices) {
      setFilteredData(prevFiltered => {
        const newFiltered = [...prevFiltered];
        // Find the correct row in filtered data (which matches rowIndex)
        newFiltered[rowIndex] = {
          ...newFiltered[rowIndex],
          [field]: value
        };
        return newFiltered;
      });
    }
    
    // Add to pending updates
    setPendingUpdates(prev => [
      ...prev,
      { rowIndex: actualIndex, field, value }
    ]);
  }, [filteredIndices]);

  const saveEdit = useCallback(() => {
    if (editingCell) {
      const actualRowIndex = filteredIndices ? filteredIndices[editingCell.rowIndex] : editingCell.rowIndex;
      handleCellChange(editingCell.rowIndex, editingCell.columnName, editValue);
      setEditingCell(null);
    }
  }, [editingCell, editValue, handleCellChange, filteredIndices]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  }, [saveEdit]);
  
  // Debounced save function to avoid too many API calls
  const saveChanges = useCallback(debounce(async () => {
    if (pendingUpdates.length === 0) return;
    
    try {
      setIsSaving(true);
      await axios.put(`http://localhost:9000/api/spreadsheets/${id}/data`, {
        updates: pendingUpdates
      });
      setPendingUpdates([]);
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Error saving changes: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsSaving(false);
    }
  }, 1000), [pendingUpdates, id]);

  // Auto-save when there are pending updates
  useEffect(() => {
    if (pendingUpdates.length > 0) {
      saveChanges();
    }
    
    // Cleanup function to ensure final save when component unmounts
    return () => {
      saveChanges.flush();
    };
  }, [pendingUpdates, saveChanges]);

  const manualSave = () => {
    saveChanges.flush();
  };

  const handleSort = (columnName) => {
    closeColumnMenu();
    
    let direction = 'asc';
    if (sortConfig.key === columnName && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === columnName && sortConfig.direction === 'desc') {
      // Reset sort
      setSortConfig({ key: null, direction: null });
      return;
    }
    
    setSortConfig({ key: columnName, direction });
  };

  const openFilterDialog = (columnName) => {
    setActiveFilterColumn(columnName);
    setFilterDialogOpen(true);
    closeColumnMenu();
  };

  const handleApplyFilter = (columnName, filterOptions) => {
    setFilters(prev => ({
      ...prev,
      [columnName]: filterOptions
    }));
    setFilterDialogOpen(false);
  };

  const toggleColumnLock = async (columnName) => {
    try {
      closeColumnMenu();
      
      const column = columns.find(col => col.name === columnName);
      if (!column) return;
      
      const response = await axios.put(
        `http://localhost:9000/api/spreadsheets/${id}/columns/${columnName}/lock`,
        { locked: !column.locked }
      );
        
      // Update columns state
      setColumns(prevColumns => 
        prevColumns.map(col => 
          col.name === columnName ? { ...col, locked: !col.locked } : col
        )
      );
    } catch (error) {
      console.error('Error toggling column lock:', error);
      alert('Error toggling column lock: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleAddNewColumn = async () => {
    if (!newColumnName.trim()) {
      alert('Please enter a column name');
      return;
    }
    
    try {
      // Prepare column data
      const columnData = {
        name: newColumnName,
        defaultValue: null,
        type: newColumnType
      };
      
      // Add options data if dropdown type
      if (newColumnType === 'dropdown' && dropdownOptions.trim()) {
        columnData.options = dropdownOptions.split(',').map(option => option.trim());
      }
      
      const response = await axios.post(`http://localhost:9000/api/spreadsheets/${id}/column`, columnData);
      
      // Refresh data after adding column to ensure we have the latest state
      fetchSpreadsheetData();
      
      setNewColumnDialogOpen(false);
      setNewColumnName('');
      setNewColumnType('text');
      setDropdownOptions('');
    } catch (error) {
      console.error('Error adding column:', error);
      alert('Error adding column: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleAddNewRow = async () => {
    try {
      // Create empty row with all columns
      const newRow = {};
      columns.forEach(col => {
        newRow[col.name] = null;
      });
      
      const response = await axios.post(`http://localhost:9000/api/spreadsheets/${id}/row`, newRow);
      
      // Add to data state
      setData(prevData => [...prevData, newRow]);
    } catch (error) {
      console.error('Error adding row:', error);
      alert('Error adding row: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setIsDownloading(true);
      
      // Request Excel download from server
      const response = await axios.get(`http://localhost:9000/api/spreadsheets/${id}/download`, {
        responseType: 'blob',  // Important for binary data
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${spreadsheet?.name || 'spreadsheet'}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error downloading Excel:', error);
      alert('Error downloading Excel: ' + error.message);
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading && !spreadsheet) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', width:'95vw', alignItems: 'center', height: '95vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  const rowCount = filteredData?.length || 0;
  const columnCount = columns?.length || 0;
  const totalColumnCount = columnCount + 1; // Add 1 for the sequence number column
  const rowHeight = 40;
  const getColumnWidth = index => (index === 0 ? 60 : 200); // Sequence column is narrower
  const totalGridWidth = 60 + (columnCount * 200); // 60px for seq column + rest for data columns
  const gridHeight = Math.min(650, rowCount * rowHeight + rowHeight); // Add rowHeight for header
  // console.log(gridHeight)
  // Calculate total and filtered rows count
  const totalRows = data?.length || 0;
  const filteredRows = filteredData?.length || 0;
  const isFiltered = Object.keys(filters).length > 0;

  return (
    <div style={{ width:'98vw', height: 'calc(100vh - 100px)',margin:"auto"}}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h5" component="h1">
            {spreadsheet?.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {isFiltered 
              ? `Showing ${filteredRows} of ${totalRows} rows` 
              : `Total rows: ${totalRows}`}
          </Typography>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            sx={{ mr: 1 }}
            onClick={() => setNewColumnDialogOpen(true)}
          >
            Add Column
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            sx={{ mr: 1 }}
            onClick={handleAddNewRow}
          >
            Add Row
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            sx={{ mr: 1 }}
            onClick={handleDownloadExcel}
            disabled={isDownloading}
          >
            {isDownloading ? 'Downloading...' : 'Download Excel'}
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={manualSave}
            disabled={pendingUpdates.length === 0 || isSaving}
          >
            {isSaving ? 'Saving...' : `Save${pendingUpdates.length > 0 ? ` (${pendingUpdates.length})` : ''}`}
          </Button>
        </Box>
      </Box>

      <Paper 
        sx={{ 
          height: 'calc(100% - 60px)', 
          width: '98vw', 
          overflow: 'hidden',
          display: 'flex', 
          // background:"red",
          flexDirection: 'column'
        }}
      >
        <div style={{ width: '100%', height: '100%', overflow: 'scroll' }}>
          <div style={{ width: totalGridWidth, height: gridHeight, overflow: 'auto' }}>
            {/* Header */}
            <div style={{ position: 'sticky', top: 0, zIndex: 2 }}>
              <Grid
                columnCount={totalColumnCount}
                rowCount={1}
                columnWidth={getColumnWidth}
                rowHeight={index => rowHeight}
                height={rowHeight}
                width={totalGridWidth}
                itemData={{ columns, handleColumnClick, sortConfig, filters }}
                style={{ overflow: 'scroll'}}
              >
                {HeaderCell}
              </Grid>
            </div>

            {/* Body */}
            <Grid
              columnCount={totalColumnCount}
              rowCount={rowCount}
              columnWidth={getColumnWidth}
              rowHeight={index => rowHeight}
              height={gridHeight - rowHeight}
              width={totalGridWidth}
              itemData={{ 
                rows: filteredData, 
                columns, 
                onCellChange: handleCellChange,
                editingCell,
                setEditingCell,
                editValue,
                setEditValue,
                saveEdit,
                handleKeyPress
              }}
            >
              {Cell}
            </Grid>
          </div>
        </div>
      </Paper>

      {/* Column Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeColumnMenu}
      >
        <MenuItem onClick={() => handleSort(columnContextMenu)}>
          {sortConfig.key === columnContextMenu && sortConfig.direction === 'asc' ? (
            <>Sort Descending <ArrowDownwardIcon fontSize="small" sx={{ ml: 1 }} /></>
          ) : sortConfig.key === columnContextMenu && sortConfig.direction === 'desc' ? (
            <>Clear Sort</>
          ) : (
            <>Sort Ascending <ArrowUpwardIcon fontSize="small" sx={{ ml: 1 }} /></>
          )}
        </MenuItem>
        <MenuItem onClick={() => openFilterDialog(columnContextMenu)}>
          Filter {filters[columnContextMenu] && '(active)'}
        </MenuItem>
        {columnContextMenu && columns.find(col => col.name === columnContextMenu)?.locked ? (
          <MenuItem onClick={() => toggleColumnLock(columnContextMenu)}>
            Unlock Column <LockOpenIcon fontSize="small" sx={{ ml: 1 }} />
          </MenuItem>
        ) : (
          <MenuItem onClick={() => toggleColumnLock(columnContextMenu)}>
            Lock Column <LockIcon fontSize="small" sx={{ ml: 1 }} />
          </MenuItem>
        )}
      </Menu>

      {/* Filter Dialog */}
      <FilterDialog 
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        column={activeFilterColumn}
        currentFilter={filters[activeFilterColumn] || {}}
        onApply={handleApplyFilter}
        data={data}
      />

      {/* New Column Dialog */}
      <Dialog 
        open={newColumnDialogOpen} 
        onClose={() => setNewColumnDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add New Column</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Column Name"
              fullWidth
              variant="outlined"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
            />
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="column-type-select-label">Column Type</InputLabel>
              <Select
                labelId="column-type-select-label"
                value={newColumnType}
                label="Column Type"
                onChange={(e) => setNewColumnType(e.target.value)}
              >
                <MenuItem value="text">Text</MenuItem>
                <MenuItem value="number">Number</MenuItem>
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="dropdown">Dropdown</MenuItem>
                <MenuItem value="checkbox">Checkbox</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          
          {newColumnType === 'dropdown' && (
            <Box sx={{ mt: 2 }}>
              <TextField
                margin="dense"
                label="Dropdown Options (comma separated)"
                fullWidth
                variant="outlined"
                value={dropdownOptions}
                onChange={(e) => setDropdownOptions(e.target.value)}
                placeholder="Option 1, Option 2, Option 3"
                helperText="Enter options separated by commas"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewColumnDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddNewColumn} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SpreadsheetView;