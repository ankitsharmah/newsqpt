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
        'http://localhost:9000/api/api/spreadsheets/67fb9e3099cdc37b2013323c'
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





// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import { useParams } from 'react-router-dom';
// import { 
//   Container, Box, Typography, CircularProgress,
//   Button, IconButton, Tooltip, Paper, Menu, MenuItem,
//   Dialog, DialogTitle, DialogContent, DialogActions, FormControl,
//   TextField, Select, InputLabel, FormControlLabel, Checkbox, FormGroup,
//   Snackbar, Alert
// } from '@mui/material';
// import LockIcon from '@mui/icons-material/Lock';
// import LockOpenIcon from '@mui/icons-material/LockOpen';
// import FilterListIcon from '@mui/icons-material/FilterList';
// import AddIcon from '@mui/icons-material/Add';
// import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
// import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
// import SaveIcon from '@mui/icons-material/Save';
// import DownloadIcon from '@mui/icons-material/Download';
// import DeleteIcon from '@mui/icons-material/Delete';
// import EditIcon from '@mui/icons-material/Edit';
// import axios from 'axios';
// import debounce from 'lodash/debounce';
// import { VariableSizeGrid as Grid } from 'react-window';
// import io from 'socket.io-client'; // Import Socket.io client

// import FilterDialog from './FilterDialog';
// import { toast } from 'react-toastify';

// // Socket URL - use environment variable in production
// const SOCKET_URL = 'http://localhost:9000/api';

// // Custom Cell component
// const Cell = ({ columnIndex, rowIndex, style, data }) => {
//   // Get reference to the cell DOM element for focus
//   const cellRef = useRef(null);
  
//   // Special case for sequence number column (columnIndex === 0)
//   if (columnIndex === 0) {
//     return (
//       <div
//         style={{
//           ...style,
//           boxSizing: 'border-box',
//           border: '1px solid #ddd',
//           padding: '6px',
//           backgroundColor: rowIndex % 2 === 0 ? '#fff' : '#f9f9f9',
//           whiteSpace: 'nowrap',
//           overflow: 'hidden',
//           textOverflow: 'ellipsis',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           fontWeight: 'bold',
//           color: '#666'
//         }}
//       >
//         {rowIndex + 1}
//       </div>
//     );
//   }
  
//   // Adjust columnIndex to get the actual column (subtract 1 because of seq column)
//   const actualColumnIndex = columnIndex - 1;
  
//   const { 
//     rows, columns, onCellChange, editingCell, setEditingCell, 
//     editValue, setEditValue, saveEdit, handleKeyPress, onfocus, customFont,
//     navigateCell, currentFocus
//   } = data;
  
//   const row = rows[rowIndex];
//   const column = columns[actualColumnIndex];
//   const columnKey = column?.name;
//   const columnType = column?.type || 'text';
//   const cellValue = row?.[columnKey];
//   const isLocked = column?.locked;
  
//   const isEditing = editingCell && 
//                    editingCell.rowIndex === rowIndex && 
//                    editingCell.columnName === columnKey;
  
//   const isFocused = currentFocus && 
//                    currentFocus.rowIndex === rowIndex && 
//                    currentFocus.columnIndex === columnIndex;

//   // Effect to focus the cell when it becomes the current focus
//   useEffect(() => {
//     if (isFocused && cellRef.current && !isLocked) {
//       cellRef.current.focus();
//     }
//   }, [isFocused, isLocked]);
  
//   const handleFocus = () => {
//     console.log('Cell focused:', rowIndex, columnKey);
//     if (!isLocked && data.onfocus) {
//       data.onfocus(rowIndex, columnKey);
//     }
    
//     // Update current focus when this cell gets focused
//     data.setCurrentFocus({ rowIndex, columnIndex, columnName: columnKey });
//   };
  
//   const handleKeyDown = (e) => {
//     // Don't handle navigation if we're editing
//     if (isEditing) {
//       handleKeyPress(e);
//       return;
//     }
    
//     // Handle arrow keys, tab, and shift+tab
//     switch (e.key) {
//       case 'ArrowUp':
//         e.preventDefault();
//         navigateCell(rowIndex, columnIndex, 'up');
//         break;
//       case 'ArrowDown':
//         e.preventDefault();
//         navigateCell(rowIndex, columnIndex, 'down');
//         break;
//       case 'ArrowLeft':
//         e.preventDefault();
//         navigateCell(rowIndex, columnIndex, 'left');
//         break;
//       case 'ArrowRight':
//         e.preventDefault();
//         navigateCell(rowIndex, columnIndex, 'right');
//         break;
//       case 'Tab':
//         e.preventDefault();
//         navigateCell(rowIndex, columnIndex, e.shiftKey ? 'left' : 'right');
//         break;
//       case 'Enter':
//         e.preventDefault();
//         if (!isLocked) {
//           startEditing();
//         }
//         break;
//       default:
//         break;
//     }
//   };

//   const handleMouseEnter = (e) => {
//     // Don't show tooltip if editing
//     if (isEditing) return;
    
//     // Get value to display in tooltip
//     let displayValue = cellValue !== null && cellValue !== undefined ? cellValue : '';
    
//     // Convert to string if not already
//     if (typeof displayValue !== 'string') {
//       displayValue = String(displayValue);
//     }
    
//     // Only show tooltip if the content is meaningful
//     if (displayValue.trim().length > 0) {
//       const tooltip = document.getElementById('spreadsheet-tooltip');
//       if (tooltip) {
//         tooltip.textContent = displayValue;
//         tooltip.style.display = 'block';
        
//         // Calculate if tooltip would go off screen and adjust positioning
//         const maxWidth = window.innerWidth - 20;
//         const maxHeight = window.innerHeight - 20;
//         const tooltipWidth = 250;
        
//         // Adjust X position if would go off right side
//         let posX = e.clientX + 15;
//         if (posX + tooltipWidth > maxWidth) {
//           posX = e.clientX - tooltipWidth - 20;
//         }
        
//         // Adjust Y position if would go off bottom
//         let posY = e.clientY + 10;
//         const tooltipHeight = tooltip.offsetHeight;
//         if (posY + tooltipHeight > maxHeight) {
//           posY = maxHeight - tooltipHeight;
//         }
        
//         tooltip.style.left = `${posX}px`;
//         tooltip.style.top = `${posY}px`;
//       }
//     }
//   };

//   const handleMouseLeave = () => {
//     const tooltip = document.getElementById('spreadsheet-tooltip');
//     if (tooltip) {
//       tooltip.style.display = 'none';
//     }
//   };

//   const startEditing = () => {
//     if (isLocked) return;
    
//     // Hide tooltip when starting to edit
//     const tooltip = document.getElementById('spreadsheet-tooltip');
//     if (tooltip) {
//       tooltip.style.display = 'none';
//     }
    
//     setEditingCell({ rowIndex, columnName: columnKey });
//     setEditValue(cellValue !== null && cellValue !== undefined ? cellValue : '');
//   };

//   // Handle different cell types
//   const renderCellContent = () => {
//     switch (columnType) {
//       case 'checkbox':
//         return (
//           <Checkbox
//             checked={Boolean(cellValue)}
//             onChange={(e) => onCellChange(rowIndex, columnKey, e.target.checked)}
//             disabled={isLocked}
//             onFocus={(e)=>onfocus(rowIndex, columnKey)}
//           />
//         );
        
