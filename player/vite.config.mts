import { defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';
import react from '@vitejs/plugin-react-swc';

export default defineConfig(({ mode }) => {
    const { VITE_PORT } = loadEnv(mode, process.cwd());

    return {
        plugins: [
            svgr(),
            react(),
        ],
        server: {
            port: Number(VITE_PORT) || 3000,
            host: mode === 'production',
        },
    };
});
