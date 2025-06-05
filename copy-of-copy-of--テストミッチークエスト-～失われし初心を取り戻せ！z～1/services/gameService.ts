

import { Player, PlayerClass, GamePhase, StatBoost, Skill, Equipment, Item, CurrentRun, Region, Enemy, BuffType, DebuffType, AppliedDebuff, AppliedBuff } from '../types';
import { 
    PLAYER_CLASSES, DEFAULT_PLAYER_NAME, XP_FOR_LEVEL, STAT_INCREASE_PER_LEVEL, 
    ALL_SKILLS, ALL_ITEMS, REGIONS, ALL_ENEMIES, 
    WEAPON_ENHANCEMENT_ATTACK_BONUS_PER_LEVEL, MAX_ENHANCEMENT_LEVEL,
    ARMOR_ENHANCEMENT_DEFENSE_BONUS_PER_LEVEL, SHIELD_ENHANCEMENT_DEFENSE_BONUS_PER_LEVEL,
    ALL_WISDOM_FRAGMENTS
} from '../constants';

declare var pako: any; 

const LOCAL_STORAGE_KEY = 'miniQuestSagaGameData';

export const createItemInstance = (itemId: string, initialEnhancementLevel: number = 0): Item | null => {
  const baseItem = ALL_ITEMS[itemId];
  if (!baseItem) return null;

  const newInstance = JSON.parse(JSON.stringify(baseItem)) as Item; 
  newInstance.instanceId = `${itemId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  if (newInstance.type === "ぶき" || newInstance.type === "よろい" || newInstance.type === "たて") {
    newInstance.enhancementLevel = initialEnhancementLevel;
  }
  return newInstance;
};

export const getDisplayItemName = (item: Item): string => {
  if ((item.type === "ぶき" || item.type === "よろい" || item.type === "たて") && item.enhancementLevel && item.enhancementLevel > 0) {
    return `${item.name}+${item.enhancementLevel}`;
  }
  return item.name;
};

export const createInitialPlayer = (name: string, playerClassInput: PlayerClass): Player => {
  const playerClass = PlayerClass.HERO;
  const classInfo = PLAYER_CLASSES[playerClass];
  const initialSkills = classInfo.initialSkills.map(id => ALL_SKILLS[id]).filter(Boolean);

  const initialInventory: Item[] = [];
  const herbInstance1 = createItemInstance(ALL_ITEMS.i_herb.id);
  const herbInstance2 = createItemInstance(ALL_ITEMS.i_herb.id);
  if (herbInstance1) initialInventory.push(herbInstance1);
  if (herbInstance2) initialInventory.push(herbInstance2);
  
  const initialWeapon = createItemInstance(ALL_ITEMS.i_wooden_sword.id);
  const initialArmor = createItemInstance(ALL_ITEMS.i_leather_armor.id);
  const initialShield = createItemInstance(ALL_ITEMS.i_small_shield.id);


  const player: Player = {
    name: name || DEFAULT_PLAYER_NAME,
    playerClass,
    level: 1,
    experience: 0,
    gold: 50,
    baseStats: { ...classInfo.baseStats },
    currentHp: classInfo.baseStats.maxHp || 0,
    currentMp: classInfo.baseStats.maxMp || 0,
    equipment: { 
      weapon: initialWeapon, 
      armor: initialArmor, 
      shield: initialShield 
    },
    inventory: initialInventory, 
    persistentSkills: initialSkills,
    collectedWisdomIds: [], 
    temporarySkills: [],
    temporaryStatBoosts: {},
    activeBuffs: [],
    usedOncePerBattleSkills: [],
  };
  return player;
};

export const calculateEffectiveStats = (player: Player, enemy?: Enemy): Required<StatBoost> => {
  const baseStats = 'stats' in player ? (player as unknown as Enemy).stats : player.baseStats; // Type guard or cast if used for enemy too
  let effective: Required<StatBoost> = {
    maxHp: baseStats.maxHp || 0,
    maxMp: baseStats.maxMp || 0,
    attack: baseStats.attack || 0,
    defense: baseStats.defense || 0,
    speed: baseStats.speed || 0,
    critRate: baseStats.critRate || 0,
  };

  if ('equipment' in player) { // Player specific equipment
    Object.values(player.equipment).forEach(item => {
      if (item) {
        effective.attack += item.attackBoost || 0;
        effective.defense += item.defenseBoost || 0;

        if (item.enhancementLevel) {
          if (item.type === "ぶき") {
            effective.attack += (item.enhancementLevel * WEAPON_ENHANCEMENT_ATTACK_BONUS_PER_LEVEL);
          } else if (item.type === "よろい") {
            effective.defense += (item.enhancementLevel * ARMOR_ENHANCEMENT_DEFENSE_BONUS_PER_LEVEL);
          } else if (item.type === "たて") {
            effective.defense += (item.enhancementLevel * SHIELD_ENHANCEMENT_DEFENSE_BONUS_PER_LEVEL);
          }
        }
      }
    });
  }
  
  if ('temporaryStatBoosts' in player) { // Player specific temp boosts
    Object.entries(player.temporaryStatBoosts).forEach(([key, value]) => {
        if (value !== undefined) {
        (effective as any)[key] = ((effective as any)[key] || 0) + value;
        }
    });
  }
  
  // Player Buffs
  if ('activeBuffs' in player) {
    player.activeBuffs.forEach(buff => {
      const skill = ALL_SKILLS[buff.skillId]; // Get original skill for statBoost definition
      if (skill && skill.statBoost) { // Check s_defend or s_bless style stat boosts
          Object.entries(skill.statBoost).forEach(([statKey, boostValue]) => {
            if (boostValue !== undefined) {
              if (statKey === 'defense' && skill.id === 's_defend') { // s_defend is multiplier
                (effective as any)[statKey] = Math.floor(((effective as any)[statKey] || 0) * boostValue);
              } else { // s_bless is flat
                (effective as any)[statKey] = ((effective as any)[statKey] || 0) + boostValue;
              }
            }
          });
      }
      // New buff types (EVADE_ALL, SELF_STUN) don't directly modify stats here, they are checked in combat logic
    });
  }

  // Enemy Debuffs (if enemy is passed)
  if (enemy && 'activeDebuffs' in enemy) {
    enemy.activeDebuffs.forEach(debuff => {
      if (debuff.type === DebuffType.DEFENSE_DOWN && debuff.value !== undefined) {
        effective.defense = Math.max(0, effective.defense - debuff.value);
      }
      // ACCURACY_DOWN and STUN are handled in combat logic, not direct stat calculation
    });
  }


  return effective;
};

export const checkLevelUp = (player: Player): { leveledUp: boolean; newSkills: Skill[] } => {
  let leveledUp = false;
  const newSkills: Skill[] = [];
  
  while (player.level < XP_FOR_LEVEL.length && player.experience >= XP_FOR_LEVEL[player.level]) {
    player.level++;
    leveledUp = true;
    const classStatIncrease = STAT_INCREASE_PER_LEVEL[player.playerClass]; 
    Object.entries(classStatIncrease).forEach(([stat, value]) => {
      if (player.baseStats[stat as keyof StatBoost] !== undefined && value !== undefined) {
        (player.baseStats[stat as keyof StatBoost] as number) += value;
      }
    });
    player.baseStats.maxHp = Math.max(1, Math.round(player.baseStats.maxHp || 1));
    player.baseStats.maxMp = Math.max(0, Math.round(player.baseStats.maxMp || 0));

    Object.values(ALL_SKILLS).forEach(skill => {
      if (skill.unlockLevel === player.level && !player.persistentSkills.find(ps => ps.id === skill.id)) {
        player.persistentSkills.push(skill);
        newSkills.push(skill);
      }
    });
  }
  if (leveledUp) {
    const effectiveStats = calculateEffectiveStats(player);
    player.currentHp = effectiveStats.maxHp;
    player.currentMp = effectiveStats.maxMp;
  }
  return { leveledUp, newSkills };
};

const hydrateItem = (itemData: any): Item | null => {
  if (!itemData || !itemData.id) return null;
  const baseItem = ALL_ITEMS[itemData.id];
  if (!baseItem) return null;
  
  const hydrated = { ...baseItem, ...itemData }; 
  if (!hydrated.instanceId && hydrated.isEquippable) { 
    hydrated.instanceId = `${hydrated.id}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }
  if ((hydrated.type === 'ぶき' || hydrated.type === 'よろい' || hydrated.type === 'たて') && typeof hydrated.enhancementLevel !== 'number') {
    hydrated.enhancementLevel = 0;
  }
  return hydrated;
};

