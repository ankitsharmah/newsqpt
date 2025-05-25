import { useState, useEffect, useRef, useCallback } from 'react';
import { X, ArrowUpDown, Filter, Upload, Download, Plus, Lock, Unlock, Settings } from 'lucide-react';
import _, { debounce } from 'lodash';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';
// import "./ExcelSpreadsheet.css";
// import ".././OwnerAgentExcelData.css"
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ColumnManagerModal from './ColumnManagerModal';

const ExcelLikeSpreadsheet = ({ apiUrl="https://excel-backend-wl01.onrender.com/api/spreadsheets/67ff64fa2da0bee947139386", initialData = null }) => {
  // State for the spreadsheet data
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [columnConfig, setColumnConfig] = useState({});
  const [activeCell, setActiveCell] = useState({ row: 0, col: 0 });
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [globalFilter, setGlobalFilter] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [columnWidths, setColumnWidths] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isColumnManagerOpen, setIsColumnManagerOpen] = useState(false);
  // Virtualization state
  const [visibleRowsRange, setVisibleRowsRange] = useState({ start: 0, end: 50 });
  const [rowHeight, setRowHeight] = useState(32); // Default row height in pixels
  const [viewportHeight, setViewportHeight] = useState(0);
  const [rowNumberWidth, setRowNumberWidth] = useState(50); // Width for row number column

  const [pendingUpdates, setPendingUpdates] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [doneByUser, setDoneByUser] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: '' });
  
// 1. Add these new state variables after your existing useState declarations:

const [searchTerm, setSearchTerm] = useState('');
const [showSearchBox, setShowSearchBox] = useState(false);
const [searchResults, setSearchResults] = useState([]);
const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
const [caseSensitive, setCaseSensitive] = useState(false);
const [shouldPreventScroll, setShouldPreventScroll] = useState(false);
const [isFullscreen, setIsFullscreen] = useState(false);
const [fontSize, setFontSize] = useState(14); // Default font size in pixels
  const id = "682d9985bcf366cb5c422a25"
