'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, BookOpen, PenTool, Sparkles, Settings, GraduationCap } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Calendario', href: '/calendar', icon: Calendar },
  { name: 'Mis Apuntes', href: '/notes', icon: BookOpen },
  { name: 'Estudio IA', href: '/study', icon: Sparkles },
  { name: 'Calificaciones', href: '/grades', icon: GraduationCap },
  { name: 'Configuración', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 flex items-center space-x-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <PenTool className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">StudySync</h1>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors",
                isActive 
                  ? "bg-indigo-50 text-indigo-600 font-semibold" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-indigo-600" : "text-gray-400")} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <div className="flex items-center space-x-3 px-4 py-2">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
            E
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Estudiante</p>
            <p className="text-xs text-gray-500">Plan Premium</p>
          </div>
        </div>
      </div>
    </div>
  );
}
