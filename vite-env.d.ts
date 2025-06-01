/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GAME_TYPE?: 'root' | 'mitchie-quest' | 'space-invaders';
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 