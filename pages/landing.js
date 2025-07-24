import Head from 'next/head';
import Link from 'next/link';
import { BookOpen, SlidersHorizontal, Sparkles, MousePointerClick, Image as ImageIcon, Music, LayoutGrid, FileText } from 'lucide-react';

export default function Landing() {
  return (
    <>
      <Head>
        <title>Proibe – Beautiful Note-Taking</title>
        <meta name="description" content="Proibe: Beautiful, modern, block-based note-taking for everyone." />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-soft-peach to-pale-beige flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full text-center">
          {/* Remove the top Proibe logo/button on landing page */}
          {/* <Link href="/landing" legacyBehavior>
            <a className="flex items-center justify-center gap-2 mb-6 group hover:opacity-80 transition">
              <BookOpen size={40} className="text-accent drop-shadow" />
              <span className="text-4xl font-playfair font-bold text-earth-900 group-hover:text-accent transition">Proibe</span>
            </a>
          </Link> */}
          <h1 className="text-5xl md:text-6xl font-extrabold font-playfair text-earth-900 mb-4 drop-shadow-lg">
            Welcome to <span className="text-earth-900 font-extrabold">Proibe</span>
          </h1>
          <p className="text-xl md:text-2xl text-earth-700 mb-8">
            Effortless, beautiful note-taking for creative minds.<br />
            Organize, visualize, and enjoy your ideas.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-10">
            <Link href="/app" legacyBehavior>
              <a className="px-8 py-3 bg-accent text-white rounded-lg shadow-lg text-lg font-semibold hover:bg-accent/90 transition">
                Open App
              </a>
            </Link>
            <Link href="/controls" legacyBehavior>
              <a className="px-8 py-3 bg-earth-200 text-earth-800 rounded-lg shadow text-lg font-semibold hover:bg-earth-300 transition flex items-center gap-2">
                <SlidersHorizontal size={18} />
                Controls
              </a>
            </Link>
            <a href="https://github.com/Vishwakaran12/proibe" target="_blank" rel="noopener noreferrer" className="px-8 py-3 bg-earth-200 text-earth-800 rounded-lg shadow text-lg font-semibold hover:bg-earth-300 transition">
              GitHub
            </a>
          </div>
          {/* Redesigned Features Section */}
          <div className="mt-10 text-earth-700 text-base">
            <span className="font-semibold text-lg flex items-center justify-center gap-2 mb-2"><Sparkles size={18} className="text-accent" /> Why you'll love Proibe</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4 text-left mx-auto max-w-2xl">
              <div className="flex items-start gap-3">
                <LayoutGrid size={22} className="text-accent mt-1" />
                <div>
                  <b>Flexible Blocks</b>
                  <div className="text-sm">Mix text, images, icons, tables, and banners—your way.</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MousePointerClick size={22} className="text-accent mt-1" />
                <div>
                  <b>Intuitive Editing</b>
                  <div className="text-sm">Click, drag, and drop to arrange and edit with zero friction.</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ImageIcon size={22} className="text-accent mt-1" />
                <div>
                  <b>Visual Exports</b>
                  <div className="text-sm">Print or save your notes as beautiful, shareable PDFs.</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Music size={22} className="text-accent mt-1" />
                <div>
                  <b>Lofi Focus</b>
                  <div className="text-sm">Built-in music player for a calm, creative workspace.</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText size={22} className="text-accent mt-1" />
                <div>
                  <b>Print-Ready</b>
                  <div className="text-sm">Export clean, readable notes for sharing or archiving.</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles size={22} className="text-accent mt-1" />
                <div>
                  <b>Modern & Responsive</b>
                  <div className="text-sm">Enjoy a sleek, adaptive UI on any device.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
