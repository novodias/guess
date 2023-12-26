import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

//@ts-ignore
export default defineConfig(({ command, mode }) => {
    process.env = Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
    const isDev = mode === 'development';
    const baseURL = process.env.VITE_APP_URL;
    const secure = process.env.VITE_APP_SECURE === 'true';
    const port = isDev ? 3000 : 3001;
    const protocol = secure ? 'https://' : 'http://';
    const apiTarget = protocol + baseURL + ':' + port;
    const cdnTarget = protocol + "cdn." + baseURL + ':' + port;
    const wssTarget = (secure ? "wss://" : "ws://") + baseURL + ':' + port;
    
    return {
        plugins: [react()],
        server: {
            host: '0.0.0.0',
            open: false,
            port: port,
            proxy: {
                '^/api': {
                    target: apiTarget,
                    changeOrigin: isDev,
                    rewrite: (path) => path.replace("api/", ""),
                    secure: secure
                },
                '^/cdn': {
                    target: cdnTarget,
                    changeOrigin: isDev,
                    rewrite: (path) => path.replace("cdn/", ""),
                    secure: secure
                },
                '/socket': {
                    target: wssTarget,
                    changeOrigin: isDev,
                    secure: secure,
                    ws: true
                }
            },
            https: !secure ? null : {
                cert: "../dev/.cert/ritmovu.dev+3.pem",
                key: "../dev/.cert/ritmovu.dev+3-key.pem",
            },
        },
        build: {
            cssCodeSplit: true
        },
        optimizeDeps: {
            // force: true,
            esbuildOptions: {
                loader: { '.js': "jsx" }
            },
        }
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