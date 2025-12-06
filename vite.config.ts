import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    root: '.',
    publicDir: 'public',
    plugins: [tailwindcss()],
    build: {
        outDir: 'dist',
    },
    server: {
        open: true,
    },
});
