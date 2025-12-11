import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
    plugins: [
        react()
    ],
    server: {
        allowedHosts: ['nexflux.appuzlota.me', 'nexflux.hyprwings.tech', 'localhost']
    },
    build: {
        // Disable source maps in production
        sourcemap: false,
        // Minify with terser for better obfuscation
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
            },
            mangle: {
                safari10: true,
                properties: {
                    regex: /^_/  // Mangle properties starting with underscore
                }
            },
            format: {
                comments: false
            }
        },
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
