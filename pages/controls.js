import Head from 'next/head';
import Link from 'next/link';
import { SlidersHorizontal, ArrowLeft } from 'lucide-react';

export default function Controls() {
  return (
    <>
      <Head>
        <title>Proibe Controls</title>
        <meta name="description" content="Proibe: Controls and keyboard shortcuts." />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-soft-peach to-pale-beige flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-xl w-full text-center">
          <Link href="/landing" legacyBehavior>
            <a className="flex items-center gap-2 mb-6 text-black font-semibold hover:underline">
              <ArrowLeft size={20} className="text-black" />
              Back to Landing
            </a>
          </Link>
          <div className="flex items-center justify-center gap-2 mb-4">
            <SlidersHorizontal size={32} className="text-accent" />
            <h1 className="text-3xl font-bold font-playfair text-earth-800">Controls & Shortcuts</h1>
          </div>
          <div className="bg-white/80 rounded-lg shadow p-6 text-left mx-auto">
            <ul className="list-disc list-inside space-y-2 text-earth-800">
              <li><b>Drag & Drop:</b> Move blocks by dragging the handle on the left.</li>
              <li><b>Edit:</b> Click any block to edit its content.</li>
              <li><b>Delete:</b> Hover a block and click the trash icon to remove it.</li>
              <li><b>Add Block:</b> Hover between blocks and click the plus (+) button.</li>
              <li><b>Export:</b> Use the Export as PDF button in the app header.</li>
              <li><b>Table Controls:</b> Hover table headers/rows for delete buttons.</li>
              <li><b>Lofi Player:</b> Click the floating music button (bottom right) to play background music.</li>
            </ul>
            <div className="mt-8">
              <h2 className="text-lg font-bold mb-2">Keyboard Shortcuts</h2>
              <ul className="list-none space-y-1 text-earth-800">
                <li><span className="font-mono bg-earth-100 px-2 py-0.5 rounded">Enter</span> — Save block or confirm edit</li>
                <li><span className="font-mono bg-earth-100 px-2 py-0.5 rounded">Esc</span> — Cancel editing</li>
                <li><span className="font-mono bg-earth-100 px-2 py-0.5 rounded">Tab</span> — Indent heading (when editing title)</li>
                <li><span className="font-mono bg-earth-100 px-2 py-0.5 rounded">Shift + Tab</span> — Outdent heading (when editing title)</li>
                <li><span className="font-mono bg-earth-100 px-2 py-0.5 rounded">Cmd/Ctrl + B</span> — Bold (in text editor)</li>
                <li><span className="font-mono bg-earth-100 px-2 py-0.5 rounded">Cmd/Ctrl + I</span> — Italic (in text editor)</li>
                <li><span className="font-mono bg-earth-100 px-2 py-0.5 rounded">Cmd/Ctrl + U</span> — Underline (in text editor)</li>
                <li><span className="font-mono bg-earth-100 px-2 py-0.5 rounded">Cmd/Ctrl + Z</span> — Undo (in text editor)</li>
                <li><span className="font-mono bg-earth-100 px-2 py-0.5 rounded">Cmd/Ctrl + Shift + Z</span> — Redo (in text editor)</li>
                <li><span className="font-mono bg-earth-100 px-2 py-0.5 rounded">Cmd/Ctrl + A</span> — Select all (in text editor)</li>
                <li><span className="font-mono bg-earth-100 px-2 py-0.5 rounded">Cmd/Ctrl + C</span> — Copy (in text editor)</li>
                <li><span className="font-mono bg-earth-100 px-2 py-0.5 rounded">Cmd/Ctrl + V</span> — Paste (in text editor)</li>
                <li><span className="font-mono bg-earth-100 px-2 py-0.5 rounded">Cmd/Ctrl + X</span> — Cut (in text editor)</li>
              </ul>
            </div>
            <div className="mt-6 text-sm text-earth-600">
              For more help, see the <a href="https://github.com/vishwakaran/Proibe_project" target="_blank" rel="noopener noreferrer" className="underline text-accent">GitHub README</a>.
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
