

import React from 'react';
import { GamePhase, Region, Player } from '../types'; // Added Player
import { ALL_ITEMS, QUIZ_SET_IDENTIFIERS } from '../constants'; // Added ALL_ITEMS and QUIZ_SET_IDENTIFIERS

interface WorldMapScreenProps {
  regions: Record<string, Region>;
  onSelectRegion: (regionId: string) => void; 
  setGamePhase: (phase: GamePhase, associatedData?: string) => void; // Updated associatedData to string
  player: Player; // Changed from playerGold to full player object
}

export const WorldMapScreen: React.FC<WorldMapScreenProps> = ({ regions, onSelectRegion, setGamePhase, player }) => {
  const unlockedRegions = Object.values(regions).filter(r => r.isUnlocked);

  const keyFragmentDetails = [
    { id: ALL_ITEMS.i_key_fragment_forest.id, name: "森の破片", shortName: "森" },
    { id: ALL_ITEMS.i_key_fragment_cave.id, name: "洞窟の破片", shortName: "洞" },
    { id: ALL_ITEMS.i_key_fragment_tower.id, name: "塔の破片", shortName: "塔" },
  ];

  return (
    <div className="flex flex-col h-full w-full p-3 sm:p-4 text-white">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 text-shadow-dq">ワールドマップ</h2>
        <p className="text-lg text-yellow-300 text-shadow-dq">ゴールド: {player.gold}G</p>
      </div>
      
      <div className="text-sm text-yellow-200 text-shadow-dq mt-0 mb-3 text-center">
        <span>大魔王の鍵: </span>
        {keyFragmentDetails.map(kf => {
          const hasFragment = player.inventory.some(item => item.id === kf.id);
          return (
            <span
              key={kf.id}
              className={`mx-0.5 px-1.5 py-0.5 rounded text-xs sm:text-sm ${
                hasFragment ? 'bg-yellow-500 text-black font-bold' : 'bg-gray-700 text-gray-400'
              }`}
              title={hasFragment ? `${kf.name} (入手済)` : `${kf.name} (未入手)`}
            >
              {hasFragment ? kf.shortName : "?"}
            </span>
          );
        })}
      </div>
      
      <div className="flex-grow space-y-3 mb-4 overflow-y-auto pr-2 bg-black bg-opacity-20 p-2 rounded border border-blue-700 shadow-inner">
        {unlockedRegions.map(region => (
          <div key={region.id} className={`p-3 border-2 ${region.isCleared ? 'border-green-500 bg-green-950 bg-opacity-50' : 'border-blue-600 bg-black bg-opacity-30'} rounded shadow-md hover:shadow-lg transition-shadow`}>
            <h3 className="text-lg sm:text-xl font-semibold text-shadow-dq">{region.name} {region.isCleared && <span className="text-green-300">(クリアずみ)</span>}</h3>
            <p className="text-xs text-gray-300 mb-2 text-shadow-dq">{region.description}</p>
            <button
              onClick={() => onSelectRegion(region.id)}
              className="dq-button w-full-dq-button text-sm mb-2"
            >
              このちいきへいく
            </button>
            <div className="grid grid-cols-2 gap-2">
                <button 
                    onClick={() => { 
                        setGamePhase(GamePhase.SHOP, region.id); 
                    }}
                    className="dq-button text-xs"
                    disabled={!region.shopInventoryIds || region.shopInventoryIds.length === 0}
                >みせ</button>
                <button 
                    onClick={() => { 
                        setGamePhase(GamePhase.GACHA, region.id); 
                    }}
                    className="dq-button text-xs"
                    disabled={!region.gachaPrizeIds || region.gachaPrizeIds.length === 0}
                >ふくびき</button>
            </div>
          </div>
        ))}
         {unlockedRegions.length === 0 && (
            <p className="text-gray-400 text-center p-4 text-shadow-dq">まだいける ばしょがないようだ...</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-auto">
        <button
            onClick={() => setGamePhase(GamePhase.STATUS_SCREEN)}
            className="dq-button w-full-dq-button text-sm"
        >
            つよさ
        </button>
        <button
            onClick={() => setGamePhase(GamePhase.WISDOM_BAG)}
            className="dq-button w-full-dq-button text-sm"
        >
            ちえぶくろ
        </button>
        <button
            onClick={() => setGamePhase(GamePhase.MITCHY_QUIZ, QUIZ_SET_IDENTIFIERS.SET1)}
            className="dq-button w-full-dq-button text-sm"
        >
            ミッチークイズ1
        </button>
        <button
            onClick={() => setGamePhase(GamePhase.MITCHY_QUIZ, QUIZ_SET_IDENTIFIERS.SET2)}
            className="dq-button w-full-dq-button text-sm"
        >
            ミッチークイズ2
        </button>
         <button
            onClick={() => setGamePhase(GamePhase.MITCHY_QUIZ, QUIZ_SET_IDENTIFIERS.SET3)}
            className="dq-button w-full-dq-button text-sm"
        >
            ミッチークイズ3
        </button>
        <button
            onClick={() => setGamePhase(GamePhase.PASSWORD_SAVE)}
            className="dq-button w-full-dq-button text-sm"
        >
            ぼうけんのしょ
        </button>
      </div>
       <button
            onClick={() => setGamePhase(GamePhase.TITLE)}
            className="dq-button danger w-full-dq-button mt-3 text-sm"
        >
            タイトルへもどる
        </button>
    </div>
  );
};