import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/space-invaders-game/',
      build: {
        rollupOptions: {
          input: {
            main: path.resolve(__dirname, 'index.html'),
            'space-invaders': path.resolve(__dirname, 'space-invaders/index.html'),
            'mitchie-quest': path.resolve(__dirname, 'mitchie-quest/index.html')
          }
        }
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
