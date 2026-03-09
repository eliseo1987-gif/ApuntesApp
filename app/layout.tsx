import type {Metadata} from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/sidebar';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-display' });

export const metadata: Metadata = {
  title: 'StudySync - Apuntes y Estudio',
  description: 'Guarda tus apuntes y genera material de estudio con IA.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="es" className={`${inter.variable} ${outfit.variable}`}>
      <body className="bg-slate-50 font-sans text-slate-900 antialiased" suppressHydrationWarning>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 lg:ml-64 p-4 sm:p-8 pt-20 lg:pt-8 w-full max-w-[100vw] overflow-x-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
