import { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import"./ColumnManagerModal.css"
const ColumnManagerModal = ({ 
  isOpen=true, 
  onClose, 
  headers, 
  columnConfig, 
  onAddColumn, 
  onUpdateColumn, 
  onDeleteColumn, 
  fileId 
}) => {
  // Modal mode: 'add' or 'edit'
  const [mode, setMode] = useState('add');
  
  // Selected column for editing
  const [selectedColumn, setSelectedColumn] = useState(null);
  
  // Form fields
  const [columnName, setColumnName] = useState('');
  const [columnType, setColumnType] = useState('text');
  const [columnOptions, setColumnOptions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'add') {
        setColumnName('');
        setColumnType('text');
        setColumnOptions('');
        setSelectedColumn(null);
        setError('');
        setSuccess('');
      }
    }
  }, [isOpen, mode]);

  // Fill form when editing an existing column
  useEffect(() => {
    if (mode === 'edit' && selectedColumn) {
      const config = columnConfig[selectedColumn];
      setColumnName(selectedColumn);
      setColumnType(config?.type || 'text');
      setColumnOptions(config?.options?.join(', ') || '');
    }
  }, [selectedColumn, columnConfig, mode]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    // Validation
    if (!columnName.trim()) {
      setError('Column name is required');
      setIsSubmitting(false);
      return;
    }

    // Parse options if columnType is dropdown
    let options = [];
    if (columnType === 'dropdown' && columnOptions.trim()) {
      options = columnOptions.split(',').map(opt => opt.trim()).filter(opt => opt);
    }

    try {
      if (mode === 'add') {
        // Create column structure based on schema
        const newColumn = {
          name: columnName,
          type: columnType,
          locked: false,
          options: options
        };

        // Send API request to add column
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/excel/file/${fileId}/column`, 
          { column: newColumn },
          { withCredentials: true }
        );

        if (response.data.success) {
          setSuccess('Column added successfully');
          // Call the parent component's callback
          onAddColumn(newColumn);
          
          // Reset form after successful submission
          setTimeout(() => {
            setColumnName('');
            setColumnType('text');
            setColumnOptions('');
            setSuccess('');
          }, 1500);
        }
      } else if (mode === 'edit') {
        // Update column structure
        const updatedColumn = {
          name: columnName,
          type: columnType,
          locked: columnConfig[selectedColumn]?.locked || false,
          options: options
        };

        // Send API request to update column
        const response = await axios.put(
          `${process.env.REACT_APP_API_URL}/excel/file/${fileId}/column/${selectedColumn}`, 
          { 
            column: updatedColumn,
            originalName: selectedColumn 
          },
          { withCredentials: true }
        );

        if (response.data.success) {
          setSuccess('Column updated successfully');
          // Call the parent component's callback
          onUpdateColumn(selectedColumn, updatedColumn);
          
          // Reset to add mode after successful update
          setTimeout(() => {
            setMode('add');
            setColumnName('');
            setColumnType('text');
            setColumnOptions('');
            setSelectedColumn(null);
            setSuccess('');
          }, 1500);
        }
      }
    } catch (err) {
      console.error('Error in column operation:', err);
      setError(err.response?.data?.error || 'An error occurred while processing your request');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle column deletion
  const handleDeleteColumn = async (columnName) => {
    if (window.confirm(`Are you sure you want to delete the column "${columnName}"? This action cannot be undone.`)) {
      setIsSubmitting(true);
      setError('');
      
      try {
        // Send API request to delete column
        const response = await axios.delete(
          `${process.env.REACT_APP_API_URL}/excel/file/${fileId}/column/${columnName}`,
          { withCredentials: true }
        );

        if (response.data.success) {
          // Call the parent component's callback
          onDeleteColumn(columnName);
          setSuccess(`Column "${columnName}" deleted successfully`);
          
          // Reset if we were editing this column
          if (selectedColumn === columnName) {
            setMode('add');
            setColumnName('');
            setColumnType('text');
            setColumnOptions('');
            setSelectedColumn(null);
          }
          
          setTimeout(() => {
            setSuccess('');
          }, 1500);
        }
      } catch (err) {
        console.error('Error deleting column:', err);
        setError(err.response?.data?.error || 'An error occurred while deleting the column');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Select a column for editing
  const selectColumnForEdit = (columnName) => {
    setMode('edit');
    setSelectedColumn(columnName);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="column-manager-modal">
        <div className="modal-header">
          <h2>{mode === 'add' ? 'Add New Column' : 'Edit Column'}</h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Column List */}
          <div className="existing-columns">
            <h3>Existing Columns</h3>
            <div className="columns-list">
              {headers.map((header, index) => (
                <div key={index} className="column-item">
                  <span className="column-name">
                    {header} 
                    <span className="column-type-badge">
                      {columnConfig[header]?.type || 'text'}
                    </span>
                  </span>
                  <div className="column-actions">
                    <button 
                      className="action-button edit-button" 
                      onClick={() => selectColumnForEdit(header)}
                      title="Edit column"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="action-button delete-button" 
                      onClick={() => handleDeleteColumn(header)}
                      title="Delete column"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column Form */}
          <div className="column-form">
            <h3>{mode === 'add' ? 'Add Column' : `Edit Column: ${selectedColumn}`}</h3>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="column-name">Column Name</label>
                <input
                  id="column-name"
                  type="text"
                  value={columnName}
                  onChange={(e) => setColumnName(e.target.value)}
                  placeholder="Enter column name"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="column-type">Column Type</label>
                <select
                  id="column-type"
                  value={columnType}
                  onChange={(e) => setColumnType(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="dropdown">Dropdown</option>
                </select>
              </div>
              
              {columnType === 'dropdown' && (
                <div className="form-group">
                  <label htmlFor="column-options">Options (comma-separated)</label>
                  <textarea
                    id="column-options"
                    value={columnOptions}
                    onChange={(e) => setColumnOptions(e.target.value)}
                    placeholder="Option 1, Option 2, Option 3"
                    disabled={isSubmitting}
                    rows={3}
                  />
                </div>
              )}
              
              <div className="form-actions">
                {mode === 'edit' && (
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={() => setMode('add')}
                    disabled={isSubmitting}
                  >
                    Cancel Edit
                  </button>
                )}
                
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : mode === 'add' ? 'Add Column' : 'Update Column'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColumnManagerModal;