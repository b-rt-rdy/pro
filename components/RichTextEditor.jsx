// components/RichTextEditor.jsx
import React, { useRef, useEffect, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  CheckSquare,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';

const FONT_SIZES = [
  { label: 'Small', value: '12px' },
  { label: 'Normal', value: '16px' },
  { label: 'Large', value: '20px' },
  { label: 'X-Large', value: '28px' },
];
const FONT_FAMILIES = [
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Mono', value: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' },
  { label: 'Playfair', value: 'Playfair Display, serif' },
];
const COLORS = [
  '#2d1c0f', '#a67c52', '#bfae9b', '#4A3B2F', '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280', '#000000', '#ffffff'
];

/* ─── main editor component ───────────────────────────────── */
export default function RichTextEditor({ content, onChange, type = 'text' }) {
  const editorRef = useRef(null);
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [fontFamily, setFontFamily] = useState('');
  const [fontSize, setFontSize] = useState('16px');
  const [color, setColor] = useState('#000000');

  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content || '';
    }
  }, [content]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString();
    setSelectedText(text);
    setIsToolbarVisible(true);
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertHTML = (html) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const div = document.createElement('div');
      div.innerHTML = html;
      const fragment = document.createDocumentFragment();
      while (div.firstChild) {
        fragment.appendChild(div.firstChild);
      }
      range.insertNode(fragment);
      selection.removeAllRanges();
    }
    handleInput();
  };

  const insertCheckbox = () => {
    const checkboxHTML = `
      <div class="flex items-center gap-2 my-2">
        <input type="checkbox" class="rounded border-earth-300 text-accent focus:ring-accent" />
        <span contenteditable="true" class="flex-1">New task</span>
      </div>
    `;
    insertHTML(checkboxHTML);
  };

  const insertCodeBlock = () => {
    const codeHTML = `
      <pre class="bg-earth-100 rounded-lg p-4 my-4 overflow-x-auto">
        <code contenteditable="true" class="text-earth-800 font-mono text-sm">// Your code here</code>
      </pre>
    `;
    insertHTML(codeHTML);
  };

  const insertQuote = () => {
    const quoteHTML = `
      <blockquote class="border-l-4 border-accent pl-4 my-4 italic text-earth-600">
        <p contenteditable="true">Your quote here...</p>
      </blockquote>
    `;
    insertHTML(quoteHTML);
  };

  const ToolbarButton = ({ onClick, icon: Icon, title, isActive = false }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded hover:bg-earth-100 transition-colors ${
        isActive ? 'bg-earth-200 text-accent' : 'text-earth-600'
      }`}
      title={title}
    >
      <Icon size={16} />
    </button>
  );

  return (
    <div className="relative">
      {/* Full Toolbar */}
      <div className="flex flex-wrap gap-1 mb-2 items-center bg-white border border-earth-200 rounded-lg p-2 shadow-sm sticky top-0 z-10 w-full max-w-full overflow-x-auto">
        <ToolbarButton onClick={() => execCommand('bold')} icon={Bold} title="Bold" isActive={document.queryCommandState('bold')} />
        <ToolbarButton onClick={() => execCommand('italic')} icon={Italic} title="Italic" isActive={document.queryCommandState('italic')} />
        <ToolbarButton onClick={() => execCommand('underline')} icon={Underline} title="Underline" isActive={document.queryCommandState('underline')} />
        <ToolbarButton onClick={() => execCommand('insertUnorderedList')} icon={List} title="Bullet List" />
        <ToolbarButton onClick={() => execCommand('insertOrderedList')} icon={ListOrdered} title="Numbered List" />
        <ToolbarButton onClick={insertCheckbox} icon={CheckSquare} title="Todo" />
        <ToolbarButton onClick={insertQuote} icon={Quote} title="Quote" />
        <ToolbarButton onClick={insertCodeBlock} icon={Code} title="Code Block" />
        <div className="w-px h-6 bg-earth-200 mx-2" />
        {/* Font family */}
        <select
          value={fontFamily}
          onChange={e => { setFontFamily(e.target.value); execCommand('fontName', e.target.value); }}
          className="rounded px-2 py-1 border border-earth-200 text-xs focus:outline-accent"
          title="Font family"
        >
          {FONT_FAMILIES.map(f => (
            <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
          ))}
        </select>
        {/* Font size */}
        <select
          value={fontSize}
          onChange={e => { setFontSize(e.target.value); execCommand('fontSize', FONT_SIZES.findIndex(s => s.value === e.target.value) + 1); }}
          className="rounded px-2 py-1 border border-earth-200 text-xs focus:outline-accent"
          title="Font size"
        >
          {FONT_SIZES.map((s, i) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        {/* Color */}
        <input
          type="color"
          value={color}
          onChange={e => { setColor(e.target.value); execCommand('foreColor', e.target.value); }}
          className="w-6 h-6 rounded border border-earth-200 ml-2"
          title="Text color"
        />
        <button
          type="button"
          className="ml-1 px-2 py-1 rounded bg-earth-100 hover:bg-earth-200 text-xs text-earth-700"
          onClick={() => execCommand('removeFormat')}
          title="Clear formatting"
        >
          Clear
        </button>
      </div>
      {/* Main Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onMouseUp={handleSelection}
        onKeyUp={handleSelection}
        onBlur={() => setIsToolbarVisible(false)}
        className={`prose prose-earth max-w-full w-full min-h-[120px] p-4 rounded-lg border border-earth-200 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent overflow-x-auto`}
        style={{ lineHeight: '1.7', fontSize: fontSize, fontFamily: fontFamily, color: color }}
        placeholder="Start typing..."
      />
    </div>
  );
}