//       case 'dropdown':
//         const options = column.options || [];
//         return (
//           <FormControl fullWidth size="small" disabled={isLocked}>
//             <Select
//               value={cellValue || ''}
//               onChange={(e) => onCellChange(rowIndex, columnKey, e.target.value)}
//               onFocus={()=>onfocus(rowIndex, columnKey)}
//               displayEmpty
//             >
//               <MenuItem value="">
//                 <em>None</em>
//               </MenuItem>
//               {options.map((option) => (
//                 <MenuItem key={option} value={option}>
//                   {option}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//         );
        
//       case 'date':
//         if (isEditing) {
//           return (
//             <TextField
//               type="date"
//               fullWidth
//               size="small"
//               value={editValue || ''}
//               onChange={(e) => setEditValue(e.target.value)}
//               onKeyDown={handleKeyPress}
//               onBlur={saveEdit}
//               autoFocus
//               onFocus={()=>onfocus(rowIndex, columnKey)}
//             />
//           );
//         }
//         return cellValue || '';
        
//       case 'number':
//         if (isEditing) {
//           return (
//             <TextField
//               type="number"
//               fullWidth
//               size="small"
//               value={editValue}
//               onChange={(e) => setEditValue(e.target.value)}
//               onKeyDown={handleKeyPress}
//               onBlur={saveEdit}
//               autoFocus
//               onFocus={()=>onfocus(rowIndex, columnKey)}
//             />
//           );
//         }
//         return cellValue !== null && cellValue !== undefined ? cellValue : '';
        
//       case 'text':
//       default:
//         if (columnType === 'text' || columnType === 'number' || columnType === 'date') {
//           if (isEditing) {
//             return (
//               <div style={{...style, /* existing styles */}}>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   value={editValue}
//                   onChange={(e) => setEditValue(e.target.value)}
//                   onKeyDown={handleKeyPress}
//                   onBlur={saveEdit}
//                   autoFocus
//                   onFocus={handleFocus}
//                 />
//               </div>
//             );
//           }
//         }
//         return cellValue !== null && cellValue !== undefined ? cellValue : '';
//     }
//   };

//   return (
//     <div
//       ref={cellRef}
//       style={{
//         ...style,
//         boxSizing: 'border-box',
//         border: '1px solid #ddd',
//         padding: isEditing ? '2px' : '6px',
//         backgroundColor: isLocked ? '#f0f0f0' : (rowIndex % 2 === 0 ? '#fff' : '#f9f9f9'),
//         whiteSpace: 'nowrap',
//         overflow: 'hidden',
//         fontSize: customFont,
//         textOverflow: 'ellipsis',
//         cursor: isLocked ? 'not-allowed' : 'pointer',
//         display: 'flex',
//         alignItems: 'center',
//         outline: isFocused ? '2px solid #1976d2' : 'none' // Highlight focused cell
//       }}
//       onClick={() => !isLocked && !isEditing && startEditing()}
//       onFocus={handleFocus}
//       onKeyDown={handleKeyDown}
//       onMouseEnter={handleMouseEnter}
//       onMouseLeave={handleMouseLeave}
//       tabIndex={isLocked ? -1 : 0} // Make non-locked cells focusable
//     >
//       {renderCellContent()}
//     </div>
//   );
// };


// // Custom HeaderCell component
// const HeaderCell = ({ columnIndex, style, data }) => {
//   const { columns, handleColumnClick, sortConfig, filters } = data;
  
//   // Special case for sequence number column (columnIndex === 0)
//   if (columnIndex === 0) {
//     return (
//       <div
//         style={{
//           ...style,
//           boxSizing: 'border-box',
//           border: '1px solid #ccc',
//           fontWeight: 'bold',
//           backgroundColor: '#f3f3f3',
//           padding: '6px',
//           whiteSpace: 'nowrap',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center'
//         }}
//       >
//         <span>#</span>
//       </div>
//     );
//   }
  
//   // Adjust columnIndex to get the actual column (subtract 1 because of seq column)
//   const actualColumnIndex = columnIndex - 1;
//   const column = columns[actualColumnIndex];
//   const columnName = column?.name;
//   const isLocked = column?.locked;
  
//   const getSortIcon = () => {
//     if (sortConfig.key !== columnName) return null;
//     return sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;
//   };

//   const getFilterIcon = () => {
//     return filters[columnName] ? <FilterListIcon color="primary" fontSize="small" /> : <FilterListIcon fontSize="small" />;
//   };

//   return (
//     <div
//       style={{
//         ...style,
//         boxSizing: 'border-box',
//         border: '1px solid #ccc',
//         fontWeight: 'bold',
//         backgroundColor: isLocked ? '#e0e0e0' : '#f3f3f3',
//         padding: '6px',
//         whiteSpace: 'nowrap',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         cursor: 'pointer'
//       }}
//       onClick={(e) => handleColumnClick(e, columnName)}
//     >
//       <span>{columnName}</span>
//       <div style={{ display: 'flex', alignItems: 'center', gap: '4px'}}>
//         {isLocked && <LockIcon fontSize="small" style={{ color: '#555' }} />}
//         {getFilterIcon()}
//         {getSortIcon()}
//       </div>
//     </div>
//   );
// };

// const SpreadsheetView = () => {
//   const { id } = useParams();
//   const [spreadsheet, setSpreadsheet] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [data, setData] = useState([]);
//   const [columns, setColumns] = useState([]);
//   const [pendingUpdates, setPendingUpdates] = useState([]);
//   const [isSaving, setIsSaving] = useState(false);
//   const [filteredData, setFilteredData] = useState([]);
//   const [filteredIndices, setFilteredIndices] = useState(null);
//   const [filters, setFilters] = useState({});
//   const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
//   const [filterDialogOpen, setFilterDialogOpen] = useState(false);
//   const [activeFilterColumn, setActiveFilterColumn] = useState(null);
//   const [anchorEl, setAnchorEl] = useState(null);
//   const [columnContextMenu, setColumnContextMenu] = useState(null);
//   const [newColumnDialogOpen, setNewColumnDialogOpen] = useState(false);
//   const [newColumnName, setNewColumnName] = useState('');
//   const [newColumnType, setNewColumnType] = useState('text');
//   const [dropdownOptions, setDropdownOptions] = useState('');
//   const [isDownloading, setIsDownloading] = useState(false);
//   const [editingCell, setEditingCell] = useState(null);
//   const [editValue, setEditValue] = useState('');
//   const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
//   const [doneByUser, setDoneByUser]= useState(false);
//   const [customFont, setCustomFont] = useState(13);
//   // New state for keyboard navigation
//   const [currentFocus, setCurrentFocus] = useState(null);
//   // New state for rename column dialog
//   const [renameColumnDialogOpen, setRenameColumnDialogOpen] = useState(false);
//   const [columnToRename, setColumnToRename] = useState('');
//   const [newColumnNameForRename, setNewColumnNameForRename] = useState('');
//   // New state for delete column confirmation dialog
//   const [deleteColumnDialogOpen, setDeleteColumnDialogOpen] = useState(false);
//   const [columnToDelete, setColumnToDelete] = useState('');
  
//   // Socket.io reference
//   const socketRef = useRef(null);
//   // Grid reference for refreshing
//   const gridRef = useRef(null);
  
//   useEffect(() => {
//     fetchSpreadsheetData();
    
//     // Initialize Socket.io connection
//     socketRef.current = io(SOCKET_URL);
    
//     // Join spreadsheet room
//     socketRef.current.emit('joinSpreadsheet', id);
    