const navigate =  useNavigate()
// Temp buffer to hold incoming updates during API call
const pendingUpdatesBuffer = useRef([]);
const pushUpdate = (update) => {
  if (isSaving) {
    // If currently saving, buffer it
    pendingUpdatesBuffer.current.push(update);
  } else {
    // If idle, push directly to pendingUpdates
    setPendingUpdates(prev => [...prev, update]);
  }
};

  // References
  const tableContainerRef = useRef(null);
  const headerRowRef = useRef(null);
  
  // Fetch data from API
  useEffect(() => {
    if (apiUrl) {
      fetchDataFromApi();
    }
  }, [apiUrl]);

  // Function to fetch data from the API
  const fetchDataFromApi = async () => {
    if (!apiUrl) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(apiUrl);
      console.log("hii")
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const apiData = await response.json();
      
      // Process the API data
      console.log(apiData)
      processApiData(apiData);
      
    } catch (err) {
      console.error("Error fetching data from API:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const processApiData = (apiData) => {
    const fileData = apiData;

    if (fileData.columns && fileData.columns.length > 0) {
      const extractedHeaders = fileData.columns.map(col => col.name);

      // Initialize column widths and column config from API columns
      const newColumnWidths = {};
      const newColumnConfig = {};

      fileData.columns.forEach(col => {
        newColumnWidths[col.name] = 150; // Default width, can be customized

        newColumnConfig[col.name] = {
          locked: col.locked || false,
          type: col.type || 'text',
          options: Array.isArray(col.options) ? col.options : []
        };
      });

      // Set states
      setColumnWidths(newColumnWidths);
      setColumnConfig(newColumnConfig);
      setHeaders(extractedHeaders);
      setData(fileData.data);
      setFilteredData(fileData.data);
      setActiveCell({ row: 0, col: 0 });
// console.log(object)
      // Reset scroll position and visible rows range
      setVisibleRowsRange({ start: 0, end: Math.min(fileData.data.length, 50) });
      if (tableContainerRef.current) {
        tableContainerRef.current.scrollTop = 0;
      }
    } else {
      setHeaders([]);
      setData([]);
      setFilteredData([]);
      setError("No data received from API or data format is invalid");
    }
  };




  // Process initial data if provided
  useEffect(() => {
    if (initialData && initialData.columns && initialData.data) {
      const headers = initialData.columns.map(col => col.name);
      
      // Build column configuration object
      const colConfig = {};
      initialData.columns.forEach(col => {
        colConfig[col.name] = {
          locked: col.locked || false,
          type: col.type || 'text',
          options: col.options || []
        };
      });
      
      // Initialize column widths
      const initialColumnWidths = {};
      headers.forEach(header => {
        initialColumnWidths[header] = 150; // Default width
      });
      
      setHeaders(headers);
      setColumnConfig(colConfig);
      setColumnWidths(initialColumnWidths);
      setData(initialData.data);
      setFilteredData(initialData.data);
    } else if (!apiUrl) {
      // Initialize with sample data if no data is provided and no API URL
      const sampleData = [];
      const sampleHeaders = ['Product', 'Category', 'Price', 'Stock', 'Rating'];
      
      // Initialize column widths and config
      const initialColumnWidths = {};
      const initialColumnConfig = {};
      
      sampleHeaders.forEach(header => {
        initialColumnWidths[header] = 150; // Default width
        initialColumnConfig[header] = {
          locked: false,
          type: 'text',
          options: []
        };
      });
      
      // Add some sample options for the Category column
      initialColumnConfig['Category'] = {
        locked: false,
        type: 'select',
        options: ['Electronics', 'Clothing', 'Food', 'Books', 'Other']
      };
      
      setColumnWidths(initialColumnWidths);
      setColumnConfig(initialColumnConfig);
      
      for (let i = 0; i < 100; i++) {
        sampleData.push({
          Product: `Product ${i + 1}`,
          Category: `Category ${(i % 5) + 1}`,
          Price: Math.floor(Math.random() * 500) + 10,
          Stock: Math.floor(Math.random() * 100),
          Rating: (Math.random() * 5).toFixed(1)
        });
      }
      
      setHeaders(sampleHeaders);
      setData(sampleData);
      setFilteredData(sampleData);
    }
  }, [initialData]);

  // Calculate viewport height and set up scroll event listener
  useEffect(() => {
    if (tableContainerRef.current) {
      const updateViewportHeight = () => {
        setViewportHeight(tableContainerRef.current.clientHeight);
      };
      
      // Update on mount and when window resizes
      updateViewportHeight();
      window.addEventListener('resize', updateViewportHeight);
      
      // Cleanup
      return () => {
        window.removeEventListener('resize', updateViewportHeight);
      };
    }
  }, []);
  

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(0);
      return;
    }
  
    const results = [];
    const searchLower = caseSensitive ? searchTerm : searchTerm.toLowerCase();
  
    filteredData.forEach((row, rowIndex) => {
      headers.forEach((header, colIndex) => {
        const cellValue = String(row[header] || '');
        const cellValueToSearch = caseSensitive ? cellValue : cellValue.toLowerCase();
        
        if (cellValueToSearch.includes(searchLower)) {
          results.push({
            rowIndex,
            colIndex,
            cellValue,
            header
          });
        }
      });
    });
  
    setSearchResults(results);
    setCurrentSearchIndex(0);
    
    // Navigate to first result
    if (results.length > 0) {
      const firstResult = results[0];
      setActiveCell({ row: firstResult.rowIndex, col: firstResult.colIndex });
      
      // Use setTimeout to ensure state updates are processed
      setTimeout(() => {
        ensureRowVisible(firstResult.rowIndex, true);
        ensureColumnVisible(firstResult.colIndex);
      }, 0);
    }
  }, [searchTerm, caseSensitive, filteredData, headers]); // K
  
  



  // Handle scroll to update visible rows
  useEffect(() => {
    const handleScroll = () => {
      if (tableContainerRef.current) {
        const scrollTop = tableContainerRef.current.scrollTop;
        const bufferRows = 15; // Extra rows rendered above/below viewport
        
        const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - bufferRows);
        const visibleRows = Math.ceil(viewportHeight / rowHeight) + bufferRows * 2;
        const endIndex = Math.min(filteredData.length, startIndex + visibleRows);
        
        setVisibleRowsRange({ start: startIndex, end: endIndex });
      }
    };
    
    const tableContainer = tableContainerRef.current;
    if (tableContainer) {
      tableContainer.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial calculation
      
      return () => {
        tableContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, [viewportHeight, rowHeight, filteredData.length]);

  // Apply global filter
  useEffect(() => {
    if (!globalFilter.trim()) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter(row => {
      return Object.values(row).some(value => 
        String(value).toLowerCase().includes(globalFilter.toLowerCase())
      );
    });
    
    setFilteredData(filtered);
    // Reset visible rows range after filtering
    setVisibleRowsRange({ start: 0, end: Math.min(filtered.length, 50) });
    
    // Reset scroll position
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
  }, [globalFilter, data]);

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      
      // Handle CSV or Excel files
      if (file.name.endsWith('.csv')) {
        Papa.parse(content, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsedHeaders = results.meta.fields || [];
            
            // Initialize column widths and config for new headers
            const newColumnWidths = {...columnWidths};
            const newColumnConfig = {...columnConfig};
            parsedHeaders.forEach(header => {
              if (!newColumnWidths[header]) {
                newColumnWidths[header] = 150; // Default width
              }
              if (!newColumnConfig[header]) {
                newColumnConfig[header] = {
                  locked: false,
                  type: 'text',
                  options: []
                };
              }
            });
            
            setColumnWidths(newColumnWidths);
            setColumnConfig(newColumnConfig);
            setHeaders(parsedHeaders);
            setData(results.data);
            setFilteredData(results.data);
            setActiveCell({ row: 0, col: 0 });
            
            // Reset scroll position and visible rows range
            setVisibleRowsRange({ start: 0, end: Math.min(results.data.length, 50) });
            if (tableContainerRef.current) {
              tableContainerRef.current.scrollTop = 0;
            }
          }
        });
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        try {
          const workbook = XLSX.read(content, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          
          if (json.length > 0) {
            const excelHeaders = Object.keys(json[0]);
            
            // Initialize column widths and config for new headers
            const newColumnWidths = {...columnWidths};
            const newColumnConfig = {...columnConfig};
            excelHeaders.forEach(header => {
              if (!newColumnWidths[header]) {
                newColumnWidths[header] = 150; // Default width
              }
              if (!newColumnConfig[header]) {
                newColumnConfig[header] = {
                  locked: false,
                  type: 'text',
                  options: []
                };
              }
            });
            
            setColumnWidths(newColumnWidths);
            setColumnConfig(newColumnConfig);
            setHeaders(excelHeaders);
            setData(json);
            setFilteredData(json);
            setActiveCell({ row: 0, col: 0 });
            
            // Reset scroll position and visible rows range
            setVisibleRowsRange({ start: 0, end: Math.min(json.length, 50) });
            if (tableContainerRef.current) {
              tableContainerRef.current.scrollTop = 0;
            }
          }
        } catch (error) {
          console.error("Error reading Excel file:", error);
          alert("Failed to read Excel file. Please check the format.");
        }
      }
    };
    
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  // Function to calculate visible range based on container bounds
  const calculateVisibleColumnRange = () => {
    if (!tableContainerRef.current) return { start: 0, end: headers.length };

    const container = tableContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const containerWidth = container.clientWidth;
    
    let accumulatedWidth = rowNumberWidth; // Start after row number column
    let startColumn = 0;
    let endColumn = 0;
    
    // Find first visible column
    for (let i = 0; i < headers.length; i++) {
      const colWidth = columnWidths[headers[i]] || 150;
      if (accumulatedWidth + colWidth > scrollLeft) {
        startColumn = i;
        break;
      }
      accumulatedWidth += colWidth;
    }
    
    // Find last visible column
    accumulatedWidth = rowNumberWidth; // Reset and start after row number column
    for (let i = 0; i < headers.length; i++) {
      const colWidth = columnWidths[headers[i]] || 150;
      accumulatedWidth += colWidth;
      if (accumulatedWidth >= scrollLeft + containerWidth) {
        endColumn = i + 1; // Add 1 more column as buffer
        break;
      }
    }
    
    // If we didn't reach the end, set endColumn to the last column
    if (endColumn === 0) endColumn = headers.length;
    
    // Add some buffer columns for smoother scrolling
    startColumn = Math.max(0, startColumn - 1);
    endColumn = Math.min(headers.length, endColumn + 2);
    
    return { start: startColumn, end: endColumn };
  };

