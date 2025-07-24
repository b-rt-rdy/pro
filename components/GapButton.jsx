// components/GapButton.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Type, Heading1, Heading2, CheckSquare, Code, Quote, Image, Table, Smile, Flag } from 'lucide-react';
import { useNotes } from '../context/NotesContext';

export default function GapButton({ parentId, beforeId = null }) {
  const { addSection } = useNotes();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const blockTypes = [
    { type: 'text', icon: Type, label: 'Text', description: 'Start writing with plain text' },
    { type: 'heading', icon: Heading1, label: 'Heading 1', description: 'Big section heading' },
    { type: 'subheading', icon: Heading2, label: 'Heading 2', description: 'Medium section heading' },
    { type: 'table', icon: Table, label: 'Table', description: 'Create a data table' },
    { type: 'image', icon: Image, label: 'Image', description: 'Add an image from URL' },
    { type: 'icon', icon: Smile, label: 'Icon Block', description: 'Add an icon with text' },
    { type: 'banner', icon: Flag, label: 'Banner', description: 'Create a colorful banner' },
  ];

  const handleAddBlock = (type) => {
    addSection(type, parentId, beforeId);
    setIsOpen(false);
  };

  return (
    <div
      className="relative flex items-center h-6 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); if (!isOpen) setIsOpen(false); }}
    >
      {/* Left-aligned subtle plus button, only on hover */}
      <button
        className={`absolute left-0 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-white border border-earth-200 shadow-sm transition-all
          ${isHovered || isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}
          hover:bg-earth-100 hover:border-accent`}
        style={{ top: '50%', transform: 'translateY(-50%)' }}
        onClick={() => setIsOpen((v) => !v)}
        tabIndex={0}
        aria-label="Add block"
      >
        <Plus size={14} />
      </button>
      {/* Gap line with hover background for discoverability */}
      <div className={`w-full h-px bg-earth-100 transition-colors ${isHovered ? 'bg-accent/30' : ''}`}></div>
      {/* Block type menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute left-8 top-1/2 -translate-y-1/2 bg-white border border-earth-200 rounded-lg shadow-lg py-2 z-20 min-w-[240px] animate-fade-in"
        >
          {blockTypes.map(({ type, icon: Icon, label, description }) => (
            <button
              key={type}
              onClick={() => handleAddBlock(type)}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-earth-50 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded bg-earth-100 flex items-center justify-center">
                <Icon size={16} className="text-earth-600" />
              </div>
              <div>
                <div className="font-medium text-earth-800">{label}</div>
                <div className="text-sm text-earth-500">{description}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
