
import React from 'react';
import { Player, GamePhase, WisdomFragment } from '../types';
import { ALL_WISDOM_FRAGMENTS } from '../constants';

interface WisdomBagScreenProps {
  player: Player;
  setGamePhase: (phase: GamePhase) => void;
}

export const WisdomBagScreen: React.FC<WisdomBagScreenProps> = ({ player, setGamePhase }) => {
  const collectedCount = player.collectedWisdomIds.filter(id => !id.startsWith("wisdom_reward_")).length; // Exclude reward flags
  const totalWisdomFragments = Object.keys(ALL_WISDOM_FRAGMENTS).length;
  const completionPercentage = totalWisdomFragments > 0 ? Math.floor((collectedCount / totalWisdomFragments) * 100) : 0;

  const wisdomCategories: Record<string, WisdomFragment[]> = {};
  Object.values(ALL_WISDOM_FRAGMENTS).forEach(fragment => {
    if (!wisdomCategories[fragment.category]) {
      wisdomCategories[fragment.category] = [];
    }
    wisdomCategories[fragment.category].push(fragment);
  });
  
  const sortedCategories = Object.keys(wisdomCategories).sort();


  return (
    <div className="flex flex-col h-full w-full p-3 sm:p-4 text-white">
      <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-1 text-shadow-dq text-center">ミッチーの知恵袋</h2>
      <p className="text-sm text-center text-gray-300 mb-4 text-shadow-dq">
        あつめた知恵: {collectedCount} / {totalWisdomFragments} ({completionPercentage}%)
      </p>

      <div className="flex-grow overflow-y-auto space-y-4 pr-1 pb-2 bg-black bg-opacity-30 p-3 rounded border border-blue-700 shadow-inner">
        {totalWisdomFragments === 0 && <p className="text-gray-400 text-center p-4 text-shadow-dq">まだ知恵のかけらはひとつもないようだ...</p>}
        {sortedCategories.map(category => (
          <div key={category}>
            <h3 className="text-lg font-semibold text-yellow-200 mb-2 text-shadow-dq sticky top-0 bg-blue-950 py-1 px-2 rounded-t -mx-1 z-10">{category}</h3>
            <div className="space-y-2 pl-1">
            {wisdomCategories[category].map(fragment => {
              const isCollected = player.collectedWisdomIds.includes(fragment.id);
              return (
                <div key={fragment.id} className={`p-2 rounded border ${isCollected ? 'border-green-700 bg-green-950 bg-opacity-30' : 'border-gray-700 bg-gray-950 bg-opacity-30'}`}>
                  {isCollected ? (
                    <p className="text-sm text-green-300 text-shadow-dq leading-relaxed">{fragment.text}</p>
                  ) : (
                    <p className="text-sm text-gray-500 text-shadow-dq italic">？？？ <span className="text-xs">({fragment.hint})</span></p>
                  )}
                </div>
              );
            })}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setGamePhase(GamePhase.WORLD_MAP)}
        className="dq-button w-full-dq-button mt-4"
      >
        マップへもどる
      </button>
    </div>
  );
};
