

import React, { useEffect, useRef } from 'react';
import { Enemy } from '../types';
import { ALL_ENEMIES } from '../constants'; // Added import for ALL_ENEMIES

interface EnemyDisplayProps {
  enemy: Enemy;
  isSelected?: boolean; 
  onSelect?: () => void; 
  isLargeView?: boolean; 
  isFinalBoss?: boolean; 
  isLargeRegionalBoss?: boolean;
}

export const EnemyDisplay: React.FC<EnemyDisplayProps> = ({ enemy, isSelected, onSelect, isLargeView = false, isFinalBoss = false, isLargeRegionalBoss = false }) => {
  const hpPercentage = enemy.stats.maxHp > 0 ? (enemy.stats.currentHp / enemy.stats.maxHp) * 100 : 0;
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && enemy.isVideoSprite) {
      videoRef.current.volume = 0.2; 
    }
  }, [enemy.isVideoSprite, enemy.spriteUrl]);
  
  if (isFinalBoss || isLargeRegionalBoss) {
    // Determine image class based on boss type
    let imgClassName = "max-w-full max-h-full object-contain"; // Default for final boss image, and now for regional bosses too
    if (isFinalBoss && enemy.isVideoSprite) { // Special case for final boss video to fill
      imgClassName = "w-full h-full object-fill";
    } else if (isLargeRegionalBoss) {
      imgClassName = "max-w-full max-h-full object-contain"; // Ensure regional boss images are contained
    }


    // Boss display remains largely the same, ensuring it fills its grid cell (w-full h-full on its parent)
    return (
      <div className="w-full h-full relative animate-enemyAppear flex flex-col items-center justify-center"> 
        <div className="flex-grow min-h-0 w-full flex items-center justify-center overflow-hidden"> 
          {enemy.isGeneratingSprite && !enemy.isVideoSprite ? ( 
            <div className="w-full h-full flex items-center justify-center bg-black bg-opacity-75">
                <p className="text-3xl font-semibold text-yellow-300 text-shadow-dq animate-pulse">
                  {isFinalBoss ? "大魔王 光臨中..." : "ボス 召喚中..."}
                </p>
              </div>
          ) : enemy.isVideoSprite && enemy.spriteUrl.endsWith('.mp4') ? (
            <video
              ref={videoRef}
              src={enemy.spriteUrl}
              autoPlay
              loop
              playsInline 
              className={imgClassName} // Use determined class name for video
              aria-label={`${enemy.name} ${isFinalBoss ? "background video" : "video"}`}
            />
          ) : (
            <img
              src={enemy.spriteUrl === "NEEDS_GENERATION" ? undefined : enemy.spriteUrl}
              alt={enemy.name}
              className={imgClassName} // Use determined class name for image
              aria-label={`${enemy.name} image`}
            />
          )}
        </div>
        <div className="absolute bottom-1 sm:bottom-2 left-1/2 transform -translate-x-1/2 z-10 bg-transparent p-1 sm:p-2 rounded-lg shadow-xl w-11/12 max-w-sm">
          <p className={`text-lg sm:text-xl font-bold text-shadow-dq text-center mb-1 ${isFinalBoss ? 'text-red-400 animate-pulse' : 'text-orange-400'}`}>{enemy.name}</p>
          <div className="w-full max-w-xs mx-auto bg-gray-800 h-3 sm:h-4 border-2 border-gray-400 rounded-sm overflow-hidden shadow-inner">
            <div
              className={`h-full transition-all duration-500 ease-out flex items-center justify-center font-bold text-white ${isFinalBoss ? 'bg-gradient-to-r from-red-600 via-red-500 to-yellow-500 text-xs' : 'bg-gradient-to-r from-orange-600 via-orange-500 to-yellow-400 text-xs'}`}
              style={{ width: `${hpPercentage}%` }}
              role="progressbar"
              aria-valuenow={enemy.stats.currentHp}
              aria-valuemin={0}
              aria-valuemax={enemy.stats.maxHp}
              aria-label={`${enemy.name} HP`}
            >
              <span className="text-shadow-sm">{enemy.stats.currentHp > 0 ? enemy.stats.currentHp : ''}</span>
            </div>
          </div>
           <p className="text-xs sm:text-sm text-shadow-dq text-center mt-1">HP: {enemy.stats.currentHp} / {enemy.stats.maxHp}</p>
        </div>
      </div>
    );
  }

  // Default large view for other enemies (as used in BattleScreen)
  if (isLargeView) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center text-white animate-enemyAppear">
        <div className="flex-grow min-h-0 w-full flex items-center justify-center overflow-hidden p-1">
            {enemy.isGeneratingSprite ? (
            <div className="w-full h-full flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                <p className="text-lg font-semibold text-yellow-300 text-shadow-dq animate-pulse">画像を生成中...</p>
            </div>
            ) : (
            <img 
                src={enemy.spriteUrl === "NEEDS_GENERATION" ? undefined : enemy.spriteUrl}
                alt={enemy.name} 
                className="max-w-full max-h-full object-contain transition-transform duration-300 hover:scale-105"
                style={enemy.id === ALL_ENEMIES.e_king_metal_mitchy.id ? { transform: 'scale(1.25)' } : {}}
            />
            )}
        </div>
        <div className="flex-shrink-0 w-full px-2 pb-1 pt-0.5">
            <p className="text-lg sm:text-xl font-bold text-shadow-dq mb-0.5">{enemy.name}</p>
            <div className="w-full max-w-[180px] sm:max-w-[240px] mx-auto bg-gray-700 h-2.5 sm:h-3 border border-gray-300 rounded-sm overflow-hidden">
            <div 
                className="bg-red-500 h-full transition-all duration-300" 
                style={{ width: `${hpPercentage}%` }}
                role="progressbar"
                aria-valuenow={enemy.stats.currentHp}
                aria-valuemin={0}
                aria-valuemax={enemy.stats.maxHp}
                aria-label={`${enemy.name} HP`}
            ></div>
            </div>
            <p className="text-xs sm:text-sm text-shadow-dq mt-0.5">HP: {enemy.stats.currentHp} / {enemy.stats.maxHp}</p>
        </div>
      </div>
    );
  }

  // Fallback small display (not typically used by BattleScreen for the main enemy)
  const borderColor = isSelected ? 'border-yellow-400 ring-2 ring-yellow-300' : 'border-blue-400';
  return (
    <div 
      className={`p-2 bg-blue-950 bg-opacity-60 border-2 ${borderColor} text-center cursor-pointer hover:border-yellow-300 transition-colors duration-150 rounded`}
      onClick={onSelect}
    >
      {enemy.isGeneratingSprite ? (
         <div className="min-h-[100px] sm:min-h-[120px] flex flex-col items-center justify-center">
            <p className="text-sm font-semibold text-yellow-300 text-shadow-dq animate-pulse">生成中...</p>
            <p className="text-xs text-shadow-dq mt-1">{enemy.name}</p>
         </div>
      ) : (
        <>
        <img 
            src={enemy.spriteUrl === "NEEDS_GENERATION" ? undefined : enemy.spriteUrl}
            alt={enemy.name} 
            className="mx-auto mb-1 w-16 h-16 sm:w-20 sm:h-20 object-contain border-2 border-blue-300 bg-blue-900 rounded-sm"
        />
        <p className="text-sm font-semibold text-shadow-dq">{enemy.name}</p>
        <div className="w-full bg-gray-700 h-2 border border-blue-300 overflow-hidden my-1 rounded-sm">
            <div className="bg-red-600 h-full" style={{ width: `${hpPercentage}%` }}></div>
        </div>
        <p className="text-xs text-shadow-dq">HP: {enemy.stats.currentHp}/{enemy.stats.maxHp}</p>
        </>
      )}
    </div>
  );
};