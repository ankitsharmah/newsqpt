import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Typography, RadioGroup,
  FormControlLabel, Radio, Tabs, Tab
} from '@mui/material';

const FilterDialog = ({ open, onClose, column, currentFilter, onApply, data }) => {
  const [filterType, setFilterType] = useState('text');
  const [textValue, setTextValue] = useState('');
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (currentFilter&&Object.keys(currentFilter).length>0) {
      setFilterType(currentFilter.type || 'text');
      if (currentFilter.type === 'text') {
        setTextValue(currentFilter.value || '');
      } else if (currentFilter.type === 'number') {
        setMinValue(currentFilter.min !== null ? currentFilter.min : '');
        setMaxValue(currentFilter.max !== null ? currentFilter.max : '');
      }
    } else {
      // Reset filters
      setFilterType('text');
      setTextValue('');
      setMinValue('');
      setMaxValue('');
    }
    
    // Auto-detect filter type based on data
    if (data && data.length > 0 && column) {
      const sampleValues = data
        .slice(0, 10)
        .map(row => row[column])
        .filter(val => val !== null && val !== undefined);
      
      const isNumeric = sampleValues.length > 0 && 
        sampleValues.every(val => !isNaN(Number(val)));
      
      if (isNumeric) {
        setFilterType('number');
        setTabValue(1);
      }
    }
  }, [currentFilter, column, data]);

  const handleApply = () => {
    if (filterType === 'text') {
      onApply(column, {
        type: 'text',
        value: textValue
      });
    } else if (filterType === 'number') {
      onApply(column, {
        type: 'number',
        min: minValue === '' ? null : Number(minValue),
        max: maxValue === '' ? null : Number(maxValue)
      });
    }
  };

  const handleClear = () => {
    // Pass null to remove the filter completely
    onApply(column, null);
    onClose(); // Close the dialog after clearing
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setFilterType(newValue === 0 ? 'text' : 'number');
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" 
      fullWidth
      // Prevent errors when column is null during transitions
      aria-labelledby={column ? `filter-dialog-${column}` : 'filter-dialog'}
    >
      <DialogTitle>
        Filter: {column}
      </DialogTitle>
      <DialogContent>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="Text" />
          <Tab label="Number" />
        </Tabs>
        
        {tabValue === 0 && (
          <Box>
            <TextField
              label="Contains"
              variant="outlined"
              fullWidth
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder="Filter text..."
            />
          </Box>
        )}
        
        {tabValue === 1 && (
          <Box>
            <TextField
              label="Min Value"
              variant="outlined"
              fullWidth
              type="number"
              value={minValue}
              onChange={(e) => setMinValue(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Max Value"
              variant="outlined"
              fullWidth
              type="number"
              value={maxValue}
              onChange={(e) => setMaxValue(e.target.value)}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClear} color="error">
          Clear Filter
        </Button>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleApply} variant="contained">
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterDialog;