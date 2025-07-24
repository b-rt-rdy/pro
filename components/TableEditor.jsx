import React, { useState, useEffect } from 'react';
import { Plus, Minus, Save, X } from 'lucide-react';

export default function TableEditor({ content, onChange, onSave, onCancel }) {
  const [tableData, setTableData] = useState(() => {
    if (content && content.rows) {
      return content;
    }
    return {
      rows: [
        ['Header 1', 'Header 2', 'Header 3'],
        ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
        ['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3']
      ],
      hasHeader: true
    };
  });

  // Sync local tableData state with content prop when content changes
  useEffect(() => {
    if (content && JSON.stringify(content) !== JSON.stringify(tableData)) {
      setTableData(content);
    }
  }, [content]);

  const updateCell = (rowIndex, colIndex, value) => {
    const newRows = [...tableData.rows];
    newRows[rowIndex][colIndex] = value;
    const newData = { ...tableData, rows: newRows };
    setTableData(newData);
    onChange(newData);
  };

  const addRow = () => {
    const colCount = tableData.rows[0]?.length || 3;
    const newRow = Array(colCount).fill('');
    const newData = { ...tableData, rows: [...tableData.rows, newRow] };
    setTableData(newData);
    onChange(newData);
  };

  const removeRow = (index) => {
    if (tableData.rows.length <= 1) return;
    const newRows = tableData.rows.filter((_, i) => i !== index);
    const newData = { ...tableData, rows: newRows };
    setTableData(newData);
    onChange(newData);
  };

  const addColumn = () => {
    const newRows = tableData.rows.map(row => [...row, '']);
    const newData = { ...tableData, rows: newRows };
    setTableData(newData);
    onChange(newData);
  };

  const removeColumn = (colIndex) => {
    if (tableData.rows[0]?.length <= 1) return;
    const newRows = tableData.rows.map(row => row.filter((_, i) => i !== colIndex));
    const newData = { ...tableData, rows: newRows };
    setTableData(newData);
    onChange(newData);
  };

  const toggleHeader = () => {
    const newData = { ...tableData, hasHeader: !tableData.hasHeader };
    setTableData(newData);
    onChange(newData);
  };

  return (
    <div className="bg-white rounded-lg border border-earth-200 p-4">
      {/* Table Controls */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button
          onClick={addRow}
          className="px-3 py-1 bg-earth-100 hover:bg-earth-200 rounded text-sm flex items-center gap-1"
        >
          <Plus size={14} />
          Add Row
        </button>
        <button
          onClick={addColumn}
          className="px-3 py-1 bg-earth-100 hover:bg-earth-200 rounded text-sm flex items-center gap-1"
        >
          <Plus size={14} />
          Add Column
        </button>
        <button
          onClick={toggleHeader}
          className={`px-3 py-1 rounded text-sm ${
            tableData.hasHeader 
              ? 'bg-accent text-white' 
              : 'bg-earth-100 hover:bg-earth-200'
          }`}
        >
          Header Row
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full border-collapse border border-earth-300">
          <tbody>
            {tableData.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <td key={colIndex} className="border border-earth-300 p-2 relative group">
                    {rowIndex === 0 && tableData.hasHeader ? (
                      <div className="relative group">
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                          className="w-full bg-earth-50 font-semibold focus:outline-none focus:bg-white"
                          placeholder="Header"
                        />
                        {/* Column delete button: only visible on header cell hover */}
                        <button
                          onClick={() => removeColumn(colIndex)}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-red-100 hover:bg-red-200 rounded text-red-600 z-10"
                          title="Remove column"
                          style={{ pointerEvents: 'auto' }}
                        >
                          <Minus size={12} />
                        </button>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                        className="w-full bg-transparent focus:outline-none focus:bg-earth-50"
                        placeholder="Cell content"
                      />
                    )}
                  </td>
                ))}
                {/* Row controls: only visible on hover for row */}
                <td className="border-none p-2 group">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => removeRow(rowIndex)}
                      className="p-1 bg-red-100 hover:bg-red-200 rounded text-red-600"
                      title="Remove row"
                    >
                      <Minus size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={onSave}
          className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 flex items-center gap-2"
        >
          <Save size={16} />
          Save Table
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-earth-100 hover:bg-earth-200 rounded flex items-center gap-2"
        >
          <X size={16} />
          Cancel
        </button>
      </div>
    </div>
  );
}
