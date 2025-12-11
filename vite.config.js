import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
    plugins: [
        react()
    ],
    server: {
        allowedHosts: ['nexflux-git-main-appuzlotatheogs-projects.vercel.app', 'nexflux-appuzlotatheogs-projects.vercel.app', 'nexflux-m49eip3h3-appuzlotatheogs-projects.vercel.app', 'nexflux.appuzlota.me', 'nexflux.hyprwings.tech', 'localhost']
    },
    build: {
        // Disable source maps in production
        sourcemap: false,
        // Use default esbuild minification for safety
        minify: 'esbuild',
        // Chunk splitting with random names
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    if (id.includes('node_modules')) {
                        if (id.includes('react')) return 'v-r'
                        if (id.includes('router')) return 'v-rt'
                        return 'v'
                    }
                },
                // Random hash for obfuscation
                chunkFileNames: 'assets/[hash].js',
                entryFileNames: 'assets/[hash].js',
                assetFileNames: 'assets/[hash].[ext]'
            }
        }
    }
}))
