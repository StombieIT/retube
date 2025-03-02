import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';

export default defineConfig(({ mode }) => {
    const { VITE_PORT } = loadEnv(mode, process.cwd());

    const port = Number(VITE_PORT);

    return {
        plugins: [
            svgr(),
            react(),
        ],
        server: {
            port,
            host: mode === 'production',
        },
    };
});