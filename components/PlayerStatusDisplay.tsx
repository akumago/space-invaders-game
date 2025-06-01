
import React from 'react';
import { Player } from '../types';
import { calculateEffectiveStats } from '../services/gameService';

interface PlayerStatusDisplayProps {
  player: Player;
  isBattle?: boolean;
}

export const PlayerStatusDisplay: React.FC<PlayerStatusDisplayProps> = ({ player, isBattle = false }) => {
  const effectiveStats = calculateEffectiveStats(player);

  const hpPercentage = effectiveStats.maxHp > 0 ? (player.currentHp / effectiveStats.maxHp) * 100 : 0;
  const mpPercentage = effectiveStats.maxMp > 0 ? (player.currentMp / effectiveStats.maxMp) * 100 : 0;

  return (
    <div className={`p-1.5 sm:p-2 ${isBattle ? 'bg-black bg-opacity-40' : 'bg-blue-900'} text-xs sm:text-sm rounded border border-blue-300`}>
      <div className="flex justify-between items-center mb-0.5 sm:mb-1">
        <span className="font-bold text-yellow-300 text-shadow-dq truncate max-w-[80px] sm:max-w-[100px]">{player.name}</span>
        <span className="text-shadow-dq">Lv:{player.level}</span>
      </div>
      <div className="mb-0.5 sm:mb-1">
        <div className="flex justify-between text-shadow-dq">
          <span>HP</span>
          <span>{player.currentHp}/{effectiveStats.maxHp}</span>
        </div>
        <div className="w-full bg-gray-700 h-2 sm:h-3 border border-gray-500 overflow-hidden rounded-sm">
          <div className="bg-green-500 h-full transition-all duration-300" style={{ width: `${hpPercentage}%` }}></div>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-shadow-dq">
          <span>MP</span>
          <span>{player.currentMp}/{effectiveStats.maxMp}</span>
        </div>
        <div className="w-full bg-gray-700 h-2 sm:h-3 border border-gray-500 overflow-hidden rounded-sm">
          <div className="bg-sky-500 h-full transition-all duration-300" style={{ width: `${mpPercentage}%` }}></div>
        </div>
      </div>
    </div>
  );
};
