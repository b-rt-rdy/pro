import React, { useState } from 'react';
import {
  DndContext,
  closestCorners,
  rectIntersection,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import SortableSection from './SortableSection.jsx'
import GapButton from './GapButton'
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import NotesPrintView, { getPdfBookmarks } from './NotesPrintView';
import { useNotes } from '../context/NotesContext'
import ExportPDFDialog from './ExportPDFDialog';

export default function NoteEditor() {
  const {
    sections,
    activeSection,
    updateSection,
    reorderSections,
    getChildSections,
    setActiveSection,
  } = useNotes()

  const [draggingId, setDraggingId] = React.useState(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  // Track which block is being edited (for all block types)
  const [editingBlockId, setEditingBlockId] = React.useState(null);

  // Clear editingBlockId when activeSection changes to a non-leaf section
  React.useEffect(() => {
    const picked = sections.find((s) => s.id === activeSection);
    if (picked && !['text','table','image','icon','banner'].includes(picked.type)) {
      setEditingBlockId(null);
    }
  }, [activeSection, sections]);

  function handleDragStart({ active }) {
    setDraggingId(active.id)
  }

  function handleDragEnd({ active, over }) {
    setDraggingId(null)
    if (!active?.id || !over?.id) return

    const dragged = sections.find((s) => s.id === active.id)
    const target  = sections.find((s) => s.id === over.id)
    if (!dragged || !target) return

    // 1) onto heading → reparent
    if (target.type === 'heading' && ['subheading','text','table','image','icon','banner'].includes(dragged.type)) {
      updateSection(dragged.id, { parent: target.id })
      return
    }
    // 2) onto subheading → reparent text and other blocks
    if (target.type === 'subheading' && ['text','table','image','icon','banner'].includes(dragged.type)) {
      updateSection(dragged.id, { parent: target.id })
      return
    }
    // 3) same parent → reorder
    if (dragged.parent === target.parent) {
      if (dragged.id !== target.id) reorderSections(dragged.id, target.id)
      return
    }
    // 4) other → move + reorder
    updateSection(dragged.id, { parent: target.parent })
    reorderSections(dragged.id, target.id)
  }

  // pick which section to render
  const picked       = sections.find((s) => s.id === activeSection) || {}
  const rootId       = picked.type === 'text' ? picked.id : activeSection
  const rootSection  = sections.find((s) => s.id === rootId)

  // --- Helper: render a tree of sections ---
  function renderTree(sectionId, parentType = null) {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return null

    // If it's a leaf block type, render only itself (no children)
    if ([
      'text',
      'table',
      'image',
      'icon',
      'banner',
    ].includes(section.type)) {
      return (
        <SortableSection
          key={section.id}
          section={section}
          onSave={(id, newContent) => {
            updateSection(id, { content: newContent })
            // After save, go back to parent section if any, else stay
            const parentSection = sections.find(s => s.id === section.parent);
            setActiveSection(parentSection ? parentSection.id : section.id);
            setEditingBlockId(null)
          }}
          isEditing={editingBlockId === section.id}
          onEdit={(id) => setEditingBlockId(id)}
        />
      )
    }

    const kids = getChildSections(section.id)

    // For headings and subheadings, render all block types as children with gaps between
    // --- FIX: wrap each group of children in a SortableContext so nested drag-and-drop works ---
    return (
      <SortableSection
        key={section.id}
        section={section}
        onSave={(id, newContent) => {
          updateSection(id, { content: newContent })
        }}
      >
        <SortableContext
          items={kids.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {/* Render GapButton before each child and after last child */}
          {kids.length === 0 && <GapButton parentId={section.id} />}
          {kids.map((child, idx) => (
            <React.Fragment key={child.id}>
              <GapButton parentId={section.id} beforeId={child.id} />
              {renderTree(child.id, section.type)}
              {idx === kids.length - 1 && <GapButton parentId={section.id} />}
            </React.Fragment>
          ))}
        </SortableContext>
      </SortableSection>
    )
  }

  function collisionDetectionStrategy(args) {
    const item = sections.find((s) => s.id === draggingId)
    return item?.type !== 'heading'
      ? closestCorners(args)
      : rectIntersection(args)
  }

  // PDF Export handler
  const exportRef = React.useRef();

  async function handleExportPDF(options) {
    if (!exportRef.current) return;
    const canvas = await html2canvas(exportRef.current, {
      backgroundColor: '#F1EEEB',
      scale: 2,
      useCORS: true,
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgProps = { width: canvas.width, height: canvas.height };
    const ratio = Math.min(pageWidth / imgProps.width, pageHeight / imgProps.height);
    const imgWidth = imgProps.width * ratio;
    const imgHeight = imgProps.height * ratio;
    pdf.addImage(imgData, 'PNG', (pageWidth - imgWidth) / 2, 40, imgWidth, imgHeight);

    // Add PDF bookmarks (outlines) for headings/subheadings
    if (rootSection && pdf.outline && typeof pdf.outline.add === 'function' && Array.isArray(pdf.outline)) {
      const bookmarks = getPdfBookmarks(sections, getChildSections, rootSection.id, 0);
      function addOutline(items, parent) {
        for (const item of items) {
          const ref = pdf.outline.add(item.title, { pageNumber: 1 }, parent);
          if (item.children && item.children.length > 0) {
            addOutline(item.children, ref);
          }
        }
      }
      addOutline(bookmarks, null);
    }
    pdf.save('proibe-notes.pdf');
  }

  const [showExportDialog, setShowExportDialog] = useState(false);

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-soft-peach to-pale-beige overflow-hidden">
      <div className="flex items-center justify-end px-4 pt-4 gap-2">
        <button
          onClick={() => setShowExportDialog(true)}
          className="px-4 py-2 bg-accent text-white rounded shadow hover:bg-accent/80 transition"
        >
          Export as PDF
        </button>
      </div>
      {/* Export PDF Dialog */}
      <ExportPDFDialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onExport={opts => {
          setShowExportDialog(false);
          handleExportPDF(opts);
        }}
        previewContent={<NotesPrintView rootId={rootSection?.id} style={{ boxShadow: 'none', border: 'none', margin: 0, background: 'transparent' }} />}
        defaultOptions={{}}
      />
      {/* Main interactive editor UI as before */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* Hidden print view for PDF export only (off-screen, but visible to html2canvas) */}
        <div style={{ position: 'absolute', left: '-200vw', top: 0, width: '900px', minHeight: '100px', pointerEvents: 'none', zIndex: -1, opacity: 1 }}>
          <div ref={exportRef} id="pdf-print-view">
            {rootSection && <NotesPrintView rootId={rootSection.id} />}
          </div>
        </div>
        {rootSection ? (
          <DndContext
            sensors={sensors}
            collisionDetection={collisionDetectionStrategy}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {/* Only wrap the root's children in SortableContext, not all sections */}
            <SortableContext
              items={getChildSections(rootSection.id).map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {renderTree(rootSection.id)}
            </SortableContext>
            <DragOverlay>
              {draggingId && (
                <SortableSection
                  section={sections.find((s) => s.id === draggingId)}
                  onSave={() => {}}
                  isDraggingOverlay
                />
              )}
            </DragOverlay>
          </DndContext>
        ) : (
          <p className="text-earth-700 italic">
            Select a heading or subheading to begin editing…
          </p>
        )}
      </div>
    </div>
  );
}