//     // Listen for cell updates from other users
//     socketRef.current.on('cellUpdates', (data) => {
//       handleRemoteCellUpdates(data.updates);
//     });
    
//     // Listen for column lock changes
//     socketRef.current.on('columnLockChanged', (data) => {
//       handleRemoteColumnLockChange(data);
//     });
    
//     // Listen for new rows
//     socketRef.current.on('rowAdded', (data) => {
//       handleRemoteRowAdded(data);
//     });
    
//     // Listen for new columns
//     socketRef.current.on('columnAdded', (data) => {
//       handleRemoteColumnAdded(data);
//     });
    
//     // Listen for column deletions
//     socketRef.current.on('columnDeleted', (data) => {
//       handleRemoteColumnDeleted(data);
//     });
    
//     // Listen for column renames
//     socketRef.current.on('columnRenamed', (data) => {
//       handleRemoteColumnRenamed(data);
//     });
    
//     socketRef.current.on('cellEditing', ({ cell, user }) => {
//       console.log(`${user.name} is editing cell [${cell.rowIndex}, ${cell.columnKey}]`);
//       // Optionally highlight that cell or show user's name on UI
//     });
    
//     // Listen for cell editing stopped by another user
//     socketRef.current.on('cellEditingStopped', ({ cell }) => {
//       console.log("stopped", `${cell.rowIndex}-${cell.columnKey}`);
//     });
    
//     // Set up key event listeners for global keyboard navigation
//     window.addEventListener('keydown', handleGlobalKeyDown);
    
//     // Cleanup on unmount
//     return () => {
//       if (socketRef.current) {
//         socketRef.current.disconnect();
//       }
//       // Clear any pending debounced saves
//       saveChanges.flush();
      
//       // Remove key event listener
//       window.removeEventListener('keydown', handleGlobalKeyDown);
//     };
//   }, [id]);
  
//   // Handle global keyboard events
//   const handleGlobalKeyDown = (e) => {
//     // Only handle global keys if we're not in an input field
//     if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
//       return;
//     }
    
//     // Add keyboard shortcuts here if needed
//   };
  
//   // Function to navigate between cells
//   const navigateCell = useCallback((rowIndex, columnIndex, direction) => {
//     if (!filteredData || !columns) return;
    
//     const rowCount = filteredData.length;
//     const columnCount = columns.length + 1; // +1 for sequence column
    
//     let newRowIndex = rowIndex;
//     let newColumnIndex = columnIndex;
    
//     switch (direction) {
//       case 'up':
//         newRowIndex = Math.max(0, rowIndex - 1);
//         break;
//       case 'down':
//         newRowIndex = Math.min(rowCount - 1, rowIndex + 1);
//         break;
//       case 'left':
//         newColumnIndex = Math.max(1, columnIndex - 1); // Min is 1 to skip sequence column
//         break;
//       case 'right':
//         newColumnIndex = Math.min(columnCount - 1, columnIndex + 1);
//         break;
//       default:
//         break;
//     }
    
//     // Don't navigate to sequence column (index 0)
//     if (newColumnIndex === 0) {
//       newColumnIndex = 1;
//     }
    
//     // If nothing changed, return
//     if (newRowIndex === rowIndex && newColumnIndex === columnIndex) {
//       return;
//     }
    
//     // Update current focus
//     const newColumnName = newColumnIndex > 0 ? columns[newColumnIndex - 1]?.name : null;
    
//     // Check if the target cell is locked
//     const isTargetLocked = newColumnIndex > 0 && columns[newColumnIndex - 1]?.locked;
    
//     // If target is locked, try to find next non-locked cell in the same direction
//     if (isTargetLocked) {
//       // For horizontal navigation, keep moving in the same direction until non-locked or edge
//       if (direction === 'left' || direction === 'right') {
//         let nextColumnIndex = newColumnIndex;
//         const step = direction === 'left' ? -1 : 1;
        
//         while (nextColumnIndex > 0 && nextColumnIndex < columnCount && 
//                columns[nextColumnIndex - 1]?.locked) {
//           nextColumnIndex += step;
          
//           // Stop at boundaries
//           if (nextColumnIndex <= 0 || nextColumnIndex >= columnCount) {
//             break;
//           }
//         }
        
//         // If we found a non-locked cell, use that
//         if (nextColumnIndex > 0 && nextColumnIndex < columnCount && 
//             !columns[nextColumnIndex - 1]?.locked) {
//           newColumnIndex = nextColumnIndex;
//           newColumnName = columns[newColumnIndex - 1]?.name;
//         } else {
//           // If all cells are locked in this direction, stay at current position
//           return;
//         }
//       }
//     }
    
//     // Set new focus
//     setCurrentFocus({ 
//       rowIndex: newRowIndex, 
//       columnIndex: newColumnIndex,
//       columnName: newColumnName
//     });
    
//     // Scroll to the new cell if needed
//     if (gridRef.current) {
//       gridRef.current.scrollToItem({
//         rowIndex: newRowIndex,
//         columnIndex: newColumnIndex
//       });
//     }
//   }, [filteredData, columns]);
  
//   const onfocus = useCallback((rowIndex, columnKey) => {
//     console.log('Cell focus triggered:', rowIndex, columnKey);
    
//     if (!socketRef.current) {
//       console.error('Socket not initialized when trying to emit cellEditing');
//       return;
//     }
    
//     if (!socketRef.current.connected) {
//       console.error('Socket not connected when trying to emit cellEditing');
//       return;
//     }
    
//     const eventData = {
//       spreadsheetId: id,
//       cell: { rowIndex, columnKey },
//       user: { id: "user123", name: "ankit" } // Replace with actual user info
//     };
    
//     console.log('Emitting cellEditing event with data:', eventData);
//     socketRef.current.emit('cellEditing', eventData);
//   }, [id]);

//   useEffect(() => {
//     if(!doneByUser && notification.message.length > 0)
//       toast.info(notification.message, {
//         position: "top-center",
//         autoClose: 5000,
//         hideProgressBar: false,
//         closeOnClick: false,
//         pauseOnHover: true,
//         draggable: true,
//         progress: undefined,
//         theme: "colored",
//       });
//   }, [notification]);

//   // Initialize tooltip element
//   useEffect(() => {
//     // Create tooltip element if it doesn't exist
//     if (!document.getElementById('spreadsheet-tooltip')) {
//       const tooltip = document.createElement('div');
//       tooltip.id = 'spreadsheet-tooltip';
//       tooltip.style.cssText = `
//         position: fixed;
//         display: none;
//         background-color: rgba(0, 0, 0, 0.8);
//         color: white;
//         padding: 8px 12px;
//         border-radius: 4px;
//         max-width: 250px;
//         max-height: 100px;
//         overflow: auto;
//         word-break: break-word;
//         pointer-events: none;
//         box-shadow: 0 2px 10px rgba(0,0,0,0.2);
//         font-size: 14px;
//         z-index: 9999;
//       `;
//       document.body.appendChild(tooltip);
//     }
    
//     // Clean up on component unmount
//     return () => {
//       const tooltip = document.getElementById('spreadsheet-tooltip');
//       if (tooltip && tooltip.parentNode) {
//         tooltip.parentNode.removeChild(tooltip);
//       }
//     };
//   }, []);
  
//   // Throttle function to limit how often a function runs
//   const throttle = (func, limit) => {
//     let inThrottle;
//     return function() {
//       const args = arguments;
//       const context = this;
//       if (!inThrottle) {
//         func.apply(context, args);
//         inThrottle = true;
//         setTimeout(() => inThrottle = false, limit);
//       }
//     };
//   };

