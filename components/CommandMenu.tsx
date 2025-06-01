
import React from 'react';
import { Player, Skill, Item } from '../types'; // Keep Skill, Item if needed for displaying counts or details

// Heroicons SVGs (Solid style) - Duplicated from BattleScreen for standalone component, consider centralizing SVGs if used elsewhere
const BoltIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6"><path fillRule="evenodd" d="M11.275 2.003c.142-.252.42-.404.725-.404s.583.152.725.404l7.5 13.25c.124.22.124.494 0 .714-.123.22-.35.358-.598.358H4.373c-.247 0-.475-.138-.598-.358a.75.75 0 0 1 0-.714l7.5-13.25ZM12 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" clipRule="evenodd" /></svg>);
const FireIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6"><path fillRule="evenodd" d="M12.963 2.286a.75.75 0 0 0-1.071 1.052A24.759 24.759 0 0 1 12 21.75a24.759 24.759 0 0 1-1.071-18.412.75.75 0 0 0-1.052-1.071A31.752 31.752 0 0 0 8.25 12.75a31.75 31.75 0 0 0 2.688 18.412.75.75 0 0 0 1.052 1.071A24.759 24.759 0 0 1 12 3.75a24.759 24.759 0 0 1 1.071 18.412.75.75 0 0 0 1.052-1.071A31.752 31.752 0 0 0 15.75 12.75a31.75 31.75 0 0 0-2.787-10.464Z" clipRule="evenodd" /></svg>);
const ShoppingBagIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6"><path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.763.746-1.856 1.705l-1.263 12c-.128 1.223.875 2.295 2.11 2.295H19.5c1.235 0 2.238-1.072 2.11-2.295l-1.263-12a1.875 1.875 0 0 0-1.856-1.705H16.5V6a4.5 4.5 0 1 0-9 0ZM12 3a3 3 0 0 0-3 3v.75h6V6a3 3 0 0 0-3-3Zm-3 8.25a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" /></svg>);
const ShieldCheckIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6"><path fillRule="evenodd" d="M12.832 2.174a1.25 1.25 0 0 0-1.664 0L2.602 9.017a1.25 1.25 0 0 0-.602 1.084V19.5a1.25 1.25 0 0 0 1.25 1.25h17.5a1.25 1.25 0 0 0 1.25-1.25v-9.4c0-.431-.22-.829-.602-1.084L12.832 2.174ZM12 16.147a.75.75 0 0 1-.518-.193l-2.25-2a.75.75 0 1 1 1.036-1.084l1.732 1.54 3.732-4.54a.75.75 0 1 1 1.168.96l-4.25 5.167a.75.75 0 0 1-.448.25Z" clipRule="evenodd" /></svg>);

interface CommandMenuProps {
  player: Player;
  onAttack: () => void;
  onOpenSkillMenu: () => void;
  onOpenItemMenu: () => void;
  onDefend: () => void;
  isPlayerTurn: boolean;
}

const CommandButton: React.FC<{ onClick: () => void; children: React.ReactNode; disabled?: boolean; icon?: React.ReactNode; className?: string }> = 
  ({ onClick, children, disabled, icon, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`dq-button flex flex-col items-center justify-center p-1 sm:p-2 h-full w-full text-xs sm:text-sm transition-opacity duration-150 ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
  >
    {icon && <div className="mb-0.5 sm:mb-1">{icon}</div>}
    <span className="text-shadow-dq">{children}</span>
  </button>
);

export const CommandMenu: React.FC<CommandMenuProps> = ({ player, onAttack, onOpenSkillMenu, onOpenItemMenu, onDefend, isPlayerTurn }) => {
  const availableSkills = player.persistentSkills.concat(player.temporarySkills);
  const consumableItems = player.inventory.filter(item => item.type === "どうぐ");

  return (
    <div className="grid grid-cols-4 gap-1 sm:gap-2 bg-black bg-opacity-30 p-1 rounded-md border border-blue-300">
      <CommandButton 
        onClick={onAttack} 
        disabled={!isPlayerTurn} 
        icon={<BoltIcon />}
        className="bg-red-700 hover:bg-red-600 border-red-400"
      >
        こうげき
      </CommandButton>
      <CommandButton 
        onClick={onOpenSkillMenu} 
        disabled={!isPlayerTurn || availableSkills.length === 0} 
        icon={<FireIcon />}
        className="bg-blue-700 hover:bg-blue-600 border-blue-400"
      >
        とくぎ
      </CommandButton>
      <CommandButton 
        onClick={onOpenItemMenu} 
        disabled={!isPlayerTurn || consumableItems.length === 0} 
        icon={<ShoppingBagIcon />}
        className="bg-green-700 hover:bg-green-600 border-green-400"
      >
        どうぐ
      </CommandButton>
      <CommandButton 
        onClick={onDefend} 
        disabled={!isPlayerTurn} 
        icon={<ShieldCheckIcon />}
        className="bg-yellow-600 hover:bg-yellow-500 border-yellow-300"
      >
        ぼうぎょ
      </CommandButton>
    </div>
  );
};
