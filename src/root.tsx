import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from '../App';

// ゲームタイプを環境変数から取得
const gameType = process.env.GAME_TYPE || 'root';

// ルートページの場合はゲーム選択画面を表示
if (gameType === 'root') {
    ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <h1 className="text-3xl font-bold text-yellow-400 mb-8 text-shadow-dq">ミッチーゲームコレクション</h1>
                <div className="grid grid-cols-1 gap-4 w-full max-w-md">
                    <a href="/space-invaders-game/space-invaders/" className="dq-button text-center p-4">
                        スペースインベーダー
                    </a>
                    <a href="/space-invaders-game/mitchie-quest/" className="dq-button text-center p-4">
                        ミッチークエスト
                    </a>
                </div>
            </div>
        </React.StrictMode>
    );
} else {
    // それ以外の場合は通常のアプリを表示
    ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} 