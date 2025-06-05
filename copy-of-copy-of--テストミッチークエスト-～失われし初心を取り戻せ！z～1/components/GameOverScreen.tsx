import React from 'react';
import { GamePhase } from '../types';

interface GameOverScreenProps {
  xpGained: number;
  goldGained: number;
  onContinue: () => void; 
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ xpGained, goldGained, onContinue }) => {
  return (
    <div className="dq-window w-full max-w-md mx-auto text-center">
      <h2 className="text-3xl font-bold text-red-500 mb-6 text-shadow-dq">ゲームオーバー</h2>
      <p className="text-lg mb-2 text-shadow-dq">ゆうかんにたたかったが、ちからつきてしまった。</p>
      <p className="text-md mb-1 text-shadow-dq">かくとくけいけんち: <span className="text-yellow-300">{xpGained}</span></p>
      <p className="text-md mb-6 text-shadow-dq">かくとくゴールド: <span className="text-yellow-300">{goldGained}</span></p>
      <p className="text-sm mb-4 text-gray-300 text-shadow-dq">これまでのぼうけんのきろく (レベル、そうけいけんち、そうゴールド、そうび、かいほうされたエリア) はほぞんされています。</p>
      <button
        onClick={onContinue}
        className="dq-button confirm w-full-dq-button text-lg"
      >
        つづける
      </button>
    </div>
  );
};
