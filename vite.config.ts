import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // GAME_TYPE環境変数に基づいてベースパスを決定
    let basePath = '/';
    if (process.env.GAME_TYPE === 'root') {
      basePath = '/space-invaders-game/';
    } else if (process.env.GAME_TYPE === 'space-invaders') {
      basePath = '/space-invaders-game/space-invaders/';
    } else if (process.env.GAME_TYPE === 'mitchie-quest') {
      basePath = '/space-invaders-game/mitchie-quest/';
    }

    return {
      base: basePath, // ベースパスを設定
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
