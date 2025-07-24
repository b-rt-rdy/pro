import React, { useState } from 'react';
import { X, Download, Eye } from 'lucide-react';

export default function ExportPDFDialog({ open, onClose, onExport, previewContent, defaultOptions = {} }) {
  const [options, setOptions] = useState({
    includeBookmarks: true,
    pageSize: 'A4',
    orientation: 'portrait',
    ...defaultOptions
  });

  const [showPreview, setShowPreview] = useState(false);

  if (!open) return null;

  const handleExport = () => {
    onExport(options);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-earth-200">
          <h2 className="text-xl font-semibold text-earth-800">Export as PDF</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-earth-100 rounded-full transition-colors"
          >
            <X size={20} className="text-earth-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showPreview ? (
            <>
              {/* Export Options */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-2">
                    Page Size
                  </label>
                  <select
                    value={options.pageSize}
                    onChange={(e) => setOptions(prev => ({ ...prev, pageSize: e.target.value }))}
                    className="w-full p-2 border border-earth-300 rounded-md focus:ring-2 focus:ring-accent focus:border-accent"
                  >
                    <option value="A4">A4</option>
                    <option value="Letter">Letter</option>
                    <option value="Legal">Legal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-2">
                    Orientation
                  </label>
                  <select
                    value={options.orientation}
                    onChange={(e) => setOptions(prev => ({ ...prev, orientation: e.target.value }))}
                    className="w-full p-2 border border-earth-300 rounded-md focus:ring-2 focus:ring-accent focus:border-accent"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeBookmarks"
                    checked={options.includeBookmarks}
                    onChange={(e) => setOptions(prev => ({ ...prev, includeBookmarks: e.target.checked }))}
                    className="rounded border-earth-300 text-accent focus:ring-accent"
                  />
                  <label htmlFor="includeBookmarks" className="ml-2 text-sm text-earth-700">
                    Include bookmarks for navigation
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowPreview(true)}
                  className="px-4 py-2 text-earth-600 hover:bg-earth-100 rounded-md transition-colors flex items-center gap-2"
                >
                  <Eye size={16} />
                  Preview
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-earth-600 hover:bg-earth-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors flex items-center gap-2"
                >
                  <Download size={16} />
                  Export PDF
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Preview */}
              <div className="mb-4">
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-accent hover:text-accent/80 text-sm"
                >
                  ← Back to options
                </button>
              </div>
              
              <div className="border border-earth-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                {previewContent}
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-earth-600 hover:bg-earth-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors flex items-center gap-2"
                >
                  <Download size={16} />
                  Export PDF
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
