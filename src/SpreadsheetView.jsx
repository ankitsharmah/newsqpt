import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

import SpreadsheetGrid from './SpreadsheetGrid';
import FilterDialog from './FilterDialog';

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
    let result = [...data];
    let indices = [];
    
    // First collect indices of all rows that match the filters
    data.forEach((row, index) => {
      let includeRow = true;
      
      // Check each filter
      for (const key of Object.keys(filters)) {
        const filter = filters[key];
        
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
    // Update local state
    setData(prevData => {
      const newData = [...prevData];
      newData[rowIndex] = {
        ...newData[rowIndex],
        [field]: value
      };
      return newData;
    });
    
    // Add to pending updates
    setPendingUpdates(prev => [
      ...prev,
      { rowIndex, field, value }
    ]);
  }, []);
  
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

  const getSortIcon = (columnName) => {
    if (sortConfig.key !== columnName) return null;
    return sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;
  };

  const getFilterIcon = (columnName) => {
    return filters[columnName] ? <FilterListIcon color="primary" fontSize="small" /> : <FilterListIcon fontSize="small" />;
  };

  if (loading && !spreadsheet) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, height: 'calc(100vh - 100px)' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h1">
          {spreadsheet?.name}
        </Typography>
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

      <Paper sx={{ height: 'calc(100% - 60px)', overflow: 'scroll' }}>
        {/* Column Headers */}
        <Box
          sx={{
            display: 'flex',
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: '#f5f5f5',
            height: '40px',
            '& > div': {
              padding: '0 8px',
              display: 'flex',
              alignItems: 'center',
              borderRight: '1px solid #e0e0e0',
              fontWeight: 'bold',
              position: 'relative',
              cursor: 'pointer',
            },
          }}
        >
          {columns.map((column) => 
            {
                return  <Box
              key={column.name}
              sx={{ 
                minWidth: '200px', 
                flex: 1,
                backgroundColor: column.locked ? '#cdcdcd' : 'inherit',
              }}
              onClick={(e) => handleColumnClick(e, column.name)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Typography variant="body2" noWrap>
                  {column.name}
                </Typography>
                <Box>
                  {column.locked && (
                    <LockIcon fontSize="small" sx={{ marginLeft: 1, color: 'text.secondary' }} />
                  )}
                  {getFilterIcon(column.name)}
                  {getSortIcon(column.name)}
                </Box>
              </Box>
            </Box>}
          )}
        </Box>

        {/* Spreadsheet Grid */}
        <Box sx={{ height: 'calc(100% - 40px)' }}>
          <SpreadsheetGrid 
            data={data} 
            columns={columns}
            onCellChange={handleCellChange}
            filteredIndices={filteredIndices}
          />
        </Box>
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
    </Container>
  );
};

export default SpreadsheetView;