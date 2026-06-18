import type { Metadata } from 'next';
import '@/styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { AuthModalProvider } from '@/context/AuthModalContext';
import Header from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'ResumeAI — Optimize Your Resume with AI',
  description:
    'AI-powered resume optimization to help you land your dream job. Beat ATS systems and impress recruiters in minutes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthModalProvider>
          <Header />
          {children}
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        </AuthModalProvider>
      </body>
    </html>
  );
}
