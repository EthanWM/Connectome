import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    root: '.',
    base: process.env.VITE_BASE || '/',
    publicDir: 'public',
    plugins: [tailwindcss()],
    build: {
        outDir: 'dist',
    },
    server: {
        open: true,
    },
});
