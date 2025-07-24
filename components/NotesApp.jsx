// components/NotesApp.jsx
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import NoteEditor from './NoteEditor';
import { Book } from 'lucide-react';
import Header from './Header'; // Import the custom Header

export default function NotesApp() {
  // Add state for header background image
  const [headerBg, setHeaderBg] = useState(null); // URL or base64 string

  return (
    <div className="flex flex-col h-screen">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <Header headerBg={headerBg} setHeaderBg={setHeaderBg} />

      {/* ── Workspace ───────────────────────────────────────────── */}
      <main className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col items-stretch justify-start px-0 py-0">
          <div className="w-full h-full flex flex-col">
            <NoteEditor />
          </div>
        </div>
      </main>
    </div>
  );
}
