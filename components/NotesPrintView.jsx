import React from 'react';
import { useNotes } from '../context/NotesContext';

function PrintSection({ section, getChildSections, level = 1, parentType = null, isFirst = false }) {
  if (!section) return null;
  const children = getChildSections(section.id);
  let Tag = 'div';
  let tagProps = {};
  // Default block spacing
  let style = {
    marginBottom: 22,
    marginTop: isFirst ? 0 : 18,
    paddingLeft: 0,
    paddingTop: 2,
    paddingBottom: 2,
    width: '100%',
    boxSizing: 'border-box',
    position: 'relative',
  };

  // Subheading (box, styled heading, plain children, equal padding)
  if (section.type === 'subheading') {
    return (
      <div style={{
        background: '#fff',
        border: '1.5px solid #e8ded4',
        borderRadius: 16,
        padding: '16px 20px', // equal top/bottom padding
        marginBottom: 22,
        marginTop: isFirst ? 0 : 18,
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative',
      }}>
        <h2 style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 700,
          fontSize: '1.25rem',
          margin: 0,
          marginBottom: 8,
          color: section.headingColor || '#bfae9b',
          textDecoration: section.headingUnderline ? 'underline' : undefined,
          fontStyle: section.headingItalic ? 'italic' : undefined,
          letterSpacing: '-0.5px',
          textAlign: 'left',
          lineHeight: 1.3,
        }}>{section.content}</h2>
        {children && children.length > 0 && (
          <div style={{ marginTop: 0 }}>
            {children.map((child, idx) => (
              <PrintSection key={child.id} section={child} getChildSections={getChildSections} level={level + 1} parentType={section.type} isFirst={idx === 0} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Table (no delete column buttons)
  if (section.type === 'table' && section.content && section.content.rows) {
    const rows = section.content.rows;
    const hasHeader = section.content.hasHeader;
    return (
      <div style={{
        background: '#fff',
        border: '1.5px solid #e8ded4',
        borderRadius: 16,
        padding: '16px 20px',
        marginBottom: 22,
        marginTop: isFirst ? 0 : 18,
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative',
      }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', margin: '0', fontSize: 15 }}>
          <thead>
            <tr>
              {rows[0].map((cell, colIdx) => (
                <th key={colIdx} style={{ border: '1px solid #e8ded4', padding: '6px 10px', background: hasHeader ? '#f7ede2' : '#fff', fontWeight: 600, position: 'relative' }}>
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(1).map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} style={{ border: '1px solid #e8ded4', padding: '6px 10px', background: '#fff', fontWeight: 400 }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Text
  if (section.type === 'text') {
    Tag = 'div';
    tagProps = { style: { fontFamily: 'Inter, sans-serif', fontSize: '1.05rem', marginBottom: '0.5em', color: '#2d1c0f', lineHeight: 1.7 }, dangerouslySetInnerHTML: { __html: section.content || '' } };
    if (parentType === 'heading') {
      style.background = '#fff';
      style.border = '1.5px solid #e8ded4';
      style.borderRadius = 12;
      style.padding = '12px 16px 8px 16px';
      style.marginBottom = 10;
      style.boxShadow = '0 1px 4px 0 rgba(92,67,46,0.02)';
      style.width = '100%';
      style.boxSizing = 'border-box';
    } else {
      style.background = 'none';
      style.border = 'none';
      style.borderRadius = 0;
      style.padding = 0;
      style.marginBottom = 10;
      style.boxShadow = 'none';
      style.width = '100%';
      style.boxSizing = 'border-box';
    }
  }

  // Image
  if (section.type === 'image' && section.content && section.content.url) {
    Tag = 'figure';
    tagProps = { style: { textAlign: section.content.alignment || 'center', margin: 0 } };
    style.background = 'none';
    style.border = 'none';
    style.boxShadow = 'none';
    style.padding = 0;
    style.marginBottom = 18;
  }

  // Icon
  if (section.type === 'icon' && section.content) {
    Tag = 'div';
    tagProps = { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, color: section.content.color || '#3B82F6', fontWeight: 500 } };
    style.background = 'none';
    style.border = 'none';
    style.boxShadow = 'none';
    style.padding = 0;
    style.marginBottom = 12;
  }

  // Banner
  if (section.type === 'banner' && section.content) {
    Tag = 'div';
    let bannerBg = section.content.color ||
      (section.content.type === 'info' ? '#e0f7fa' :
       section.content.type === 'warning' ? '#fff3cd' :
       section.content.type === 'success' ? '#d1f7c4' :
       section.content.type === 'danger' ? '#ffe0e0' :
       '#e6e6e6');
    let bannerColor = section.content.textColor || '#333';
    tagProps = { style: { background: bannerBg, color: bannerColor, borderRadius: 8, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, fontWeight: 500, border: '1.5px solid #e8ded4' } };
    style.background = 'none';
    style.border = 'none';
    style.boxShadow = 'none';
    style.padding = 0;
    style.marginBottom = 14;
  }

  // Other block types (image, icon, banner, text, etc.)
  return (
    <div style={style}>
      {/* Render block content by type */}
      {section.type === 'image' && section.content && section.content.url ? (
        <figure style={{ textAlign: section.content.alignment || 'center', margin: 0 }}>
          <img src={section.content.url} alt={section.content.alt || ''} style={{ maxWidth: '100%', width: section.content.width || 'auto', borderRadius: 8, margin: '0 auto' }} />
          {section.content.caption && <figcaption style={{ fontSize: 13, color: '#8A6F53', marginTop: 4 }}>{section.content.caption}</figcaption>}
        </figure>
      ) : section.type === 'icon' && section.content ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, color: section.content.color || '#3B82F6', fontWeight: 500 }}>
          <span style={{ fontSize: 28, marginRight: 6 }}>{getIconEmoji(section.content.icon)}</span>
          <span>{section.content.text}</span>
        </div>
      ) : section.type === 'banner' && section.content ? (
        <div style={tagProps.style}>
          {section.content.showIcon && <span style={{ fontSize: 22, marginRight: 8 }}>⚑</span>}
          <span>{section.content.text}</span>
        </div>
      ) : section.type === 'table' && section.content && section.content.rows ? (
        <table style={{ borderCollapse: 'collapse', width: '100%', margin: '10px 0', fontSize: 15 }}>
          <tbody>
            {section.content.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} style={{ border: '1px solid #e8ded4', padding: '6px 10px', background: i === 0 && section.content.hasHeader ? '#f7ede2' : '#fff', fontWeight: i === 0 && section.content.hasHeader ? 600 : 400 }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        // Only render section.content directly for string-based types
        ["heading", "subheading", "text"].includes(section.type) ? (
          <Tag {...tagProps}>{section.type === 'text' ? null : section.content}</Tag>
        ) : null
      )}
      {children && children.length > 0 && (
        <div style={{ marginTop: 0 }}>
          {children.map((child, idx) => (
            <PrintSection key={child.id} section={child} getChildSections={getChildSections} level={level + 1} parentType={section.type} isFirst={idx === 0} />
          ))}
        </div>
      )}
    </div>
  );
}

// Helper: map icon name to emoji (fallback to star)
function getIconEmoji(name) {
  if (!name) return '★';
  const map = {
    Star: '★',
    Smile: '😊',
    Flag: '⚑',
    CheckSquare: '☑️',
    Image: '🖼️',
    Table: '📊',
    Type: '✏️',
    Heading1: '🔠',
    Heading2: '🔡',
    Code: '💻',
    Quote: '❝',
  };
  return map[name] || '★';
}

export default function NotesPrintView({ rootId, style = {} }) {
  const { sections, getChildSections } = useNotes();
  const rootSection = sections.find(s => s.id === rootId);
  if (!rootSection) return null;
  return (
    <div
      className="bg-white p-8 max-w-4xl mx-auto"
      style={{
        fontFamily: '"Inter", sans-serif',
        lineHeight: '1.6',
        color: '#4A3B2F',
        ...style
      }}
    >
      <PrintSection section={rootSection} getChildSections={getChildSections} />
    </div>
  );
}

export function getPdfBookmarks(sections, getChildSections, rootId, depth = 0) {
  const section = sections.find(s => s.id === rootId);
  if (!section) return [];

  const bookmarks = [];
  
  if (section.type === 'heading' || section.type === 'subheading') {
    bookmarks.push({
      title: section.content || 'Untitled',
      level: depth,
      id: section.id,
      children: getPdfBookmarks(sections, getChildSections, section.id, depth + 1)
    });
  }

  // Always recurse for children
  bookmarks.push(...getPdfBookmarks(sections, getChildSections, section.id, depth + 1));

  return bookmarks;
}