const ensureColumnVisible = (colIndex) => {
  if (!tableContainerRef.current || colIndex < 0 || colIndex >= headers.length) return;
  
  const container = tableContainerRef.current;
  let leftPos = rowNumberWidth; // Start position after the row number column
  
  // Calculate position of the column
  for (let i = 0; i < colIndex; i++) {
    leftPos += columnWidths[headers[i]] || 150;
  }
  
  const colWidth = columnWidths[headers[colIndex]] || 150;
  const rightPos = leftPos + colWidth;
  
  // Important fix: When navigating to the first column (colIndex = 0),
  // ensure we scroll all the way to the left to prevent hiding behind row numbers
  if (colIndex === 0) {
    container.scrollLeft = 0;
  } 
  else if (leftPos < container.scrollLeft + rowNumberWidth) {
    // When moving left, ensure column is visible and not hidden behind row numbers
    // Add rowNumberWidth to ensure column is not hidden behind the row numbers column
    container.scrollLeft = leftPos - rowNumberWidth;
  } 
  else if (rightPos > container.scrollLeft + container.clientWidth) {
    // When moving right, ensure the right edge of column is visible
    container.scrollLeft = rightPos - container.clientWidth;
  }
};    

useEffect(() => {
  const handleGlobalKeyDown = (e) => {
    // Handle Ctrl+F (Windows/Linux) or Cmd+F (Mac) for search
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      e.stopPropagation();
      setShowSearchBox(true);
      return false;
    }
  };

  // Add event listener to document
  document.addEventListener('keydown', handleGlobalKeyDown, true);
  
  return () => {
    document.removeEventListener('keydown', handleGlobalKeyDown, true);
  };
}, []);

// Fullscreen functions
const enterFullscreen = () => {
  const element = document.documentElement;
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
  setIsFullscreen(true);
};

const exitFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
  setIsFullscreen(false);
};

const toggleFullscreen = () => {
  if (isFullscreen) {
    exitFullscreen();
  } else {
    enterFullscreen();
  }
};

const calculatedRowHeight = Math.max(32, fontSize + 18); 
// Font size functions
const increaseFontSize = () => {
  setFontSize(prev => Math.min(prev + 2, 24)); // Max 24px
};

const decreaseFontSize = () => {
  setFontSize(prev => Math.max(prev - 2, 10)); // Min 10px
};

// 3. ADD THIS USEEFFECT FOR FULLSCREEN EVENT LISTENERS (after your existing useEffects around line 200-250):

