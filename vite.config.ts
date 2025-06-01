import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const gameType = process.env.GAME_TYPE || 'root';
    
    const basePaths = {
        'root': '/space-invaders-game/',
        'mitchie-quest': '/space-invaders-game/mitchie-quest/',
        'space-invaders': '/space-invaders-game/space-invaders/'
    };
    
    const outDirs = {
        'root': 'dist',
        'mitchie-quest': 'dist/mitchie-quest',
        'space-invaders': 'dist/space-invaders'
    };
    
    return {
      plugins: [react()],
      base: basePaths[gameType as keyof typeof basePaths],
      define: {
        'process.env': env
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: outDirs[gameType as keyof typeof outDirs]
      }
    };
});
