
import React, { useState } from 'react';
import { Player, Item, GamePhase, Region } from '../types';
import { ALL_ITEMS } from '../constants';

interface ShopScreenProps {
  player: Player;
  currentShopRegionId: string | null;
  allRegions: Record<string, Region>;
  onPurchaseItem: (item: Item) => void;
  onSellItem: (item: Item, indexInInventory: number) => void;
  setGamePhase: (phase: GamePhase) => void;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({ player, currentShopRegionId, allRegions, onPurchaseItem, onSellItem, setGamePhase }) => {
  const [viewMode, setViewMode] = useState<'buy' | 'sell'>('buy');

  const currentRegion = currentShopRegionId ? allRegions[currentShopRegionId] : null;
  const shopItems = currentRegion?.shopInventoryIds.map(id => ALL_ITEMS[id]).filter(Boolean) || [];
  const sellPriceMultiplier = 0.5;

  const handleBuy = (item: Item) => {
    if (player.gold >= item.price) {
      onPurchaseItem(item);
    } else {
      alert("ゴールドがたりない！");
    }
  };

  const handleSell = (item: Item, index: number) => {
    onSellItem(item, index);
  };

  return (
    <div className="flex flex-col h-full w-full p-3 sm:p-4 text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 text-shadow-dq">
          {currentRegion?.name || 'たびのしょうにん'} のみせ
        </h2>
        <p className="text-yellow-300 text-shadow-dq">しょじゴールド: {player.gold}G</p>
      </div>

      <div className="mb-4 flex border-b-2 border-blue-700">
        <button
          onClick={() => setViewMode('buy')}
          className={`py-2 px-4 text-shadow-dq ${viewMode === 'buy' ? 'border-b-2 border-yellow-400 text-yellow-300' : 'text-gray-300'} hover:text-yellow-200 transition-colors`}
        >
          かう
        </button>
        <button
          onClick={() => setViewMode('sell')}
          className={`py-2 px-4 text-shadow-dq ${viewMode === 'sell' ? 'border-b-2 border-yellow-400 text-yellow-300' : 'text-gray-300'} hover:text-yellow-200 transition-colors`}
        >
          うる
        </button>
      </div>

      <div className="flex-grow space-y-2 overflow-y-auto pr-1 bg-black bg-opacity-30 p-2 rounded border border-blue-700 shadow-inner">
        {viewMode === 'buy' && (
          <>
            {shopItems.length > 0 ? shopItems.map(item => (
              <div key={item.id} className="flex justify-between items-center p-2 bg-black bg-opacity-20 border border-blue-600 rounded hover:bg-opacity-40 transition-colors">
                <div>
                  <p className="font-semibold text-yellow-200 text-shadow-dq">{item.name}</p>
                  <p className="text-xs text-gray-300 text-shadow-dq">{item.description}</p>
                  <p className="text-xs text-gray-400 text-shadow-dq">
                    {item.attackBoost ? `こうげき+${item.attackBoost} ` : ''}
                    {item.defenseBoost ? `しゅび+${item.defenseBoost} ` : ''}
                    {item.hpRecovery ? `HP+${item.hpRecovery} ` : ''}
                    {item.mpRecovery ? `MP+${item.mpRecovery} ` : ''}
                  </p>
                </div>
                <button
                  onClick={() => handleBuy(item)}
                  disabled={player.gold < item.price}
                  className="dq-button confirm text-xs px-3 py-1"
                >
                  {item.price}G
                </button>
              </div>
            )) : <p className="text-gray-400 text-shadow-dq p-2">このみせにはうりものがありません。</p>}
          </>
        )}

        {viewMode === 'sell' && (
           <>
            {player.inventory.length > 0 ? player.inventory.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex justify-between items-center p-2 bg-black bg-opacity-20 border border-blue-600 rounded hover:bg-opacity-40 transition-colors">
                <div>
                  <p className="font-semibold text-yellow-200 text-shadow-dq">{item.name}</p>
                   <p className="text-xs text-gray-300 text-shadow-dq">{item.description}</p>
                </div>
                <button
                  onClick={() => handleSell(item, index)}
                  className="dq-button danger text-xs px-3 py-1"
                >
                  {Math.floor(item.price * sellPriceMultiplier)}G
                </button>
              </div>
            )) : <p className="text-gray-400 text-shadow-dq p-2">うるものがありません。</p>}
          </>
        )}
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
