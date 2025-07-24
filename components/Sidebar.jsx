import React from 'react';
import {
  Plus,
  Heading1,
  Heading2,
  AlignLeft,
  Trash2,
  ChevronDown,
  ChevronRight,
  Star,
  Pin,
  Table,
  Image,
  Smile,
  Flag,
} from 'lucide-react';
import { GripVertical } from 'lucide-react';
import { useSensors, useSensor, PointerSensor, DndContext, rectIntersection } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';

import { motion } from 'framer-motion';
import { useNotes } from '../context/NotesContext';
import { cn } from '../utils/cn';          // helper to join classes

function EmptyStateMessage() {
  return (
    <div className="text-center p-4 text-earth-700">
      <Plus className="mx-auto mb-2 h-8 w-8" />
      <p className="text-sm">Add your first section</p>
    </div>
  );
}

export default function Sidebar() {
  const {
    sections,
    activeSection,
    setActiveSection,
    toggleCollapse,
    getChildSections,
    togglePin,
    updateSection,
  } = useNotes();

  const addSection = React.useCallback(useNotes().addSection, []);
  const deleteSection = React.useCallback(useNotes().deleteSection, []);
  const reorderSections = React.useCallback(useNotes().reorderSections, []);
  const pinnedSections = sections.filter((s) => s.pinned);
  const rootSections = getChildSections(null).filter((s) => !s.pinned);
  const [editingId, setEditingId]   = React.useState(null);  const [draftLabel, setDraftLabel] = React.useState('');  const [openedDuringDrag, setOpenedDuringDrag] = React.useState([]);  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    function allowedChildTypes(type) {
      if (type === 'heading')    return ['subheading','text','table','image','icon','banner'];
      if (type === 'subheading') return ['text','table','image','icon','banner'];
      return [];
    }
    function handleDragEnd(event) {
    const { active, over } = event;
    if (!active?.id || !over?.id) return;

    const dragged = sections.find((s) => s.id === active.id);
    const target  = sections.find((s) => s.id === over.id);
    if (!dragged || !target) return;
    if (
      target.type === 'heading' &&
      ['subheading', 'text'].includes(dragged.type)
    ) {
      updateSection(dragged.id, { parent: target.id });
    }
    else if (dragged.parent === target.parent) {
      // same‐parent ⇒ just reorder
      if (dragged.id !== target.id) {
        reorderSections(dragged.id, target.id);
      }
    }
    else {
      // different parent but same level target ⇒ move into its parent and reorder
      updateSection(dragged.id, { parent: target.parent });
      reorderSections(dragged.id, target.id);
    }

    // close any parents we auto-opened
    Array.from(new Set(openedDuringDrag)).forEach(toggleCollapse);
    setOpenedDuringDrag([]);
  }

    function handleDragStart(event) {
    const { active } = event;
    if (!active?.id) return;

    const dragged = sections.find((s) => s.id === active.id);
    if (!dragged) return;

    const parentId = dragged.parent;          // null for top-level headings
    if (!parentId) return;

    const parent = sections.find((s) => s.id === parentId);
    if (parent && parent.collapsed) {
        toggleCollapse(parentId);               // open it so we can see the child
        setOpenedDuringDrag((prev) => [...prev, parentId]);
    }
    }
 

   /* ---------- inline rename ---------- */
   function commitRename(id) {
    const trimmed = draftLabel.trim();
    updateSection(id, { content: trimmed || 'Untitled' });
    setEditingId(null);
    }

  /* ---------- helpers ---------- */
  
// Removed duplicate implementation of allowedChildTypes function
  const SectionIcon = (type) => {
    switch (type) {
      case 'heading':
        return <Heading1 className="h-4 w-4 text-earth-700" />;
      case 'subheading':
        return <Heading2 className="h-4 w-4 text-earth-700" />;
      case 'text':
        return <AlignLeft className="h-4 w-4 text-earth-700" />;
      case 'table':
        return <Table className="h-4 w-4 text-earth-700" />;
      case 'image':
        return <Image className="h-4 w-4 text-earth-700" />;
      case 'icon':
        return <Smile className="h-4 w-4 text-earth-700" />;
      case 'banner':
        return <Flag className="h-4 w-4 text-earth-700" />;
      default:
        return null;
    }
  };
function SortableRow({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,    
  } = useSortable({ id });

  const style = {
    transform: (transform && CSS.Translate && typeof CSS.Translate.toString === 'function') ? CSS.Translate.toString(transform) : undefined,
    transition,
    opacity: isDragging ? 0.6 : 1, 
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'shadow-lg' : ''}
      {...attributes}
      {...listeners}
    >
       {children}
     </div>
   );
        }

    React.useEffect(() => {
        function onKey(e) {
            // ignore if typing inside inputs/textareas
            const tag = document.activeElement.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;

            const mod  = e.metaKey || e.ctrlKey;      // Cmd ⌘  on mac, Ctrl on win/linux
            const alt  = e.altKey;                    // ⌥ / Alt
            const shft = e.shiftKey;

            /* ---------- add blocks ---------- */
            if (mod && !shft && !alt && e.key.toLowerCase() === 'h') {
            addSection('heading');                  // Cmd/Ctrl + H
            return e.preventDefault();
            }
            if (mod && shft && !alt && e.key.toLowerCase() === 'h') {
            // inside selected heading if possible
            const parent = activeSection
                ? sections.find((s) => s.id === activeSection)
                : null;
            if (parent?.type === 'heading' && parent.collapsed) toggleCollapse(parent.id);
            addSection('subheading', parent?.type === 'heading' ? parent.id : null);
            return e.preventDefault();
            }
            if (mod && !shft && !alt && e.key.toLowerCase() === 't') {
            const parent = activeSection
                ? sections.find((s) => s.id === activeSection)
                : null;
            if (parent?.collapsed) toggleCollapse(parent.id);
            addSection('text', parent?.id ?? null);
            return e.preventDefault();
            }

            /* ---------- rename ---------- */
            if (!mod && !shft && !alt && e.key === 'Enter' && !editingId) {
            setEditingId(activeSection);                    // starts inline edit
            const cur = sections.find((s) => s.id === activeSection);
            setDraftLabel(cur?.content ?? '');
            return;
            }

            /* ---------- delete ---------- */
            if (mod && !alt && (e.key === 'Backspace' || e.key === 'Delete')) {
            deleteSection(activeSection);
            return e.preventDefault();
            }

            /* ---------- move up / down (Cmd/Ctrl + Alt + ↑/↓) ---------- */
            if (mod && alt && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
            swapWithNeighbor(e.key === 'ArrowUp' ? 'up' : 'down');
            return e.preventDefault();
            }

            /* ---------- collapse / expand ---------- */
                if (!mod && alt && e.key === 'ArrowLeft') {            // Option / Alt  +  ←
                  toggleCollapse(activeSection);
                  return e.preventDefault();
                }
                if (!mod && alt && e.key === 'ArrowRight') {           // Option / Alt  +  →
                  const sec = sections.find((s) => s.id === activeSection);
                  if (sec?.collapsed) toggleCollapse(activeSection);
                  return e.preventDefault();
                }

            /* ---------- plain navigation (↑ / ↓) ---------- */
            if (!mod && !alt && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
            const flat = sections;                   // simple linear nav (visible-only nav skipped for brevity)
            const idx  = flat.findIndex((s) => s.id === activeSection);
            const next = flat[idx + (e.key === 'ArrowDown' ? 1 : -1)];
            if (next) setActiveSection(next.id);
            return e.preventDefault();
            }

            /* ---------- new sibling below ---------- */
            if (mod && !shft && e.key === 'Enter') {
            const cur = sections.find((s) => s.id === activeSection);
            if (!cur) return;
            addSiblingBelow(cur.type);
            return e.preventDefault();
            }
        }

        const debounce = (func, delay) => {
          let timeout;
          return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
          };
        };

        const debouncedOnKey = debounce(onKey, 200);
        window.addEventListener('keydown', debouncedOnKey);
        return () => window.removeEventListener('keydown', debouncedOnKey);
        }, [
        sections,
        activeSection,
        editingId,
        addSection,
        deleteSection,
        reorderSections,
        toggleCollapse,
        setActiveSection,
        setEditingId,
        updateSection,
            ]);

        /* ---------- keyboard helpers ---------- */
        function siblingsOf(id) {
        const cur = sections.find((s) => s.id === id);
        return cur ? sections.filter((x) => x.parent === cur.parent) : [];
        }

        function swapWithNeighbor(dir) {
        const sibs = siblingsOf(activeSection);
        const idx  = sibs.findIndex((s) => s.id === activeSection);
        const neighbor = dir === 'up' ? sibs[idx - 1] : sibs[idx + 1];
        if (neighbor) reorderSections(activeSection, neighbor.id);
        }

        function addSiblingBelow(type) {
        const cur  = sections.find((s) => s.id === activeSection);
        if (!cur) return;
        addSection(type, cur.parent);                // append to same parent
        // then move it right after current
        const sibs  = siblingsOf(activeSection);
        const added = sibs[sibs.length - 1];         // newly appended
        reorderSections(added.id, activeSection);    // swap once to move below
        }