useEffect(() => {
  const handleFullscreenChange = () => {
    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      document.mozFullScreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
    );
    setIsFullscreen(isCurrentlyFullscreen);
  };

  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('MSFullscreenChange', handleFullscreenChange);

  return () => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
  };
}, []);



  // Handle keyboard navigation with improved scrolling
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      setShowSearchBox(true);
      return;
    }
  
    // Handle Escape to close search
    if (e.key === 'Escape' && showSearchBox) {
      setShowSearchBox(false);
      setSearchTerm('');
      setSearchResults([]);
      return;
    }
    if (editingCell) return; // Don't navigate while editing
    
    const { row, col } = activeCell;
    const rowCount = filteredData.length;
    const colCount = headers.length;
    
    switch (e.key) {
      case 'ArrowUp':
        if (row > 0) {
          const newRow = row - 1;
          setActiveCell({ row: newRow, col });
          ensureRowVisible(newRow, true); // Force scroll for navigation
        }
        e.preventDefault();
        break;
      case 'ArrowDown':
        if (row < rowCount - 1) {
          const newRow = row + 1;
          setActiveCell({ row: newRow, col });
          ensureRowVisible(newRow, true); // Force scroll for navigation
        }
        e.preventDefault();
        break;
      case 'ArrowLeft':
        if (col > 0) {
          const newCol = col - 1;
          setActiveCell({ row, col: newCol });
          ensureColumnVisible(newCol);
        }
        e.preventDefault();
        break;
      case 'ArrowRight':
        if (col < colCount - 1) {
          const newCol = col + 1;
          setActiveCell({ row, col: newCol });
          ensureColumnVisible(newCol);
        }
        e.preventDefault();
        break;
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          // Shift + Tab: move left, or up to previous row if at column 0
          if (col > 0) {
            const newCol = col - 1;
            setActiveCell({ row, col: newCol });
            ensureColumnVisible(newCol);
          } else if (row > 0) {
            const newRow = row - 1;
            const newCol = colCount - 1;
            setActiveCell({ row: newRow, col: newCol });
            ensureRowVisible(newRow, true);
            ensureColumnVisible(newCol);
          }
        } else {
          // Tab: move right, or down to next row if at last column
          if (col < colCount - 1) {
            const newCol = col + 1;
            setActiveCell({ row, col: newCol });
            ensureColumnVisible(newCol);
          } else if (row < rowCount - 1) {
            const newRow = row + 1;
            setActiveCell({ row: newRow, col: 0 });
            ensureRowVisible(newRow, true);
            ensureColumnVisible(0);
          }
        }
        break;
        case 'Enter':
          if (!editingCell && row < filteredData.length) {
            const header = headers[col];
            // Only allow editing if column is not locked
            if (!columnConfig[header]?.locked) {
              const value = filteredData[row][header];
              setEditingCell({ row, col });
              setEditValue(value !== undefined ? String(value) : '');
            }
          }
          e.preventDefault();
          break;
        
    // Also update the Escape case to handle fullscreen:
      case 'Escape':
        if (isFullscreen) {
          exitFullscreen();
          e.preventDefault();
          return;
        }
        if (editingCell) {
          setEditingCell(null);
        }
        if (showSearchBox) {
          setShowSearchBox(false);
          setSearchTerm('');
          setSearchResults([]);
        }
        e.preventDefault();
        break;
      case 'PageUp':
        e.preventDefault();
        if (row > 0) {
          const newRow = Math.max(0, row - Math.floor(viewportHeight / rowHeight));
          setActiveCell({ row: newRow, col });
          ensureRowVisible(newRow, true);
        }
        break;
      case 'PageDown':
        e.preventDefault();
        if (row < rowCount - 1) {
          const newRow = Math.min(rowCount - 1, row + Math.floor(viewportHeight / rowHeight));
          setActiveCell({ row: newRow, col });
          ensureRowVisible(newRow, true);
        }
        break;
      case 'Home':
        if (e.ctrlKey) {
          // Ctrl+Home -> go to first cell
          setActiveCell({ row: 0, col: 0 });
          ensureRowVisible(0, true);
          ensureColumnVisible(0);
        } else {
          // Home -> go to first column
          setActiveCell({ row, col: 0 });
          ensureColumnVisible(0);
        }
        e.preventDefault();
        break;
      case 'End':
        if (e.ctrlKey) {
          // Ctrl+End -> go to last cell
          const lastRow = rowCount - 1;
          const lastCol = colCount - 1;
          setActiveCell({ row: lastRow, col: lastCol });
          ensureRowVisible(lastRow, true);
          ensureColumnVisible(lastCol);
        } else {
          // End -> go to last column
          const lastCol = colCount - 1;
          setActiveCell({ row, col: lastCol });
          ensureColumnVisible(lastCol);
        }
        e.preventDefault();
        break;
        case 'F11':
  e.preventDefault();
  toggleFullscreen();
  break;



      default:
        // For any other key, start editing if it's a printable character
        // and the column is not locked
        if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
          const header = headers[col];
          if (!columnConfig[header]?.locked) {
            setEditingCell({ row, col });
            setEditValue(e.key);
            e.preventDefault();
          }
        }
        break;
    }
  };
  
  
  const goToNextResult = () => {
    if (searchResults.length === 0) return;
    
    const newIndex = currentSearchIndex < searchResults.length - 1 ? currentSearchIndex + 1 : 0;
    setCurrentSearchIndex(newIndex);
    
    const result = searchResults[newIndex];
    setActiveCell({ row: result.rowIndex, col: result.colIndex });
    
    // Ensure the cell is visible with a slight delay to allow state update
    setTimeout(() => {
      ensureRowVisible(result.rowIndex, true);
      ensureColumnVisible(result.colIndex);
    }, 10);
  };
  
   const goToPreviousResult = () => {
    if (searchResults.length === 0) return;
    
    const newIndex = currentSearchIndex > 0 ? currentSearchIndex - 1 : searchResults.length - 1;
    setCurrentSearchIndex(newIndex);
    
    const result = searchResults[newIndex];
    setActiveCell({ row: result.rowIndex, col: result.colIndex });
    
    // Ensure the cell is visible with a slight delay to allow state update
    setTimeout(() => {
      ensureRowVisible(result.rowIndex, true);
      ensureColumnVisible(result.colIndex);
    }, 10);
  };
  
  
  // Highlight search term in text
  const highlightSearchTerm = (text, searchTerm, caseSensitive = false, rowIndex, colIndex) => {
    if (!searchTerm.trim()) return text;
    
    const textStr = String(text || '');
    const searchStr = caseSensitive ? searchTerm : searchTerm.toLowerCase();
    const textToSearch = caseSensitive ? textStr : textStr.toLowerCase();
    
    if (!textToSearch.includes(searchStr)) return textStr;
    
    // Check if this cell is the current active search result
    const currentResult = searchResults[currentSearchIndex];
    const isCurrentResult = currentResult && 
      currentResult.rowIndex === rowIndex && 
      currentResult.colIndex === colIndex;
    
    const parts = [];
    let lastIndex = 0;
    let index = textToSearch.indexOf(searchStr);
    let matchCount = 0;
    
    while (index !== -1) {
      // Add text before match
      if (index > lastIndex) {
        parts.push(textStr.substring(lastIndex, index));
      }
      
      // Add highlighted match with appropriate color
      const highlightStyle = {
        backgroundColor: isCurrentResult ? 'rgb(255 102 0 / 68%)' : '#ffff00', // Orange for current, yellow for others
        fontWeight: 'bold',
        color: isCurrentResult ? 'white' : 'black',
        padding: '1px 2px',
        borderRadius: '2px',
        border:  'none'
      };
      
      parts.push(
        <span 
          key={`${rowIndex}-${colIndex}-${matchCount}-highlight`} 
          style={highlightStyle}
        >
          {textStr.substring(index, index + searchStr.length)}
        </span>
      );
      
      lastIndex = index + searchStr.length;
      index = textToSearch.indexOf(searchStr, lastIndex);
      matchCount++;
    }
    
    // Add remaining text
    if (lastIndex < textStr.length) {
      parts.push(textStr.substring(lastIndex));
    }
    
    return parts;
  };
  
  

  const scrollbarStyles = `
  .excel-spread-sheet-table-container {
    overflow: auto !important;
    scrollbar-width: auto !important;
    -ms-overflow-style: auto !important;
  }
  
  .excel-spread-sheet-table-container::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }
  
  .excel-spread-sheet-table-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 6px;
  }
  
  .excel-spread-sheet-table-container::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 6px;
  }
  
  .excel-spread-sheet-table-container::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
  
  .excel-spread-sheet-table-container::-webkit-scrollbar-corner {
    background: #f1f1f1;
  }
`;

