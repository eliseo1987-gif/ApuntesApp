import type { Metadata } from 'next';
import { Inter, Outfit, Montserrat, Merriweather } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/sidebar';
import AITooltip from '@/components/ai/AITooltip';
import ThemeProvider from '@/components/ThemeProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' });
const merriweather = Merriweather({ subsets: ['latin'], weight: ['300', '400', '700'], variable: '--font-merriweather' });

export const metadata: Metadata = {
  title: 'StudySync - Apuntes y Estudio',
  description: 'Guarda tus apuntes y genera material de estudio con IA.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${outfit.variable} ${montserrat.variable} ${merriweather.variable}`}>
      <body className="bg-[var(--color-background)] font-custom text-slate-900 antialiased transition-colors duration-300" suppressHydrationWarning>
        <ThemeProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 lg:ml-64 p-4 sm:p-8 pt-20 lg:pt-8 w-full max-w-[100vw] overflow-x-hidden">
              {children}
              <AITooltip />
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
