

import React, { useState } from 'react';
import { Player, Item, Equipment, GamePhase } from '../types';
import { calculateEffectiveStats, getDisplayItemName } from '../services/gameService'; // Added getDisplayItemName
import { 
    ALL_ITEMS, XP_FOR_LEVEL, MAX_ENHANCEMENT_LEVEL, 
    WEAPON_ENHANCEMENT_ATTACK_BONUS_PER_LEVEL,
    ARMOR_ENHANCEMENT_DEFENSE_BONUS_PER_LEVEL,
    SHIELD_ENHANCEMENT_DEFENSE_BONUS_PER_LEVEL
} from '../constants'; // Added MAX_ENHANCEMENT_LEVEL and WEAPON_ENHANCEMENT_ATTACK_BONUS_PER_LEVEL
import { Modal } from './Modal';

interface StatusScreenProps {
  player: Player;
  setGamePhase: (phase: GamePhase) => void;
  onEquipItem: (item: Item, slot: keyof Equipment) => void;
  onUnequipItem: (slot: keyof Equipment) => void;
  onEnhanceEquipment: (baseItemInstanceId: string, materialItemInstanceId: string) => void;
}

const StatDisplay: React.FC<{ label: string, value: string | number }> = ({label, value}) => (
    <div className="flex justify-between py-1 border-b border-blue-700 last:border-b-0">
        <span className="text-gray-300 text-shadow-dq">{label}:</span>
        <span className="font-semibold text-shadow-dq">{value}</span>
    </div>
);