const hydratePlayerEquipmentAndInventory = (player: Player): Player => {
    const newPlayer = { ...player };
    newPlayer.equipment.weapon = player.equipment.weapon ? hydrateItem(player.equipment.weapon) : null;
    newPlayer.equipment.armor = player.equipment.armor ? hydrateItem(player.equipment.armor) : null;
    newPlayer.equipment.shield = player.equipment.shield ? hydrateItem(player.equipment.shield) : null;
    newPlayer.inventory = player.inventory.map(hydrateItem).filter(Boolean) as Item[];
    return newPlayer;
};


export const saveGame = (player: Player | null, unlockedRegions: Record<string, Region>): void => {
  if (!player) return;
  try {
    const regionsToSave = Object.fromEntries(
      Object.entries(unlockedRegions).map(([id, region]) => [id, { isUnlocked: region.isUnlocked, isCleared: region.isCleared }])
    );
    const dataToSave = { player: { ...player, collectedWisdomIds: player.collectedWisdomIds || [], usedOncePerBattleSkills: player.usedOncePerBattleSkills || [] }, regions: regionsToSave };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (error) {
    console.error("セーブに失敗しました:", error);
  }
};

export const loadGame = (): { player: Player | null; regions: Record<string, Region> } => {
  try {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      if (parsedData.player && parsedData.regions) {
         let loadedPlayer = parsedData.player as Player;
         loadedPlayer = hydratePlayerEquipmentAndInventory(loadedPlayer); 

         loadedPlayer.baseStats = {
            maxHp: Number(loadedPlayer.baseStats.maxHp) || 20,
            maxMp: Number(loadedPlayer.baseStats.maxMp) || 10,
            attack: Number(loadedPlayer.baseStats.attack) || 5,
            defense: Number(loadedPlayer.baseStats.defense) || 5,
            speed: Number(loadedPlayer.baseStats.speed) || 5,
            critRate: Number(loadedPlayer.baseStats.critRate) || 0.05,
         };
         loadedPlayer.currentHp = Number(loadedPlayer.currentHp) || loadedPlayer.baseStats.maxHp;
         loadedPlayer.currentMp = Number(loadedPlayer.currentMp) || loadedPlayer.baseStats.maxMp;
         loadedPlayer.persistentSkills = loadedPlayer.persistentSkills || [];
         loadedPlayer.temporarySkills = loadedPlayer.temporarySkills || [];
         loadedPlayer.temporaryStatBoosts = loadedPlayer.temporaryStatBoosts || {};
         loadedPlayer.activeBuffs = loadedPlayer.activeBuffs || []; // Ensure activeBuffs is initialized
         loadedPlayer.collectedWisdomIds = loadedPlayer.collectedWisdomIds || []; 
         loadedPlayer.usedOncePerBattleSkills = loadedPlayer.usedOncePerBattleSkills || [];
         if (loadedPlayer.playerClass !== PlayerClass.HERO) {
            console.warn(`旧バージョンの職業(${loadedPlayer.playerClass})を${PlayerClass.HERO}に変換しました。`);
            loadedPlayer.playerClass = PlayerClass.HERO;
         }

        const loadedRegionsState = parsedData.regions as Record<string, {isUnlocked: boolean, isCleared: boolean}>;
        const fullRegionsData = JSON.parse(JSON.stringify(REGIONS)); 
        Object.keys(fullRegionsData).forEach(regionId => {
          if(loadedRegionsState[regionId]) {
            fullRegionsData[regionId].isUnlocked = loadedRegionsState[regionId].isUnlocked;
            fullRegionsData[regionId].isCleared = loadedRegionsState[regionId].isCleared;
          }
        });
        return { player: loadedPlayer, regions: fullRegionsData };
      }
    }
  } catch (error) {
    console.error("ロードに失敗しました:", error);
  }
  const defaultRegionsFromConstants = JSON.parse(JSON.stringify(REGIONS));
  return { player: null, regions: defaultRegionsFromConstants }; 
};

