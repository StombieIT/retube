import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig(({ mode }) => {
    const { VITE_PORT } = loadEnv(mode, process.cwd());

    const port = Number(VITE_PORT);

    return {
        plugins: [
            react(),
        ],
        server: {
            port,
        },
    };
});