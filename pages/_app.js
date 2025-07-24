import Head from 'next/head';
 import '../styles/globals.css';
 import { NotesProvider } from '../context/NotesContext';

 export default function MyApp({ Component, pageProps }) {
   return (
    <>

      <NotesProvider>
        <Component {...pageProps} />
      </NotesProvider>
    </>
  );
}