// 9. ADD THE STYLES TO THE COMPONENT (add this at the end of your component, before the return):

useEffect(() => {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = scrollbarStyles;
  document.head.appendChild(styleSheet);
  
  return () => {
    document.head.removeChild(styleSheet);
  };
}, []);
  // Ensure a row is visible in the viewport
  const ensureRowVisible = (rowIndex, forceScroll = false) => {
    // Don't scroll if we're preventing it and it's not forced
    if (shouldPreventScroll && !forceScroll) return;
    
    if (tableContainerRef.current) {
      const container = tableContainerRef.current;
      const rowTop = rowIndex * rowHeight;
      const rowBottom = (rowIndex + 1) * rowHeight;
      
      if (rowTop < container.scrollTop) {
        // Scroll up to show the row at the top
        container.scrollTop = rowTop;
      } else if (rowBottom > container.scrollTop + container.clientHeight) {
        // Scroll down to show the row at the bottom
        container.scrollTop = rowBottom - container.clientHeight+50;
      }
    }
  };

  // Save edited cell value
  const saveEditedValue = (colName) => {
    if (!editingCell) return;
  
    const { row, col } = editingCell;
    const header = headers[col];
  
    // Don't save if column is locked
    if (columnConfig[header]?.locked) {
      setEditingCell(null);
      // Refocus the table container to maintain keyboard navigation
      setTimeout(() => {
        if (tableContainerRef.current) {
          tableContainerRef.current.focus();
        }
      }, 0);
      return;
    }
  
    // Only proceed if something actually changed
    const originalValue = filteredData[row]?.[header];
    if (originalValue === editValue) {
      setEditingCell(null);
      // Refocus the table container to maintain keyboard navigation
      setTimeout(() => {
        if (tableContainerRef.current) {
          tableContainerRef.current.focus();
        }
      }, 0);
      return;
    }
  
    // Prevent scrolling during the edit save process
    setShouldPreventScroll(true);
  
    // Create a new array with the updated value
    const updatedData = [...data];
    const dataIndex = data.indexOf(filteredData[row]);
  
    if (dataIndex !== -1) {
      updatedData[dataIndex] = {
        ...updatedData[dataIndex],
        [header]: editValue
      };
  
      setData(updatedData);
  
      // Push update safely (handles buffering if saving is active)
      pushUpdate({
        rowIndex: dataIndex,
        field: header,
        value: editValue
      });
    }
  
    setEditingCell(null);
    
    // Refocus the table container to maintain keyboard navigation
    setTimeout(() => {
      if (tableContainerRef.current) {
        tableContainerRef.current.focus();
      }
    }, 50);
    
    // Re-enable scrolling after a short delay
    setTimeout(() => {
      setShouldPreventScroll(false);
    }, 100);
  };
  