export const StatusScreen: React.FC<StatusScreenProps> = ({ player, setGamePhase, onEquipItem, onUnequipItem, onEnhanceEquipment }) => {
  const effectiveStats = calculateEffectiveStats(player);
  const [selectedSlotToEquip, setSelectedSlotToEquip] = useState<keyof Equipment | null>(null);
  
  const [showEnhancementModal, setShowEnhancementModal] = useState(false);
  const [enhancementBaseEquipment, setEnhancementBaseEquipment] = useState<Item | null>(null);
  const [enhancementMaterialCandidates, setEnhancementMaterialCandidates] = useState<Item[]>([]);

  const equippableItemsForSlot = (slot: keyof Equipment): Item[] => {
    return player.inventory.filter(item => {
      if (!item.isEquippable || !item.instanceId) return false;
      if (slot === 'weapon' && item.type === 'ぶき') return true;
      if (slot === 'armor' && item.type === 'よろい') return true;
      if (slot === 'shield' && item.type === 'たて') return true;
      return false;
    });
  };

  const handleEquip = (item: Item) => {
    if (selectedSlotToEquip) {
      onEquipItem(item, selectedSlotToEquip);
      setSelectedSlotToEquip(null);
    }
  };

  const openEnhancementModal = (baseEquipment: Item) => {
    if (!baseEquipment.instanceId || (baseEquipment.type !== "ぶき" && baseEquipment.type !== "よろい" && baseEquipment.type !== "たて")) return;
    
    if ((baseEquipment.enhancementLevel || 0) >= MAX_ENHANCEMENT_LEVEL) {
        alert(`「${getDisplayItemName(baseEquipment)}」は既に最大まで強化されています。`);
        return;
    }
    const materials = player.inventory.filter(
      item => item.id === baseEquipment.id && item.instanceId !== baseEquipment.instanceId && item.type === baseEquipment.type
    );
    if (materials.length === 0) {
        alert(`「${getDisplayItemName(baseEquipment)}」を強化するための素材（同じ種類の装備）がありません。`);
        return;
    }
    setEnhancementBaseEquipment(baseEquipment);
    setEnhancementMaterialCandidates(materials);
    setShowEnhancementModal(true);
  };

  const handleConfirmEnhancement = (materialEquipment: Item) => {
    if (enhancementBaseEquipment && enhancementBaseEquipment.instanceId && materialEquipment.instanceId) {
      onEnhanceEquipment(enhancementBaseEquipment.instanceId, materialEquipment.instanceId);
    }
    setShowEnhancementModal(false);
    setEnhancementBaseEquipment(null);
    setEnhancementMaterialCandidates([]);
  };
  
  const renderEquipmentSlot = (slotKey: keyof Equipment, slotName: string) => {
    const equippedItem = player.equipment[slotKey];
    return (
      <div className="mb-2">
        <span className="text-sm text-gray-300 text-shadow-dq">{slotName}: </span>
        {equippedItem ? (
          <div className="inline-flex items-center gap-2">
            <span className="text-yellow-300 text-shadow-dq">{getDisplayItemName(equippedItem)}</span>
            <button onClick={() => onUnequipItem(slotKey)} className="text-xs text-red-400 hover:text-red-300 text-shadow-dq">(はずす)</button>
            {(equippedItem.type === "ぶき" || equippedItem.type === "よろい" || equippedItem.type === "たて") && 
             ((equippedItem.enhancementLevel || 0) < MAX_ENHANCEMENT_LEVEL) && (
                 <button onClick={() => openEnhancementModal(equippedItem)} className="text-xs text-green-400 hover:text-green-300 text-shadow-dq">(強化)</button>
            )}
          </div>
        ) : (
          <span className="text-gray-500 text-shadow-dq">なし</span>
        )}
        <button onClick={() => setSelectedSlotToEquip(slotKey)} className="ml-2 text-xs text-sky-400 hover:text-sky-300 text-shadow-dq">(そうび)</button>
      </div>
    );
  };

  const xpToNextLevel = player.level < XP_FOR_LEVEL.length ? XP_FOR_LEVEL[player.level] : Infinity;
  const displayExperience = player.level < XP_FOR_LEVEL.length ? `${player.experience} / ${xpToNextLevel}` : `${player.experience} (MAX)`;
  const nextLevelProgress = player.level < XP_FOR_LEVEL.length ? `あと ${Math.max(0, xpToNextLevel - player.experience)} でレベルアップ` : "レベルMAX";


  return (
    <div className="flex flex-col h-full w-full p-2 sm:p-4 text-white text-sm">
      <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-4 text-shadow-dq text-center">{player.name} - つよさ</h2>
      
      <div className="flex-grow overflow-y-auto space-y-4 pr-1 pb-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black bg-opacity-30 p-3 rounded border border-blue-700 shadow-md">
              <h3 className="font-semibold text-lg mb-2 text-shadow-dq text-yellow-200">ステータス</h3>
              <StatDisplay label="レベル" value={player.level} />
              <StatDisplay label="しょくぎょう" value={player.playerClass} />
              <StatDisplay label="けいけんち" value={displayExperience} />
              <p className="text-xs text-gray-400 ml-1 text-shadow-dq my-0.5">{nextLevelProgress}</p>
              <StatDisplay label="ゴールド" value={player.gold} />
              <StatDisplay label="HP" value={`${player.currentHp} / ${effectiveStats.maxHp}`} />
              <StatDisplay label="MP" value={`${player.currentMp} / ${effectiveStats.maxMp}`} />
              <StatDisplay label="こうげき力" value={effectiveStats.attack} />
              <StatDisplay label="しゅび力" value={effectiveStats.defense} />
              <StatDisplay label="すばやさ" value={effectiveStats.speed} />
              <StatDisplay label="かいしん率" value={`${(effectiveStats.critRate * 100).toFixed(0)}%`} />
          </div>
          <div className="bg-black bg-opacity-30 p-3 rounded border border-blue-700 shadow-md">
              <h3 className="font-semibold text-lg mb-2 text-shadow-dq text-yellow-200">そうび</h3>
              {renderEquipmentSlot('weapon', 'ぶき')}
              {renderEquipmentSlot('armor', 'よろい')}
              {renderEquipmentSlot('shield', 'たて')}

              {selectedSlotToEquip && (
                  <div className="mt-4 p-2 bg-black bg-opacity-40 border border-blue-600 rounded max-h-40 overflow-y-auto">
                      <h4 className="text-md font-semibold mb-1 text-yellow-200 text-shadow-dq">{selectedSlotToEquip === 'weapon' ? 'ぶき' : selectedSlotToEquip === 'armor' ? 'よろい' : 'たて'}をそうび:</h4>
                      {equippableItemsForSlot(selectedSlotToEquip).length > 0 ? equippableItemsForSlot(selectedSlotToEquip).map(item => (
                          <button 
                            key={item.instanceId || item.id} /* Use instanceId if available */
                            onClick={() => handleEquip(item)} 
                            className="block w-full text-left p-1 hover:bg-yellow-600 hover:text-black text-xs text-shadow-dq rounded transition-colors"
                          >
                              {getDisplayItemName(item)} (攻:{item.attackBoost || 0}, 守:{item.defenseBoost || 0})
                          </button>
                      )) : <p className="text-xs text-gray-400 text-shadow-dq">そうびできるアイテムがありません。</p>}
                       <button onClick={() => setSelectedSlotToEquip(null)} className="mt-2 text-xs text-gray-300 hover:text-white text-shadow-dq">キャンセル</button>
                  </div>
              )}
          </div>
        </div>

        <div className="bg-black bg-opacity-30 p-3 rounded border border-blue-700 shadow-md">
          <h3 className="font-semibold text-lg mb-2 text-shadow-dq text-yellow-200">おぼえているとくぎ・じゅもん</h3>
          <div className="max-h-32 overflow-y-auto bg-black bg-opacity-20 p-2 border border-blue-600 rounded">
              {player.persistentSkills.map(skill => (
                  <div key={skill.id} className="mb-1 p-1 border-b border-blue-800 last:border-b-0">
                      <p className="font-semibold text-yellow-100 text-shadow-dq">{skill.name} <span className="text-xs text-gray-400">(MP: {skill.mpCost})</span></p>
                      <p className="text-xs text-gray-300 text-shadow-dq">{skill.description}</p>
                  </div>
              ))}
              {player.persistentSkills.length === 0 && <p className="text-xs text-gray-400 text-shadow-dq">まだなにもおぼえていない。</p>}
          </div>
        </div>
      </div>
      
      <button
        onClick={() => setGamePhase(GamePhase.WORLD_MAP)}
        className="dq-button w-full-dq-button mt-auto" 
      >
        マップへもどる
      </button>

      <Modal 
        isOpen={showEnhancementModal} 
        onClose={() => {
            setShowEnhancementModal(false); 
            setEnhancementBaseEquipment(null); 
            setEnhancementMaterialCandidates([]);
        }} 
        title="そうびをきょうか"
        size="md"
      >
        {enhancementBaseEquipment && (
          <div>
            <p className="text-md mb-1 text-shadow-dq">ベース: <span className="text-yellow-300">{getDisplayItemName(enhancementBaseEquipment)}</span></p>
            {enhancementBaseEquipment.type === 'ぶき' &&
                <p className="text-sm text-gray-400 mb-3 text-shadow-dq">
                こうげきりょく: {enhancementBaseEquipment.attackBoost || 0} 
                {enhancementBaseEquipment.enhancementLevel ? ` + ${(enhancementBaseEquipment.enhancementLevel) * WEAPON_ENHANCEMENT_ATTACK_BONUS_PER_LEVEL}` : ''}
                {' -> '}
                <span className="text-green-400">
                    {enhancementBaseEquipment.attackBoost || 0} + {((enhancementBaseEquipment.enhancementLevel || 0) + 1) * WEAPON_ENHANCEMENT_ATTACK_BONUS_PER_LEVEL}
                </span>
                </p>
            }
            {enhancementBaseEquipment.type === 'よろい' &&
                <p className="text-sm text-gray-400 mb-3 text-shadow-dq">
                しゅびりょく: {enhancementBaseEquipment.defenseBoost || 0} 
                {enhancementBaseEquipment.enhancementLevel ? ` + ${(enhancementBaseEquipment.enhancementLevel) * ARMOR_ENHANCEMENT_DEFENSE_BONUS_PER_LEVEL}` : ''}
                {' -> '}
                <span className="text-green-400">
                    {enhancementBaseEquipment.defenseBoost || 0} + {((enhancementBaseEquipment.enhancementLevel || 0) + 1) * ARMOR_ENHANCEMENT_DEFENSE_BONUS_PER_LEVEL}
                </span>
                </p>
            }
            {enhancementBaseEquipment.type === 'たて' &&
                <p className="text-sm text-gray-400 mb-3 text-shadow-dq">
                しゅびりょく: {enhancementBaseEquipment.defenseBoost || 0} 
                {enhancementBaseEquipment.enhancementLevel ? ` + ${(enhancementBaseEquipment.enhancementLevel) * SHIELD_ENHANCEMENT_DEFENSE_BONUS_PER_LEVEL}` : ''}
                {' -> '}
                <span className="text-green-400">
                    {enhancementBaseEquipment.defenseBoost || 0} + {((enhancementBaseEquipment.enhancementLevel || 0) + 1) * SHIELD_ENHANCEMENT_DEFENSE_BONUS_PER_LEVEL}
                </span>
                </p>
            }
            <h4 className="text-sm font-semibold mb-2 text-yellow-200 text-shadow-dq">そざいをえらんでください (のこり {enhancementMaterialCandidates.length}こ):</h4>
            <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
              {enhancementMaterialCandidates.map(material => (
                <button
                  key={material.instanceId}
                  onClick={() => handleConfirmEnhancement(material)}
                  className="dq-button w-full-dq-button text-xs p-1.5"
                >
                  {getDisplayItemName(material)} (そざいにする)
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};