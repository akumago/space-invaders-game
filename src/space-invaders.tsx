import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App';

// スペースインベーダー用の設定
const gameType = 'space-invaders';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App gameType={gameType} />
    </React.StrictMode>
); 