// Removed unused wrapperIndent variable
 /* ---------- one row + its (optional) children ---------- */
const renderSection = (section, depth = 0, inPinned = false) => {
  // don’t render pinned items twice
  if (!inPinned && depth === 0 && section.pinned) return null;
// inside renderSection(...)
const INDENT = 16;  // px per nesting level
const indentUnit   = 16;   // how much each extra level nests
const baseIndent   = 24;   // the left padding of an H1 row (px-6 → 24px)
const wrapperIndent = baseIndent + depth * indentUnit;


  const children    = getChildSections(section.id);
  const hasChildren = children.length > 0;

  return (
    <motion.div
      key={section.id}
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
    >
      {/* ───────── ROW ───────── */}
      <div
      className={cn(
        `flex w-full items-center group
          py-2 px-4
          ${hasChildren && !section.collapsed
            ? 'rounded-t-md rounded-b-none mb-0'
            : 'rounded-md mb-2'}
          cursor-pointer bg-white shadow-sm transition-all duration-150`,
          activeSection === section.id
            ? 'bg-[#F9F7F5] ring-2 ring-accent/40'
            : 'hover:bg-[#FCFAF9] text-earth-700'
        )}
        onClick={() => setActiveSection(section.id)}
      >

        <GripVertical
          size={14}
          className="text-earth-700 opacity-0 group-hover:opacity-100 transition-opacity mr-1 cursor-grab"
        />

        {/* collapse/expand */}
        {hasChildren && (
          <button
            className="p-1 mr-1 hover:bg-earth-200 rounded"
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapse(section.id);
            }}
          >
            {section.collapsed ? (
              <ChevronRight size={14} />
            ) : (
              <ChevronDown size={14} />
            )}
          </button>
        )}

        {/* type icon */}
        <div
          onDoubleClick={(e) => {
            e.stopPropagation();
            setEditingId(section.id);
            setDraftLabel(section.content);
          }}
        >
          {SectionIcon(section.type)}
        </div>

        {/* label or inline edit */}
        {editingId === section.id && (section.type === 'heading' || section.type === 'subheading') ? (
          <input
            autoFocus
            spellCheck={false}
            value={draftLabel}
            onChange={(e) => setDraftLabel(e.target.value)}
            onBlur={() => commitRename(section.id)}
            onKeyDown={(e) => {
             if (e.key === 'Enter') {
               e.preventDefault();
               e.stopPropagation();
               commitRename(section.id);
             }
             if (e.key === "Escape") {
               if (['Enter', 'Escape'].includes(e.key)) {
                 e.stopPropagation();
               }
               setEditingId(null);
             }
           }}
            className={cn(
              "ml-3 flex-1 bg-transparent focus:outline-none",
              depth === 0
                ? "text-[15px] font-medium"
                : depth === 1
                ? "text-[14px]"
                : "text-[13px]"
            )}
          />
        ) : (
          <span
            onDoubleClick={(e) => {
              if (section.type === 'heading' || section.type === 'subheading') {
                e.stopPropagation();
                setEditingId(section.id);
                setDraftLabel(section.content);
              }
            }}
            className={cn(
              "ml-2 truncate flex-1",
              depth === 0
                ? "text-[15px] font-medium"
                : depth === 1
                ? "text-[14px]"
                : "text-[13px]"
            )}
          >
            {stripHtml(section.content, section.type) || `New ${section.type}`}
          </span>
        )}

        {/* toolbar (add/delete buttons) */}
        {editingId !== section.id && (
          <div className="ml-auto hidden group-hover:flex items-center gap-2 pointer-events-none">
            {/* pin */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePin(section.id);
              }}
              className="p-1 rounded hover:bg-peach-50 pointer-events-auto"
            >
              <Star
                size={18}
                className={section.pinned ? "text-accent" : "text-[#8A6F53]"}
                fill={section.pinned ? "currentColor" : "none"}
              />
            </button>

            {/* add subheading/text */}
            {allowedChildTypes(section.type).includes("subheading") && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (section.collapsed) toggleCollapse(section.id);
                  addSection("subheading", section.id);
                }}
                className="p-1 rounded bg-accent/40 hover:bg-accent/60 pointer-events-auto"
                title="Add subheading"
              >
                <Heading2 size={14} />
              </button>
            )}
            {allowedChildTypes(section.type).includes("text") && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (section.collapsed) toggleCollapse(section.id);
                  addSection("text", section.id);
                }}
                className="p-1 rounded bg-accent/40 hover:bg-accent/60 pointer-events-auto"
                title="Add text"
              >
                <AlignLeft size={14} />
              </button>
            )}

            {/* delete */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteSection(section.id);
              }}
              className="p-1 rounded hover:bg-peach-50 pointer-events-auto"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>

      {/* ───────── CHILDREN ───────── */}
      {hasChildren && !section.collapsed && editingId !== section.id && (
        <div className="relative w-full mb-2 bg-white rounded-b-md shadow-sm">
          {/* guide only spans real content */}
          <span className="absolute left-6 top-4 bottom-4 w-px bg-[#D6C4B3]" />

          {/* inner padding & vertical gutters */}
          <div className="pl-10 pr-4 py-4 space-y-2">
            <DndContext
              sensors={sensors}
              collisionDetection={rectIntersection}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={children.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {children.map((c) => (
                  <SortableRow key={c.id} id={c.id}>
                    {renderSection(c, depth + 1)}
                  </SortableRow>
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>
      )}
    </motion.div>
  );
};


// close the inline editor any time the user selects a new section
  React.useEffect(() => {
    setEditingId(null);
  }, [activeSection]);  

  /* ---------- sidebar wrapper ---------- */
  return (
    <div className="sm:w-[280px] md:w-[320px] lg:w-[360px] flex-shrink-0 bg-[#F7EDE2] px-4 py-6 overflow-y-auto sidebar-scroll border-r border-[#E8DFD6]">
      {/* header row */}
     {/* ---------- header row ---------- */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-[22px] font-serif font-semibold text-earth-700 mb-3">
          Sections
        </h2>

        <div className="flex gap-2 mt-1">
          {/* H1 */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 rounded-md bg-accent/40 hover:bg-accent/60 inline-flex items-center justify-center shadow-sm transition duration-150"
            onClick={() => addSection('heading')}
            title="Add heading"
          >
            <Heading1 size={14} />
          </motion.button>

          {/* H2 */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 rounded-md bg-accent/40 hover:bg-accent/60 inline-flex items-center justify-center shadow-sm transition duration-150"
            onClick={() => {
              const parent = activeSection
                ? sections.find((s) => s.id === activeSection)
                : null;
              if (parent?.type === 'heading') {
                if (parent.collapsed) toggleCollapse(parent.id);
                addSection('subheading', parent.id);
              } else {
                addSection('subheading');
              }
            }}
            title="Add subheading"
          >
            <Heading2 size={14} />
          </motion.button>

          {/* Text */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 rounded-md bg-accent/40 hover:bg-accent/60 inline-flex items-center justify-center shadow-sm transition duration-150"
            onClick={() => {
              const parent = activeSection
                ? sections.find((s) => s.id === activeSection)
                : null;
              if (parent && (parent.type === 'heading' || parent.type === 'subheading')) {
                if (parent.collapsed) toggleCollapse(parent.id);
                addSection('text', parent.id);
              } else {
                addSection('text');
              }
            }}
            title="Add text"
          >
            <AlignLeft size={14} />
          </motion.button>
        </div>
      </div>


    {/* pinned sections */}
    {pinnedSections.length > 0 && (
    <div className="mb-6">
        <h3 className="flex items-center text-[17px] font-serif font-medium mb-4 text-earth-700">
          <Pin size={16} className="mr-2 text-light-brown" />
          Pinned
        </h3>

        {pinnedSections.map((sec) => (
          <SortableRow key={sec.id} id={sec.id}>
            {renderSection(sec, 0, true)}   {/* ← tell it we’re in Pinned */}
          </SortableRow>
        ))}

        {/* divider */}
        <hr className="mt-6 border-t border-[#EADFD4]" />
      </div>
    )}

    
      {/* list */}
        <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        >
        <SortableContext
            items={rootSections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
        >
            {rootSections.map((sec) => (
            <SortableRow key={sec.id} id={sec.id}>
                {renderSection(sec, 0)}
            </SortableRow>
            ))}
        </SortableContext>

        {/* empty-state message stays outside SortableContext */}
        {rootSections.length === 0 && <EmptyStateMessage />}
        </DndContext>


    </div>
  );
}

// Utility to strip HTML tags
function stripHtml(html, type) {
  if (!html) return '';
  if (typeof html === 'string') {
    return html.replace(/<[^>]+>/g, '').trim();
  }
  switch (type) {
    case 'table':
      return 'Table';
    case 'image':
      return 'Image';
    case 'icon':
      return 'Icon';
    case 'banner':
      return 'Banner';
    default:
      return '';
  }
}