export const deleteSave = (): void => {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
};

export const generatePassword = (player: Player, regions: Record<string, Region>): string => {
  if (typeof pako === 'undefined') {
    console.error("pako (圧縮ライブラリ) が読み込まれていません。パスワードを生成できません。");
    return "エラー: pakoが見つかりません";
  }
  try {
    const regionsToSave = Object.fromEntries(
      Object.entries(regions).map(([id, region]) => [id, { isUnlocked: region.isUnlocked, isCleared: region.isCleared }])
    );
    const data = { player: { ...player, collectedWisdomIds: player.collectedWisdomIds || [], usedOncePerBattleSkills: player.usedOncePerBattleSkills || [] }, regions: regionsToSave };
    const jsonString = JSON.stringify(data);
    const compressed = pako.deflate(jsonString); 
    let binaryString = '';
    for (let i = 0; i < compressed.length; i++) {
        binaryString += String.fromCharCode(compressed[i]);
    }
    return btoa(binaryString);
  } catch (e) {
    console.error("パスワード生成に失敗しました:", e);
    return "";
  }
};

export const loadFromPassword = (password: string): { player: Player | null; regions: Record<string, Region> } => {
  if (typeof pako === 'undefined') {
    console.error("pako (圧縮ライブラリ) が読み込まれていません。パスワードを読み込めません。");
    const defaultRegionsOnErrorPako = JSON.parse(JSON.stringify(REGIONS));
    return { player: null, regions: defaultRegionsOnErrorPako };
  }

  const cleanedPassword = password.replace(/\s/g, ''); // Remove all internal whitespace

  try {
    const binaryString = atob(cleanedPassword); // Use cleanedPassword
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    const decompressedJson = pako.inflate(bytes, { to: 'string' });
    const parsedData = JSON.parse(decompressedJson);

     if (parsedData.player && parsedData.regions) {
        let loadedPlayer = parsedData.player as Player;
        loadedPlayer = hydratePlayerEquipmentAndInventory(loadedPlayer); 

         loadedPlayer.baseStats = {
            maxHp: Number(loadedPlayer.baseStats.maxHp) || 20,
            maxMp: Number(loadedPlayer.baseStats.maxMp) || 10,
            attack: Number(loadedPlayer.baseStats.attack) || 5,
            defense: Number(loadedPlayer.baseStats.defense) || 5,
            speed: Number(loadedPlayer.baseStats.speed) || 5,
            critRate: Number(loadedPlayer.baseStats.critRate) || 0.05,
         };
        loadedPlayer.currentHp = Number(loadedPlayer.currentHp) || loadedPlayer.baseStats.maxHp;
        loadedPlayer.currentMp = Number(loadedPlayer.currentMp) || loadedPlayer.baseStats.maxMp;
        loadedPlayer.persistentSkills = loadedPlayer.persistentSkills || [];
        loadedPlayer.temporarySkills = loadedPlayer.temporarySkills || [];
        loadedPlayer.temporaryStatBoosts = loadedPlayer.temporaryStatBoosts || {};
        loadedPlayer.activeBuffs = loadedPlayer.activeBuffs || []; 
        loadedPlayer.collectedWisdomIds = loadedPlayer.collectedWisdomIds || []; 
        loadedPlayer.usedOncePerBattleSkills = loadedPlayer.usedOncePerBattleSkills || [];
         if (loadedPlayer.playerClass !== PlayerClass.HERO) {
            console.warn(`旧バージョンの職業(${loadedPlayer.playerClass})を${PlayerClass.HERO}に変換しました。(パスワードロード)`);
            loadedPlayer.playerClass = PlayerClass.HERO;
         }

        const loadedRegionsState = parsedData.regions as Record<string, {isUnlocked: boolean, isCleared: boolean}>;
        const fullRegionsData = JSON.parse(JSON.stringify(REGIONS)); 
        Object.keys(fullRegionsData).forEach(regionId => {
          if(loadedRegionsState[regionId]) {
            fullRegionsData[regionId].isUnlocked = loadedRegionsState[regionId].isUnlocked;
            fullRegionsData[regionId].isCleared = loadedRegionsState[regionId].isCleared;
          }
        });
        return { player: loadedPlayer, regions: fullRegionsData };
      }
  } catch (e) {
    console.error("パスワードからのロードに失敗しました:", e);
    try {
        console.warn("圧縮パスワードの解析に失敗。非圧縮パスワードとして再試行します...");
        const decodedStringFromAtob = atob(cleanedPassword); // Use cleanedPassword for fallback as well
        const decodedString = decodeURIComponent(decodedStringFromAtob); 
        const parsedDataFallback = JSON.parse(decodedString);
        if (parsedDataFallback.player && parsedDataFallback.regions) {
           let loadedPlayer = parsedDataFallback.player as Player;
           loadedPlayer = hydratePlayerEquipmentAndInventory(loadedPlayer); 

           loadedPlayer.baseStats = {
              maxHp: Number(loadedPlayer.baseStats.maxHp) || 20,
              maxMp: Number(loadedPlayer.baseStats.maxMp) || 10,
              attack: Number(loadedPlayer.baseStats.attack) || 5,
              defense: Number(loadedPlayer.baseStats.defense) || 5,
              speed: Number(loadedPlayer.baseStats.speed) || 5,
              critRate: Number(loadedPlayer.baseStats.critRate) || 0.05,
           };
          loadedPlayer.currentHp = Number(loadedPlayer.currentHp) || loadedPlayer.baseStats.maxHp;
          loadedPlayer.currentMp = Number(loadedPlayer.currentMp) || loadedPlayer.baseStats.maxMp;
          loadedPlayer.persistentSkills = loadedPlayer.persistentSkills || [];
          loadedPlayer.temporarySkills = loadedPlayer.temporarySkills || [];
          loadedPlayer.temporaryStatBoosts = loadedPlayer.temporaryStatBoosts || {};
          loadedPlayer.activeBuffs = loadedPlayer.activeBuffs || []; 
          loadedPlayer.collectedWisdomIds = loadedPlayer.collectedWisdomIds || []; 
          loadedPlayer.usedOncePerBattleSkills = loadedPlayer.usedOncePerBattleSkills || [];
          if (loadedPlayer.playerClass !== PlayerClass.HERO) {
             console.warn(`旧バージョンの職業(${loadedPlayer.playerClass})を${PlayerClass.HERO}に変換しました。(フォールバックパスワードロード)`);
             loadedPlayer.playerClass = PlayerClass.HERO;
          }

          const loadedRegionsState = parsedDataFallback.regions as Record<string, {isUnlocked: boolean, isCleared: boolean}>;
          const fullRegionsData = JSON.parse(JSON.stringify(REGIONS)); 
          Object.keys(fullRegionsData).forEach(regionId => {
            if(loadedRegionsState[regionId]) {
              fullRegionsData[regionId].isUnlocked = loadedRegionsState[regionId].isUnlocked;
              fullRegionsData[regionId].isCleared = loadedRegionsState[regionId].isCleared;
            }
          });
          console.log("非圧縮パスワードの読み込みに成功しました。");
          return { player: loadedPlayer, regions: fullRegionsData };
        }
    } catch (e2) {
        console.error("フォールバックのパスワード読み込みも失敗しました:", e2);
    }
  }
  const defaultRegionsOnErrorFromConstants = JSON.parse(JSON.stringify(REGIONS));
  return { player: null, regions: defaultRegionsOnErrorFromConstants };
};

