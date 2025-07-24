import dynamic from 'next/dynamic';
import Head from 'next/head';
import LofiCircle from '../components/LofiCircle';

const NotesApp = dynamic(() => import('../components/NotesApp'), { ssr: false });

export default function AppPage() {
  return (
    <>
      <Head>
        <title>Proibe App</title>
        <meta name="description" content="Proibe: Beautiful, modern, block-based note-taking app." />
      </Head>
      <LofiCircle />
      <NotesApp />
    </>
  );
}
