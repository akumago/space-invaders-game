
import React, { useState } from 'react';
import { GamePhase } from '../types';
import { MAX_PLAYER_NAME_LENGTH, DEFAULT_PLAYER_NAME } from '../constants';

interface NameInputScreenProps {
  setPlayerName: (name: string) => void;
  setGamePhase: (phase: GamePhase) => void; // Still needed to signal completion to App.tsx
}

export const NameInputScreen: React.FC<NameInputScreenProps> = ({ setPlayerName, setGamePhase }) => {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    const finalName = name.trim() || DEFAULT_PLAYER_NAME;
    setPlayerName(finalName);
    // App.tsx will now handle the transition to WORLD_MAP after player creation
    // No need to call setGamePhase(GamePhase.CLASS_SELECTION) or GamePhase.WORLD_MAP here directly
    // setGamePhase is called by App.tsx after this component's purpose is fulfilled.
  };

  return (
    <div className="dq-window w-full max-w-md mx-auto text-center">
      <h2 className="text-2xl font-bold text-yellow-400 mb-6 text-shadow-dq">なまえをいれてください</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value.slice(0, MAX_PLAYER_NAME_LENGTH))}
        maxLength={MAX_PLAYER_NAME_LENGTH}
        className="w-full p-3 bg-blue-900 border-2 border-blue-400 focus:border-yellow-400 rounded text-white mb-6 text-lg text-center placeholder-gray-500"
        placeholder={DEFAULT_PLAYER_NAME}
        aria-label="プレイヤー名入力"
      />
      <button
        onClick={handleSubmit}
        className="dq-button confirm w-full-dq-button text-lg"
      >
        けってい
      </button>
       <p className="mt-4 text-xs text-gray-300 text-shadow-dq">さいだい{MAX_PLAYER_NAME_LENGTH}もじまで。デフォルト: {DEFAULT_PLAYER_NAME}</p>
    </div>
  );
};