//   // Utility functions for tooltip
//   const showTooltip = (text, x, y) => {
//     const tooltip = document.getElementById('spreadsheet-tooltip');
//     if (!tooltip) return;
    
//     tooltip.textContent = text;
//     tooltip.style.display = 'block';
    
//     // Calculate if tooltip would go off screen and adjust positioning
//     const maxWidth = window.innerWidth - 20;
//     const maxHeight = window.innerHeight - 20;
//     const tooltipWidth = 250;
    
//     // Adjust X position if would go off right side
//     let posX = x + 15;
//     if (posX + tooltipWidth > maxWidth) {
//       posX = x - tooltipWidth - 20;
//     }
    
//     // Adjust Y position if would go off bottom
//     let posY = y + 10;
//     const tooltipHeight = tooltip.offsetHeight;
//     if (posY + tooltipHeight > maxHeight) {
//       posY = maxHeight - tooltipHeight;
//     }
    
//     tooltip.style.left = `${posX}px`;
//     tooltip.style.top = `${posY}px`;
//   };

//   const hideTooltip = () => {
//     const tooltip = document.getElementById('spreadsheet-tooltip');
//     if (tooltip) tooltip.style.display = 'none';
//   };

//   // Throttled update function for mouse movement
//   const updateTooltipPosition = throttle((x, y) => {
//     const tooltip = document.getElementById('spreadsheet-tooltip');
//     if (!tooltip || tooltip.style.display === 'none') return;
    
//     // Get current text to maintain it
//     const text = tooltip.textContent;
//     showTooltip(text, x, y);
//   }, 30); // Update at most every 30ms

//   useEffect(() => {
//     const handleMouseMove = (e) => {
//       updateTooltipPosition(e.clientX, e.clientY);
//     };
    
//     window.addEventListener('mousemove', handleMouseMove);
    
//     return () => {
//       window.removeEventListener('mousemove', handleMouseMove);
//       hideTooltip(); // Make sure to hide tooltip on unmount
//     };
//   }, []);
  
//   // Handle remote updates received from Socket.io
//   const handleRemoteCellUpdates = (updates) => {
//     // Skip if these are our own updates
//     if (pendingUpdates.some(update => 
//       updates.some(remoteUpdate => 
//         remoteUpdate.rowIndex === update.rowIndex && 
//         remoteUpdate.field === update.field
//       )
//     )) {
//       return;
//     }
    
//     // Apply remote updates to our data
//     setData(prevData => {
//       const newData = [...prevData];
//       updates.forEach(update => {
//         if (newData[update.rowIndex]) {
//           newData[update.rowIndex] = {
//             ...newData[update.rowIndex],
//             [update.field]: update.value
//           };
//         }
//       });
//       return newData;
//     });
//   };

//   const handleRemoteColumnLockChange = (data) => {
//     const { columnName, locked } = data;
    
//     // Update columns state
//     setColumns(prevColumns => 
//       prevColumns.map(col => 
//         col.name === columnName ? { ...col, locked } : col
//       )
//     );
    
//     // Show notification
//     setNotification({
//       open: true,
//       message: `Column "${columnName}" was ${locked ? 'locked' : 'unlocked'} by another user`,
//       severity: 'info'
//     });
//   };

//   const handleRemoteRowAdded = (data) => {
//     const { rowData } = data;
    
//     // Add row to data
//     setData(prevData => [...prevData, rowData]);
    
//     // Show notification
//     setNotification({
//       open: true,
//       message: 'New row added by another user',
//       severity: 'info'
//     });
//   };

//   const handleRemoteColumnAdded = (data) => {
//     const { column, defaultValue } = data;
    
//     // Update our data to include the new column
//     setData(prevData => {
//       return prevData.map(row => ({
//         ...row,
//         [column.name]: defaultValue
//       }));
//     });
    
//     // Update columns state
//     setColumns(prevColumns => [...prevColumns, column]);
    
//     // Show notification
//     setNotification({
//       open: true,
//       message: `New column "${column.name}" added by another user`,
//       severity: 'info'
//     });
//   };

//   // Handle remote column deletion
//   const handleRemoteColumnDeleted = (data) => {
//     const { columnName } = data;
    
//     // Update columns state by removing the deleted column
//     setColumns(prevColumns => 
//       prevColumns.filter(col => col.name !== columnName)
//     );
    
//     // Update data to remove the column from all rows
//     setData(prevData => {
//       return prevData.map(row => {
//         const newRow = { ...row };
//         delete newRow[columnName];
//         return newRow;
//       });
//     });
    
//     // Clear any sort/filter on this column
//     if (sortConfig.key === columnName) {
//       setSortConfig({ key: null, direction: null });
//     }
    
//     if (filters[columnName]) {
//       setFilters(prev => {
//         const newFilters = { ...prev };
//         delete newFilters[columnName];
//         return newFilters;
//       });
//     }
    
//     // Show notification
//     setNotification({
//       open: true,
//       message: `Column "${columnName}" was deleted by another user`,
//       severity: 'info'
//     });
//   };

//   // Handle remote column rename
//   const handleRemoteColumnRenamed = (data) => {
//     const { oldName, newName, column } = data;
    
//     // Update columns state
//     setColumns(prevColumns => 
//       prevColumns.map(col => 
//         col.name === oldName ? { ...col, name: newName } : col
//       )
//     );
    
//     // Update data to use the new column name
//     setData(prevData => {
//       return prevData.map(row => {
//         const newRow = { ...row };
//         if (oldName in newRow) {
//           newRow[newName] = newRow[oldName];
//           delete newRow[oldName];
//         }
//         return newRow;
//       });
//     });
    
//     // Update any sort/filter




// // Update any sort/filter on this column
// if (sortConfig.key === oldName) {
//   setSortConfig({ key: newName, direction: sortConfig.direction });
// }

// if (filters[oldName]) {
//   setFilters(prev => {
//     const newFilters = { ...prev };
//     newFilters[newName] = newFilters[oldName];
//     delete newFilters[oldName];
//     return newFilters;
//   });
// }

// // Show notification
// setNotification({
//   open: true,
//   message: `Column "${oldName}" was renamed to "${newName}" by another user`,
//   severity: 'info'
// });
// };

// const fetchSpreadsheetData = async () => {
// try {
//   setLoading(true);
//   const response = await axios.get(`http://localhost:9000/api/spreadsheets/${id}`);
//   setSpreadsheet(response.data);
//   setData(response.data.data || []);
//   setColumns(response.data.columns || []);
//   setLoading(false);
// } catch (error) {
//   console.error('Error fetching spreadsheet:', error);
//   setNotification({
//     open: true,
//     message: 'Error loading spreadsheet data',
//     severity: 'error'
//   });
//   setLoading(false);
// }
// };

// // Effect to update filtered data when data, filters, or sort changes
// useEffect(() => {
// if (!data || data.length === 0) {
//   setFilteredData([]);
//   setFilteredIndices(null);
//   return;
// }

// // Apply filters
// let newFilteredData = [...data];
// let indices = data.map((_, index) => index);

// if (Object.keys(filters).length > 0) {
//   const filteredResults = data.reduce((acc, row, index) => {
//     let includeRow = true;
    
//     for (const [columnKey, filterValue] of Object.entries(filters)) {
//       if (filterValue === null || filterValue === undefined) continue;
      