const saveChanges = useCallback(
  debounce(async () => {
    if (pendingUpdates.length === 0) return;

    const tooltip = document.getElementById('spreadsheet-tooltip');
    if (tooltip) tooltip.style.display = 'none';

    try {
      setIsSaving(true);
      setDoneByUser(true);

      const updates = pendingUpdates.map(update => ({
        rowIndex: update.rowIndex,
        columnName: update.field,
        newValue: update.value,
      }));

      await axios.put(
        `${process.env.REACT_APP_API_URL}/excel/file/${id}/update`,
        { updates },
        { withCredentials: true }
      );

      setPendingUpdates([]);

      setNotification({
        open: true,
        message: 'Changes saved successfully',
        severity: 'success',
      });

      // 🚀 After saving, check if buffer has any new edits
      if (pendingUpdatesBuffer.current.length > 0) {
        const buffered = [...pendingUpdatesBuffer.current];
        pendingUpdatesBuffer.current = [];
        setPendingUpdates(buffered); // Will trigger another save via useEffect
      }

    } catch (error) {
      console.error('Error saving changes:', error);
      if (error?.response?.data?.success === false) {
        navigate('/admin/dashboard');
        window.location.reload();
      }

      setNotification({
        open: true,
        message: 'Error saving changes: ' + (error.response?.data?.error || error.message),
        severity: 'error',
      });

    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setDoneByUser(false);
      }, 500);
    }
  }, 1000),
  [pendingUpdates, id]
);
useEffect(() => {
  if (pendingUpdates.length > 0) {
    saveChanges();
  }

  return () => {
    saveChanges.flush();
  };
}, [pendingUpdates, saveChanges]);

  // Toggle locked status for a column
  const toggleColumnLock = (columnName) => {
    setColumnConfig(prev => ({
      ...prev,
      [columnName]: {
        ...prev[columnName],
        locked: !prev[columnName]?.locked
      }
    }));
  };

  // Set column type (text, select, etc.)
  const setColumnType = (columnName, type) => {
    setColumnConfig(prev => ({
      ...prev,
      [columnName]: {
        ...prev[columnName],
        type
      }
    }));
  };

  // Update options for a column
  const setColumnOptions = (columnName, options) => {
    setColumnConfig(prev => ({
      ...prev,
      [columnName]: {
        ...prev[columnName],
        options
      }
    }));
  };

  // Handle adding a new column
  const addNewColumn = () => {
    const newColumnName = `Column ${headers.length + 1}`;
    const newHeaders = [...headers, newColumnName];
    
    // Add the new column to all data rows
    const newData = data.map(row => ({
      ...row,
      [newColumnName]: ''
    }));
    
    // Set default width for the new column
    setColumnWidths(prev => ({
      ...prev,
      [newColumnName]: 150
    }));
    
    // Set default config for the new column
    setColumnConfig(prev => ({
      ...prev,
      [newColumnName]: {
        locked: false,
        type: 'text',
        options: []
      }
    }));
    
    setHeaders(newHeaders);
    setData(newData);
    setFilteredData(newData);
  };
 const handleOpenColumnManager = () => {
    setIsColumnManagerOpen(true);
  };

  // Handle closing the column manager
  const handleCloseColumnManager = () => {
    setIsColumnManagerOpen(false);
  };

  // Handle column visibility and order updates from column manager
  const handleColumnConfigUpdate = (updatedHeaders, updatedConfig) => {
    setHeaders(updatedHeaders);
    setColumnConfig(updatedConfig);
  };
  // Handle removing a column
  const removeColumn = (columnToRemove) => {
    const newHeaders = headers.filter(header => header !== columnToRemove);
    
    // Remove the column from all data rows
    const newData = data.map(row => {
      const newRow = {...row};
      delete newRow[columnToRemove];
      return newRow;
    });
    
    // Remove column width entry
    const newColumnWidths = {...columnWidths};
    delete newColumnWidths[columnToRemove];
    setColumnWidths(newColumnWidths);
    
    // Remove column config entry
    const newColumnConfig = {...columnConfig};
    delete newColumnConfig[columnToRemove];
    setColumnConfig(newColumnConfig);
    
    setHeaders(newHeaders);
    setData(newData);
    setFilteredData(newData);
  };

  // Handle column resizing in a simpler, more direct approach
  const startResizing = (columnIndex, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const header = headers[columnIndex];
    const startX = e.clientX;
    const startWidth = columnWidths[header] || 150;
    
    // Define these handlers inline to avoid closure/hook issues
    function handleMouseMove(moveEvent) {
      moveEvent.preventDefault();
      const diff = moveEvent.clientX - startX;
      const newWidth = Math.max(50, startWidth + diff); // Minimum width of 50px
      
      setColumnWidths(prev => ({
        ...prev,
        [header]: newWidth
      }));
    }
    
    function stopResizing(upEvent) {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopResizing);
    }
    
    // Add the listeners directly
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
  };

  // Function to export data
  const exportData = () => {
    const csvContent = Papa.unparse(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'spreadsheet_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate total height for scroll area
  const totalHeight = filteredData.length * rowHeight;
  
  // Render cell content based on column type
  const renderCellContent = (row, header, isEditing, rowIndex, colIndex) => {
    const columnType = columnConfig[header]?.type || 'text';
    const columnOptions = columnConfig[header]?.options || [];
    const value = row[header];
    
    if (isEditing) {
      if (columnType === 'dropdown' && columnOptions.length > 0) {
        return (
          <select
            className="excel-spread-sheet-cell-select"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEditedValue}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                saveEditedValue();
              } else if (e.key === 'Escape') {
                setEditingCell(null);
                // Refocus the table container
                setTimeout(() => {
                  if (tableContainerRef.current) {
                    tableContainerRef.current.focus();
                  }
                }, 0);
                e.preventDefault();
              }
            }}
            autoFocus
          >
            <option value="">Select...</option>
            {columnOptions.map((option, idx) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </select>
        );
      } else {
        return (
          <input
            type="text"
            className="excel-spread-sheet-cell-input"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEditedValue}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                saveEditedValue(header);
              } else if (e.key === 'Escape') {
                setEditingCell(null);
                // Refocus the table container
                setTimeout(() => {
                  if (tableContainerRef.current) {
                    tableContainerRef.current.focus();
                  }
                }, 0);
                e.preventDefault();
              }
            }}
            autoFocus
          />
        );
      }
    } else {
      // Highlight search terms in cell content - PASS ROW AND COLUMN INDEX
      const displayValue = searchTerm.trim() 
        ? highlightSearchTerm(value, searchTerm, caseSensitive, rowIndex, colIndex)
        : value;
        
      return (
        <div 
          className="excel-spread-sheet-cell-content"
          style={{ fontSize: `${fontSize}px` }}
        >
          {displayValue}
        </div>
      );
    }
  };
  
  
  // Render the row number cell
  const renderRowNumberCell = (rowIndex) => {
    return (
      <div 
        className="excel-spread-sheet-row-number-cell"
        style={{
          width: `${rowNumberWidth}px`,
          minWidth: `${rowNumberWidth}px`,
          position: 'sticky',
          left: 0,
          zIndex: 5,
          backgroundColor: '#f8f9fa',
          borderRight: '1px solid #dee2e6',
          borderBottom: '1px solid #dee2e6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          color: '#6c757d'
        }}
      >
        {rowIndex + 1}
      </div>
    );
  };

  // Virtualized row rendering for better performance
  const renderVirtualizedRows = () => {
    // Calculate buffer to render based on visible rows range
    const { start, end } = visibleRowsRange;
    
    // Create an array of visible row indices
    const visibleRows = [];
    for (let i = start; i < end && i < filteredData.length; i++) {
      visibleRows.push(i);
    }
    
    return (
      <div 
        className="excel-spread-sheet-rows-container"
        style={{ 
          height: totalHeight, 
          position: 'relative',
        }}
      >
        {visibleRows.map(rowIndex => {
          const row = filteredData[rowIndex];
          const isActiveRow = activeCell.row === rowIndex;
          
          return (
            <div 
              key={rowIndex}
              className={`excel-spread-sheet-row ${isActiveRow ? 'excel-spread-sheet-active-row' : ''}`}
              style={{
                position: 'absolute',
                top: rowIndex * calculatedRowHeight,
                height: calculatedRowHeight,
                display: 'flex',
               
              }}
            >
              {/* Row number cell */}
              {renderRowNumberCell(rowIndex)}
              
              {/* Data cells */}
              {headers.map((header, colIndex) => {
  const isActiveCellThis = isActiveRow && activeCell.col === colIndex;
  const isEditing = 
    editingCell && 
    editingCell.row === rowIndex && 
    editingCell.col === colIndex;
  const isLocked = columnConfig[header]?.locked;
  
  return (
    <div 
      key={`${rowIndex}-${colIndex}`}
      className={`excel-spread-sheet-cell 
        ${isActiveCellThis ? 'excel-spread-sheet-active-cell' : ''}
        ${isLocked ? 'excel-spread-sheet-locked-cell' : ''}
      `}
      onClick={() => setActiveCell({ row: rowIndex, col: colIndex })}
      onDoubleClick={() => {
        if (!isLocked) {
          setEditingCell({ row: rowIndex, col: colIndex });
          setEditValue(row[header] !== undefined ? String(row[header]) : '');
        }
      }}
      style={{ 
        width: `${columnWidths[header] || 150}px`,
        minWidth: `${columnWidths[header] || 150}px`,
      }}
    >
      {/* UPDATED: Pass rowIndex and colIndex to renderCellContent */}
      {renderCellContent(row, header, isEditing, rowIndex, colIndex)}
    </div>
  );
})}
            </div>
          );
        })}
      </div>
    );
  };
  return (
    <div className="excel-spread-sheet-container">
      {/* Toolbar */}
      <div className="excel-spread-sheet-toolbar">
        <div className="excel-spread-sheet-toolbar-group">
          <label htmlFor="file-upload" className="excel-spread-sheet-btn excel-spread-sheet-btn-import">
            <Upload size={16} className="excel-spread-sheet-btn-icon" />
            Import
          </label>
          <input 
            id="file-upload" 
            type="file" 
            accept=".csv,.xlsx,.xls" 
            className="excel-spread-sheet-hidden-input" 
            onChange={handleFileUpload}
          />
        </div>

        <button 
          className="excel-spread-sheet-btn excel-spread-sheet-btn-export"
          onClick={exportData}
        >
          <Download size={16} className="excel-spread-sheet-btn-icon" />
          Export
        </button>

        <button 
          className="excel-spread-sheet-btn excel-spread-sheet-btn-add"
          onClick={addNewColumn}
        >
          <Plus size={16} className="excel-spread-sheet-btn-icon" />
          Add Column
        </button>
        <button className="toolbar-button" onClick={handleOpenColumnManager}>
            <Settings size={16} /> Manage Columns
          </button>
          {/* Font Size Controls */}
  <div className="excel-spread-sheet-toolbar-group">
    <button
      className="excel-spread-sheet-btn"
      onClick={decreaseFontSize}
      title="Decrease font size"
    >
      A-
    </button>
    <span style={{ fontSize: '12px', padding: '0 8px' }}>{fontSize}px</span>
    <button
      className="excel-spread-sheet-btn"
      onClick={increaseFontSize}
      title="Increase font size"
    >
      A+
    </button>
  </div>

  {/* Fullscreen Button */}
  <button
    className="excel-spread-sheet-btn"
    onClick={toggleFullscreen}
    title={isFullscreen ? "Exit fullscreen (F11 or Esc)" : "Enter fullscreen (F11)"}
  >
    {isFullscreen ? '⊡' : '⊞'}
  </button>


        <div className="excel-spread-sheet-toolbar-filter">
          <Filter size={16} className="excel-spread-sheet-filter-icon" />
          <input
            type="text"
            placeholder="Global filter..."
            className="excel-spread-sheet-filter-input"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Spreadsheet Area */}
      <div 
  ref={tableContainerRef}
  className="excel-spread-sheet-table-container"
  tabIndex="0"
  onKeyDown={handleKeyDown}
  style={{
    height:"85vh",
    fontSize: `${fontSize}px`,
    overflow: 'auto', // Always show scrollbars
    scrollbarWidth: 'auto', // For Firefox
    msOverflowStyle: 'auto' // For IE/Edge
  }}
