import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { MobileNav } from '@/components/ui/mobile-nav';
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
          {/* Desktop sidebar */}
          <div className="hidden md:flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 min-h-screen">
              {children}
            </main>
          </div>
          {/* Mobile layout */}
          <div className="md:hidden min-h-screen flex flex-col">
            <main className="flex-1 pb-20">
              {children}
            </main>
            <MobileNav />
          </div>
        </ThemeProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}