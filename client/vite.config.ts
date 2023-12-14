import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'

// process.env = Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
export default defineConfig({
    plugins: [react()],
    server: {
        host: 'ritmovu.dev',
        open: false,
        port: 3000,
        proxy: {
            '^/api': {
                target: "https://ritmovu.dev:3001",
                changeOrigin: true,
                rewrite: (path) => path.replace("api/", ""),
                secure: false
            },
            '^/cdn': {
                target: 'https://cdn.ritmovu.dev:3001',
                changeOrigin: true,
                rewrite: (path) => path.replace("cdn/", ""),
                secure: false
            },
            '/socket': {
                target: "wss://ritmovu.dev:3001/",
                changeOrigin: true,
                ws: true
            }
        },
        https: {
            cert: "../dev/.cert/ritmovu.dev+3.pem",
            key: "../dev/.cert/ritmovu.dev+3-key.pem",
        },
    },
    optimizeDeps: {
        // force: true,
        esbuildOptions: {
            loader: { '.js': "jsx" }
        },
    }
})

// eslint-disable-next-line import/no-anonymous-default-export
// export default ({ mode }) => {
//     process.env = Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

//     return defineConfig({
//         root: 'src',
//         base: '',
//         plugins: [react(), viteTsconfigPaths()],
//         server: {
//             open: false,
//             port: parseInt(process.env.PORT as string),
//             proxy: {
//                 '/api': {
//                     target: "https://ritmovu.dev:3001",
//                     changeOrigin: true,
//                     rewrite: (path) => path.replace("^/api/", ""),
//                     secure: false
//                 },
//                 '/cdn': {
//                     target: 'https://cdn.ritmovu.dev:3001',
//                     changeOrigin: true,
//                     rewrite: (path) => path.replace("^/cdn/", ""),
//                     secure: false
//                 },
//                 'socket': {
//                     target: "wss://ritmovu.dev:3001/",
//                     changeOrigin: true,
//                     ws: true
//                 }
//             },
//             https: {
//                 cert: process.env.SSL_CRT_FILE as string,
//                 key: process.env.SSL_KEY_FILE as string,
//             },
    
//         }
//     })
// }