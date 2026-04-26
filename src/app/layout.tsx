// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Sidebar } from '@/components/ui/sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LeadHunt AI — Find Your Next Client',
  description: 'AI-powered lead discovery for freelancers and agencies',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#0a0a0f] text-slate-100 antialiased`}>
        <ThemeProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 min-h-screen">
              {children}
            </main>
          </div>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