//       const columnValue = row[columnKey];
//       const column = columns.find(col => col.name === columnKey);
      
//       // Skip if value is null and we're not filtering for null values
//       if (columnValue === null || columnValue === undefined) {
//         if (filterValue !== 'null' && filterValue !== '') {
//           includeRow = false;
//           break;
//         }
//         continue;
//       }
      
//       // Handle different column types
//       switch (column?.type) {
//         case 'checkbox':
//           if (filterValue !== String(columnValue)) {
//             includeRow = false;
//           }
//           break;
          
//         case 'dropdown':
//           if (filterValue !== columnValue && filterValue !== '') {
//             includeRow = false;
//           }
//           break;
          
//         case 'number':
//           const numValue = parseFloat(columnValue);
//           if (filterValue.type === 'range') {
//             if ((filterValue.min !== null && numValue < filterValue.min) || 
//                 (filterValue.max !== null && numValue > filterValue.max)) {
//               includeRow = false;
//             }
//           } else if (filterValue.type === 'equals' && numValue !== filterValue.value) {
//             includeRow = false;
//           }
//           break;
          
//         case 'date':
//           if (filterValue.type === 'range') {
//             const dateValue = new Date(columnValue);
//             if ((filterValue.start && dateValue < new Date(filterValue.start)) || 
//                 (filterValue.end && dateValue > new Date(filterValue.end))) {
//               includeRow = false;
//             }
//           } else if (filterValue !== columnValue) {
//             includeRow = false;
//           }
//           break;
          
//         case 'text':
//         default:
//           if (typeof columnValue === 'string') {
//             const stringValue = String(columnValue).toLowerCase();
//             const filterStr = String(filterValue).toLowerCase();
//             if (!stringValue.includes(filterStr)) {
//               includeRow = false;
//             }
//           } else if (filterValue !== '') {
//             includeRow = false;
//           }
//           break;
//       }
      
//       if (!includeRow) break;
//     }
    
//     if (includeRow) {
//       acc.rows.push(row);
//       acc.indices.push(index);
//     }
    
//     return acc;
//   }, { rows: [], indices: [] });
  
//   newFilteredData = filteredResults.rows;
//   indices = filteredResults.indices;
// }

// // Apply sorting
// if (sortConfig.key && sortConfig.direction) {
//   const key = sortConfig.key;
//   const direction = sortConfig.direction;
  
//   // Get column type for proper sorting
//   const column = columns.find(col => col.name === key);
//   const columnType = column?.type || 'text';
  
//   // Create a copy with indices to maintain original index after sorting
//   const indexedData = newFilteredData.map((item, idx) => ({
//     item,
//     originalIndex: indices[idx]
//   }));
  
//   indexedData.sort((a, b) => {
//     const valueA = a.item[key];
//     const valueB = b.item[key];
    
//     // Handle null/undefined values (always sort to bottom)
//     if (valueA === null || valueA === undefined) {
//       return direction === 'asc' ? 1 : -1;
//     }
//     if (valueB === null || valueB === undefined) {
//       return direction === 'asc' ? -1 : 1;
//     }
    
//     // Sort based on column type
//     switch (columnType) {
//       case 'number':
//         return direction === 'asc' 
//           ? parseFloat(valueA) - parseFloat(valueB) 
//           : parseFloat(valueB) - parseFloat(valueA);
          
//       case 'date':
//         const dateA = new Date(valueA);
//         const dateB = new Date(valueB);
//         return direction === 'asc' 
//           ? dateA - dateB 
//           : dateB - dateA;
          
//       case 'checkbox':
//         const boolA = Boolean(valueA);
//         const boolB = Boolean(valueB);
//         return direction === 'asc' 
//           ? boolA - boolB 
//           : boolB - boolA;
          
//       case 'text':
//       case 'dropdown':
//       default:
//         const strA = String(valueA).toLowerCase();
//         const strB = String(valueB).toLowerCase();
//         if (strA < strB) return direction === 'asc' ? -1 : 1;
//         if (strA > strB) return direction === 'asc' ? 1 : -1;
//         return 0;
//     }
//   });
  
//   // Update filtered data and indices
//   newFilteredData = indexedData.map(item => item.item);
//   indices = indexedData.map(item => item.originalIndex);
// }

// setFilteredData(newFilteredData);
// setFilteredIndices(indices);

// }, [data, filters, sortConfig, columns]);

// // Save changes with debounce
// const saveChanges = useCallback(
// debounce(async (updatesList) => {
//   if (updatesList.length === 0) return;
  
//   try {
//     setIsSaving(true);
//     const response = await axios.post(`http://localhost:9000/api/spreadsheets/${id}/cells`, {
//       updates: updatesList
//     });
    
//     // Clear the pending updates since they've been saved
//     setPendingUpdates([]);
//     setIsSaving(false);
    
//     // Show save success notification
//     setNotification({
//       open: true,
//       message: 'Changes saved successfully',
//       severity: 'success'
//     });
//   } catch (error) {
//     console.error('Error saving changes:', error);
//     setIsSaving(false);
    
//     // Show error notification
//     setNotification({
//       open: true,
//       message: 'Error saving changes',
//       severity: 'error'
//     });
//   }
// }, 1000),
// [id]
// );

// const handleCellChange = useCallback((rowIndex, columnKey, value) => {
// // Get actual row index if we're using filtered data
// const actualRowIndex = filteredIndices ? filteredIndices[rowIndex] : rowIndex;

// // Update local data
// setData(prevData => {
//   const newData = [...prevData];
//   if (newData[actualRowIndex]) {
//     newData[actualRowIndex] = {
//       ...newData[actualRowIndex],
//       [columnKey]: value
//     };
//   }
//   return newData;
// });

// // Add to pending updates
// const newUpdate = { rowIndex: actualRowIndex, field: columnKey, value };
// setPendingUpdates(prev => [...prev, newUpdate]);

// // Emit update via socket
// if (socketRef.current) {
//   socketRef.current.emit('cellUpdate', {
//     spreadsheetId: id,
//     updates: [newUpdate]
//   });
// }

// // Save changes
// saveChanges([...pendingUpdates, newUpdate]);
// }, [id, pendingUpdates, saveChanges, filteredIndices]);

// const handleColumnClick = (e, columnName) => {
// // Open context menu for column
// setColumnContextMenu(columnName);
// setAnchorEl(e.currentTarget);
// };

// const handleSortClick = (direction) => {
// const column = columnContextMenu;
// setSortConfig({
//   key: column,
//   direction: direction
// });
// handleCloseContextMenu();
// };

// const handleFilterClick = () => {
// setActiveFilterColumn(columnContextMenu);
// setFilterDialogOpen(true);
// handleCloseContextMenu();
// };

// const handleFilterSubmit = (filterValue) => {
// setFilters(prev => ({
//   ...prev,
//   [activeFilterColumn]: filterValue
// }));
// setFilterDialogOpen(false);
// };

// const handleFilterClear = () => {
// setFilters(prev => {
//   const newFilters = { ...prev };
//   delete newFilters[activeFilterColumn];
//   return newFilters;
// });
// setFilterDialogOpen(false);
// };

// const handleCloseContextMenu = () => {
// setAnchorEl(null);
// setColumnContextMenu(null);
// };

