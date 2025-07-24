import React, { useState } from 'react';
import { Save, X, Flag, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export default function BannerEditor({ content, onChange, onSave, onCancel }) {
  const [bannerData, setBannerData] = useState(() => {
    if (content && content.text) {
      return content;
    }
    return {
      text: 'This is an important announcement!',
      type: 'info',
      showIcon: true,
      dismissible: false
    };
  });

  const bannerTypes = [
    { 
      type: 'info', 
      label: 'Info', 
      icon: Info, 
      bgColor: 'bg-blue-50', 
      borderColor: 'border-blue-200', 
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600'
    },
    { 
      type: 'success', 
      label: 'Success', 
      icon: CheckCircle, 
      bgColor: 'bg-green-50', 
      borderColor: 'border-green-200', 
      textColor: 'text-green-800',
      iconColor: 'text-green-600'
    },
    { 
      type: 'warning', 
      label: 'Warning', 
      icon: AlertTriangle, 
      bgColor: 'bg-yellow-50', 
      borderColor: 'border-yellow-200', 
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600'
    },
    { 
      type: 'error', 
      label: 'Error', 
      icon: AlertCircle, 
      bgColor: 'bg-red-50', 
      borderColor: 'border-red-200', 
      textColor: 'text-red-800',
      iconColor: 'text-red-600'
    },
    { 
      type: 'neutral', 
      label: 'Neutral', 
      icon: Flag, 
      bgColor: 'bg-earth-50', 
      borderColor: 'border-earth-200', 
      textColor: 'text-earth-800',
      iconColor: 'text-earth-600'
    }
  ];

  const updateBannerData = (updates) => {
    const newData = { ...bannerData, ...updates };
    setBannerData(newData);
    onChange && onChange(newData);
  };

  const currentBannerType = bannerTypes.find(bt => bt.type === bannerData.type) || bannerTypes[0];
  const IconComponent = currentBannerType.icon;

  return (
    <div className="bg-white rounded-lg border border-earth-200 p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Flag size={20} />
        Add Banner
      </h3>
      {/* Banner Type Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Banner Type</label>
        <div className="grid grid-cols-5 gap-2">
          {bannerTypes.map((type) => {
            const TypeIcon = type.icon;
            return (
              <button
                key={type.type}
                onClick={() => updateBannerData({ type: type.type })}
                className={`p-3 rounded border-2 flex flex-col items-center gap-1 transition-all ${
                  bannerData.type === type.type 
                    ? `${type.borderColor} ${type.bgColor}` 
                    : 'border-earth-200 hover:border-earth-300'
                }`}
              >
                <TypeIcon size={20} className={type.iconColor} />
                <span className={`text-xs font-medium ${type.textColor}`}>
                  {type.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className={`flex items-center gap-3 rounded border p-3 mb-4 ${currentBannerType.bgColor} ${currentBannerType.borderColor}`}>
        {bannerData.showIcon !== false && (
          <IconComponent size={24} className={currentBannerType.iconColor} />
        )}
        <input
          type="text"
          value={bannerData.text}
          onChange={e => updateBannerData({ text: e.target.value })}
          className={`flex-1 bg-transparent border-none outline-none text-base font-medium ${currentBannerType.textColor}`}
          placeholder="Banner text..."
        />
      </div>
      <div className="flex items-center gap-4 mb-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={bannerData.showIcon !== false}
            onChange={e => updateBannerData({ showIcon: e.target.checked })}
          />
          Show icon
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={bannerData.dismissible || false}
            onChange={e => updateBannerData({ dismissible: e.target.checked })}
          />
          Dismissible
        </label>
      </div>
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <button onClick={onCancel} className="px-3 py-1 rounded bg-earth-100 hover:bg-earth-200 text-earth-700">Cancel</button>
        )}
        {onSave && (
          <button onClick={() => onSave(bannerData)} className="px-3 py-1 rounded bg-accent text-white hover:bg-accent/90 flex items-center gap-1">
            <Save size={16} /> Save
          </button>
        )}
      </div>
    </div>
  );
}
