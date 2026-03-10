'use client';

import { useEffect, useState } from 'react';
import { subscribeToTheme, ThemePreference } from '@/lib/store';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<ThemePreference | null>(null);

    useEffect(() => {
        const unsubscribe = subscribeToTheme((loadedTheme) => {
            setTheme(loadedTheme);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!theme) return;

        const root = document.documentElement;

        // Apply CSS Variables
        root.style.setProperty('--color-primary', theme.primaryColor);
        root.style.setProperty('--color-background', theme.backgroundColor);

        // Convert hex to rgb for rgba cases
        const hex2rgb = (hex: string) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `${r}, ${g}, ${b}`;
        };
        root.style.setProperty('--color-primary-rgb', hex2rgb(theme.primaryColor));

        // Apply font family
        if (theme.fontFamily === 'Inter') {
            root.style.setProperty('--font-custom', 'var(--font-inter)');
        } else if (theme.fontFamily === 'Montserrat') {
            root.style.setProperty('--font-custom', 'var(--font-montserrat)');
        } else if (theme.fontFamily === 'Outfit') {
            root.style.setProperty('--font-custom', 'var(--font-outfit)');
        } else if (theme.fontFamily === 'Merriweather') {
            root.style.setProperty('--font-custom', 'var(--font-merriweather)');
        }

        // Apply dark mode classes
        if (theme.isDarkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    return <>{children}</>;
}
