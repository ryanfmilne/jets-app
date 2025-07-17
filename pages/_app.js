import { AuthProvider } from '../lib/auth';
import { Toaster } from 'react-hot-toast';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}