>
        {/* Fixed headers */}
        <div 
          className="excel-spread-sheet-header-row"
          ref={headerRowRef}
        > <div 
              className="excel-spread-sheet-row-number-header"
              style={{
                width: `${rowNumberWidth}px`,
                minWidth: `${rowNumberWidth}px`,
                position: 'sticky',
                left: 0,
                zIndex: 30,
                backgroundColor: '#f1f3f5',
                borderRight: '1px solid #dee2e6',
                borderBottom: '1px solid #dee2e6',
              }}
            >
              #
            </div>
          {headers.map((header, idx) => {
            const isLocked = columnConfig[header]?.locked;
            
            return (
              <div 
                key={idx}
                className="excel-spread-sheet-header-cell"
                style={{ 
                  width: `${columnWidths[header] || 150}px`,
                  minWidth: `${columnWidths[header] || 150}px`,
                }}
              >
                <div className="excel-spread-sheet-header-content">
                  <span className="excel-spread-sheet-header-text">{header}</span>
                  <div className="excel-spread-sheet-header-controls">
                    <button
                      className="excel-spread-sheet-header-btn excel-spread-sheet-lock-btn"
                      onClick={() => toggleColumnLock(header)}
                      title={isLocked ? "Unlock column" : "Lock column"}
                    >
                      {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                    </button>
                    <button
                      className="excel-spread-sheet-header-btn excel-spread-sheet-remove-btn"
                      onClick={() => removeColumn(header)}
                      title="Remove column"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
                {/* Column resizer */}
                <div
                  className="excel-spread-sheet-column-resizer"
                  onMouseDown={(e) => startResizing(idx, e)}
                >
                  <div className="excel-spread-sheet-resizer-handle"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Virtualized rows */}
        {renderVirtualizedRows()}
      </div>


      {/* Search Box */}
{showSearchBox && (
  <div style={{
    position: 'fixed',
    top: '20px',
    right: '20px',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 1000,
    minWidth: '300px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          flex: 1,
          padding: '6px 8px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '14px'
        }}
        autoFocus
      />
      <button
        onClick={() => {
          setShowSearchBox(false);
          setSearchTerm('');
          setSearchResults([]);
        }}
        style={{
          padding: '6px',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          borderRadius: '4px'
        }}
        title="Close search"
      >
        <X size={16} />
      </button>
    </div>
    
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <input
          type="checkbox"
          checked={caseSensitive}
          onChange={(e) => setCaseSensitive(e.target.checked)}
        />
        Case sensitive
      </label>
      
      {searchResults.length > 0 && (
        <>
          <span style={{ color: '#666', marginLeft: '8px' }}>
            {currentSearchIndex + 1} of {searchResults.length}
          </span>
          
          <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
            <button
              onClick={goToPreviousResult}
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                background: 'white',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              title="Previous result"
            >
              ↑
            </button>
            <button
              onClick={goToNextResult}
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                background: 'white',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              title="Next result"
            >
              ↓
            </button>
          </div>
        </>
      )}
      
      {searchTerm.trim() && searchResults.length === 0 && (
        <span style={{ color: '#999', marginLeft: '8px' }}>No results found</span>
      )}
    </div>
  </div>
)}

   {/* Column Manager Modal */}
      {isColumnManagerOpen && (
        <ColumnManagerModal
          headers={headers}
          columnConfig={columnConfig}
          onClose={handleCloseColumnManager}
          onSave={handleColumnConfigUpdate}
        />
      )}
      
      {/* Status bar */}
      {/* <div className="px-2 py-1 border-t bg-gray-50 text-sm text-gray-600">
        {filteredData.length} rows | Visible rows: {visibleRowsRange.start+1}-{Math.min(visibleRowsRange.end, filteredData.length)} | Active cell: {headers[activeCell.col] || ''} at row {activeCell.row + 1}
      </div> */}
    </div>
  );
};

export default ExcelLikeSpreadsheet;