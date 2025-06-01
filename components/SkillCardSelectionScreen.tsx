import React, { useState, useEffect } from 'react';
import { SkillCardOption, StatBoost, Skill } from '../types';
import { AVAILABLE_SKILL_CARDS, ALL_SKILLS } from '../constants'; 

interface SkillCardSelectionScreenProps {
  onCardSelect: (card: SkillCardOption) => void;
}

const getRandomCards = <T,>(options: T[], count: number): T[] => {
  const shuffled = [...options].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const SkillCardSelectionScreen: React.FC<SkillCardSelectionScreenProps> = ({ onCardSelect }) => {
  const [cards, setCards] = useState<SkillCardOption[]>([]);

  useEffect(() => {
    setCards(getRandomCards(AVAILABLE_SKILL_CARDS, 3));
  }, []);

  if (cards.length === 0) {
    return <div className="dq-window"><p className="text-shadow-dq">スキルカードをよみこみちゅう...</p></div>; 
  }

  return (
    <div className="dq-window w-full max-w-xl mx-auto text-center">
      <h2 className="text-2xl font-bold text-yellow-400 mb-6 text-shadow-dq">ほうびをえらんでください！</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <button
            key={index}
            onClick={() => onCardSelect(card)}
            className="dq-button h-full flex flex-col justify-between p-4" // Added p-4 for internal padding
          >
            <div>
              <h3 className="text-lg font-semibold mb-2 text-shadow-dq">
                {card.type === "STAT_BOOST" ? "のうりょくアップ" : `とくぎ: ${card.skill.name}`}
              </h3>
              <p className="text-xs text-shadow-dq">
                {card.type === "STAT_BOOST" ? card.description : card.skill.description}
              </p>
            </div>
            {card.type === "NEW_SKILL" && <p className="text-xs mt-2 text-shadow-dq">MP: {card.skill.mpCost}</p>}
          </button>
        ))}
      </div>
    </div>
  );
};
