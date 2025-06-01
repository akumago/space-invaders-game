
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Player, Enemy, Skill, Item, BattleState, GamePhase, CurrentRun, TargetType, SkillType } from '../types';
import { PlayerStatusDisplay } from './PlayerStatusDisplay';
import { EnemyDisplay } from './EnemyDisplay';
import { BattleLog } from './BattleLog';
import { CommandMenu } from './CommandMenu';
import { processPlayerAction, processEnemyAction, ActionResult, updateActiveEffects } from '../services/combatService';
import { Modal } from './Modal';
import { generateBossImage } from '../services/imageGenerationService';
import { PLACEHOLDER_BOSS_SPRITE_URL, ALL_SKILLS, ALL_ENEMIES } from '../constants';
import { playSfx, SFX_FILES } from '../services/audioService'; // Removed BGM_FILES and getMasterBgmVolume

// Heroicons SVGs (Solid style)
const ChevronLeftIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" /></svg>);
const ChevronRightIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" /></svg>);


interface BattleScreenProps {
  currentRun: CurrentRun;
  initialEnemies: Enemy[];
  onBattleEnd: (win: boolean, xpGained: number, goldGained: number) => void;
  updateCurrentRunPlayer: (player: Player) => void; 
  onFleeBattle: () => void;
  isSfxEnabled: boolean;
  battleBgUrl?: string; 
}

