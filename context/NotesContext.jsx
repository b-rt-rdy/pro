// context/NotesContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

const NotesContext = createContext();

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}

export function NotesProvider({ children }) {
  const [sections, setSections] = useState([
    {
      id: 'welcome-heading',
      type: 'heading',
      content: 'Welcome to Proibe Notes',
      parent: null,
      order: 0,
      collapsed: false,
      pinned: false,
      headingColor: '#4A3B2F',
      headingBold: true,
      headingItalic: false,
      headingUnderline: false,
      headingFont: '"Playfair Display", serif',
    },
    {
      id: 'intro-text',
      type: 'text',
      content:
        '<p>Start creating beautiful, organized notes with our Notion-inspired editor. Click on any section to begin editing, or use the sidebar to add new content blocks.</p>',
      parent: 'welcome-heading',
      order: 0,
    },
  ]);

  const [activeSection, setActiveSection] = useState('welcome-heading');

  // Generate unique ID for new sections
  const generateId = useCallback(() => {
    return `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Add a new section
  const addSection = useCallback(
    (type, parentId = null, beforeId = null) => {
      const siblings = sections.filter((s) => s.parent === parentId);
      let newOrder = siblings.length;
      let insertIndex = -1;
      if (beforeId) {
        const beforeSection = siblings.find((s) => s.id === beforeId);
        if (beforeSection) {
          newOrder = beforeSection.order;
          // Find the index in the main array where beforeSection is
          insertIndex = sections.findIndex((s) => s.id === beforeId);
        }
      }
      const newSection = {
        id: generateId(),
        type,
        content: getDefaultContent(type),
        parent: parentId,
        order: newOrder,
        collapsed: false,
        pinned: false,
      };
      if (type === 'heading' || type === 'subheading') {
        newSection.headingColor = '#4A3B2F';
        newSection.headingBold = true;
        newSection.headingItalic = false;
        newSection.headingUnderline = false;
        newSection.headingFont = '"Playfair Display", serif';
      }
      setSections((prev) => {
        let updated = [...prev];
        // If beforeId is specified, increment order of all siblings after or at newOrder
        if (beforeId) {
          updated = updated.map((s) => {
            if (s.parent === parentId && s.order >= newOrder) {
              return { ...s, order: s.order + 1 };
            }
            return s;
          });
          // Insert at the correct index in the array
          if (insertIndex !== -1) {
            updated.splice(insertIndex, 0, newSection);
          } else {
            updated.push(newSection);
          }
        } else {
          updated.push(newSection);
        }
        // Always re-sort siblings by order
        return updated.map((s) => {
          if (s.parent !== parentId) return s;
          // Recompute order for all siblings
          const sibs = updated
            .filter((x) => x.parent === parentId)
            .sort((a, b) => a.order - b.order);
          return { ...s, order: sibs.findIndex((x) => x.id === s.id) };
        });
      });
      return newSection.id;
    },
    [sections, generateId]
  );

  // Get default content for different section types
  const getDefaultContent = (type) => {
    switch (type) {
      case 'heading':
        return 'New Heading';
      case 'subheading':
        return 'New Subheading';
      case 'text':
        return '<p>New text section. Edit me!</p>';
      case 'table':
        return {
          rows: [
            ['Header 1', 'Header 2', 'Header 3'],
            ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
            ['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3'],
          ],
          hasHeader: true,
        };
      case 'image':
        return {
          url: '',
          alt: '',
          caption: '',
          width: 'auto',
          alignment: 'center',
        };
      case 'icon':
        return {
          icon: 'Star',
          text: 'Your text here',
          size: 'medium',
          color: '#C4A484',
          layout: 'horizontal',
        };
      case 'banner':
        return {
          text: 'This is an important announcement!',
          type: 'info',
          showIcon: true,
          dismissible: false,
        };
      default:
        return '';
    }
  };

  // Update section properties
  const updateSection = useCallback(
    (id, updates) => {
      setSections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      );
    },
    []
  );

  // Delete section and its children
  const deleteSection = useCallback(
    (id) => {
      setSections((prev) => {
        const toDelete = new Set([id]);
        const collectChildren = (parentId) => {
          prev.forEach((s) => {
            if (s.parent === parentId) {
              toDelete.add(s.id);
              collectChildren(s.id);
            }
          });
        };
        collectChildren(id);
        return prev.filter((s) => !toDelete.has(s.id));
      });
      if (activeSection === id) setActiveSection(null);
    },
    [activeSection]
  );

  // Get child sections of a parent
  const getChildSections = useCallback(
    (parentId) => sections.filter((s) => s.parent === parentId).sort((a, b) => a.order - b.order),
    [sections]
  );

  // Reorder sections
  const reorderSections = useCallback(
    (draggedId, targetId) => {
      setSections((prev) => {
        const dragged = prev.find((s) => s.id === draggedId);
        const target = prev.find((s) => s.id === targetId);

        if (!dragged || !target || dragged.parent !== target.parent) return prev;

        const next = [...prev];
        const draggedIndex = next.findIndex((s) => s.id === draggedId);
        const targetIndex = next.findIndex((s) => s.id === targetId);

        // Swap the order values
        [next[draggedIndex].order, next[targetIndex].order] = [
          next[targetIndex].order,
          next[draggedIndex].order,
        ];

        return next.sort((a, b) => a.order - b.order);
      });
    },
    [sections]
  );

  // Toggle section collapse
  const toggleCollapse = useCallback(
    (id) => {
      setSections((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, collapsed: !s.collapsed } : s
        )
      );
    },
    []
  );

  // Toggle section pin
  const togglePin = useCallback(
    (id) => {
      setSections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s))
      );
    },
    []
  );

  const value = {
    sections,
    activeSection,
    setActiveSection,
    addSection,
    updateSection,
    deleteSection,
    getChildSections,
    reorderSections,
    toggleCollapse,
    togglePin,
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
}
