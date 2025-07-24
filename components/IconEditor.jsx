import React, { useState } from 'react';
import { Save, X, Search } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

export default function IconEditor({ content, onChange, onSave, onCancel }) {
  const [iconData, setIconData] = useState(() => {
    if (content && content.icon) {
      return content;
    }
    return {
      icon: 'Star',
      text: 'Your text here',
      size: 'medium',
      color: '#C4A484',
      layout: 'horizontal'
    };
  });

  const [searchTerm, setSearchTerm] = useState('');

  // Get available Lucide icons
  const availableIcons = Object.keys(LucideIcons).filter(name => 
    name !== 'default' && 
    name !== 'createLucideIcon' &&
    typeof LucideIcons[name] === 'function'
  );

  const filteredIcons = availableIcons.filter(icon =>
    icon.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 50);
  const updateIconData = (updates) => {
    const newData = { ...iconData, ...updates };
    setIconData(newData);
    onChange && onChange(newData);
  };

  const IconComponent = LucideIcons[iconData.icon] || LucideIcons.Star;

  const sizeMap = {
    small: 16,
    medium: 24,
    large: 32,
    xlarge: 48
  };

  const colorOptions = [
    '#C4A484', '#4A3B2F', '#8A6F53', '#D4B5A0',
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#6B7280', '#000000'
  ];

  return (
    <div className="bg-white rounded-lg border border-earth-200 p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <IconComponent size={20} />
        Add Icon Block
      </h3>

      {/* Icon Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Choose Icon</label>
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-earth-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search icons..."
            className="w-full pl-10 pr-4 py-2 border border-earth-300 rounded focus:ring-2 focus:ring-accent focus:border-accent"
          />
        </div>
        <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto border border-earth-200 rounded p-2">
          {filteredIcons.map((iconName) => {
            const Icon = LucideIcons[iconName];
            return (
              <button
                key={iconName}
                onClick={() => updateIconData({ icon: iconName })}
                className={`p-2 rounded hover:bg-earth-100 flex items-center justify-center ${iconData.icon === iconName ? 'bg-accent text-white' : ''}`}
              >
                <Icon size={20} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Icon Preview and Text */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <IconComponent size={sizeMap[iconData.size] || 24} color={iconData.color} />
          <input
            type="text"
            value={iconData.text}
            onChange={e => updateIconData({ text: e.target.value })}
            className="bg-transparent border-b border-earth-200 outline-none text-base font-medium px-2"
            placeholder="Icon text..."
          />
        </div>
      </div>

      {/* Size and Color */}
      <div className="flex items-center gap-4 mb-4">
        <label className="text-sm">Size:</label>
        <select
          value={iconData.size}
          onChange={e => updateIconData({ size: e.target.value })}
          className="rounded px-2 py-1 border border-earth-200 text-xs focus:outline-accent"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
          <option value="xlarge">X-Large</option>
        </select>
        <label className="text-sm ml-4">Color:</label>
        <div className="flex gap-2 items-center">
          {colorOptions.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => updateIconData({ color: c })}
              style={{ backgroundColor: c, borderColor: c === iconData.color ? '#8A6F53' : '#ddd' }}
              className={`w-6 h-6 rounded-full border-2 transition-all ${c === iconData.color ? 'ring-2 ring-accent scale-110' : ''} hover:scale-105 hover:ring-2 hover:ring-accent/40`}
              title={c}
            >
              {c === iconData.color && (
                <span className="block w-2 h-2 rounded-full bg-white mx-auto my-auto mt-2" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <button onClick={onCancel} className="px-3 py-1 rounded bg-earth-100 hover:bg-earth-200 text-earth-700">Cancel</button>
        )}
        {onSave && (
          <button onClick={() => onSave(iconData)} className="px-3 py-1 rounded bg-accent text-white hover:bg-accent/90 flex items-center gap-1">
            <Save size={16} /> Save
          </button>
        )}
      </div>
    </div>
  );
}
