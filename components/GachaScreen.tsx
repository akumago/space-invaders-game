
import React, { useState } from 'react';
import { Player, Item, GamePhase, Region } from '../types';
import { ALL_ITEMS } from '../constants';
import { Modal } from './Modal';

interface GachaScreenProps {
  player: Player;
  currentGachaRegionId: string | null;
  allRegions: Record<string, Region>;
  onUseGacha: (cost: number, prize: Item) => void;
  setGamePhase: (phase: GamePhase) => void;
}

const GACHA_COST_GOLD = 50;

export const GachaScreen: React.FC<GachaScreenProps> = ({ player, currentGachaRegionId, allRegions, onUseGacha, setGamePhase }) => {
  const [lastPrize, setLastPrize] = useState<Item | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const currentRegion = currentGachaRegionId ? allRegions[currentGachaRegionId] : null;
  const gachaPrizes = currentRegion?.gachaPrizeIds.map(id => ALL_ITEMS[id]).filter(Boolean) || [];
  const gachaTicketCount = player.inventory.filter(item => item.id === 'i_gacha_ticket').length;


  const handleRoll = (useTicket: boolean) => {
    if (isRolling || gachaPrizes.length === 0) return;

    const cost = useTicket ? 0 : GACHA_COST_GOLD;
    if (!useTicket && player.gold < cost) {
      alert("ゴールドがたりない！");
      return;
    }
    if (useTicket && gachaTicketCount === 0) {
      alert("ふくびきけんをもっていない！");
      return;
    }

    setIsRolling(true);
    setLastPrize(null);

    setTimeout(() => {
      const prize = gachaPrizes[Math.floor(Math.random() * gachaPrizes.length)];
      setLastPrize(prize);
      onUseGacha(useTicket ? 10001 : cost, prize); // 10001 is a sentinel for ticket use
      setIsRolling(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full w-full p-3 sm:p-4 text-white text-center">
      <div className="mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-1 text-shadow-dq">
          {currentRegion?.name || 'なぞ'} のふくびきじょ
        </h2>
        <p className="text-sm text-gray-300 mb-1 text-shadow-dq">うんためしだ！</p>
        <p className="text-yellow-300 text-shadow-dq">しょじゴールド: {player.gold}G | ふくびきけん: {gachaTicketCount}まい</p>
      </div>
      
      <div className="flex-grow flex flex-col items-center justify-center my-4">
        {isRolling && (
          <div className="p-4 bg-black bg-opacity-40 rounded-lg shadow-lg">
            <p className="text-xl sm:text-2xl animate-pulse text-pink-400 text-shadow-dq">ガラガラガラ...</p>
            <div className="text-3xl sm:text-4xl my-4 text-purple-300 text-shadow-dq">
              <span>{gachaPrizes.length > 0 ? gachaPrizes[Math.floor(Math.random()*gachaPrizes.length)].name.substring(0,1) : "?"}</span>
              <span className="animate-ping inline-block mx-1 sm:mx-2">・</span>
              <span>{gachaPrizes.length > 0 ? gachaPrizes[Math.floor(Math.random()*gachaPrizes.length)].name.substring(0,1) : "?"}</span>
              <span className="animate-ping inline-block mx-1 sm:mx-2">・</span>
              <span>{gachaPrizes.length > 0 ? gachaPrizes[Math.floor(Math.random()*gachaPrizes.length)].name.substring(0,1) : "?"}</span>
            </div>
          </div>
        )}
        {!isRolling && gachaPrizes.length === 0 && (
             <p className="text-gray-400 text-lg text-shadow-dq">このふくびきじょにはけいひんがないようだ...</p>
        )}
      </div>


      {!isRolling && lastPrize && (
        <Modal isOpen={!!lastPrize} onClose={() => setLastPrize(null)} title="やったね！">
            <div className="text-center">
                <p className="text-lg font-semibold mb-2 text-green-400 text-shadow-dq">{lastPrize.name} をてにいれた！</p>
                <p className="text-sm text-gray-300 text-shadow-dq">{lastPrize.description}</p>
            </div>
        </Modal>
      )}

      <div className="space-y-3 mt-auto"> {/* Buttons pushed to bottom */}
        <button
          onClick={() => handleRoll(false)}
          disabled={isRolling || player.gold < GACHA_COST_GOLD || gachaPrizes.length === 0}
          className="dq-button w-full-dq-button text-lg"
        >
          まわす ({GACHA_COST_GOLD}G)
        </button>
        <button
          onClick={() => handleRoll(true)}
          disabled={isRolling || gachaTicketCount === 0 || gachaPrizes.length === 0}
          className="dq-button w-full-dq-button text-lg"
        >
          ふくびきけんをつかう (1まい)
        </button>
     
        <button
          onClick={() => setGamePhase(GamePhase.WORLD_MAP)}
          className="dq-button danger w-full-dq-button"
        >
          マップへもどる
        </button>
      </div>
    </div>
  );
};
