import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    base: './',
    plugins: [tailwindcss()],
    build: {
        emptyOutDir: true,
        lib: {
            entry: 'src/index.js',
            name: 'AppleStyleSlider',
            fileName: 'apple-style-slider',
            cssFileName: 'apple-style-slider',
            formats: ['es', 'umd'],
        },
    },
});
