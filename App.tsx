import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GamePhase, Player, PlayerClass, SkillCardOption, StatBoost, Item, Equipment, Region, CurrentRun, Enemy, QuizQuestion, AppliedBuff, DebuffType, BuffType } from './types';
import { TitleScreen } from './components/TitleScreen';
import { NameInputScreen } from './components/NameInputScreen';
// import { ClassSelectionScreen } from './components/ClassSelectionScreen'; // Removed
import { WorldMapScreen } from './components/WorldMapScreen';
import { BattleScreen } from './components/BattleScreen';
import { SkillCardSelectionScreen } from './components/SkillCardSelectionScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { StatusScreen } from './components/StatusScreen';
import { ShopScreen } from './components/ShopScreen';
import { GachaScreen } from './components/GachaScreen';
import { PasswordManagementScreen } from './components/PasswordManagementScreen';
import { WisdomBagScreen } from './components/WisdomBagScreen'; 
import { MitchyQuizScreen } from './components/MitchyQuizScreen'; // Added
import { Modal } from './components/Modal';
import { FinalBossPreDialogueScreen } from './components/FinalBossPreDialogueScreen'; 
import { EndingMessageScreen } from './components/EndingMessageScreen'; 
import { CreditsRollScreen } from './components/CreditsRollScreen'; 
import { 
    createInitialPlayer, saveGame, loadGame, deleteSave, clearSaveData,
    checkLevelUp, calculateEffectiveStats, getEnemiesForEncounter, 
    generatePassword, createItemInstance, getDisplayItemName,
    collectWisdomFragment 
} from './services/gameService';
import { 
    MAX_PLAYER_NAME_LENGTH, DEFAULT_PLAYER_NAME, REGIONS, ALL_ITEMS, XP_FOR_LEVEL, 
    PLAYER_CLASSES, STAT_INCREASE_PER_LEVEL, ALL_SKILLS, ALL_ENEMIES,
    MAX_ENHANCEMENT_LEVEL,
    WEAPON_ENHANCEMENT_ATTACK_BONUS_PER_LEVEL,
    ARMOR_ENHANCEMENT_DEFENSE_BONUS_PER_LEVEL,
    SHIELD_ENHANCEMENT_DEFENSE_BONUS_PER_LEVEL,
    ALL_WISDOM_FRAGMENTS, WISDOM_COLLECTION_REWARDS,
    ALL_MITCHY_QUIZZES_SET1, ALL_MITCHY_QUIZZES_SET2, ALL_MITCHY_QUIZZES_SET3, 
    QUIZ_SET1_COMPLETION_FLAG_ID, QUIZ_SET2_COMPLETION_FLAG_ID, QUIZ_SET3_COMPLETION_FLAG_ID, 
    QUIZ_MIN_CORRECT_FOR_REWARD, QUIZ_SET_IDENTIFIERS 
} from './constants';
import { playSfx, SFX_FILES, ensureAudioContext, BGM_FILES, getMasterBgmVolume } from './services/audioService';
import { updateActiveEffects } from './services/combatService';


interface CurrentQuizParams {
  questions: QuizQuestion[];
  completionFlagId: string;
  wisdomFragmentForRewardId: string;
}

