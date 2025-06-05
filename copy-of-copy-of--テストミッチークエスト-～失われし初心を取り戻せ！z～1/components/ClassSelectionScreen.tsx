import React from 'react';
import { PlayerClass, GamePhase } from '../types';
import { PLAYER_CLASSES, ALL_SKILLS } from '../constants';

interface ClassSelectionScreenProps {
  onClassSelect: (playerClass: PlayerClass) => void;
}

export const ClassSelectionScreen: React.FC<ClassSelectionScreenProps> = ({ onClassSelect }) => {
  return (
    <div className="dq-window w-full max-w-lg mx-auto text-center">
      <h2 className="text-2xl font-bold text-yellow-400 mb-6 text-shadow-dq">しょくぎょうをえらんでください</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.values(PlayerClass).map((pClass) => {
          const classDetails = PLAYER_CLASSES[pClass];
          const initialSkills = classDetails.initialSkills.map(id => ALL_SKILLS[id]?.name).filter(Boolean).join(', ');
          return (
            <button
              key={pClass}
              onClick={() => onClassSelect(pClass)}
              className="dq-button h-full flex flex-col justify-between p-4" // Added p-4 for internal padding
            >
              <div>
                <h3 className="text-xl font-bold mb-2 text-shadow-dq">{pClass}</h3>
                <p className="text-xs mb-1 text-shadow-dq">HP: {classDetails.baseStats.maxHp}, MP: {classDetails.baseStats.maxMp}</p>
                <p className="text-xs mb-1 text-shadow-dq">こうげき: {classDetails.baseStats.attack}, しゅび: {classDetails.baseStats.defense}</p>
              </div>
              <p className="text-xs mt-2 text-shadow-dq">とくぎ: {initialSkills || 'なし'}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
