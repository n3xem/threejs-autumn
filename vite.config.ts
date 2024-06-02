import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        target: 'esnext',
        rollupOptions: {
            output: {
                assetFileNames: 'assets/[name].[ext]',
            }
        },
    },
    assetsInclude: ['**/*.glb'],
});
