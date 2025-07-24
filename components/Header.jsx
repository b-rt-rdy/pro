import React, { useRef } from 'react';
import { BookOpen, Image as ImageIcon, X } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
};
const item = {
  hidden: { opacity: 0, y: -10 },
  show:  { opacity: 1, y:  0, transition: { type: 'spring', stiffness: 120, damping: 20 } }
};

export default function Header({ headerBg, setHeaderBg }) {
  const fileInputRef = useRef();

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setHeaderBg(ev.target.result);
    };
    reader.readAsDataURL(file);
  }

  function handleRemove() {
    setHeaderBg(null);
  }

  return (
    <header
      className="relative overflow-hidden bg-earth-200 border-b border-accent/40 min-h-[180px] flex items-end group"
      style={headerBg ? { backgroundImage: `url(${headerBg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
    >
      {/* Overlay for readability */}
      {headerBg && <div className="absolute inset-0 bg-black/30 pointer-events-none" />}
      {/* blurred glow */}
      <div className="absolute -top-32 -right-32 w-72 h-72 bg-accent rounded-full opacity-30 blur-3xl animate-pulse z-10" />

      {/* Banner image upload button: top right, hover only */}
      <div className="absolute top-3 right-4 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="flex items-center gap-1 px-3 py-1.5 bg-white/80 hover:bg-white/90 rounded shadow text-earth-700 text-xs font-medium"
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          title={headerBg ? 'Change banner image' : 'Add banner image'}
        >
          <ImageIcon size={16} />
          {headerBg ? 'Change Banner' : 'Add Banner'}
        </button>
        {headerBg && (
          <button
            className="flex items-center px-2 py-1 bg-red-100 hover:bg-red-200 rounded text-red-600 text-xs"
            onClick={handleRemove}
            title="Remove banner image"
          >
            <X size={14} />
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <motion.div
        className="relative z-20 flex items-center justify-between px-10 py-6 w-full"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* logo + name */}
        <motion.div variants={item} className="flex items-center space-x-3">
          <Link href="/landing" legacyBehavior>
            <a className="flex items-center gap-2 group hover:opacity-80 transition">
              <BookOpen size={28} className="text-earth-700 drop-shadow group-hover:text-accent transition" />
              <h1 className="text-3xl font-playfair font-bold text-earth-100 drop-shadow-lg group-hover:text-accent transition">
                Proibe
              </h1>
            </a>
          </Link>
        </motion.div>

        {/* tagline with underline */}
        <motion.div variants={item} className="relative inline-block">
          <p className="text-sm italic text-earth-100 drop-shadow">
            Beautiful note-taking made simple
          </p>
          <motion.span
            className="absolute left-0 bottom-0 h-[2px] bg-earth-100"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.6, duration: 0.8, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </header>
  );
}