export const BattleScreen: React.FC<BattleScreenProps> = ({ currentRun, initialEnemies, onBattleEnd, updateCurrentRunPlayer, onFleeBattle, isSfxEnabled, battleBgUrl }) => {
  
  const runPlayer = currentRun.player; 
  const isFinalBossEncounterOnInit = initialEnemies.length === 1 && initialEnemies[0].id === ALL_ENEMIES.e_micchy_final_boss.id;
  const isLargeRegionalBossEncounterOnInit = initialEnemies.length === 1 && (
    initialEnemies[0].id === ALL_ENEMIES.e_micchy_sexy_knight_boss.id ||
    initialEnemies[0].id === ALL_ENEMIES.e_micchy_baroku_saburou_boss.id ||
    initialEnemies[0].id === ALL_ENEMIES.e_senden_biker_boss.id
  );
  const isBossEncounter = isFinalBossEncounterOnInit || isLargeRegionalBossEncounterOnInit;

  const getInitialLogMessage = () => {
    if (isBossEncounter) {
      return `「${initialEnemies[0].name}」があらわれた！`; 
    }
    return `${initialEnemies.map(e => e.name).join(' と ')} があらわれた！`;
  };
  
  const [battleState, setBattleState] = useState<BattleState>({
    enemies: JSON.parse(JSON.stringify(initialEnemies.map(e => ({...e, isGeneratingSprite: e.spriteUrl === "NEEDS_GENERATION" && !e.hasGeneratedSprite, spriteUrl: e.hasGeneratedSprite ? e.spriteUrl : (e.spriteUrl === "NEEDS_GENERATION" ? PLACEHOLDER_BOSS_SPRITE_URL : e.spriteUrl) })))),
    playerTurn: true,
    log: [getInitialLogMessage()],
    selectedSkill: null,
    selectedItem: null,
    showTargetSelection: false, 
  });
  
  const [selectedTargetIndex, setSelectedTargetIndex] = useState<number>(0);
  const [showSkillSelectionModal, setShowSkillSelectionModal] = useState(false);
  const [showItemSelectionModal, setShowItemSelectionModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'attack' | 'skill' | 'item'; id?: string } | null>(null);
  
  const [triggerScreenFlash, setTriggerScreenFlash] = useState(false);
  // const battleAudioRef = useRef<HTMLAudioElement | null>(null); // BGM managed by App.tsx

  const pendingActionRef = useRef(pendingAction);
   useEffect(() => {
    pendingActionRef.current = pendingAction;
  }, [pendingAction]);

  // BGM useEffect removed - App.tsx handles battle BGM

  useEffect(() => {
    if (isBossEncounter && initialEnemies.length > 0) {
      if (isSfxEnabled) playSfx(SFX_FILES.BOSS_APPEAR);
      
      setTriggerScreenFlash(true);
      setTimeout(() => setTriggerScreenFlash(false), 350);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBossEncounter, isSfxEnabled]);


  useEffect(() => {
    const activeEnemies = battleState.enemies.filter(e => e.stats.currentHp > 0);
    if (activeEnemies.length > 0) {
        const currentTarget = battleState.enemies[selectedTargetIndex];
        if (!currentTarget || currentTarget.stats.currentHp <= 0) {
            const firstLivingEnemyIndex = battleState.enemies.findIndex(e => e.stats.currentHp > 0);
            if (firstLivingEnemyIndex !== -1) {
                setSelectedTargetIndex(firstLivingEnemyIndex);
            }
        }
    }
  }, [battleState.enemies, selectedTargetIndex]);


  useEffect(() => {
    battleState.enemies.forEach((enemyInState, index) => {
      const initialEnemyData = initialEnemies.find(ie => ie.id === enemyInState.id); 
      if (initialEnemyData && initialEnemyData.spriteUrl === 'NEEDS_GENERATION' && !enemyInState.hasGeneratedSprite && !enemyInState.isGeneratingSprite) {
        
        setBattleState(prev => {
          const newEnemies = [...prev.enemies];
          if(newEnemies[index]) newEnemies[index] = { ...newEnemies[index], isGeneratingSprite: true };
          return { ...prev, enemies: newEnemies };
        });

        generateBossImage(`${initialEnemyData.name}、ドラゴンクエスト風のピクセルアートスタイル、威圧的、強大、${initialEnemyData.id === ALL_ENEMIES.e_micchy_final_boss.id ? "最終ボス、邪悪なオーラ、巨大" : "ボスモンスター"} `)
          .then(imageUrl => {
            setBattleState(prev => {
                const newEnemies = [...prev.enemies];
                if(newEnemies[index]) newEnemies[index] = { ...newEnemies[index], spriteUrl: imageUrl || PLACEHOLDER_BOSS_SPRITE_URL, isGeneratingSprite: false, hasGeneratedSprite: true };
                return { ...prev, enemies: newEnemies };
            });
          })
          .catch(() => { 
             setBattleState(prev => {
                const newEnemies = [...prev.enemies];
                if(newEnemies[index]) newEnemies[index] = { ...newEnemies[index], spriteUrl: PLACEHOLDER_BOSS_SPRITE_URL, isGeneratingSprite: false, hasGeneratedSprite: true }; 
                return { ...prev, enemies: newEnemies };
            });
          });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 


  const addToLog = useCallback((messages: string | string[]) => {
    setBattleState(prev => ({ ...prev, log: [...prev.log, ...(Array.isArray(messages) ? messages : [messages])].slice(-100) }));
  }, []);

  const handleActionResults = useCallback((results: ActionResult[], updatedPlayerStateFromAction: Player, updatedEnemiesStateFromAction: Enemy[]) => {
    results.forEach(result => {
        if (result.logMessage) addToLog(result.logMessage);
        if (result.damageDealt && isSfxEnabled) playSfx(SFX_FILES.DAMAGE);
    });

    updateCurrentRunPlayer(updatedPlayerStateFromAction);
    setBattleState(prev => ({
        ...prev,
        enemies: updatedEnemiesStateFromAction,
        playerTurn: false, 
    }));

  }, [addToLog, updateCurrentRunPlayer, isSfxEnabled]);

  const executePendingAction = useCallback(() => {
    const actionToExecute = pendingActionRef.current;
    if (!actionToExecute || !battleState.playerTurn) return;

    let playerCopy = JSON.parse(JSON.stringify(runPlayer));
    let enemiesCopy = JSON.parse(JSON.stringify(battleState.enemies));
    
    const targetForAction = (actionToExecute.type === 'attack' || (actionToExecute.type === 'skill' && ALL_SKILLS[actionToExecute.id!]?.target === TargetType.SINGLE_ENEMY)) 
                             ? selectedTargetIndex 
                             : null;

    const actionResults = processPlayerAction(playerCopy, enemiesCopy, targetForAction, actionToExecute.type, actionToExecute.id);
    
    const finalPlayerState = playerCopy; 
    const finalEnemiesState = enemiesCopy;

    handleActionResults(actionResults, finalPlayerState, finalEnemiesState);
    setPendingAction(null);
    setShowSkillSelectionModal(false);
    setShowItemSelectionModal(false);
    setBattleState(prev => ({...prev, showTargetSelection: false}));
  }, [runPlayer, battleState.enemies, battleState.playerTurn, selectedTargetIndex, handleActionResults]);


  const handlePlayerAttack = () => {
    if (!battleState.playerTurn) return;
    const livingEnemies = battleState.enemies.filter(e => e.stats.currentHp > 0);
    if (livingEnemies.length === 0) return;

    const currentTarget = battleState.enemies[selectedTargetIndex];
    if (!currentTarget || currentTarget.stats.currentHp <= 0) {
        const firstLivingIndex = battleState.enemies.findIndex(e => e.stats.currentHp > 0);
        if (firstLivingIndex !== -1) {
            setSelectedTargetIndex(firstLivingIndex);
            setTimeout(() => pendingActionRef.current = { type: 'attack' }, 0); 
            setTimeout(() => executePendingAction(), 50); 
            return;
        }
        return; 
    }
    setPendingAction({ type: 'attack' });
    setTimeout(() => executePendingAction(), 50); 
  };

  const handlePlayerDefend = () => {
    if (!battleState.playerTurn) return;
    const defendSkill = Object.values(ALL_SKILLS).find(s => s.id === 's_defend'); 
    if (defendSkill) {
        setPendingAction({ type: 'skill', id: defendSkill.id });
        setTimeout(() => executePendingAction(), 50); 
    } else {
        addToLog("ぼうぎょスキルが見つかりませんでした。");
    }
  };

  const handleOpenSkillMenu = () => {
    if (!battleState.playerTurn) return;
    setShowSkillSelectionModal(true);
  };

  const handleOpenItemMenu = () => {
    if (!battleState.playerTurn) return;
    setShowItemSelectionModal(true);
  };

  const handleSelectSkill = (skill: Skill) => {
    if (!battleState.playerTurn || runPlayer.currentMp < skill.mpCost) {
        addToLog(runPlayer.currentMp < skill.mpCost ? "MPがたりない！" : "プレイヤーのターンではありません。");
        setShowSkillSelectionModal(false);
        return;
    }
    if (isSfxEnabled) playSfx(SFX_FILES.SPELL_CAST, 0.2); 
    
    setPendingAction({ type: 'skill', id: skill.id });

    if (skill.target === TargetType.SINGLE_ENEMY && battleState.enemies.filter(e => e.stats.currentHp > 0).length >= 1) {
        const currentTarget = battleState.enemies[selectedTargetIndex];
        if (!currentTarget || currentTarget.stats.currentHp <= 0) {
            const firstLiving = battleState.enemies.findIndex(e => e.stats.currentHp > 0);
            if (firstLiving !== -1) setSelectedTargetIndex(firstLiving);
        }
    }
    setTimeout(() => executePendingAction(), 50);
  };

  const handleSelectItem = (item: Item) => {
    if (!battleState.playerTurn) return;
    if (isSfxEnabled) playSfx(SFX_FILES.SPELL_CAST, 0.1); 

    setPendingAction({ type: 'item', id: item.id });
    setTimeout(() => executePendingAction(), 50);
  };

  const changeTarget = (direction: 'next' | 'prev') => {
    const livingEnemiesIndexes = battleState.enemies
        .map((enemy, index) => ({ ...enemy, originalIndex: index }))
        .filter(e => e.stats.currentHp > 0)
        .map(e => e.originalIndex);

    if (livingEnemiesIndexes.length <= 1) return;

    let currentSelectedOriginalIndex = selectedTargetIndex;
    let currentPositionInLiving = livingEnemiesIndexes.indexOf(currentSelectedOriginalIndex);
    
    if(currentPositionInLiving === -1){ 
        currentPositionInLiving = 0; 
    }

    if (direction === 'next') {
      currentPositionInLiving = (currentPositionInLiving + 1) % livingEnemiesIndexes.length;
    } else {
      currentPositionInLiving = (currentPositionInLiving - 1 + livingEnemiesIndexes.length) % livingEnemiesIndexes.length;
    }
    setSelectedTargetIndex(livingEnemiesIndexes[currentPositionInLiving]);
  };
  
  useEffect(() => {
    if (!battleState.playerTurn && battleState.enemies.some(e => e.stats.currentHp > 0) && runPlayer.currentHp > 0) {
      const enemyTurnTimeout = setTimeout(() => {
        let playerCopy = JSON.parse(JSON.stringify(runPlayer));
        let enemiesCopy = JSON.parse(JSON.stringify(battleState.enemies));
        const allActionResults: ActionResult[] = [];
        let gameEndedMidTurn = false;

        for (let i = 0; i < enemiesCopy.length; i++) {
          if (enemiesCopy[i].stats.currentHp > 0) {
            const enemyResults = processEnemyAction(enemiesCopy[i], playerCopy);
            enemyResults.forEach(res => {
                if(res.logMessage) allActionResults.push({logMessage: res.logMessage});
                if(res.damageDealt && isSfxEnabled) playSfx(SFX_FILES.DAMAGE);
            });
            if (playerCopy.currentHp <= 0) {
              gameEndedMidTurn = true;
              break; 
            }
          }
        }
        
        updateCurrentRunPlayer(playerCopy); 

        const playerEffectMessages = updateActiveEffects(playerCopy).expiredEffectMessages;
        if(playerEffectMessages.length > 0) playerEffectMessages.forEach(m => allActionResults.push({logMessage: m}));
        
        enemiesCopy.forEach(enemy => {
            if(enemy.stats.currentHp > 0) {
                const enemyEffectMessages = updateActiveEffects(enemy).expiredEffectMessages;
                if(enemyEffectMessages.length > 0) enemyEffectMessages.forEach(m => allActionResults.push({logMessage: m}));
            }
        });

        if (allActionResults.length > 0) {
             addToLog(allActionResults.map(r => r.logMessage).filter(m => m !== undefined) as string[]);
        }

        setBattleState(prev => ({
          ...prev,
          enemies: enemiesCopy, 
          playerTurn: !gameEndedMidTurn, 
        }));
        
        if (gameEndedMidTurn) {
          // BGM stop handled by App.tsx on phase change to GAME_OVER
          onBattleEnd(false, currentRun.xpGainedThisRun, currentRun.goldGainedThisRun);
        }

      }, 1000); 

      return () => clearTimeout(enemyTurnTimeout);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battleState.playerTurn, battleState.enemies, runPlayer.currentHp]); 

  useEffect(() => {
    const livingEnemies = battleState.enemies.filter(e => e.stats.currentHp > 0);
    const allEnemiesDefeated = livingEnemies.length === 0;
    const playerDefeated = runPlayer.currentHp <= 0;

    if (allEnemiesDefeated && !playerDefeated) {
      const totalExp = battleState.enemies.reduce((sum, e) => sum + e.stats.expYield, 0);
      const totalGold = battleState.enemies.reduce((sum, e) => sum + e.stats.goldYield, 0);
      addToLog("てきをすべてやっつけた！");
      // BGM continues if battle sequence continues (skill card / next encounter)
      // BGM stop handled by App.tsx if phase changes to WORLD_MAP
      setTimeout(() => onBattleEnd(true, totalExp, totalGold), 1500);
    } else if (playerDefeated) {
      addToLog(`${runPlayer.name} はちからつきた...`);
      // BGM stop handled by App.tsx on phase change to GAME_OVER
      setTimeout(() => onBattleEnd(false, currentRun.xpGainedThisRun, currentRun.goldGainedThisRun), 1500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battleState.enemies, runPlayer.currentHp, runPlayer.name, onBattleEnd, addToLog, currentRun.xpGainedThisRun, currentRun.goldGainedThisRun]);

  const availableSkills = useMemo(() => runPlayer.persistentSkills.concat(runPlayer.temporarySkills), [runPlayer.persistentSkills, runPlayer.temporarySkills]);
  const consumableItems = useMemo(() => runPlayer.inventory.filter(item => item.type === "どうぐ"), [runPlayer.inventory]);
  const livingEnemiesCount = useMemo(() => battleState.enemies.filter(e => e.stats.currentHp > 0).length, [battleState.enemies]);

  const renderEnemyAreaContent = () => {
    const mainDisplayedEnemy = battleState.enemies[selectedTargetIndex];
    const anyLivingEnemy = battleState.enemies.some(e => e.stats.currentHp > 0);

    if (isBossEncounter) {
      return (
          <div className="w-full h-full flex items-center justify-center relative">
              <EnemyDisplay 
                  enemy={battleState.enemies[0]} 
                  isFinalBoss={isFinalBossEncounterOnInit}
                  isLargeRegionalBoss={isLargeRegionalBossEncounterOnInit}
              />
          </div>
      );
    }
    
    if (!anyLivingEnemy && battleState.enemies.length > 0) {
        return <div className="w-full h-full flex items-center justify-center text-gray-400">てきは いなくなった！</div>;
    }
    
    let enemyToDisplay = mainDisplayedEnemy;
    if (!enemyToDisplay || enemyToDisplay.stats.currentHp <= 0) {
        enemyToDisplay = battleState.enemies.find(e => e.stats.currentHp > 0) || enemyToDisplay; 
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative">
            <div className="absolute top-0 left-0 right-0 text-center pt-1">
                <p className="text-sm text-yellow-300 text-shadow-dq">
                    のこりのてき: {livingEnemiesCount} / {initialEnemies.length}
                </p>
            </div>
            <div className="flex-grow min-h-0 w-full flex items-center justify-center relative px-10">
                {livingEnemiesCount > 1 && (
                    <button onClick={() => changeTarget('prev')} className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-20 dq-button p-1 sm:p-2 bg-opacity-70 hover:bg-opacity-90" aria-label="前のターゲット">
                        <ChevronLeftIcon />
                    </button>
                )}
                {enemyToDisplay && (
                    <EnemyDisplay
                        key={enemyToDisplay.id + "-main-" + selectedTargetIndex}
                        enemy={enemyToDisplay}
                        isLargeView={true} 
                    />
                )}
                {livingEnemiesCount > 1 && (
                    <button onClick={() => changeTarget('next')} className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-20 dq-button p-1 sm:p-2 bg-opacity-70 hover:bg-opacity-90" aria-label="次のターゲット">
                        <ChevronRightIcon />
                    </button>
                )}
            </div>
            {livingEnemiesCount > 1 && (
                <div className="flex justify-center items-center space-x-2 sm:space-x-3 py-1 h-8">
                    {battleState.enemies.map((enemy, index) => (
                        enemy.stats.currentHp > 0 && (
                            <button
                                key={enemy.id + "-indicator-" + index}
                                onClick={() => {
                                    if (battleState.playerTurn) setSelectedTargetIndex(index);
                                }}
                                className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 transition-all duration-150
                                            ${index === selectedTargetIndex ? 'bg-yellow-400 border-yellow-200 scale-125 shadow-lg' : 'bg-gray-600 border-gray-400 hover:bg-gray-500'}
                                            ${!battleState.playerTurn ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                aria-label={`ターゲット: ${enemy.name}`}
                                title={enemy.name}
                                disabled={!battleState.playerTurn}
                            />
                        )
                    ))}
                </div>
            )}
             {livingEnemiesCount <= 1 && <div className="h-8 py-1"></div>} {/* Placeholder for spacing when no dots */}
        </div>
    );
  };
  
  let battleBgStyle: React.CSSProperties = { backgroundColor: '#0C0C0C' }; 
  let innerDivBgClass: string = 'bg-black bg-opacity-60'; 

  if (isBossEncounter) {
    battleBgStyle = { backgroundColor: 'black' };
    innerDivBgClass = ''; 
  } else if (battleBgUrl && battleBgUrl.trim() !== "") {
    battleBgStyle = { 
      backgroundImage: `url(${battleBgUrl})`, 
      backgroundSize: 'cover', 
      backgroundPosition: 'center', 
      backgroundColor: '#0C0C0C' 
    };
    innerDivBgClass = ''; 
  }

  return (
    <div 
        className="flex flex-col h-full w-full text-white items-stretch relative"
        style={battleBgStyle}
    >
      {triggerScreenFlash && <div className="fixed inset-0 bg-white z-[9998] animate-screenFlashEffect pointer-events-none" />}
      
      {/* Main Grid Container */}
      <div className={`grid h-full w-full p-2 sm:p-4 ${innerDivBgClass} overflow-hidden`}
           style={{ gridTemplateRows: isBossEncounter ? 'minmax(0, 1fr) auto auto auto auto' : 'minmax(0, 3fr) auto auto auto auto' }}
      >
        {/* Row 1: Enemy Display Area */}
        <div className="min-h-0 w-full relative">
          {renderEnemyAreaContent()}
        </div>
        
        {/* Row 2: Battle Log */}
        <div className={`min-h-0 w-full my-1 sm:my-1.5`}>
            <BattleLog log={battleState.log} />
        </div>

        {/* Row 3: Player Status */}
        <div className="min-h-0 w-full">
            <PlayerStatusDisplay player={runPlayer} isBattle={true} />
        </div>
        
        {/* Row 4: Command Menu */}
        <div className="min-h-0 w-full mt-1 sm:mt-1.5">
            <CommandMenu
            player={runPlayer}
            onAttack={handlePlayerAttack}
            onOpenSkillMenu={handleOpenSkillMenu}
            onOpenItemMenu={handleOpenItemMenu}
            onDefend={handlePlayerDefend}
            isPlayerTurn={battleState.playerTurn}
            />
        </div>
            
        {/* Row 5: Flee Button */}
        <div className="min-h-0 w-full mt-1.5 sm:mt-2">
            <button
                onClick={() => {
                  // BGM stop handled by App.tsx on phase change
                  onFleeBattle();
                }}
                className={`dq-button danger w-full text-xs py-1 ${isBossEncounter ? 'dq-button-slashed' : ''}`}
                disabled={!battleState.playerTurn || isBossEncounter}
            >
                {isBossEncounter ? "にげられない！" : "にげる"}
            </button>
        </div>
      </div>

      <Modal isOpen={showSkillSelectionModal} onClose={() => {setShowSkillSelectionModal(false); setPendingAction(null);}} title="とくぎ">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
          {availableSkills.length > 0 ? availableSkills.map(skill => (
            <button
              key={skill.id}
              onClick={() => handleSelectSkill(skill)}
              disabled={runPlayer.currentMp < skill.mpCost}
              className={`dq-button text-left w-full p-2 ${runPlayer.currentMp < skill.mpCost ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-shadow-dq">{skill.name}</span>
                <span className="text-xs text-sky-300 text-shadow-dq">MP: {skill.mpCost}</span>
              </div>
              <p className="text-xs text-gray-300 text-shadow-dq mt-0.5">{skill.description}</p>
            </button>
          )) : <p className="text-shadow-dq col-span-full text-center">おぼえているとくぎがない。</p>}
        </div>
      </Modal>

      <Modal isOpen={showItemSelectionModal} onClose={() => {setShowItemSelectionModal(false); setPendingAction(null);}} title="どうぐ">
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
          {consumableItems.length > 0 ? consumableItems.map((item, index) => (
            <button
              key={`${item.id}-${index}`}
              onClick={() => handleSelectItem(item)}
              className="dq-button text-left w-full p-2"
            >
              <p className="text-sm font-semibold text-shadow-dq">{item.name}</p>
              <p className="text-xs text-gray-300 text-shadow-dq mt-0.5">{item.description}</p>
            </button>
          )) : <p className="text-shadow-dq col-span-full text-center">つかえるどうぐがない。</p>}
        </div>
      </Modal>
    </div>
  );
};