const KING_METAL_MITCHY_ID = "e_king_metal_mitchy";
const KING_METAL_MITCHY_CHANCE = 0.01; // Reverted from 0.5 (50%) back to 0.01 (1%)

export const getEnemiesForEncounter = (region: Region, encounterIndex: number, currentStageInBossFight?: number): Enemy[] => {
  let enemyIds: string[];
  const isBossEncounter = encounterIndex === region.encounters.length;

  if (isBossEncounter) {
    if (region.id === REGIONS.r_micchy_tower.id) {
      enemyIds = [currentStageInBossFight === 2 ? ALL_ENEMIES.e_micchy_dragonlord.id : region.bossId];
    } else {
      enemyIds = [region.bossId];
    }
  } else if (encounterIndex < region.encounters.length) {
    // Check for King Metal Mitchy for non-boss encounters, but not in the final castle
    if (region.id !== REGIONS.r_micchy_castle.id && Math.random() < KING_METAL_MITCHY_CHANCE) {
      enemyIds = [KING_METAL_MITCHY_ID];
    } else {
      enemyIds = region.encounters[encounterIndex];
    }
  } else {
    return []; 
  }

  return enemyIds.map(id => {
    const enemyData = ALL_ENEMIES[id];
    if (!enemyData) return null;
    return { 
        ...enemyData, 
        stats: { ...enemyData.stats, currentHp: enemyData.stats.maxHp, currentMp: enemyData.stats.maxMp },
        activeDebuffs: [] // Initialize activeDebuffs for each enemy instance
    };
  }).filter(Boolean) as Enemy[];
};

export const collectWisdomFragment = (player: Player, fragmentId: string): { collectedNew: boolean, fragmentText: string | null } => {
  if (!player.collectedWisdomIds.includes(fragmentId)) {
    const fragmentData = ALL_WISDOM_FRAGMENTS[fragmentId];
    if (fragmentData) {
      player.collectedWisdomIds.push(fragmentId);
      return { collectedNew: true, fragmentText: fragmentData.text };
    }
  }
  return { collectedNew: false, fragmentText: null };
};