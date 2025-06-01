import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App';

// ミッチークエスト用の設定
const gameType = 'mitchie-quest';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App gameType={gameType} />
    </React.StrictMode>
); 