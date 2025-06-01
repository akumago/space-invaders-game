import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    // loadEnvを使って環境変数を読み込む
    const env = loadEnv(mode, process.cwd(), '');
    
    // 読み込んだ環境変数GAME_TYPEに基づいてベースパスを決定
    let basePath = '/';
    if (env.GAME_TYPE === 'root') {
      basePath = '/space-invaders-game/';
    } else if (env.GAME_TYPE === 'space-invaders') {
      basePath = '/space-invaders-game/space-invaders/';
    } else if (env.GAME_TYPE === 'mitchie-quest') {
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