const App: React.FC = () => {
  const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.TITLE);
  const [player, setPlayer] = useState<Player | null>(null); 
  const [regions, setRegions] = useState<Record<string, Region>>(() => JSON.parse(JSON.stringify(REGIONS))); 
  const [currentRun, setCurrentRun] = useState<CurrentRun | null>(null);
  
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [currentShopRegionId, setCurrentShopRegionId] = useState<string | null>(null);
  const [currentGachaRegionId, setCurrentGachaRegionId] = useState<string | null>(null);
  const [isSfxEnabled, setIsSfxEnabled] = useState(false);

  const [showBossConfirmationModal, setShowBossConfirmationModal] = useState(false);
  const [pendingRegionSelection, setPendingRegionSelection] = useState<string | null>(null);

  const titleAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isTitleMusicPlaying, setIsTitleMusicPlaying] = useState(false);

  const battleBgmAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentBattleBgmUrlRef = useRef<string | null>(null);
  const endingBgmAudioRef = useRef<HTMLAudioElement | null>(null);


  // Removed debug password states
  // const [generatedDebugPassword, setGeneratedDebugPassword] = useState<string | null>(null);
  // const [showDebugPasswordModal, setShowDebugPasswordModal] = useState(false);
  const [currentQuizParams, setCurrentQuizParams] = useState<CurrentQuizParams | null>(null);


  const checkForWisdomRewards = useCallback((currentPlayer: Player) => {
    WISDOM_COLLECTION_REWARDS.forEach(reward => {
      const currentCollectedIds = currentPlayer.collectedWisdomIds || [];
      const nonRewardFlagsCount = currentCollectedIds.filter(id => !id.startsWith("wisdom_reward_") && !id.startsWith("quiz_set") ).length;


      if (nonRewardFlagsCount >= reward.count) {
        const rewardFlagId = `wisdom_reward_${reward.count}_claimed`;
        if (!currentCollectedIds.includes(rewardFlagId)) {
          let message = reward.message;
          if (reward.items) {
            reward.items.forEach(rewardItem => {
              for (let i = 0; i < rewardItem.quantity; i++) {
                const itemInstance = createItemInstance(rewardItem.itemId);
                if (itemInstance) {
                  currentPlayer.inventory.push(itemInstance);
                }
              }
            });
          }
          if (!currentPlayer.collectedWisdomIds) {
            currentPlayer.collectedWisdomIds = [];
          }
          currentPlayer.collectedWisdomIds.push(rewardFlagId);
          setModalMessage(prev => prev ? `${prev}\n\n${message}` : message);
        }
      }
    });
    return currentPlayer; 
  }, []);

  const tryCollectWisdomFragment = useCallback((fragmentId: string, triggerPlayer: Player | null = player) => {
    if (!triggerPlayer) return;
    setPlayer(prevPlayer => {
      if (!prevPlayer) return null;
      let playerCopy = JSON.parse(JSON.stringify(prevPlayer)) as Player;
      if (!playerCopy.collectedWisdomIds) {
        playerCopy.collectedWisdomIds = [];
      }
      const { collectedNew, fragmentText } = collectWisdomFragment(playerCopy, fragmentId);
      if (collectedNew && fragmentText) {
        setModalMessage(prev => prev ? `${prev}\n\n【ミッチーの知恵を発見！】\n${fragmentText}` : `【ミッチーの知恵を発見！】\n${fragmentText}`);
        return checkForWisdomRewards(playerCopy);
      }
      return prevPlayer; 
    });
  }, [player, checkForWisdomRewards]);


  useEffect(() => {
    const initializeAudio = async () => {
      try {
        if (await ensureAudioContext()) {
          setIsSfxEnabled(true);
          console.log('音声の初期化に成功しました。');
        } else {
          console.warn('音声の初期化に失敗しました。ユーザーインタラクションが必要です。');
        }
      } catch (error) {
        console.error('音声の初期化中にエラーが発生しました:', error);
      }
    };

    const handleUserInteraction = () => {
      initializeAudio();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  useEffect(() => {
    try {
      const { player: loadedPlayer, regions: loadedRegions } = loadGame();
      if (loadedPlayer) {
        setPlayer(loadedPlayer);
        setRegions(loadedRegions);
        console.log('セーブデータを読み込みました。');
      } else {
        setRegions(loadedRegions);
        console.log('新しいゲームを開始します。');
      }
    } catch (error) {
      console.error('セーブデータの読み込みに失敗しました:', error);
      clearSaveData();
      setRegions(JSON.parse(JSON.stringify(REGIONS)));
    }
  }, []);

  useEffect(() => {
    if (player && 
        gamePhase !== GamePhase.BATTLE && 
        gamePhase !== GamePhase.BATTLE_REWARD_SKILL_CARD &&
        gamePhase !== GamePhase.BOSS_CONFIRMATION && 
        gamePhase !== GamePhase.FINAL_BOSS_PRE_DIALOGUE &&
        gamePhase !== GamePhase.ENDING_MESSAGE && 
        gamePhase !== GamePhase.CREDITS_ROLL &&   
        currentRun === null 
    ) {
      try {
        saveGame(player, regions);
        console.log('ゲームの状態を保存しました。');
      } catch (error) {
        console.error('ゲームの状態の保存に失敗しました:', error);
      }
    }
  }, [player, gamePhase, currentRun, regions]);

  useEffect(() => { 
    if (player && player.level === 5) {
      tryCollectWisdomFragment('wf_level_5_reached');
    }
  }, [player, tryCollectWisdomFragment]);

  const startNewGameFlow = () => {
    try {
      handleStopTitleMusic();
      clearSaveData();
      setPlayer(null); 
      const initialRegionsFromConstants = JSON.parse(JSON.stringify(REGIONS));
      setRegions(initialRegionsFromConstants); 
      setGamePhase(GamePhase.NAME_INPUT);
      console.log('新しいゲームを開始します。');
    } catch (error) {
      console.error('新しいゲームの開始に失敗しました:', error);
      setModalMessage('新しいゲームの開始に失敗しました。ページを再読み込みしてください。');
    }
  };

  const continueGameFlow = () => {
    try {
      handleStopTitleMusic();
      if (player) {
        setGamePhase(GamePhase.WORLD_MAP);
        console.log('ゲームを続行します。');
      } else {
        setModalMessage("セーブデータがみつかりませんでした。はじめからスタートします。");
        startNewGameFlow();
      }
    } catch (error) {
      console.error('ゲームの続行に失敗しました:', error);
      setModalMessage('ゲームの続行に失敗しました。ページを再読み込みしてください。');
    }
  };

  const handleNameSet = (name: string) => {
    const playerName = name.trim() || DEFAULT_PLAYER_NAME;
    const newPlayer = createInitialPlayer(playerName, PlayerClass.HERO); 
    setPlayer(newPlayer);
    setGamePhase(GamePhase.WORLD_MAP);
  };

  const handleStopTitleMusic = useCallback(() => {
    if (titleAudioRef.current) {
      titleAudioRef.current.pause();
      titleAudioRef.current.src = ''; 
      titleAudioRef.current = null; 
    }
    setIsTitleMusicPlaying(false);
  }, []);

  const handleStopBattleMusic = useCallback(() => {
    if (battleBgmAudioRef.current) {
      battleBgmAudioRef.current.pause();
      battleBgmAudioRef.current.src = '';
      battleBgmAudioRef.current = null;
      currentBattleBgmUrlRef.current = null;
    }
  }, []);

  const handleStopEndingMusic = useCallback(() => {
    if (endingBgmAudioRef.current) {
        endingBgmAudioRef.current.pause();
        endingBgmAudioRef.current.src = '';
        endingBgmAudioRef.current = null;
    }
  }, []);
  
  const handleSetGamePhase = useCallback((phase: GamePhase, associatedData?: string) => {
    if (phase !== GamePhase.BATTLE && phase !== GamePhase.BATTLE_REWARD_SKILL_CARD) {
      handleStopBattleMusic();
    }
    if (phase !== GamePhase.TITLE && 
        (phase === GamePhase.NAME_INPUT || phase === GamePhase.WORLD_MAP || phase === GamePhase.BATTLE || phase === GamePhase.FINAL_BOSS_PRE_DIALOGUE || phase === GamePhase.ENDING_MESSAGE || phase === GamePhase.CREDITS_ROLL) ) { 
        handleStopTitleMusic();
    }
    if (phase !== GamePhase.CREDITS_ROLL) {
        handleStopEndingMusic();
    }

    if (phase === GamePhase.SHOP) {
        const targetRegionId = associatedData || Object.keys(regions).find(rId => regions[rId].isUnlocked && regions[rId].shopInventoryIds && regions[rId].shopInventoryIds.length > 0) || 'r_starting_plains';
        setCurrentShopRegionId(targetRegionId);
    } else if (phase === GamePhase.GACHA) {
        const targetRegionId = associatedData || Object.keys(regions).find(rId => regions[rId].isUnlocked && regions[rId].gachaPrizeIds && regions[rId].gachaPrizeIds.length > 0) || 'r_starting_plains';
        setCurrentGachaRegionId(targetRegionId);
    } else if (phase === GamePhase.MITCHY_QUIZ && associatedData) {
        let params: CurrentQuizParams | null = null;
        switch (associatedData) {
            case QUIZ_SET_IDENTIFIERS.SET1:
                params = { questions: ALL_MITCHY_QUIZZES_SET1, completionFlagId: QUIZ_SET1_COMPLETION_FLAG_ID, wisdomFragmentForRewardId: "wf_quiz_master_set1" };
                break;
            case QUIZ_SET_IDENTIFIERS.SET2:
                params = { questions: ALL_MITCHY_QUIZZES_SET2, completionFlagId: QUIZ_SET2_COMPLETION_FLAG_ID, wisdomFragmentForRewardId: "wf_quiz_master_set2" };
                break;
            case QUIZ_SET_IDENTIFIERS.SET3:
                params = { questions: ALL_MITCHY_QUIZZES_SET3, completionFlagId: QUIZ_SET3_COMPLETION_FLAG_ID, wisdomFragmentForRewardId: "wf_quiz_master_set3" };
                break;
        }
        if (params) {
            setCurrentQuizParams(params);
        } else {
            setModalMessage("指定されたクイズセットが見つかりませんでした。");
            return; 
        }
    }
    setGamePhase(phase);
  }, [regions, handleStopTitleMusic, handleStopBattleMusic, handleStopEndingMusic]); 

  useEffect(() => {
    if (gamePhase === GamePhase.BATTLE && currentRun && player) { 
      const region = regions[currentRun.currentRegionId];
      if (!region) return;
  
      const enemies = getEnemiesForEncounter(region, currentRun.currentEncounterIndex);
      const isBoss = enemies.length === 1 && (
        enemies[0].id === ALL_ENEMIES.e_micchy_final_boss.id ||
        enemies[0].id === ALL_ENEMIES.e_micchy_sexy_knight_boss.id ||
        enemies[0].id === ALL_ENEMIES.e_micchy_baroku_saburou_boss.id ||
        enemies[0].id === ALL_ENEMIES.e_senden_biker_boss.id ||
        enemies[0].id === ALL_ENEMIES.e_orc_boss.id 
      );
      const newBgmUrl = isBoss ? BGM_FILES.BATTLE_BOSS : BGM_FILES.BATTLE_NORMAL;
  
      if (battleBgmAudioRef.current === null || currentBattleBgmUrlRef.current !== newBgmUrl) {
        if (battleBgmAudioRef.current) {
          battleBgmAudioRef.current.pause();
        }
        battleBgmAudioRef.current = new Audio(newBgmUrl);
        battleBgmAudioRef.current.crossOrigin = "anonymous";
        battleBgmAudioRef.current.loop = true;
        battleBgmAudioRef.current.volume = getMasterBgmVolume();
        currentBattleBgmUrlRef.current = newBgmUrl;
      }
      if (battleBgmAudioRef.current && battleBgmAudioRef.current.paused) {
         battleBgmAudioRef.current.play().catch(e => console.warn("Battle BGM play error:", e));
      }
    } 
  }, [gamePhase, currentRun, regions, player]); 
  
  useEffect(() => {
    return () => {
      handleStopTitleMusic();
      handleStopBattleMusic();
      handleStopEndingMusic();
    };
  }, [handleStopTitleMusic, handleStopBattleMusic, handleStopEndingMusic]);

  const handlePlayTitleMusicRequest = useCallback(() => {
    if (!isTitleMusicPlaying) {
      if (titleAudioRef.current) { 
        titleAudioRef.current.pause();
        titleAudioRef.current.src = ''; 
      }
      titleAudioRef.current = new Audio(BGM_FILES.TITLE);
      titleAudioRef.current.crossOrigin = "anonymous";
      titleAudioRef.current.loop = true;
      titleAudioRef.current.volume = getMasterBgmVolume();
      titleAudioRef.current.play().then(() => {
        setIsTitleMusicPlaying(true);
      }).catch(error => {
        console.warn("Title BGM play failed:", error);
        setIsTitleMusicPlaying(true); 
      });
    }
    if (ensureAudioContext()) { 
        setIsSfxEnabled(true);
    }
  }, [isTitleMusicPlaying]);


  const initiateRegionRun = (regionId: string) => {
    if (!player) return;
    const selectedRegion = regions[regionId];
    if (!selectedRegion || !selectedRegion.isUnlocked) return;
    
    const runPlayerSnapshot: Player = JSON.parse(JSON.stringify(player));
    runPlayerSnapshot.temporarySkills = [];
    runPlayerSnapshot.temporaryStatBoosts = {
      maxHp: 0,
      maxMp: 0,
      attack: 0,
      defense: 0,
      speed: 0,
      critRate: 0,
    };
    runPlayerSnapshot.activeBuffs = [];
    runPlayerSnapshot.usedOncePerBattleSkills = []; // Reset for the new run/battle series
    const effectiveStats = calculateEffectiveStats(runPlayerSnapshot);
    runPlayerSnapshot.currentHp = effectiveStats.maxHp;
    runPlayerSnapshot.currentMp = effectiveStats.maxMp;

    setCurrentRun({
      player: runPlayerSnapshot,
      currentRegionId: regionId,
      currentEncounterIndex: 0,
      xpGainedThisRun: 0,
      goldGainedThisRun: 0,
    });
    handleSetGamePhase(GamePhase.BATTLE); 
  };

  const handleAttemptRegionSelect = (regionId: string) => {
    const selectedRegion = regions[regionId];
    if (!selectedRegion || !player) return;

    // Check general region unlock level first
    if (selectedRegion.unlockPlayerLevel && player.level < selectedRegion.unlockPlayerLevel) {
        setModalMessage(`この地域に入るにはレベル${selectedRegion.unlockPlayerLevel}が必要です。`);
        return;
    }

    // Special handling for the final boss area
    if (regionId === REGIONS.r_micchy_castle.id) {
      const requiredKeyIds = [
        ALL_ITEMS.i_key_fragment_forest.id,
        ALL_ITEMS.i_key_fragment_cave.id,
        ALL_ITEMS.i_key_fragment_tower.id,
      ];
      const possessedKeyItems = player.inventory.filter(item => item.isKeyItem && requiredKeyIds.includes(item.id));
      const allKeysPossessed = possessedKeyItems.length === requiredKeyIds.length;

      if (!allKeysPossessed) {
        const possessedKeyNames = possessedKeyItems.map(item => item.name);
        const missingKeyNames = requiredKeyIds
          .filter(keyId => !possessedKeyItems.some(item => item.id === keyId))
          .map(keyId => ALL_ITEMS[keyId]?.name || "なぞの破片");
        
        let message = "ミッチー大魔王の強大な気配は感じるが、まだ道は閉ざされているようだ…\n\n";
        if (possessedKeyNames.length > 0) {
          message += "あつめた破片:\n  " + possessedKeyNames.join("\n  ") + "\n\n";
        }
        if (missingKeyNames.length > 0) {
          message += "たりない破片:\n  " + missingKeyNames.join("\n  ") + "\n";
        }
        setModalMessage(message);
        return; 
      }
      setPendingRegionSelection(regionId);
      handleSetGamePhase(GamePhase.FINAL_BOSS_PRE_DIALOGUE);
      return;
    }

    // Check if the region starts directly with a boss
    const isBossFirstRegion = selectedRegion.encounters.length === 0 && selectedRegion.bossId;
    if (isBossFirstRegion) {
      // If it's a boss-only region, check bossUnlockLevel now before confirmation
      if (selectedRegion.bossUnlockLevel && player.level < selectedRegion.bossUnlockLevel) {
          setModalMessage(`この地域のボスに挑戦するにはレベル${selectedRegion.bossUnlockLevel}が必要です。`);
          return;
      }
      setPendingRegionSelection(regionId);
      setShowBossConfirmationModal(true);
      handleSetGamePhase(GamePhase.BOSS_CONFIRMATION); 
    } else {
      // For regions with normal encounters, proceed to initiate the run.
      // The bossUnlockLevel for these regions will be checked in handleBattleEnd
      // before transitioning to the boss fight.
      initiateRegionRun(regionId);
    }
  };
  
  const updateCurrentRunPlayerState = useCallback((updatedRunPlayer: Player) => {
    setCurrentRun(prevRun => {
      if (!prevRun) return null;
      return { ...prevRun, player: updatedRunPlayer };
    });
  }, []);

  const handleBattleEnd = (win: boolean, xpGained: number, goldGained: number) => {
    if (!currentRun || !player) return;

    const runPlayerEndState = currentRun.player; 
    const currentRegion = regions[currentRun.currentRegionId]; // Get current region definition

    const defeatedBossId = (win && currentRun.currentEncounterIndex === currentRegion.encounters.length) 
                           ? currentRegion.bossId 
                           : null;

    let newKeyFragmentMessage: string | null = null;
    if (win) {
        const currentRegionDef = REGIONS[currentRun.currentRegionId];
        let droppedFragmentId: string | null = null;

        if (currentRegionDef.bossId === ALL_ENEMIES.e_micchy_sexy_knight_boss.id && !player.inventory.some(item => item.id === ALL_ITEMS.i_key_fragment_forest.id)) {
            if (Math.random() < 0.5) droppedFragmentId = ALL_ITEMS.i_key_fragment_forest.id;
        } else if (currentRegionDef.bossId === ALL_ENEMIES.e_micchy_baroku_saburou_boss.id && !player.inventory.some(item => item.id === ALL_ITEMS.i_key_fragment_cave.id)) {
            if (Math.random() < 0.5) droppedFragmentId = ALL_ITEMS.i_key_fragment_cave.id;
        } else if (currentRegionDef.bossId === ALL_ENEMIES.e_senden_biker_boss.id && !player.inventory.some(item => item.id === ALL_ITEMS.i_key_fragment_tower.id)) {
            if (Math.random() < 0.5) droppedFragmentId = ALL_ITEMS.i_key_fragment_tower.id;
        }
        
        if (droppedFragmentId) {
            const fragmentItemBase = ALL_ITEMS[droppedFragmentId];
            if (fragmentItemBase) {
                const fragmentItemInstance = createItemInstance(fragmentItemBase.id);
                if (fragmentItemInstance){
                    setPlayer(prevPlayer_1 => {
                        if(!prevPlayer_1) return null;
                        return { ...prevPlayer_1, inventory: [...prevPlayer_1.inventory, fragmentItemInstance] };
                    });
                    newKeyFragmentMessage = `「${fragmentItemInstance.name}」をてにいれた！`;
                }
            }
        }
    }

    if (isSfxEnabled) {
        if (win) {
            playSfx(SFX_FILES.VICTORY);
        } else {
            playSfx(SFX_FILES.GAME_OVER);
        }
    }
    
    setPlayer(prevPlayer => {
      if (!prevPlayer) return null; 
      let updatedPersistentPlayer = { ...prevPlayer };
      
      updatedPersistentPlayer.experience += xpGained;
      updatedPersistentPlayer.gold += goldGained;
      
      if (win && runPlayerEndState.currentHp > 0) {
         const persistentEffectiveStats = calculateEffectiveStats(updatedPersistentPlayer);
         updatedPersistentPlayer.currentHp = Math.min(runPlayerEndState.currentHp, persistentEffectiveStats.maxHp);
         updatedPersistentPlayer.currentMp = Math.min(runPlayerEndState.currentMp, persistentEffectiveStats.maxMp);
      } else if (!win && runPlayerEndState.currentHp <= 0) {
      }
      
      const { expiredEffectMessages } = updateActiveEffects(updatedPersistentPlayer);
      if (expiredEffectMessages.length > 0) {
           setModalMessage(prev => prev ? `${prev}\n\n${expiredEffectMessages.join('\n')}` : expiredEffectMessages.join('\n'));
      }


      const { leveledUp, newSkills } = checkLevelUp(updatedPersistentPlayer);
      if (leveledUp) {
        if (isSfxEnabled) playSfx(SFX_FILES.LEVEL_UP);
        let levelUpMsg = `レベル ${updatedPersistentPlayer.level} にあがった！`;
        if (newSkills.length > 0) {
          levelUpMsg += ` あたらしいとくぎ: ${newSkills.map(s => s.name).join('、')} をおぼえた！`;
        } else {
             levelUpMsg += `！`;
        }
        setModalMessage(prev => prev ? `${prev}\n\n${levelUpMsg}` : levelUpMsg);
      }
      
      if (defeatedBossId === ALL_ENEMIES.e_orc_boss.id) {
        updatedPersistentPlayer = tryCollectWisdomFragmentInternal(updatedPersistentPlayer, 'wf_boss_orc_defeat');
      }
      
      updatedPersistentPlayer = checkForWisdomRewards(updatedPersistentPlayer);
      
      return updatedPersistentPlayer;
    });
    
    setCurrentRun(prevRun => {
        if(!prevRun) return null;
        const nextEncounterIndex = win ? prevRun.currentEncounterIndex + 1 : prevRun.currentEncounterIndex; 
        return {
            ...prevRun,
            currentEncounterIndex: nextEncounterIndex,
            xpGainedThisRun: prevRun.xpGainedThisRun + xpGained,
            goldGainedThisRun: prevRun.goldGainedThisRun + goldGained,
        };
    });
  };

  useEffect(() => {
    if (!player || !currentRun) {
        return;
    }

    const currentRegion = regions[currentRun.currentRegionId];
    if (!currentRegion) return;

    if (gamePhase === GamePhase.BATTLE_REWARD_SKILL_CARD) {
         return;
    } else if (gamePhase === GamePhase.BATTLE) {
         const nextEncounterIndex = currentRun.currentEncounterIndex;
         const regionCleared = nextEncounterIndex > currentRegion.encounters.length;

         if (regionCleared) {
             let clearMessage = `${currentRegion.name} をクリアした！`;

             setRegions(prevRegions => ({
                 ...prevRegions,
                 [currentRun.currentRegionId]: { ...prevRegions[currentRun.currentRegionId], isCleared: true }
             }));

             if (currentRun.currentRegionId === REGIONS.r_micchy_castle.id) { 
                  handleSetGamePhase(GamePhase.ENDING_MESSAGE);
                  setCurrentRun(null);
                  return;
             }

             const regionKeys = Object.keys(REGIONS); 
             const clearedRegionKeyIndex = regionKeys.indexOf(currentRun.currentRegionId);

             if (clearedRegionKeyIndex !== -1 && clearedRegionKeyIndex + 1 < regionKeys.length) {
                 const nextRegionIdToUnlock = regionKeys[clearedRegionKeyIndex + 1];
                 const nextRegionDefinition = REGIONS[nextRegionIdToUnlock];
                 if (regions[nextRegionIdToUnlock] && !regions[nextRegionIdToUnlock].isUnlocked) {
                     let canUnlock = true;
                     if (nextRegionDefinition.unlockPlayerLevel && player.level < nextRegionDefinition.unlockPlayerLevel) {
                         canUnlock = false;
                         clearMessage += `\n${nextRegionDefinition.name}へは まだすすめないようだ... (ひつようレベル: ${nextRegionDefinition.unlockPlayerLevel})`;
                     }

                     if (canUnlock && nextRegionIdToUnlock === REGIONS.r_micchy_castle.id) {
                          const requiredKeyIds = [ALL_ITEMS.i_key_fragment_forest.id, ALL_ITEMS.i_key_fragment_cave.id, ALL_ITEMS.i_key_fragment_tower.id];
                          const allKeysPossessed = requiredKeyIds.every(keyId => player.inventory.some(item => item.id === keyId));
                          if (!allKeysPossessed) {
                              canUnlock = false;
                          }
                     }

                     if (canUnlock) {
                         setRegions(prevRegions_1 => ({
                             ...prevRegions_1,
                             [nextRegionIdToUnlock]: { ...prevRegions_1[nextRegionIdToUnlock], isUnlocked: true }
                         }));
                         clearMessage += `\nあたらしいちいき: ${REGIONS[nextRegionIdToUnlock].name} がかいほうされた！`;
                     }
                 }
             }

             setCurrentRun(null);
             handleSetGamePhase(GamePhase.WORLD_MAP);

         } else {
             if (nextEncounterIndex === currentRegion.encounters.length && currentRegion.bossId) {
                 if (currentRegion.bossUnlockLevel && player.level < currentRegion.bossUnlockLevel) {
                     let blockMessage = `${currentRegion.name} のボスに挑戦するにはまだレベルが足りない (必要レベル: ${currentRegion.bossUnlockLevel})。ワールドマップにもどります。`;
                     setModalMessage(prev => prev ? `${prev}\n\n${blockMessage}` : blockMessage);
                     setCurrentRun(null);
                     handleSetGamePhase(GamePhase.WORLD_MAP);
                     return;
                 }
             }
             handleSetGamePhase(GamePhase.BATTLE_REWARD_SKILL_CARD);
         }
    }
  }, [player, currentRun, regions, handleSetGamePhase, isSfxEnabled]);

  const handleSkillCardSelect = (card: SkillCardOption) => {
    if (!currentRun) return;
    const runPlayer = { ...currentRun.player }; 
    runPlayer.usedOncePerBattleSkills = []; // Reset for next battle in the run

    if (card.type === "STAT_BOOST") {
      Object.entries(card.boost).forEach(([key, value]) => {
        const statKey = key as keyof StatBoost;
        if (value !== undefined) {
          (runPlayer.temporaryStatBoosts[statKey] as number) = ((runPlayer.temporaryStatBoosts[statKey] as number) || 0) + value;
          if (statKey === 'maxHp') runPlayer.currentHp += value;
          if (statKey === 'maxMp') runPlayer.currentMp += value;
        }
      });
    } else if (card.type === "NEW_SKILL") {
      if (!runPlayer.temporarySkills.find(s => s.id === card.skill.id) && !runPlayer.persistentSkills.find(s => s.id === card.skill.id)) {
        runPlayer.temporarySkills.push(card.skill);
      }
    }
    const effective = calculateEffectiveStats(runPlayer);
    runPlayer.currentHp = Math.min(runPlayer.currentHp, effective.maxHp);
    runPlayer.currentMp = Math.min(runPlayer.currentMp, effective.maxMp);
    
    setCurrentRun({ ...currentRun, player: runPlayer });
    handleSetGamePhase(GamePhase.BATTLE); 
  };

  const handleGameOverContinue = () => {
    if (player) { 
        const effectiveStats = calculateEffectiveStats(player);
        setPlayer(p => p ? {...p, currentHp: effectiveStats.maxHp, currentMp: effectiveStats.maxMp, activeBuffs: [], usedOncePerBattleSkills: []} : null);
    }
    setCurrentRun(null); 
    handleSetGamePhase(GamePhase.WORLD_MAP); 
  };

  const handleFleeBattle = () => {
    if (currentRun) {
      setModalMessage(`${currentRun.player.name} はにげだした！`);
       if (player) { 
            tryCollectWisdomFragment('wf_action_run_fail_first', player);
      }
      setCurrentRun(null);
      handleSetGamePhase(GamePhase.WORLD_MAP); 
    }
  };

  const handleEquipItem = (itemToEquip: Item, slot: keyof Equipment) => {
    if (!player || !itemToEquip.instanceId) return;
    setPlayer(prevPlayer => {
        if (!prevPlayer) return null;
        
        let newPlayer = JSON.parse(JSON.stringify(prevPlayer)) as Player;
        const currentItemInSlot = newPlayer.equipment[slot];

        const itemIndexInInventory = newPlayer.inventory.findIndex(invItem => invItem.instanceId === itemToEquip.instanceId);
        if (itemIndexInInventory > -1) {
            newPlayer.inventory.splice(itemIndexInInventory, 1);
        } else {
            console.warn("装備しようとしたアイテムがインベントリに見つかりません:", itemToEquip.name);
        }

        if (currentItemInSlot) {
            newPlayer.inventory.push(currentItemInSlot);
        }
        
        newPlayer.equipment[slot] = itemToEquip;

        const oldEffectiveStats = calculateEffectiveStats(prevPlayer);
        const newEffectiveStats = calculateEffectiveStats(newPlayer);
        if (newEffectiveStats.maxHp !== oldEffectiveStats.maxHp) {
            newPlayer.currentHp = Math.min(newPlayer.currentHp, newEffectiveStats.maxHp); 
            if (newEffectiveStats.maxHp > oldEffectiveStats.maxHp) { 
                newPlayer.currentHp = Math.min(newPlayer.currentHp + (newEffectiveStats.maxHp - oldEffectiveStats.maxHp), newEffectiveStats.maxHp);
            }
        }
         if (newEffectiveStats.maxMp !== oldEffectiveStats.maxMp) {
            newPlayer.currentMp = Math.min(newPlayer.currentMp, newEffectiveStats.maxMp);
             if (newEffectiveStats.maxMp > oldEffectiveStats.maxMp) {
                newPlayer.currentMp = Math.min(newPlayer.currentMp + (newEffectiveStats.maxMp - oldEffectiveStats.maxMp), newEffectiveStats.maxMp);
            }
        }
        
        if (itemToEquip.id === 'i_micchy_buster') {
            newPlayer = tryCollectWisdomFragmentInternal(newPlayer, 'wf_equip_micchy_buster_first');
        }
        return newPlayer;
    });
  };
  const handleUnequipItem = (slot: keyof Equipment) => {
     if (!player) return;
     setPlayer(prevPlayer => {
        if (!prevPlayer) return null;
        const itemToUnequip = prevPlayer.equipment[slot];
        if (!itemToUnequip) return prevPlayer;

        const newPlayer = JSON.parse(JSON.stringify(prevPlayer)) as Player;
        newPlayer.inventory.push(itemToUnequip);
        newPlayer.equipment[slot] = null;
        
        const oldEffectiveStats = calculateEffectiveStats(prevPlayer);
        const newEffectiveStats = calculateEffectiveStats(newPlayer);
         if (newEffectiveStats.maxHp !== oldEffectiveStats.maxHp) {
            newPlayer.currentHp = Math.min(newPlayer.currentHp, newEffectiveStats.maxHp);
        }
         if (newEffectiveStats.maxMp !== oldEffectiveStats.maxMp) {
            newPlayer.currentMp = Math.min(newPlayer.currentMp, newEffectiveStats.maxMp);
        }
        return newPlayer;
     });
  };

  const tryCollectWisdomFragmentInternal = (playerState: Player, fragmentId: string): Player => {
    let playerCopy = playerState; 
    if (!playerCopy.collectedWisdomIds) {
      playerCopy.collectedWisdomIds = [];
    }
    const { collectedNew, fragmentText } = collectWisdomFragment(playerCopy, fragmentId);
    if (collectedNew && fragmentText) {
        setModalMessage(prev => prev ? `${prev}\n\n【ミッチーの知恵を発見！】\n${fragmentText}` : `【ミッチーの知恵を発見！】\n${fragmentText}`);
        playerCopy = checkForWisdomRewards(playerCopy);
    }
    return playerCopy;
  };

  const handlePurchaseItem = (itemBase: Item) => {
    if (!player || player.gold < itemBase.price) return;
    const newItemInstance = createItemInstance(itemBase.id);
    if (!newItemInstance) return;

    setPlayer(prev => {
        if (!prev) return null;
        let playerCopy = { ...prev, gold: prev.gold - itemBase.price, inventory: [...prev.inventory, newItemInstance] };
        
        if (itemBase.id === 'i_gm_dew') {
             playerCopy = tryCollectWisdomFragmentInternal(playerCopy, 'wf_item_gmdew_firstget');
        }
        return playerCopy;
    });
  };
  
  const handleSellItem = (itemToSell: Item, indexInInventory?: number) => { 
    if (!player || !itemToSell.instanceId) return;
    const sellPrice = Math.floor(itemToSell.price * 0.5);
    setPlayer(prev => {
        if (!prev) return null;
        const newInventory = prev.inventory.filter(invItem => invItem.instanceId !== itemToSell.instanceId);
        return { ...prev, gold: prev.gold + sellPrice, inventory: newInventory };
    });
  };

  const handleUseGacha = (cost: number, prizeBase: Item) => {
    if (!player) return;
    
    const isTicket = cost === 10001; 
    const actualCost = isTicket ? 0 : cost;
    const prizeInstance = createItemInstance(prizeBase.id);
    if (!prizeInstance) return;


    setPlayer(prev => {
      if (!prev) return null;
      const newInventory = [...prev.inventory, prizeInstance];
      if (isTicket) {
        const ticketIndex = newInventory.findIndex(i => i.id === 'i_gacha_ticket'); 
        if (ticketIndex > -1) newInventory.splice(ticketIndex, 1); 
      }
      let playerCopy = { ...prev, gold: prev.gold - actualCost, inventory: newInventory };
      return playerCopy;
    });
  };

  const handleEnhanceEquipment = (baseItemInstanceId: string, materialItemInstanceId: string) => {
    if (!player) return;

    setPlayer(prevPlayer => {
        if (!prevPlayer) return null;

        const newPlayer = JSON.parse(JSON.stringify(prevPlayer)) as Player;
        let baseEquipment: Item | null = null;
        let baseEquipmentLocation: 'equipment' | 'inventory' = 'inventory';
        let baseEquipmentIndex = -1; 

        if (newPlayer.equipment.weapon && newPlayer.equipment.weapon.instanceId === baseItemInstanceId) {
            baseEquipment = newPlayer.equipment.weapon;
            baseEquipmentLocation = 'equipment';
        } else if (newPlayer.equipment.armor && newPlayer.equipment.armor.instanceId === baseItemInstanceId) {
            baseEquipment = newPlayer.equipment.armor;
            baseEquipmentLocation = 'equipment';
        } else if (newPlayer.equipment.shield && newPlayer.equipment.shield.instanceId === baseItemInstanceId) {
            baseEquipment = newPlayer.equipment.shield;
            baseEquipmentLocation = 'equipment';
        } else {
            baseEquipmentIndex = newPlayer.inventory.findIndex(item => item.instanceId === baseItemInstanceId);
            if (baseEquipmentIndex > -1) {
                baseEquipment = newPlayer.inventory[baseEquipmentIndex];
            }
        }

        const materialEquipmentIndex = newPlayer.inventory.findIndex(item => item.instanceId === materialItemInstanceId);
        const materialEquipment = materialEquipmentIndex > -1 ? newPlayer.inventory[materialEquipmentIndex] : null;

        if (!baseEquipment || !materialEquipment) {
            setModalMessage("エラー: 強化に必要な装備が見つかりませんでした。");
            return prevPlayer;
        }

        if (baseEquipment.id !== materialEquipment.id || baseEquipment.type !== materialEquipment.type) {
            setModalMessage("エラー: 同じ種類の装備同士でしか強化できません。");
            return prevPlayer;
        }
        
        if (baseEquipment.type !== "ぶき" && baseEquipment.type !== "よろい" && baseEquipment.type !== "たて") {
            setModalMessage("エラー: この種類の装備は強化できません。");
            return prevPlayer;
        }

        const currentEnhancement = baseEquipment.enhancementLevel || 0;
        if (currentEnhancement >= MAX_ENHANCEMENT_LEVEL) {
            setModalMessage(`「${getDisplayItemName(baseEquipment)}」は既に最大まで強化されています。`);
            return prevPlayer;
        }

        const newEnhancementLevel = currentEnhancement + 1;
        baseEquipment.enhancementLevel = newEnhancementLevel;

        if (baseEquipmentLocation === 'equipment') {
            if (baseEquipment.type === "ぶき" && newPlayer.equipment.weapon) newPlayer.equipment.weapon.enhancementLevel = newEnhancementLevel;
            else if (baseEquipment.type === "よろい" && newPlayer.equipment.armor) newPlayer.equipment.armor.enhancementLevel = newEnhancementLevel;
            else if (baseEquipment.type === "たて" && newPlayer.equipment.shield) newPlayer.equipment.shield.enhancementLevel = newEnhancementLevel;
        } else if (baseEquipmentLocation === 'inventory' && baseEquipmentIndex > -1) {
            newPlayer.inventory[baseEquipmentIndex].enhancementLevel = newEnhancementLevel;
        }
        
        newPlayer.inventory.splice(materialEquipmentIndex, 1);

        setModalMessage(`「${getDisplayItemName(baseEquipment)}」に強化しました！`);
        return newPlayer;
    });
  };


  const handlePasswordLoadSuccess = (loadedPlayer: Player, loadedRegions: Record<string, Region>) => {
    handleStopTitleMusic();
    setPlayer(loadedPlayer);
    setRegions(loadedRegions);
    saveGame(loadedPlayer, loadedRegions); 
    handleSetGamePhase(GamePhase.WORLD_MAP);
  };

  const handleAudioEnable = () => { 
    if (ensureAudioContext()) {
        setIsSfxEnabled(true);
    }
  };

  const handleConfirmBossEncounter = () => {
    if (pendingRegionSelection) {
      initiateRegionRun(pendingRegionSelection);
    }
    setShowBossConfirmationModal(false);
    setPendingRegionSelection(null);
  };

  const handleCancelBossEncounter = () => {
    setShowBossConfirmationModal(false);
    setPendingRegionSelection(null);
    handleSetGamePhase(GamePhase.WORLD_MAP); 
  };

  const handleFinalBossDialogueComplete = () => {
    if (pendingRegionSelection) {
      initiateRegionRun(pendingRegionSelection);
      setPendingRegionSelection(null);
    } else {
      handleSetGamePhase(GamePhase.WORLD_MAP);
    }
  };
  
  const handleProceedToCredits = () => {
    handleStopBattleMusic(); 
    if (endingBgmAudioRef.current) {
      endingBgmAudioRef.current.pause();
    }
    endingBgmAudioRef.current = new Audio(BGM_FILES.TITLE); 
    endingBgmAudioRef.current.crossOrigin = "anonymous";
    endingBgmAudioRef.current.loop = true;
    endingBgmAudioRef.current.volume = getMasterBgmVolume();
    endingBgmAudioRef.current.play().catch(e => console.warn("Ending BGM play error:", e));
    handleSetGamePhase(GamePhase.CREDITS_ROLL);
  };

  const handleCreditsEnd = () => {
    handleStopEndingMusic();
    deleteSave(); 
    setPlayer(null); 
    setRegions(JSON.parse(JSON.stringify(REGIONS))); 
    handleSetGamePhase(GamePhase.TITLE);
  };

  // Removed handleGenerateDebugHighLevelPassword function
  // Removed handleCopyDebugPassword function

  const handleQuizComplete = (score: number, totalQuestions: number) => {
    if (!player || !currentQuizParams) return;
    
    const { completionFlagId, wisdomFragmentForRewardId } = currentQuizParams;
    let message = `ミッチークイズ終了！ ${score} / ${totalQuestions} 問正解でした！`;
    
    const alreadyRewarded = player.collectedWisdomIds.includes(completionFlagId);

    if (score >= QUIZ_MIN_CORRECT_FOR_REWARD && !alreadyRewarded) {
        message += "\n\n素晴らしい成績です！報酬を贈ります！";
        
        const gachaTicket = createItemInstance(ALL_ITEMS.i_gacha_ticket.id);
        if (gachaTicket) {
            setPlayer(prevPlayer => {
                if (!prevPlayer) return null;
                return {...prevPlayer, inventory: [...prevPlayer.inventory, gachaTicket]};
            });
            message += "\n・ふくびきけん x1 を手に入れた！";
        }
        
        tryCollectWisdomFragment(wisdomFragmentForRewardId); 
        
        setPlayer(prevPlayer => {
            if (!prevPlayer) return null;
            const updatedCollectedWisdomIds = prevPlayer.collectedWisdomIds.includes(completionFlagId)
                ? prevPlayer.collectedWisdomIds
                : [...prevPlayer.collectedWisdomIds, completionFlagId];
            return {...prevPlayer, collectedWisdomIds: updatedCollectedWisdomIds};
        });
        
    } else if (score >= QUIZ_MIN_CORRECT_FOR_REWARD && alreadyRewarded) {
        message += "\n\n既にこのクイズセットの報酬は獲得済みです。";
    } else {
        message += "\n\nもうすこしミッチーのことを勉強しよう！";
    }

    setModalMessage(message);
    setCurrentQuizParams(null);
    handleSetGamePhase(GamePhase.WORLD_MAP);
  };


  const renderScreen = () => {
    switch (gamePhase) {
      case GamePhase.TITLE:
        return <TitleScreen 
                  setGamePhase={handleSetGamePhase} 
                  hasSaveData={!!player} 
                  startNewGame={startNewGameFlow} 
                  continueGame={continueGameFlow}
                  onAudioStart={handleAudioEnable}
                  onPlayTitleMusicRequest={handlePlayTitleMusicRequest}
                  isTitleMusicPlaying={isTitleMusicPlaying}
                  // onGenerateDebugHighLevelPassword prop removed
                />;
      case GamePhase.NAME_INPUT:
        return <NameInputScreen setPlayerName={handleNameSet} setGamePhase={handleSetGamePhase} />;
      case GamePhase.FINAL_BOSS_PRE_DIALOGUE: 
        return <FinalBossPreDialogueScreen onDialogueComplete={handleFinalBossDialogueComplete} />;
      case GamePhase.BOSS_CONFIRMATION: 
      case GamePhase.WORLD_MAP:
        if (!player) return <TitleScreen setGamePhase={handleSetGamePhase} hasSaveData={false} startNewGame={startNewGameFlow} continueGame={continueGameFlow} onAudioStart={handleAudioEnable} onPlayTitleMusicRequest={handlePlayTitleMusicRequest} isTitleMusicPlaying={isTitleMusicPlaying} />; 
        return <WorldMapScreen regions={regions} onSelectRegion={handleAttemptRegionSelect} setGamePhase={handleSetGamePhase} player={player}/>;
      case GamePhase.BATTLE:
        if (!currentRun) {
             setModalMessage("エラー: アクティブなランがありません。マップにもどります。");
             handleSetGamePhase(GamePhase.WORLD_MAP);
             return null;
        }
        const currentRegionForBattle = regions[currentRun.currentRegionId];
         if (!currentRegionForBattle) {
            setModalMessage("エラー: 現在の地域データが見つかりません。マップに戻ります。");
            setCurrentRun(null);
            handleSetGamePhase(GamePhase.WORLD_MAP);
            return null;
        }
        const enemiesForBattle = getEnemiesForEncounter(currentRegionForBattle, currentRun.currentEncounterIndex);
        if (enemiesForBattle.length === 0 && currentRun.currentEncounterIndex <= currentRegionForBattle.encounters.length) { 
            if (currentRun.currentEncounterIndex !== currentRegionForBattle.encounters.length || !currentRegionForBattle.bossId) {
              setModalMessage("エラー: このそうぐうでてきが見つかりませんでした。マップにもどります。");
              setCurrentRun(null); 
              handleSetGamePhase(GamePhase.WORLD_MAP);
              return null;
            }
        }
        const battleBgUrl = currentRegionForBattle?.battleBackgroundUrl;
        return <BattleScreen 
                  currentRun={currentRun} 
                  initialEnemies={enemiesForBattle} 
                  onBattleEnd={handleBattleEnd} 
                  updateCurrentRunPlayer={updateCurrentRunPlayerState} 
                  onFleeBattle={handleFleeBattle} 
                  isSfxEnabled={isSfxEnabled}
                  battleBgUrl={battleBgUrl} 
                />;
      case GamePhase.BATTLE_REWARD_SKILL_CARD:
        return <SkillCardSelectionScreen onCardSelect={handleSkillCardSelect} />;
      case GamePhase.GAME_OVER:
        if (!currentRun) { 
             setModalMessage("エラー: ゲームオーバー状態が無効です。タイトルに戻ります。");
             handleSetGamePhase(GamePhase.TITLE);
             return null;
        }
        return <GameOverScreen xpGained={currentRun.xpGainedThisRun} goldGained={currentRun.goldGainedThisRun} onContinue={handleGameOverContinue} />;
      case GamePhase.ENDING_MESSAGE:
        return <EndingMessageScreen onProceed={handleProceedToCredits} />;
      case GamePhase.CREDITS_ROLL:
        return <CreditsRollScreen playerName={player?.name || DEFAULT_PLAYER_NAME} onCreditsEnd={handleCreditsEnd} />;
      case GamePhase.STATUS_SCREEN:
        if (!player) return <p>プレイヤーデータがありません。</p>;
        return <StatusScreen player={player} setGamePhase={handleSetGamePhase} onEquipItem={handleEquipItem} onUnequipItem={handleUnequipItem} onEnhanceEquipment={handleEnhanceEquipment}/>;
      case GamePhase.SHOP:
        if (!player) return <p>プレイヤーデータがありません。</p>;
        return <ShopScreen player={player} currentShopRegionId={currentShopRegionId} allRegions={regions} onPurchaseItem={handlePurchaseItem} onSellItem={handleSellItem} setGamePhase={handleSetGamePhase} />;
      case GamePhase.GACHA:
        if (!player) return <p>プレイヤーデータがありません。</p>;
        return <GachaScreen player={player} currentGachaRegionId={currentGachaRegionId} allRegions={regions} onUseGacha={handleUseGacha} setGamePhase={handleSetGamePhase} />;
      case GamePhase.WISDOM_BAG: 
        if (!player) return <p>プレイヤーデータがありません。</p>;
        return <WisdomBagScreen player={player} setGamePhase={handleSetGamePhase} />;
      case GamePhase.MITCHY_QUIZ:
        if (!player || !currentQuizParams) {
            setModalMessage("クイズの準備ができていません。");
            handleSetGamePhase(GamePhase.WORLD_MAP);
            return null;
        }
        return <MitchyQuizScreen 
                  player={player} 
                  questions={currentQuizParams.questions} 
                  onQuizComplete={handleQuizComplete} 
                  setGamePhase={handleSetGamePhase} 
                />;
      case GamePhase.PASSWORD_SAVE:
        return <PasswordManagementScreen mode="save" playerData={player} regionsData={regions} setGamePhase={handleSetGamePhase} onLoadSuccess={handlePasswordLoadSuccess} />;
      case GamePhase.PASSWORD_LOAD:
        return <PasswordManagementScreen mode="load" playerData={player} regionsData={regions} setGamePhase={handleSetGamePhase} onLoadSuccess={handlePasswordLoadSuccess} />;
      default:
        return <p>ふめいなゲームフェーズです！</p>;
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-stretch justify-stretch overflow-hidden">
      {renderScreen()}
      {modalMessage && (
        <Modal isOpen={!!modalMessage} onClose={() => setModalMessage(null)} title="おしらせ">
          <p className="text-shadow-dq whitespace-pre-wrap">{modalMessage}</p>
        </Modal>
      )}
       {showBossConfirmationModal && (
        <Modal isOpen={showBossConfirmationModal} title="かくにん">
          <p className="text-shadow-dq mb-4 whitespace-pre-wrap">このさきには きょうだいな まもののけはいがする...。</p>
          <p className="text-shadow-dq whitespace-pre-wrap">すすみますか？</p>
          <div className="mt-6 flex gap-4">
            <button onClick={handleConfirmBossEncounter} className="dq-button confirm w-full-dq-button">はい</button>
            <button onClick={handleCancelBossEncounter} className="dq-button danger w-full-dq-button">いいえ</button>
          </div>
        </Modal>
      )}
      {/* Debug password modal removed */}
    </div>
  );
};

export default App;
