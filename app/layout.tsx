// app/layout.tsx
import type { Metadata } from 'next';
import { GeistSans, GeistMono } from 'geist/font';   // ← Correct modern import
import './globals.css';
import Chatbot from './components/Chatbot';

export const metadata: Metadata = {
  title: 'BIOF3003 - ECG Stress Detection',
  description: 'Wearable ECG + Heart Rate Real-time Stress Monitoring App',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        {children}
        
        {/* Floating StressGuard Chatbot - visible on every page */}
        <Chatbot />
      </body>
    </html>
  );
}