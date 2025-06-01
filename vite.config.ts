import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isMitchieQuest = process.env.GAME_TYPE === 'mitchie-quest';
    
    return {
      plugins: [react()],
      base: isMitchieQuest ? '/space-invaders-game/mitchie-quest/' : '/space-invaders-game/space-invaders/',
      define: {
        'process.env': env
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: isMitchieQuest ? 'dist/mitchie-quest' : 'dist/space-invaders'
      }
    };
});