// const handleAddRow = async () => {
// try {
//   // Create empty row object with default values for each column
//   const newRow = {};
//   columns.forEach(column => {
//     // Set default values based on column type
//     switch (column.type) {
//       case 'checkbox':
//         newRow[column.name] = false;
//         break;
//       case 'number':
//         newRow[column.name] = 0;
//         break;
//       default:
//         newRow[column.name] = '';
//         break;
//     }
//   });
  
//   // Add row to local data first for immediate UI update
//   setData(prevData => [...prevData, newRow]);
  
//   // Send to server
//   const response = await axios.post(`http://localhost:9000/api/spreadsheets/${id}/rows`, {
//     rowData: newRow
//   });
  
//   // Notify other users via socket
//   if (socketRef.current) {
//     socketRef.current.emit('rowAdded', {
//       spreadsheetId: id,
//       rowData: newRow
//     });
//   }
  
//   // Show success notification
//   setNotification({
//     open: true,
//     message: 'New row added',
//     severity: 'success'
//   });
// } catch (error) {
//   console.error('Error adding row:', error);
//   setNotification({
//     open: true,
//     message: 'Error adding row',
//     severity: 'error'
//   });
// }
// };

// const handleAddColumn = async () => {
// // Validate column name
// if (!newColumnName.trim()) {
//   setNotification({
//     open: true,
//     message: 'Column name cannot be empty',
//     severity: 'error'
//   });
//   return;
// }

// // Check for duplicate column name
// if (columns.some(col => col.name === newColumnName)) {
//   setNotification({
//     open: true,
//     message: 'Column name already exists',
//     severity: 'error'
//   });
//   return;
// }

// // Create new column object
// const newColumn = {
//   name: newColumnName,
//   type: newColumnType,
//   locked: false
// };

// // Add options if it's a dropdown type
// if (newColumnType === 'dropdown' && dropdownOptions.trim()) {
//   newColumn.options = dropdownOptions
//     .split(',')
//     .map(option => option.trim())
//     .filter(option => option);
// }

// // Default value based on column type
// let defaultValue;
// switch (newColumnType) {
//   case 'checkbox':
//     defaultValue = false;
//     break;
//   case 'number':
//     defaultValue = 0;
//     break;
//   default:
//     defaultValue = '';
//     break;
// }

// try {
//   // Add column to server first
//   const response = await axios.post(`http://localhost:9000/api/spreadsheets/${id}/columns`, {
//     column: newColumn,
//     defaultValue
//   });
  
//   // Add column locally
//   setColumns(prev => [...prev, newColumn]);
  
//   // Add field to each row in data
//   setData(prevData => {
//     return prevData.map(row => ({
//       ...row,
//       [newColumnName]: defaultValue
//     }));
//   });
  
//   // Notify other users via socket
//   if (socketRef.current) {
//     socketRef.current.emit('columnAdded', {
//       spreadsheetId: id,
//       column: newColumn,
//       defaultValue
//     });
//   }
  
//   // Show success notification
//   setNotification({
//     open: true,
//     message: `New column "${newColumnName}" added`,
//     severity: 'success'
//   });
  
//   // Close dialog and reset fields
//   setNewColumnDialogOpen(false);
//   setNewColumnName('');
//   setNewColumnType('text');
//   setDropdownOptions('');
// } catch (error) {
//   console.error('Error adding column:', error);
//   setNotification({
//     open: true,
//     message: 'Error adding column',
//     severity: 'error'
//   });
// }
// };

// const handleLockColumn = async () => {
// const columnName = columnContextMenu;
// const column = columns.find(col => col.name === columnName);

// if (!column) return;

// const newLockState = !column.locked;

// try {
//   // Update on server
//   await axios.put(`http://localhost:9000/api/spreadsheets/${id}/columns/${columnName}/lock`, {
//     locked: newLockState
//   });
  
//   // Update locally
//   setColumns(prevColumns => 
//     prevColumns.map(col => 
//       col.name === columnName ? { ...col, locked: newLockState } : col
//     )
//   );
  
//   // Notify other users via socket
//   if (socketRef.current) {
//     socketRef.current.emit('columnLockChanged', {
//       spreadsheetId: id,
//       columnName,
//       locked: newLockState
//     });
//   }
  
//   // Show success notification
//   setNotification({
//     open: true,
//     message: `Column "${columnName}" ${newLockState ? 'locked' : 'unlocked'}`,
//     severity: 'success'
//   });
  
//   handleCloseContextMenu();
// } catch (error) {
//   console.error('Error changing column lock state:', error);
//   setNotification({
//     open: true,
//     message: `Error ${newLockState ? 'locking' : 'unlocking'} column`,
//     severity: 'error'
//   });
// }
// };

// const handleDeleteColumn = async () => {
// try {
//   // Delete on server
//   await axios.delete(`http://localhost:9000/api/spreadsheets/${id}/columns/${columnToDelete}`);
  
//   // Update locally
//   setColumns(prevColumns => prevColumns.filter(col => col.name !== columnToDelete));
  
//   // Update data to remove the column from all rows
//   setData(prevData => {
//     return prevData.map(row => {
//       const newRow = { ...row };
//       delete newRow[columnToDelete];
//       return newRow;
//     });
//   });
  
//   // Clear any sort/filter on this column
//   if (sortConfig.key === columnToDelete) {
//     setSortConfig({ key: null, direction: null });
//   }
  
//   if (filters[columnToDelete]) {
//     setFilters(prev => {
//       const newFilters = { ...prev };
//       delete newFilters[columnToDelete];
//       return newFilters;
//     });
//   }
  
//   // Notify other users via socket
//   if (socketRef.current) {
//     socketRef.current.emit('columnDeleted', {
//       spreadsheetId: id,
//       columnName: columnToDelete
//     });
//   }
  
//   // Show success notification
//   setNotification({
//     open: true,
//     message: `Column "${columnToDelete}" deleted`,
//     severity: 'success'
//   });
  
//   // Close dialog
//   setDeleteColumnDialogOpen(false);
//   setColumnToDelete('');
// } catch (error) {
//   console.error('Error deleting column:', error);
//   setNotification({
//     open: true,
//     message: 'Error deleting column',
//     severity: 'error'
//   });
// }
// };

// const handleRenameColumn = async () => {
// // Validate new name
// if (!newColumnNameForRename.trim()) {
//   setNotification({
//     open: true,
//     message: 'Column name cannot be empty',
//     severity: 'error'
//   });
//   return;
// }

// // Check for duplicate name
// if (columns.some(col => col.name === newColumnNameForRename)) {
//   setNotification({
//     open: true,
//     message: 'Column name already exists',
//     severity: 'error'
//   });
//   return;
// }

// try {
//   // Rename on server
//   await axios.put(`http://localhost:9000/api/spreadsheets/${id}/columns/${columnToRename}`, {
//     newName: newColumnNameForRename
//   });
  
//   // Update columns locally
//   const updatedColumn = columns.find(col => col.name === columnToRename);
  
//   setColumns(prevColumns => 
//     prevColumns.map(col => 
//       col.name === columnToRename ? { ...col, name: newColumnNameForRename } : col
//     )
//   );
  
//   // Update data to use the new column name
//   setData(prevData => {
//     return prevData.map(row => {
//       const newRow = { ...row };
//       if (columnToRename in newRow) {
//         newRow[newColumnNameForRename] = newRow[columnToRename];
//         delete newRow[columnToRename];
//       }
//       return newRow;
//     });
//   });
  
//   // Update any sort/filter on this column
//   if (sortConfig.key === columnToRename) {
//     setSortConfig({ key: newColumnNameForRename, direction: sortConfig.direction });
//   }
  
