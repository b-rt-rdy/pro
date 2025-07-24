import React, { useState } from 'react';
import { Save, X, Upload, Link, Image as ImageIcon } from 'lucide-react';

export default function ImageEditor({ content, onChange, onSave, onCancel }) {
  const [imageData, setImageData] = useState(() => {
    if (content && content.url) {
      return content;
    }
    return {
      url: '',
      alt: '',
      caption: '',
      width: 'auto',
      alignment: 'center'
    };
  });

  const [inputMethod, setInputMethod] = useState('url');

  const updateImageData = (updates) => {
    const newData = { ...imageData, ...updates };
    setImageData(newData);
    onChange && onChange(newData);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateImageData({ url: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const sampleImages = [
    'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1181316/pexels-photo-1181316.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800'
  ];

  return (
    <div className="bg-white rounded-lg border border-earth-200 p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <ImageIcon size={20} />
        Add Image
      </h3>

      {/* Input method selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setInputMethod('url')}
          className={`px-3 py-2 rounded text-sm ${
            inputMethod === 'url' 
              ? 'bg-accent text-white' 
              : 'bg-earth-100 hover:bg-earth-200'
          }`}
        >
          <Link size={14} className="inline mr-1" />
          URL
        </button>
        <button
          onClick={() => setInputMethod('upload')}
          className={`px-3 py-2 rounded text-sm ${
            inputMethod === 'upload' 
              ? 'bg-accent text-white' 
              : 'bg-earth-100 hover:bg-earth-200'
          }`}
        >
          <Upload size={14} className="inline mr-1" />
          Upload
        </button>
        <button
          onClick={() => setInputMethod('sample')}
          className={`px-3 py-2 rounded text-sm ${
            inputMethod === 'sample' 
              ? 'bg-accent text-white' 
              : 'bg-earth-100 hover:bg-earth-200'
          }`}
        >
          <ImageIcon size={14} className="inline mr-1" />
          Sample
        </button>
      </div>

      {/* Input fields */}
      {inputMethod === 'url' && (
        <div className="mb-4">
          <input
            type="text"
            value={imageData.url}
            onChange={e => updateImageData({ url: e.target.value })}
            placeholder="Paste image URL..."
            className="w-full px-3 py-2 border border-earth-300 rounded focus:ring-2 focus:ring-accent focus:border-accent"
          />
        </div>
      )}
      {inputMethod === 'upload' && (
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="w-full"
          />
        </div>
      )}
      {inputMethod === 'sample' && (
        <div className="mb-4 grid grid-cols-2 gap-2">
          {sampleImages.map(url => (
            <img
              key={url}
              src={url}
              alt="Sample"
              className="rounded cursor-pointer border-2 border-transparent hover:border-accent"
              style={{ maxHeight: 80, objectFit: 'cover' }}
              onClick={() => updateImageData({ url })}
            />
          ))}
        </div>
      )}

      {/* Preview */}
      {imageData.url && (
        <div className="mb-4 text-center">
          <img
            src={imageData.url}
            alt={imageData.alt || ''}
            className="rounded max-w-full mx-auto"
            style={{ maxHeight: 240, display: 'block', margin: '0 auto' }}
          />
        </div>
      )}

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={imageData.alt}
          onChange={e => updateImageData({ alt: e.target.value })}
          placeholder="Alt text (for accessibility)"
          className="flex-1 px-3 py-2 border border-earth-300 rounded focus:ring-2 focus:ring-accent focus:border-accent"
        />
        <input
          type="text"
          value={imageData.caption}
          onChange={e => updateImageData({ caption: e.target.value })}
          placeholder="Caption (optional)"
          className="flex-1 px-3 py-2 border border-earth-300 rounded focus:ring-2 focus:ring-accent focus:border-accent"
        />
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <button onClick={onCancel} className="px-3 py-1 rounded bg-earth-100 hover:bg-earth-200 text-earth-700">Cancel</button>
        )}
        {onSave && (
          <button onClick={() => onSave(imageData)} className="px-3 py-1 rounded bg-accent text-white hover:bg-accent/90 flex items-center gap-1">
            <Save size={16} /> Save
          </button>
        )}
      </div>
    </div>
  );
}
