
import React, { useEffect, useRef } from 'react';

interface BattleLogProps {
  log: string[];
}

export const BattleLog: React.FC<BattleLogProps> = ({ log }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  return (
    // Applied dq-window style with some modifications for battle log context
    <div className="dq-window bg-opacity-80 max-h-24 sm:max-h-28 overflow-y-auto text-sm sm:text-base !p-2 sm:!p-3"> {/* Reduced padding & max-height */}
      {log.map((entry, index) => (
        <p key={index} className="mb-1 text-shadow-dq leading-tight">{entry}</p>
      ))}
      <div ref={logEndRef} />
    </div>
  );
};