//   if (filters[columnToRename]) {
//     setFilters(prev => {
//       const newFilters = { ...prev };
//       newFilters[newColumnNameForRename] = newFilters[columnToRename];
//       delete newFilters[columnToRename];
//       return newFilters;
//     });
//   }
  
//   // Notify other users via socket
//   if (socketRef.current) {
//     socketRef.current.emit('columnRenamed', {
//       spreadsheetId: id,
//       oldName: columnToRename,
//       newName: newColumnNameForRename,
//       column: updatedColumn
//     });
//   }
  
//   // Show success notification
//   setNotification({
//     open: true,
//     message: `Column renamed from "${columnToRename}" to "${newColumnNameForRename}"`,
//     severity: 'success'
//   });
  
//   // Close dialog and reset values
//   setRenameColumnDialogOpen(false);
//   setColumnToRename('');
//   setNewColumnNameForRename('');
// } catch (error) {
//   console.error('Error renaming column:', error);
//   setNotification({
//     open: true,
//     message: 'Error renaming column',
//     severity: 'error'
//   });
// }
// };

// const handleRenameColumnClick = () => {
// setColumnToRename(columnContextMenu);
// setNewColumnNameForRename(columnContextMenu);
// setRenameColumnDialogOpen(true);
// handleCloseContextMenu();
// };

// const handleDeleteColumnClick = () => {
// setColumnToDelete(columnContextMenu);
// setDeleteColumnDialogOpen(true);
// handleCloseContextMenu();
// };

// const handleDownload = async () => {
// try {
//   setIsDownloading(true);
  
//   // Get current filtered and sorted data
//   const currentData = filteredData.length > 0 ? filteredData : data;
  
//   // Prepare data for CSV
//   const headers = columns.map(col => col.name);
//   const csvContent = [
//     headers.join(','), // headers row
//     ...currentData.map(row => 
//       headers.map(header => {
//         const value = row[header];
        
//         // Handle different value types for CSV
//         if (value === null || value === undefined) {
//           return '';
//         } else if (typeof value === 'string') {
//           // Escape quotes and wrap in quotes if needed
//           if (value.includes(',') || value.includes('"') || value.includes('\n')) {
//             return `"${value.replace(/"/g, '""')}"`;
//           }
//           return value;
//         } else {
//           return String(value);
//         }
//       }).join(',')
//     )
//   ].join('\n');
  
//   // Create downloadable blob
//   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//   const url = URL.createObjectURL(blob);
  
//   // Create download link and click it
//   const link = document.createElement('a');
//   const fileName = spreadsheet?.name 
//     ? `${spreadsheet.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`
//     : 'spreadsheet.csv';
  
//   link.setAttribute('href', url);
//   link.setAttribute('download', fileName);
//   link.style.visibility = 'hidden';
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
  
//   setIsDownloading(false);
  
//   // Show success notification
//   setNotification({
//     open: true,
//     message: 'Spreadsheet data downloaded successfully',
//     severity: 'success'
//   });
// } catch (error) {
//   console.error('Error downloading data:', error);
//   setIsDownloading(false);
  
//   // Show error notification
//   setNotification({
//     open: true,
//     message: 'Error downloading data',
//     severity: 'error'
//   });
// }
// };

// // Handle cell editing
// const handleKeyPress = (e) => {
// if (!editingCell) return;

// if (e.key === 'Enter' || e.key === 'Tab') {
//   e.preventDefault();
//   saveEdit();
  
//   // Navigate to next cell based on key
//   if (e.key === 'Enter') {
//     navigateCell(editingCell.rowIndex, 
//                columns.findIndex(col => col.name === editingCell.columnName) + 1, 
//                'down');
//   } else if (e.key === 'Tab') {
//     navigateCell(editingCell.rowIndex, 
//                columns.findIndex(col => col.name === editingCell.columnName) + 1, 
//                e.shiftKey ? 'left' : 'right');
//   }
// } else if (e.key === 'Escape') {
//   e.preventDefault();
//   setEditingCell(null);
// }
// };

// const saveEdit = () => {
// if (!editingCell) return;

// const { rowIndex, columnName } = editingCell;

// if (socketRef.current) {
//   socketRef.current.emit('cellEditingStopped', {
//     spreadsheetId: id,
//     cell: { rowIndex, columnKey: columnName },
//     user: { id: "user123", name: "ankit" } // Replace with actual user info
//   });
// }

// // Only save if value actually changed
// const row = filteredData[rowIndex];
// const origValue = row ? row[columnName] : null;

// if (editValue !== origValue) {
//   handleCellChange(rowIndex, columnName, editValue);
// }

// setEditingCell(null);
// };

// // Calculate grid sizes and item sizes
// const getColumnWidth = index => {
// // Width for sequence number column
// if (index === 0) return 60;

// // Adjust index for actual column (subtract 1 because of seq column)
// const actualIndex = index - 1;

// // Get column from array
// const column = columns[actualIndex];
// if (!column) return 150; // Default width

// // Adjust width based on column type
// switch (column.type) {
//   case 'checkbox':
//     return 100;
//   case 'date':
//     return 180;
//   case 'dropdown':
//     return 180;
//   default:
//     return 150;
// }
// };

// const handleNotificationClose = () => {
// setNotification({ ...notification, open: false });
// };

// if (loading) {
// return (
//   <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
//     <CircularProgress />
//   </Box>
// );
// }

// return (
// <Container maxWidth={false} sx={{ py: 2, height: '100vh', display: 'flex', flexDirection: 'column' }}>
//   {/* Header and controls */}
//   <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//     <Typography variant="h5" component="h1">
//       {spreadsheet?.name || 'Spreadsheet'} 
//       {isSaving && <CircularProgress size={20} sx={{ ml: 2 }} />}
//     </Typography>
    
//     <Box sx={{ display: 'flex', gap: 1 }}>
//       <TextField
//         select
//         size="small"
//         label="Font Size"
//         value={customFont}
//         onChange={(e) => setCustomFont(e.target.value)}
//         sx={{ width: 120 }}
//       >
//         <MenuItem value={11}>Small</MenuItem>
//         <MenuItem value={13}>Medium</MenuItem>
//         <MenuItem value={16}>Large</MenuItem>
//       </TextField>
      
//       <Button 
//         variant="contained" 
//         color="primary" 
//         startIcon={<AddIcon />}
//         onClick={handleAddRow}
//       >
//         Add Row
//       </Button>
      
//       <Button 
//         variant="contained" 
//         color="primary" 
//         startIcon={<AddIcon />}
//         onClick={() => setNewColumnDialogOpen(true)}
//       >
//         Add Column
//       </Button>
      
//       <Button 
//         variant="contained" 
//         color="success" 
//         startIcon={<DownloadIcon />}
//         onClick={handleDownload}
//         disabled={isDownloading}
//       >
//         Download CSV
//       </Button>
//     </Box>
//   </Box>
  
