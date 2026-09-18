import {defineConfig} from 'vite';

export default defineConfig({
    base: './', // Ensures assets load correctly on both custom domains and GitHub project subpaths
    root: './',
    publicDir: 'public',
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        target: 'es2022',
        minify: 'esbuild'
    }
});