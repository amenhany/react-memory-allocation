import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
    base: './',
    build: {
        outDir: 'dist-react/',
    },
    server: {
        port: 5123,
        strictPort: true,
    },
    resolve: {
        alias: {
            '@/electron': path.resolve(__dirname, 'src/electron'),
            '@/types': path.resolve(__dirname, 'src/types'),
            '@': path.resolve(__dirname, 'src/client'),
        },
    },
});
