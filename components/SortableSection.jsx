import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Plus,
  Indent,
  Outdent,
  Save,
  Pencil,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Palette,
  Trash2,
  X,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';

import { cn } from '../utils/cn';
import { useNotes } from '../context/NotesContext';
import RichTextEditor from './RichTextEditor';
import TableEditor from './TableEditor';
import ImageEditor from './ImageEditor';
import IconEditor from './IconEditor';
import BannerEditor from './BannerEditor';

const stripTags = (html) => html.replace(/<[^>]+>/g, '').trim();

export default function SortableSection({
  section,
  onSave,
  children,
  isDraggingOverlay = false,
  isEditing: externalIsEditing,
  onEdit,
}) {
  const { addSection, updateSection, deleteSection, sections } = useNotes();

  // Use internal editing state for headings/subheadings
  const [isEditing, setIsEditing] = useState(false);
  // Use external editing state for all leaf blocks
  const isBlockEditing = ['text','table','image','icon','banner'].includes(section.type) ? externalIsEditing : isEditing;
  const [isExpanded, setIsExpanded] = useState(true);
  const [content, setContent] = useState(section.content ?? '');
  const [draftLabel, setDraftLabel] = useState(section.content ?? '');

  // --- Heading style state ---
  const [headingColor, setHeadingColor] = useState(section.headingColor || '#000000');
  const [headingBold, setHeadingBold] = useState(!!section.headingBold);
  const [headingItalic, setHeadingItalic] = useState(!!section.headingItalic);
  const [headingUnderline, setHeadingUnderline] = useState(!!section.headingUnderline);
  const defaultFontFamilies = [
    { label: 'Default', val: '' },
    { label: 'Serif', val: 'serif' },
    { label: 'Sans', val: 'Inter, sans-serif' },
    { label: 'Playfair', val: '"Playfair Display", serif' },
    { label: 'Monospace', val: 'monospace' },
    { label: 'Georgia', val: 'Georgia, serif' },
    { label: 'Courier New', val: '"Courier New", monospace' },
  ];
  const fontFamilies = defaultFontFamilies;
  // Fix: define headingFont state (was missing)
  const [headingFont, setHeadingFont] = useState(section.headingFont || '');

  // Recommended colors (persist custom colors in localStorage)
  const LOCAL_COLORS_KEY = 'proibe_heading_colors';
  const defaultColors = ['#000000', '#DEB887', '#B5C18E', '#8B4513', '#A0522D'];
  const [customColors, setCustomColors] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_COLORS_KEY)) || [];
    } catch {
      return [];
    }
  });
  const palette = [...defaultColors, ...customColors];
  const [newColor, setNewColor] = useState('#000000');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = isDraggingOverlay
    ? undefined
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : 0,
      };

  const prevSibling = () => {
    const sibs = sections.filter((s) => s.parent === section.parent);
    const idx  = sibs.findIndex((s) => s.id === section.id);
    return idx > 0 ? sibs[idx - 1] : null;
  };

  const handleIndent = () => {
    const newParent = prevSibling();
    if (newParent) updateSection(section.id, { parent: newParent.id });
  };

  const handleOutdent = () => {
    if (!section.parent) return;
    const parent = sections.find((s) => s.id === section.parent);
    updateSection(section.id, { parent: parent?.parent ?? null });
  };

  const handleSave = () => {
    updateSection(section.id, { content });
    if (onSave) onSave(section.id, content);
    setIsEditing(false);
    if (onEdit) onEdit(null);
  };

  // Save label for headings/subheadings, including style
  const handleLabelSave = () => {
    const newContent = draftLabel.trim() || 'Untitled';
    updateSection(section.id, {
      content: newContent,
      headingColor,
      headingBold,
      headingItalic,
      headingUnderline,
      headingFont,
    });
    setContent(newContent);
    // Do NOT setIsEditing(false) here, let blur/Enter/Escape handle it
  }

  // Add a custom color to the palette
  function handleAddColor(e) {
    e.preventDefault();
    if (!customColors.includes(newColor) && !defaultColors.includes(newColor)) {
      const updated = [...customColors, newColor];
      setCustomColors(updated);
      localStorage.setItem(LOCAL_COLORS_KEY, JSON.stringify(updated));
    }
    setHeadingColor(newColor);
  }

  // Remove a custom color from the palette
  function handleRemoveColor(color) {
    const updated = customColors.filter(c => c !== color);
    setCustomColors(updated);
    localStorage.setItem(LOCAL_COLORS_KEY, JSON.stringify(updated));
  }

  // Toolbar for heading/subheading styles
  function HeadingStyleToolbar() {
    const [open, setOpen] = useState(false);
    const toolbarRef = React.useRef(null);
    React.useEffect(() => {
      if (!open) return;
      function handleClick(e) {
        if (!toolbarRef.current?.contains(e.target)) setOpen(false);
      }
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);
    const dropdownPosition =
      section.type === 'heading'
        ? 'right-0'
        : section.type === 'subheading'
        ? 'left-0'
        : 'left-0';
    return (
      <div className="relative inline-block heading-style-toolbar" ref={toolbarRef}>
        <button
          type="button"
          className="p-1 rounded bg-accent/40 hover:bg-accent/60 text-earth-700"
          onClick={() => setOpen((v) => !v)}
          title="Style"
        >
          <Palette size={18} />
        </button>
        {open && (
          <div
            className={`absolute top-full mt-2 z-50 bg-pale-beige border border-accent rounded-lg shadow-lg px-3 py-2 flex flex-col gap-2 items-start w-[min(320px,90vw)] max-w-xs min-w-[220px] ${dropdownPosition}`}
            style={{ left: section.type === 'text' ? 0 : undefined, right: section.type === 'heading' ? 0 : undefined, overflowX: 'auto' }}
          >
            <div className="flex gap-2 items-center flex-wrap">
              <button
                type="button"
                className={cn(
                  'p-1 rounded hover:bg-light-brown/20',
                  headingBold && 'bg-light-brown/30'
                )}
                title="Bold"
                onClick={() => setHeadingBold((v) => !v)}
              >
                <Bold size={16} />
              </button>
              <button
                type="button"
                className={cn(
                  'p-1 rounded hover:bg-light-brown/20',
                  headingItalic && 'bg-light-brown/30'
                )}
                title="Italic"
                onClick={() => setHeadingItalic((v) => !v)}
              >
                <Italic size={16} />
              </button>
              <button
                type="button"
                className={cn(
                  'p-1 rounded hover:bg-light-brown/20',
                  headingUnderline && 'bg-light-brown/30'
                )}
                title="Underline"
                onClick={() => setHeadingUnderline((v) => !v)}
              >
                <UnderlineIcon size={16} />
              </button>
              {/* Font family dropdown with preview */}
              <div className="relative">
                <select
                  value={headingFont}
                  onChange={e => setHeadingFont(e.target.value)}
                  className="rounded px-1 py-0.5 border border-light-brown text-xs"
                  style={{ fontFamily: headingFont || undefined, maxWidth: 120 }}
                  title="Font style"
                >
                  {fontFamilies.map(f => (
                    <option
                      key={f.val}
                      value={f.val}
                      style={{
                        fontFamily: f.val || undefined,
                        fontWeight: headingBold ? 'bold' : undefined,
                        fontStyle: headingItalic ? 'italic' : undefined,
                        textDecoration: headingUnderline ? 'underline' : undefined,
                      }}
                    >
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Color palette box */}
            <div className="flex flex-wrap gap-2 items-center mt-2">
              {palette.map((c, idx) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setHeadingColor(c)}
                  style={{ backgroundColor: c, borderColor: c === headingColor ? '#8A6F53' : '#ddd' }}
                  className={cn(
                    'w-6 h-6 rounded-full border-2 transition-all',
                    c === headingColor && 'ring-2 ring-accent scale-110',
                    'hover:scale-105 hover:ring-2 hover:ring-accent/40'
                  )}
                  title={c}
                >
                  {c === headingColor && (
                    <span className="block w-2 h-2 rounded-full bg-white mx-auto my-auto mt-2" />
                  )}
                </button>
              ))}
              {/* Add new color */}
              <form
                onSubmit={handleAddColor}
                className="flex items-center gap-1 ml-2"
                style={{ minWidth: 0 }}
              >
                <input
                  type="color"
                  value={newColor}
                  onChange={e => setNewColor(e.target.value)}
                  className="w-6 h-6 rounded-full border border-[#ddd] cursor-pointer"
                  style={{ padding: 0, background: 'none' }}
                  title="Add new color"
                />
                <button
                  type="submit"
                  className="px-1 py-0.5 rounded bg-accent/40 hover:bg-accent/60 text-xs text-earth-700 border border-accent"
                  tabIndex={-1}
                  title="Add color"
                >+</button>
              </form>
            </div>
            {/* Font preview */}
            <div className="w-full mt-2 mb-1 px-1 py-1 rounded bg-white border border-accent text-xs text-earth-700"
              style={{
                fontFamily: headingFont || undefined,
                fontWeight: headingBold ? 'bold' : undefined,
                fontStyle: headingItalic ? 'italic' : undefined,
                textDecoration: headingUnderline ? 'underline' : undefined,
                color: headingColor,
                minHeight: 24,
              }}
            >
              {draftLabel || 'Font preview'}
            </div>
            <button
              type="button"
              className="ml-2 px-2 py-1 rounded bg-accent/40 hover:bg-accent/60 text-earth-700 text-xs"
              onClick={() => setOpen(false)}
              tabIndex={-1}
            >
              Done
            </button>
          </div>
        )}
      </div>
    );
  }

  // Compute inline style for heading/subheading
  const headingStyle = {
    color: headingColor || '#000',
    fontWeight: headingBold ? 'bold' : undefined,
    fontStyle: headingItalic ? 'italic' : undefined,
    textDecoration: headingUnderline ? 'underline' : undefined,
    fontFamily: (typeof headingFont !== 'undefined' ? headingFont : '') || undefined,
  };

  // Render text section directly and return if type is 'text'
  if (section.type === 'text') {
    if (isBlockEditing) {
      return (
        <div ref={setNodeRef} className="flex items-start group relative" style={{ paddingLeft: 0, paddingRight: 0, marginTop: section.parent ? '18px' : '0', marginBottom: '2px' }}>
          <div
            {...attributes}
            {...listeners}
            className="ml-2 mt-2 opacity-0 group-hover:opacity-100 cursor-grab transition-opacity"
            style={{ minWidth: 20 }}
            title="Drag"
          >
            <GripVertical className="text-light-brown" />
          </div>
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-light-brown/10 p-2 ml-1">
            <RichTextEditor
              content={content}
              onChange={setContent}
              type={section.type}
            />
            <button
              onClick={handleSave}
              className="mt-2 px-3 py-1.5 bg-light-brown/10 rounded hover:bg-light-brown/20 text-light-brown flex items-center"
            >
              <Save size={14} className="mr-1" />
              Save
            </button>
          </div>
          {/* Trash button is now correctly positioned inside the block */}
          <button
            onClick={() => deleteSection(section.id)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-red-100 text-red-500 z-10"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      );
    } else {
      return (
        <div ref={setNodeRef} className="flex items-start group relative" style={{ paddingLeft: 0, paddingRight: 0, marginTop: section.parent ? '18px' : '0', marginBottom: '2px' }}>
          <div
            {...attributes}
            {...listeners}
            className="ml-2 mt-2 opacity-0 group-hover:opacity-100 cursor-grab transition-opacity"
            style={{ minWidth: 20 }}
            title="Drag"
          >
            <GripVertical className="text-light-brown" />
          </div>
          <div
            className="flex-1 prose max-w-none tiptap bg-white rounded-xl shadow-sm border border-light-brown/10 p-2 ml-1"
            dangerouslySetInnerHTML={{
              __html: content && content.trim()
                ? content
                : '<span class="text-earth-400 italic">Click to add text…</span>'
            }}
            onClick={() => onEdit && onEdit(section.id)}
            title="Click to edit"
            style={{ cursor: 'pointer', minHeight: 32 }}
          />
          {/* Trash button is now correctly positioned inside the block */}
          <button
            onClick={() => deleteSection(section.id)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-red-100 text-red-500 z-10"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      );
    }
  }

  // Render table section
  if (section.type === 'table') {
    if (isBlockEditing) {
      return (
        <div ref={setNodeRef} className="flex items-start group relative" style={{ paddingLeft: 0, paddingRight: 0, marginTop: section.parent ? '18px' : '0', marginBottom: '2px' }}>
          <div
            {...attributes}
            {...listeners}
            className="ml-2 mt-2 opacity-0 group-hover:opacity-100 cursor-grab transition-opacity"
            style={{ minWidth: 20 }}
            title="Drag"
          >
            <GripVertical className="text-light-brown" />
          </div>
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-light-brown/10 p-2 ml-1">
            <TableEditor
              content={content}
              onChange={setContent}
              onSave={handleSave}
              onCancel={() => onEdit && onEdit(null)}
            />
          </div>
          {/* Trash button is now correctly positioned inside the block */}
          <button
            onClick={() => deleteSection(section.id)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-red-100 text-red-500 z-10"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      );
    } else {
      // Bolt-style table preview
      return (
        <div
          ref={setNodeRef}
          className="flex items-start group relative"
          style={{ paddingLeft: 0, paddingRight: 0, marginTop: section.parent ? '18px' : '0', marginBottom: '2px' }}
        >
          <div
            {...attributes}
            {...listeners}
            className="ml-2 mt-2 opacity-0 group-hover:opacity-100 cursor-grab transition-opacity"
            style={{ minWidth: 20 }}
            title="Drag"
          >
            <GripVertical className="text-light-brown" />
          </div>
          <div
            className="flex-1 overflow-x-auto bg-earth-50 rounded-lg border border-earth-200 p-4 min-h-[60px] cursor-pointer hover:bg-earth-100 transition"
            onClick={() => onEdit && onEdit(section.id)}
            title="Click to edit table"
          >
            {content && content.rows && content.rows.length > 0 ? (
              <table className="min-w-[200px] border border-earth-200 text-sm w-full">
                <tbody>
                  {content.rows.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j} className={`border border-earth-200 px-2 py-1 ${i === 0 && content.hasHeader ? 'font-semibold bg-earth-100' : ''}`}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <span className="text-earth-400 italic">Empty table</span>
            )}
          </div>
          {/* Trash button is now correctly positioned inside the block */}
          <button
            onClick={() => deleteSection(section.id)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-red-100 text-red-500 z-10"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      );
    }
  }

  // Render image section
  if (section.type === 'image') {
    if (isBlockEditing) {
      return (
        <div ref={setNodeRef} className="flex items-start group relative" style={{ paddingLeft: 0, paddingRight: 0, marginTop: section.parent ? '18px' : '0', marginBottom: '2px' }}>
          <div
            {...attributes}
            {...listeners}
            className="ml-2 mt-2 opacity-0 group-hover:opacity-100 cursor-grab transition-opacity"
            style={{ minWidth: 20 }}
            title="Drag"
          >
            <GripVertical className="text-light-brown" />
          </div>
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-light-brown/10 p-2 ml-1">
            <ImageEditor
              content={content}
              onChange={setContent}
              onSave={handleSave}
              onCancel={() => onEdit && onEdit(null)}
            />
          </div>
          {/* Trash button is now correctly positioned inside the block */}
          <button
            onClick={() => deleteSection(section.id)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-red-100 text-red-500 z-10"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      );
    } else {
      // Bolt-style image preview
      return (
        <div
          ref={setNodeRef}
          className="flex items-start group relative"
          style={{ paddingLeft: 0, paddingRight: 0, marginTop: section.parent ? '18px' : '0', marginBottom: '2px' }}
        >
          <div
            {...attributes}
            {...listeners}
            className="ml-2 mt-2 opacity-0 group-hover:opacity-100 cursor-grab transition-opacity"
            style={{ minWidth: 20 }}
            title="Drag"
          >
            <GripVertical className="text-light-brown" />
          </div>
          <div
            className="flex-1 flex flex-col items-center justify-center bg-earth-50 rounded-lg border border-earth-200 p-4 min-h-[120px] cursor-pointer hover:bg-earth-100 transition"
            onClick={() => onEdit && onEdit(section.id)}
            title="Click to edit image"
          >
            {content && content.url ? (
              <img
                src={content.url}
                alt={content.alt || ''}
                className={`rounded shadow-sm ${content.width === 'small' ? 'w-[300px]' : content.width === 'medium' ? 'w-[500px]' : content.width === 'large' ? 'w-[700px]' : content.width === 'full' ? 'w-full' : 'max-w-full h-auto'}`}
                style={{ maxHeight: '220px', objectFit: 'cover', display: 'block', margin: '0 auto' }}
              />
            ) : (
              <span className="text-earth-400 italic w-full text-center block">No image selected</span>
            )}
            {content && content.caption && (
              <div className="text-xs text-earth-600 mt-2 text-center">{content.caption}</div>
            )}
          </div>
          {/* Trash button is now correctly positioned inside the block */}
          <button
            onClick={() => deleteSection(section.id)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-red-100 text-red-500 z-10"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      );
    }
  }

  // Render icon section
  if (section.type === 'icon') {
    if (isBlockEditing) {
      return (
        <div ref={setNodeRef} className="flex items-start group relative" style={{ paddingLeft: 0, paddingRight: 0, marginTop: section.parent ? '18px' : '0', marginBottom: '2px' }}>
          <div
            {...attributes}
            {...listeners}
            className="ml-2 mt-2 opacity-0 group-hover:opacity-100 cursor-grab transition-opacity"
            style={{ minWidth: 20 }}
            title="Drag"
          >
            <GripVertical className="text-light-brown" />
          </div>
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-light-brown/10 p-2 ml-1">
            <IconEditor
              content={content}
              onChange={setContent}
              onSave={handleSave}
              onCancel={() => onEdit && onEdit(null)}
            />
          </div>
          {/* Trash button is now correctly positioned inside the block */}
          <button
            onClick={() => deleteSection(section.id)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-red-100 text-red-500 z-10"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      );
    } else {
      // Bolt-style icon + text preview
      const Icon = content && content.icon && LucideIcons[content.icon] ? LucideIcons[content.icon] : LucideIcons.Star;
      return (
        <div
          ref={setNodeRef}
          className={`flex items-start group gap-3 bg-earth-50 rounded-lg border border-earth-200 p-4 min-h-[60px] cursor-pointer hover:bg-earth-100 transition ${content?.layout === 'vertical' ? 'flex-col items-start' : ''}`}
          style={{ paddingLeft: 0, paddingRight: 0, marginTop: section.parent ? '18px' : '0', marginBottom: '2px' }}
          onClick={() => onEdit && onEdit(section.id)}
          title="Click to edit icon block"
        >
          <Icon size={content?.size === 'xlarge' ? 48 : content?.size === 'large' ? 32 : content?.size === 'medium' ? 24 : 16} style={{ color: content?.color || '#8A6F53' }} />
          <span className="text-earth-800 text-base">{content?.text ? content.text.split('\n').map((line, i) => <span key={i}>{line}<br/></span>) : <span className='text-earth-400 italic'>No text</span>}</span>
        </div>
      );
    }
  }

  // Render banner section
  if (section.type === 'banner') {
    // Get banner type info for preview
    const bannerTypes = [
      {
        type: 'info',
        icon: LucideIcons.Info,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        iconColor: 'text-blue-600',
      },
      {
        type: 'success',
        icon: LucideIcons.CheckCircle,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        iconColor: 'text-green-600',
      },
      {
        type: 'warning',
        icon: LucideIcons.AlertTriangle,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        iconColor: 'text-yellow-600',
      },
      {
        type: 'error',
        icon: LucideIcons.AlertCircle,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        iconColor: 'text-red-600',
      },
      {
        type: 'neutral',
        icon: LucideIcons.Flag,
        bgColor: 'bg-earth-50',
        borderColor: 'border-earth-200',
        textColor: 'text-earth-800',
        iconColor: 'text-earth-600',
      },
    ];
    const bannerType = bannerTypes.find(bt => bt.type === (content?.type || 'info')) || bannerTypes[0];
    const BannerIcon = bannerType.icon;
    if (isBlockEditing) {
      return (
        <div ref={setNodeRef} className="flex items-start group relative" style={{ paddingLeft: 0, paddingRight: 0, marginTop: section.parent ? '18px' : '0', marginBottom: '2px' }}>
          <div
            {...attributes}
            {...listeners}
            className="ml-2 mt-2 opacity-0 group-hover:opacity-100 cursor-grab transition-opacity"
            style={{ minWidth: 20 }}
            title="Drag"
          >
            <GripVertical className="text-light-brown" />
          </div>
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-light-brown/10 p-2 ml-1">
            <BannerEditor
              content={content}
              onChange={setContent}
              onSave={handleSave}
              onCancel={() => onEdit && onEdit(null)}
            />
          </div>
          {/* Trash button is now correctly positioned inside the block */}
          <button
            onClick={() => deleteSection(section.id)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-red-100 text-red-500 z-10"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      );
    } else {
      // Bolt-style banner preview with correct color/icon
      return (
        <div
          ref={setNodeRef}
          className={`flex items-start group ${bannerType.bgColor} ${bannerType.borderColor} rounded-lg border p-4 min-h-[48px] cursor-pointer hover:bg-opacity-80 transition`}
          style={{ paddingLeft: 0, paddingRight: 0, marginTop: section.parent ? '18px' : '0', marginBottom: '2px' }}
          onClick={() => onEdit && onEdit(section.id)}
          title="Click to edit banner"
        >
          {content?.showIcon !== false && <BannerIcon size={20} className={bannerType.iconColor} />}
          <span className={`ml-2 ${bannerType.textColor} font-semibold`}>{content?.text || <span className='text-earth-400 italic'>Banner</span>}</span>
        </div>
      );
    }
  }

  // Sync local content state with section.content when section changes
  React.useEffect(() => {
    setContent(section.content ?? '');
  }, [section.content]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-white bg-opacity-90 rounded-xl shadow-sm mb-4',
        section.type === 'heading'    && 'border-2 border-light-brown/20',
        section.type === 'subheading' && 'border border-light-brown/10',
        isDragging && 'opacity-50'
      )}
    >
      {/* — header row — */}
      {(section.type === 'heading' || section.type === 'subheading') && (
        <div className="p-4 flex items-center justify-between group">
          <div className="flex items-center gap-2 flex-1">
            <div
              {...attributes}
              {...listeners}
              className="opacity-0 group-hover:opacity-100 cursor-grab"
            >
              <GripVertical className="text-light-brown/60 hover:text-light-brown" />
            </div>
            {children && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:bg-light-brown/10 rounded"
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            )}
            {/* label or input */}
            {!isEditing ? (
              <div
                className={cn(
                  'flex-1 truncate transition-colors flex items-center',
                  section.type === 'heading'    && 'text-2xl font-playfair font-bold',
                  section.type === 'subheading' && 'text-xl font-medium',
                  'hover:bg-pale-beige/80 rounded px-1 cursor-pointer'
                )}
                style={headingStyle}
                onClick={() => {
                  setDraftLabel(stripTags(content));
                  setHeadingColor(section.headingColor || '#000000');
                  setHeadingBold(!!section.headingBold);
                  setHeadingItalic(!!section.headingItalic);
                  setHeadingUnderline(!!section.headingUnderline);
                  setIsEditing(true);
                }}
                title="Click to edit title"
              >
                {stripTags(content) || (
                  <span className="italic text-earth-400">
                    {section.type === 'heading'
                      ? 'Click to add a heading…'
                      : 'Click to add a subheading…'}
                  </span>
                )}
                <span className="ml-2 opacity-0 group-hover:opacity-80 transition-opacity">
                  <Pencil size={16} />
                </span>
              </div>
            ) : (
              <div className="flex-1 flex items-center gap-2">
                <input
                  autoFocus
                  value={draftLabel}
                  onChange={e => setDraftLabel(e.target.value)}
                  onBlur={() => {/* do nothing, let user finish styling */}}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleLabelSave();
                      setIsEditing(false);
                    }
                    if (e.key === 'Escape') {
                      setIsEditing(false);
                    }
                  }}
                  className={cn(
                    'w-full bg-pale-beige/80 rounded px-2 py-1 outline-none mb-1',
                    section.type === 'heading'    && 'text-2xl font-playfair font-bold',
                    section.type === 'subheading' && 'text-xl font-medium'
                  )}
                  style={{
                    color: headingColor,
                    fontWeight: headingBold ? 'bold' : undefined,
                    fontStyle: headingItalic ? 'italic' : undefined,
                    textDecoration: headingUnderline ? 'underline' : undefined,
                  }}
                  placeholder={
                    section.type === 'heading'
                      ? 'Enter heading…'
                      : 'Enter subheading…'
                  }
                />
                <HeadingStyleToolbar />
              </div>
            )}
          </div>
          {/* hover-only actions */}
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Remove indent/outdent for subheadings */}
            {section.type === 'heading' && (
              <>
                <button
                  onClick={handleOutdent}
                  disabled={!section.parent}
                  className="p-1.5 rounded-full hover:bg-light-brown/20 text-light-brown disabled:opacity-30"
                  title="Outdent"
                >
                  <Outdent size={16} />
                </button>
                <button
                  onClick={handleIndent}
                  disabled={!prevSibling()}
                  className="p-1.5 rounded-full hover:bg-light-brown/20 text-light-brown disabled:opacity-30"
                  title="Indent"
                >
                  <Indent size={16} />
                </button>
              </>
            )}
            {section.type !== 'text' && (
              <button
                onClick={() => addSection(section.type === 'heading' ? 'subheading' : 'text', section.id)}
                className="p-1.5 bg-light-brown/10 rounded-full hover:bg-light-brown/20 text-light-brown"
                title={`Add ${section.type === 'heading' ? 'subheading' : 'text'}`}
              >
                <Plus size={16} />
              </button>
            )}
            {/* Always show delete button for all block types, only on hover */}
            <button
              onClick={() => deleteSection(section.id)}
              className="p-1.5 rounded-full hover:bg-red-100 text-red-500"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      )}

      {/* — editor OR rendered HTML — */}
      {/* children */}
      {children && isExpanded && !isEditing && (
        <div
          className={cn(
            'space-y-2 pb-2', // reduce vertical spacing between children
            section.type === 'heading' && 'px-6',
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}
