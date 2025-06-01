import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const gameType = process.env.GAME_TYPE || 'root';
    
    // ゲームタイプに応じた設定
    const configs = {
        'root': {
            base: '/space-invaders-game/',
            outDir: 'dist',
            entry: 'src/root.tsx'
        },
        'mitchie-quest': {
            base: '/space-invaders-game/mitchie-quest/',
            outDir: 'dist/mitchie-quest',
            entry: 'src/mitchie-quest.tsx'
        },
        'space-invaders': {
            base: '/space-invaders-game/space-invaders/',
            outDir: 'dist/space-invaders',
            entry: 'src/space-invaders.tsx'
        }
    };
    
    const config = configs[gameType as keyof typeof configs];
    
    return {
        plugins: [react()],
        base: config.base,
        define: {
            'process.env': {
                ...env,
                GAME_TYPE: JSON.stringify(gameType)
            }
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            }
        },
        build: {
            outDir: config.outDir,
            rollupOptions: {
                input: {
                    main: path.resolve(__dirname, config.entry)
                }
            }
        }
    };
});
