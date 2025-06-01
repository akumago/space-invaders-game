import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    // loadEnvを使って環境変数を読み込む
    const env = loadEnv(mode, process.cwd(), '');
    
    // 読み込んだ環境変数GAME_TYPEに基づいてベースパスと出力ディレクトリを決定
    let basePath = '/';
    let outDir = 'dist';

    if (env.GAME_TYPE === 'root') {
      basePath = '/space-invaders-game/';
      outDir = 'dist';
    } else if (env.GAME_TYPE === 'space-invaders') {
      basePath = '/space-invaders-game/space-invaders/';
      outDir = 'dist/space-invaders';
    } else if (env.GAME_TYPE === 'mitchie-quest') {
      basePath = '/space-invaders-game/mitchie-quest/';
      outDir = 'dist/mitchie-quest';
    }

    return {
      base: basePath, // ベースパスを設定
      build: { // ビルド設定を追加
        outDir: outDir // 出力ディレクトリを設定
      },
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