//   {/* Main spreadsheet grid */}
//   <Box 
//     sx={{
//       flexGrow: 1,
//       border: '1px solid #ddd',
//       position: 'relative',
//       overflow: 'hidden'
//     }}
//   >
//     {filteredData.length > 0 ? (
//       <Grid
//         ref={gridRef}
//         columnCount={columns.length + 1} // +1 for sequence column
//         columnWidth={getColumnWidth}
//         height={window.innerHeight - 180}
//         rowCount={filteredData.length}
//         rowHeight={() => 40}
//         width={window.innerWidth - 48}
//         itemData={{
//           rows: filteredData,
//           columns: columns,
//           onCellChange: handleCellChange,
//           editingCell,
//           setEditingCell,
//           editValue,
//           setEditValue,
//           saveEdit,
//           handleKeyPress,
//           onfocus,
//           customFont,
//           navigateCell,
//           currentFocus,
//           setCurrentFocus
//         }}
//       >
//         {Cell}
//       </Grid>
//     ) : (
//       <Box 
//         sx={{ 
//           height: '100%', 
//           display: 'flex', 
//           justifyContent: 'center', 
//           alignItems: 'center' 
//         }}
//       >
//         <Typography variant="body1" color="textSecondary">
//           {data.length === 0 
//             ? 'No data available. Add some rows and columns to get started.' 
//             : 'No data matching the current filters.'}
//         </Typography>
//       </Box>
//     )}
    
//     {/* Fixed header row */}
//     <Box 
//       sx={{ 
//         position: 'absolute', 
//         top: 0, 
//         left: 0, 
//         right: 0, 
//         height: 40, 
//         zIndex: 2, 
//         backgroundColor: '#f3f3f3',
//         borderBottom: '1px solid #ccc'
//       }}
//     >
//       <Grid
//         columnCount={columns.length + 1} // +1 for sequence column
//         columnWidth={getColumnWidth}
//         height={40}
//         rowCount={1}
//         rowHeight={() => 40}
//         width={window.innerWidth - 48}
//         itemData={{
//           columns: columns,
//           handleColumnClick,
//           sortConfig,
//           filters
//         }}
//       >
//         {HeaderCell}
//       </Grid>
//     </Box>
//   </Box>
  
//   {/* Column context menu */}
//   <Menu
//     anchorEl={anchorEl}
//     open={Boolean(anchorEl)}
//     onClose={handleCloseContextMenu}
//   >
//     <MenuItem onClick={() => handleSortClick('asc')}>
//       <ArrowUpwardIcon fontSize="small" sx={{ mr: 1 }} />
//       Sort A-Z
//     </MenuItem>
//     <MenuItem onClick={() => handleSortClick('desc')}>
//       <ArrowDownwardIcon fontSize="small" sx={{ mr: 1 }} />
//       Sort Z-A
//     </MenuItem>
//     <MenuItem onClick={handleFilterClick}>
//       <FilterListIcon fontSize="small" sx={{ mr: 1 }} />
//       Filter
//     </MenuItem>
//     <MenuItem onClick={handleLockColumn}>
//       {columns.find(col => col.name === columnContextMenu)?.locked ? (
//         <>
//           <LockOpenIcon fontSize="small" sx={{ mr: 1 }} />
//           Unlock Column
//         </>
//       ) : (
//         <>
//           <LockIcon fontSize="small" sx={{ mr: 1 }} />
//           Lock Column
//         </>
//       )}
//     </MenuItem>
//     <MenuItem onClick={handleRenameColumnClick}>
//       <EditIcon fontSize="small" sx={{ mr: 1 }} />






//     <EditIcon fontSize="small" sx={{ mr: 1 }} />
//           Rename Column
//         </MenuItem>
//         <MenuItem onClick={handleDeleteColumnClick}>
//           <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
//           Delete Column
//         </MenuItem>
//       </Menu>
      
//       {/* Filter dialog */}
//       {filterDialogOpen && activeFilterColumn && (
//         <FilterDialog
//           open={filterDialogOpen}
//           column={columns.find(col => col.name === activeFilterColumn)}
//           currentFilter={filters[activeFilterColumn]}
//           data={data}
//           onClose={() => setFilterDialogOpen(false)}
//           onSubmit={handleFilterSubmit}
//           onClear={handleFilterClear}
//         />
//       )}
      
//       {/* Add Column Dialog */}
//       <Dialog 
//         open={newColumnDialogOpen} 
//         onClose={() => setNewColumnDialogOpen(false)}
//         maxWidth="sm"
//         fullWidth
//       >
//         <DialogTitle>Add New Column</DialogTitle>
//         <DialogContent>
//           <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
//             <TextField
//               label="Column Name"
//               value={newColumnName}
//               onChange={(e) => setNewColumnName(e.target.value)}
//               fullWidth
//               required
//             />
            
//             <FormControl fullWidth>
//               <InputLabel>Column Type</InputLabel>
//               <Select
//                 value={newColumnType}
//                 onChange={(e) => setNewColumnType(e.target.value)}
//                 label="Column Type"
//               >
//                 <MenuItem value="text">Text</MenuItem>
//                 <MenuItem value="number">Number</MenuItem>
//                 <MenuItem value="date">Date</MenuItem>
//                 <MenuItem value="checkbox">Checkbox</MenuItem>
//                 <MenuItem value="dropdown">Dropdown</MenuItem>
//               </Select>
//             </FormControl>
            
//             {newColumnType === 'dropdown' && (
//               <TextField
//                 label="Dropdown Options (comma separated)"
//                 value={dropdownOptions}
//                 onChange={(e) => setDropdownOptions(e.target.value)}
//                 multiline
//                 rows={3}
//                 fullWidth
//                 helperText="Enter options separated by commas (e.g., Option 1, Option 2, Option 3)"
//               />
//             )}
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setNewColumnDialogOpen(false)}>Cancel</Button>
//           <Button onClick={handleAddColumn} variant="contained" color="primary">Add Column</Button>
//         </DialogActions>
//       </Dialog>
      
//       {/* Rename Column Dialog */}
//       <Dialog 
//         open={renameColumnDialogOpen} 
//         onClose={() => setRenameColumnDialogOpen(false)}
//         maxWidth="sm"
//         fullWidth
//       >
//         <DialogTitle>Rename Column</DialogTitle>
//         <DialogContent>
//           <Box sx={{ mt: 2 }}>
//             <TextField
//               label="New Column Name"
//               value={newColumnNameForRename}
//               onChange={(e) => setNewColumnNameForRename(e.target.value)}
//               fullWidth
//               required
//             />
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setRenameColumnDialogOpen(false)}>Cancel</Button>
//           <Button onClick={handleRenameColumn} variant="contained" color="primary">Rename</Button>
//         </DialogActions>
//       </Dialog>
      
//       {/* Delete Column Confirmation Dialog */}
//       <Dialog 
//         open={deleteColumnDialogOpen} 
//         onClose={() => setDeleteColumnDialogOpen(false)}
//       >
//         <DialogTitle>Delete Column</DialogTitle>
//         <DialogContent>
//           <Typography>
//             Are you sure you want to delete the column "{columnToDelete}"? This action cannot be undone.
//           </Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setDeleteColumnDialogOpen(false)}>Cancel</Button>
//           <Button onClick={handleDeleteColumn} variant="contained" color="error">Delete</Button>
//         </DialogActions>
//       </Dialog>
      
//       {/* Custom tooltip div is added to the DOM directly in useEffect */}
      
//       {/* Notification Snackbar */}
//       <Snackbar
//         open={notification.open}
//         autoHideDuration={6000}
//         onClose={handleNotificationClose}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
//       >
//         <Alert 
//           onClose={handleNotificationClose} 
//           severity={notification.severity} 
//           sx={{ width: '100%' }}
//           variant="filled"
//         >
//           {notification.message}
//         </Alert>
//       </Snackbar>
//     </Container>
//   );
// };

// export default SpreadsheetView;