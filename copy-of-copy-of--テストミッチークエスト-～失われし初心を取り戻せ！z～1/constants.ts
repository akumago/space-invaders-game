

import { PlayerClass, Skill, Item, Enemy, Region, StatBoost, SkillType, TargetType, SkillCardOption, WisdomFragment, QuizQuestion, DebuffType, BuffType } from './types';

export const MAX_PLAYER_NAME_LENGTH = 4;
export const DEFAULT_PLAYER_NAME = "ゆうしゃ";
export const PLACEHOLDER_BOSS_SPRITE_URL = "https://picsum.photos/seed/evilplaceholder/150/150";

export const MAX_ENHANCEMENT_LEVEL = 10; 
export const WEAPON_ENHANCEMENT_ATTACK_BONUS_PER_LEVEL = 2; 
export const ARMOR_ENHANCEMENT_DEFENSE_BONUS_PER_LEVEL = 1; 
export const SHIELD_ENHANCEMENT_DEFENSE_BONUS_PER_LEVEL = 1; 


export const PLAYER_CLASSES: Record<PlayerClass, { baseStats: StatBoost, initialSkills: string[] }> = {
  [PlayerClass.HERO]: {
    baseStats: { maxHp: 28, maxMp: 15, attack: 7, defense: 5, speed: 5, critRate: 0.03 },
    initialSkills: ["s_power_strike", "s_fireball", "s_heal_light"],
  },
};

export const ALL_SKILLS: Record<string, Skill> = {
  // Hero Skills
  s_power_strike: { id: "s_power_strike", name: "パワーストライク", type: SkillType.ATTACK, description: "強力な物理攻撃。", mpCost: 2, power: 1.5, target: TargetType.SINGLE_ENEMY, unlockLevel: 1 },
  s_defend: { id: "s_defend", name: "ぼうぎょ", type: SkillType.DEFEND, description: "1ターンの間、防御力を大幅に上げる。", mpCost: 1, statBoost: { defense: 1.5 }, duration: 1, target: TargetType.SELF, unlockLevel: 2 }, // Multiplier
  s_cleave: { id: "s_cleave", name: "なぎはらい", type: SkillType.ATTACK, description: "複数の敵を攻撃する。", mpCost: 4, power: 0.8, target: TargetType.ALL_ENEMIES, unlockLevel: 5 },
  
  s_fireball: { id: "s_fireball", name: "メラ", type: SkillType.MAGIC, element: 'fire', description: "小さな火の玉を放つ。", mpCost: 3, power: 18, target: TargetType.SINGLE_ENEMY, unlockLevel: 1 },
  s_ice_lance: { id: "s_ice_lance", name: "ヒャド", type: SkillType.MAGIC, element: 'ice', description: "鋭い氷のやいばで攻撃。", mpCost: 5, power: 28, target: TargetType.SINGLE_ENEMY, unlockLevel: 4 },
  s_doom_blast: { id: "s_doom_blast", name: "ダークブラスト", type: SkillType.MAGIC, element: 'dark', description: "強力な闇の爆発。", mpCost: 10, power: 60, target: TargetType.SINGLE_ENEMY, unlockLevel: 12 },
  
  s_firestorm: { id: "s_firestorm", name: "メラミ", type: SkillType.MAGIC, element: 'fire', description: "中くらいの火の玉を放つ。", mpCost: 6, power: 35, target: TargetType.SINGLE_ENEMY, unlockLevel: 7 },
  s_blizzard: { id: "s_blizzard", name: "ヒャダルコ", type: SkillType.MAGIC, element: 'ice', description: "氷の嵐で敵全体を攻撃。", mpCost: 9, power: 25, target: TargetType.ALL_ENEMIES, unlockLevel: 10 },
  s_inferno: { id: "s_inferno", name: "メラゾーマ", type: SkillType.MAGIC, element: 'fire', description: "巨大な炎の業火で焼き尽くす。", mpCost: 12, power: 80, target: TargetType.SINGLE_ENEMY, unlockLevel: 14 },

  s_drain_slash: { id: "s_drain_slash", name: "ドレインスラッシュ", type: SkillType.ATTACK, description: "敵にダメージを与え、その一部を自分のHPとして吸収する斬撃。", mpCost: 6, power: 1.3, target: TargetType.SINGLE_ENEMY, drainFactor: 0.5, unlockLevel: 9 },

  s_heal_light: { id: "s_heal_light", name: "ホイミ", type: SkillType.HEAL, description: "HPを少し回復する。", mpCost: 4, healAmount: 25, target: TargetType.SELF, unlockLevel: 1 },
  s_heal_mid: { id: "s_heal_mid", name: "ベホイミ", type: SkillType.HEAL, description: "HPをまあまあ回復する。", mpCost: 7, healAmount: 60, target: TargetType.SELF, unlockLevel: 5 },
  s_bash: { id: "s_bash", name: "たたく", type: SkillType.ATTACK, description: "弱い物理攻撃。", mpCost: 0, power: 0.8, target: TargetType.SINGLE_ENEMY, unlockLevel: 1 }, 
  s_bless: { id: "s_bless", name: "バイキルト", type: SkillType.BUFF, description: "攻撃力を上げる。", mpCost: 3, statBoost: { attack: 5 }, duration: 3, target: TargetType.SELF, unlockLevel: 3 },
  s_explosion: { id: "s_explosion", name: "イオナズン", type: SkillType.MAGIC, element: 'dark', description: "すべてを吹き飛ばす大爆発。(敵専用)", mpCost: 20, power: 45, target: TargetType.ALL_ENEMIES, unlockLevel: 99 }, 
  s_escape: { id: "s_escape", name: "にげる", type: SkillType.DEFEND, description: "戦闘から逃げる。", mpCost: 0, target: TargetType.SELF, unlockLevel: 1 }, // For Metal Slime AI

  // Mitchy Special Skills
  s_32bit_float_shout: {
    id: "s_32bit_float_shout", name: "32bitフロートシャウト", type: SkillType.MAGIC,
    description: "音割れしないクリアな大声で叫び、敵単体に小ダメージを与え、確率で1ターン行動不能にする。",
    mpCost: 6, power: 20, target: TargetType.SINGLE_ENEMY, unlockLevel: 4,
    debuffsToTarget: [{ type: DebuffType.STUN, chance: 0.3, duration: 1 }]
  },
  s_gm_lens_flash: {
    id: "s_gm_lens_flash", name: "GMレンズフラッシュ", type: SkillType.MAGIC,
    description: "GMレンズから閃光を放ち、敵全体に小ダメージと確率で「めつぶし」状態にする。",
    mpCost: 8, power: 10, target: TargetType.ALL_ENEMIES, unlockLevel: 7,
    debuffsToTarget: [{ type: DebuffType.ACCURACY_DOWN, chance: 0.4, duration: 2, value: 0.25 }] // 25% accuracy reduction
  },
  s_mitchy_scelt: {
    id: "s_mitchy_scelt", name: "鉄壁の配信環境", type: SkillType.BUFF,
    description: "ミッチー自慢の配信環境が鉄壁の守りを生み出す！これでアンチコメントも怖くないぞ！...たぶん。",
    mpCost: 4, statBoost: { defense: 8 }, duration: 3, target: TargetType.SELF, unlockLevel: 6,
  },
  s_enjo_kaihi_move: {
    id: "s_enjo_kaihi_move", name: "炎上回避ムーブ", type: SkillType.BUFF,
    description: "1ターンの間、敵の通常攻撃と一部の単体攻撃特技を完全に回避する。",
    mpCost: 5, target: TargetType.SELF, unlockLevel: 9,
    selfEvadeTurns: 1
  },
  s_90en_membership_prayer: {
    id: "s_90en_membership_prayer", name: "90円メンバーシップの祈り", type: SkillType.HEAL,
    description: "熱い応援コメントでHPを少し回復。稀に「ふくびきけん」を拾う。",
    mpCost: 12, healAmount: 30, target: TargetType.SELF, unlockLevel: 11,
    itemFind: { itemId: 'i_gacha_ticket', chance: 0.1 }
  },
  s_kaifu_no_gi_rta: {
    id: "s_kaifu_no_gi_rta", name: "開封の儀RTA", type: SkillType.ATTACK,
    description: "目にも止まらぬ速さで敵の装備を「開封」、確率で防御力を下げ、稀にアイテムを奪う。",
    mpCost: 7, power: 0.5, target: TargetType.SINGLE_ENEMY, unlockLevel: 14,
    debuffsToTarget: [{ type: DebuffType.DEFENSE_DOWN, chance: 0.5, duration: 3, value: 5 }], // flat 5 defense reduction
    itemSteal: { itemPool: ['i_herb', 'i_magic_water'], chance: 0.2 }
  },
  s_anken_douga_rush: {
    id: "s_anken_douga_rush", name: "案件動画ラッシュ", type: SkillType.ATTACK,
    description: "敵一体に通常攻撃の2.5倍ダメージ。使用後次の1ターンは疲労で行動不能。",
    mpCost: 15, power: 2.5, target: TargetType.SINGLE_ENEMY, unlockLevel: 18,
    selfStunTurns: 1
  },

  // New Healing Skills
  s_divine_edit_heal: {
    id: "s_divine_edit_heal", name: "再編集で神編集！", type: SkillType.HEAL, target: TargetType.SELF,
    description: "HPが低い時(25%以下)に使うと最大HPの70%回復。そうでなければHP10回復。",
    mpCost: 10, unlockLevel: 13,
    conditionalHpThreshold: 0.25,
    targetHpPercentageRestore: 0.70,
    healAmount: 10, // Heal amount if condition not met
  },
  s_asmr_regen: {
    id: "s_asmr_regen", name: "飯テロASMR(回復版)", type: SkillType.BUFF, target: TargetType.SELF,
    description: "3ターンの間、毎ターン最大HPの8%ぶんHPが自動回復する。",
    mpCost: 7, unlockLevel: 8,
    hpRegenPerTurnPercent: 0.08,
    regenDuration: 3,
  },
  s_desperate_backup_restore: {
    id: "s_desperate_backup_restore", name: "決死のバックアップ復元", type: SkillType.HEAL, target: TargetType.SELF,
    description: "HPとMPを全回復する。戦闘中一度しか使えない奥の手。",
    mpCost: 25, unlockLevel: 18,
    isFullHpRestore: true,
    isFullMpRestore: true,
    oncePerBattle: true,
  },
};

export const ALL_ITEMS: Record<string, Item> = {
  i_herb: { id: "i_herb", name: "やくそう", type: "どうぐ", description: "HPを20回復する。", price: 10, hpRecovery: 20, isEquippable: false },
  i_magic_water: { id: "i_magic_water", name: "まほうのせいすい", type: "どうぐ", description: "MPを10回復する。", price: 25, mpRecovery: 10, isEquippable: false },
  i_super_magic_water: { id: "i_super_magic_water", name: "まほうの聖水 改", type: "どうぐ", description: "MPを30回復する、改良された聖水。", price: 150, mpRecovery: 30, isEquippable: false },
  
  i_wooden_sword: { id: "i_wooden_sword", name: "ひのきのぼう", type: "ぶき", description: "基本的な剣。", price: 50, attackBoost: 2, isEquippable: true },
  i_leather_armor: { id: "i_leather_armor", name: "かわのよろい", type: "よろい", description: "簡単な鎧。", price: 70, defenseBoost: 2, isEquippable: true },
  i_small_shield: { id: "i_small_shield", name: "かわのたて", type: "たて", description: "軽い盾。", price: 40, defenseBoost: 1, isEquippable: true },
  
  i_bronze_sword: { id: "i_bronze_sword", name: "どうのつるぎ", type: "ぶき", description: "青銅製の剣。ひのきのぼうより強い。", price: 120, attackBoost: 5, isEquippable: true },
  i_chain_mail: { id: "i_chain_mail", name: "くさりかたびら", type: "よろい", description: "鎖で編まれた鎧。かわの鎧より頑丈。", price: 150, defenseBoost: 4, isEquippable: true },
  
  i_steel_sword: { id: "i_steel_sword", name: "はがねのつるぎ", type: "ぶき", description: "鋼鉄製の頑丈な剣。", price: 500, attackBoost: 10, isEquippable: true },
  i_plate_armor: { id: "i_plate_armor", name: "てつのよろい", type: "よろい", description: "鉄板で作られた重厚な鎧。", price: 650, defenseBoost: 8, isEquippable: true },
  i_knight_shield: { id: "i_knight_shield", name: "ナイトシールド", type: "たて", description: "きしがつかう たて。", price: 380, defenseBoost: 5, isEquippable: true },

  i_knight_sword: { id: "i_knight_sword", name: "きしのつるぎ", type: "ぶき", description: "騎士が愛用する頑丈な剣。", price: 1200, attackBoost: 18, isEquippable: true },
  i_knight_armor: { id: "i_knight_armor", name: "きしのよろい", type: "よろい", description: "騎士のために作られた上質な鎧。", price: 1500, defenseBoost: 15, isEquippable: true },
  i_sacred_shield: { id: "i_sacred_shield", name: "せいなるたて", type: "たて", description: "聖なる力で守られた盾。", price: 900, defenseBoost: 10, isEquippable: true },

  i_micchy_buster: { id: "i_micchy_buster", name: "ミッチーバスター", type: "ぶき", description: "ミッチーの力を宿す伝説の剣。2回攻撃が可能。", price: 60000, attackBoost: 55, isEquippable: true },
  i_micchy_brave: { id: "i_micchy_brave", name: "ミッチーブレイブ", type: "ぶき", description: "聖なる光を放つ杖。2回攻撃が可能。", price: 55000, attackBoost: 45, isEquippable: true },
  i_micchy_guard: { id: "i_micchy_guard", name: "ミッチーガード", type: "たて", description: "あらゆる攻撃を弾き返すという伝説の盾。", price: 45000, defenseBoost: 30, isEquippable: true },
  i_micchy_armor: { id: "i_micchy_armor", name: "ミッチーのよろい", type: "よろい", description: "ミッチー大魔王の魔力で鍛えられた究極の鎧。", price: 50000, defenseBoost: 35, isEquippable: true },
  
  i_gacha_ticket: { id: "i_gacha_ticket", name: "ふくびきけん", type: "ふくびきけん", description: "ふくびき所で使える券。", price: 100, isEquippable: false },
  i_gm_dew: { id: "i_gm_dew", name: "GMのしずく", type: "どうぐ", description: "HPとMPをすべてかいふくする、きちょうなしずく。", price: 10000, isFullHpRecovery: true, isFullMpRecovery: true, isEquippable: false },

  i_key_fragment_forest: { id: "i_key_fragment_forest", name: "くらやみの森の破片", type: "どうぐ", description: "大魔王への道を開く鍵の破片。森の奥深くに隠されているようだ。", price: 0, isEquippable: false, isKeyItem: true },
  i_key_fragment_cave: { id: "i_key_fragment_cave", name: "がんくつ洞窟の破片", type: "どうぐ", description: "大魔王への道を開く鍵の破片。洞窟の主が守っているらしい。", price: 0, isEquippable: false, isKeyItem: true },
  i_key_fragment_tower: { id: "i_key_fragment_tower", name: "ミッチータワーの破片", type: "どうぐ", description: "大魔王への道を開く鍵の破片。塔の頂に眠ると言われる。", price: 0, isEquippable: false, isKeyItem: true },
};

export const ALL_ENEMIES: Record<string, Enemy> = {
  e_slime: { 
    id: "e_slime", name: "スライム", spriteUrl: "https://i.imgur.com/9CUjduE.png", 
    stats: { maxHp: Math.floor(15 * 0.2), currentHp: Math.floor(15 * 0.2), maxMp: 0, currentMp: 0, attack: Math.floor(5 * 0.2), defense: Math.floor(2 * 0.3), speed: 3, goldYield: 3, expYield: 1 }, 
    skills: [], aiBehavior: "こうげきてき", resistances: { fire: 'weak' }, activeDebuffs: []
  },
  e_bat: { 
    id: "e_bat", name: "おおこうもり", spriteUrl: "https://i.imgur.com/B810HNV.png", 
    stats: { maxHp: Math.floor(12 * 0.2), currentHp: Math.floor(12 * 0.2), maxMp: 0, currentMp: 0, attack: Math.floor(6 * 0.2), defense: Math.floor(1 * 0.2), speed: 6, goldYield: 4, expYield: 2 }, 
    skills: [], aiBehavior: "こうげきてき", resistances: { ice: 'weak' }, activeDebuffs: []
  },
  e_goblin: { 
    id: "e_goblin", name: "ゴブリン", spriteUrl: "https://i.imgur.com/PfeRIhW.png", 
    stats: { maxHp: Math.floor(25 * 0.3), currentHp: Math.floor(25 * 0.3), maxMp: 4, currentMp: 4, attack: Math.floor(8 * 0.3), defense: Math.floor(4 * 0.3), speed: 4, goldYield: 8, expYield: 5 }, 
    skills: [ALL_SKILLS.s_power_strike], aiBehavior: "こんごう", resistances: {}, activeDebuffs: []
  },
  e_orc_boss: { 
    id: "e_orc_boss", name: "ミッチースライム", spriteUrl: "https://i.imgur.com/9E38Z7m.png", 
    stats: { maxHp: Math.floor(80 * 0.4), currentHp: Math.floor(80 * 0.4), maxMp: 10, currentMp: 10, attack: Math.floor(12 * 0.4), defense: Math.floor(8 * 0.4), speed: 5, goldYield: 50, expYield: 25 },
    skills: [ALL_SKILLS.s_power_strike], aiBehavior: "こうげきてき", resistances: { fire: 'weak', ice: 'resist' }, activeDebuffs: []
  },
  e_shadow_panther: {
    id: "e_shadow_panther", name: "シャドーパンサー", spriteUrl: "https://i.imgur.com/AvuoMSd.png",
    stats: { maxHp: Math.floor(80 * 1.25 * 1.2), currentHp: Math.floor(80 * 1.25 * 1.2), maxMp: 0, currentMp: 0, attack: Math.floor(12*1.2 * 1.15), defense: Math.floor(6 * 1.1), speed: 13, goldYield: 45, expYield: 35 },
    skills: [ALL_SKILLS.s_bash], aiBehavior: "こうげきてき", resistances: { dark: 'resist', ice: 'weak' }, activeDebuffs: []
  },
  e_micchy_sexy_knight_boss: {
    id: "e_micchy_sexy_knight_boss", name: "ミッチーセクシーナイト", spriteUrl: "https://i.imgur.com/MWUBRnw.jpeg",
    stats: { maxHp: Math.floor(160 * 1.3 * 1.25), currentHp: Math.floor(160 * 1.3 * 1.25), maxMp: 25, currentMp: 25, attack: Math.floor(20*1.25 * 1.2), defense: Math.floor(14 * 1.15), speed: 11, goldYield: 220, expYield: 130 },
    skills: [ALL_SKILLS.s_cleave, ALL_SKILLS.s_power_strike], aiBehavior: "こんごう", resistances: { fire: 'weak', dark: 'resist' }, activeDebuffs: []
  },
  e_rock_golem: {
    id: "e_rock_golem", name: "ロックゴーレム", spriteUrl: "https://i.imgur.com/4gMmZQ2.png",
    stats: { maxHp: Math.floor(50 * 1.25 * 1.2), currentHp: Math.floor(50 * 1.25 * 1.2), maxMp: 6, currentMp: 6, attack: Math.floor(10*1.2 * 1.15), defense: Math.floor(12 * 1.1), speed: 2, goldYield: 40, expYield: 30 },
    skills: [ALL_SKILLS.s_power_strike], aiBehavior: "ぼうぎょてき", resistances: { ice: 'weak', fire: 'resist' }, activeDebuffs: []
  },
  e_cave_troll: { 
    id: "e_cave_troll", name: "ケイブトロール", spriteUrl: "https://i.imgur.com/Gmb5c91.png",
    stats: { maxHp: Math.floor(100 * 1.25 * 1.2), currentHp: Math.floor(100 * 1.25 * 1.2), maxMp: 10, currentMp: 10, attack: Math.floor(15*1.2 * 1.15), defense: Math.floor(12 * 1.1), speed: 6, goldYield: 70, expYield: 55 }, 
    skills: [ALL_SKILLS.s_power_strike, ALL_SKILLS.s_bash], aiBehavior: "こんごう", resistances: { fire: 'weak' }, activeDebuffs: []
  },
  e_micchy_baroku_saburou_boss: { 
    id: "e_micchy_baroku_saburou_boss", name: "ミッチバロクサブロウ", spriteUrl: "https://i.imgur.com/Zld50GP.jpeg",
    stats: { maxHp: Math.floor(220 * 1.3 * 1.25), currentHp: Math.floor(220 * 1.3 * 1.25), maxMp: 30, currentMp: 30, attack: Math.floor(25*1.25 * 1.2), defense: Math.floor(18 * 1.15), speed: 8, goldYield: 350, expYield: 180 },
    skills: [ALL_SKILLS.s_power_strike, ALL_SKILLS.s_bash, ALL_SKILLS.s_fireball], aiBehavior: "こんごう", resistances: { ice: 'weak', dark: 'resist' }, activeDebuffs: []
  },
  e_senden_biker_boss: {
    id: "e_senden_biker_boss", name: "宣伝バイカー", spriteUrl: "https://i.imgur.com/bJWRTUg.jpeg",
    stats: { maxHp: Math.floor(300 * 1.35 * 1.25), currentHp: Math.floor(300 * 1.35 * 1.25), maxMp: 40, currentMp: 40, attack: Math.floor(30*1.3 * 1.2), defense: Math.floor(22 * 1.15), speed: 10, goldYield: 500, expYield: 250 },
    skills: [ALL_SKILLS.s_power_strike, ALL_SKILLS.s_cleave], aiBehavior: "こんごう", resistances: { ice: 'weak' }, activeDebuffs: []
  },
  e_micchy_dragonlord: { 
    id: "e_micchy_dragonlord", name: "ミッチーりゅうおう", spriteUrl: "https://i.imgur.com/e5nPjEg.mp4", // Updated URL
    stats: { 
        maxHp: Math.floor(350 * 1.35 * 1.25), 
        currentHp: Math.floor(350 * 1.35 * 1.25), 
        maxMp: 50, 
        currentMp: 50, 
        attack: Math.floor(38 * 1.3 * 1.2), 
        defense: Math.floor(28 * 1.15), 
        speed: 12, 
        goldYield: 700, 
        expYield: 350 
    },
    skills: [ALL_SKILLS.s_inferno, ALL_SKILLS.s_doom_blast, ALL_SKILLS.s_cleave], 
    aiBehavior: "こんごう", 
    isVideoSprite: true, 
    resistances: { fire: 'resist', ice: 'weak' }, 
    activeDebuffs: []
  },
  e_wonda_omaewa: {
    id: "e_wonda_omaewa", name: "ワンダお前は", spriteUrl: "https://i.imgur.com/RUxb44I.jpeg",
    stats: { maxHp: Math.floor(90 * 1.2 * 1.2), currentHp: Math.floor(90 * 1.2 * 1.2), maxMp: 0, currentMp: 0, attack: Math.floor(18*1.15 * 1.15), defense: Math.floor(12 * 1.1), speed: 9, goldYield: 80, expYield: 60 },
    skills: [ALL_SKILLS.s_bash], aiBehavior: "こうげきてき", resistances: {}, activeDebuffs: []
  },
  e_ono_no_imoo: {
    id: "e_ono_no_imoo", name: "オノのいもお", spriteUrl: "https://i.imgur.com/15qAxOY.jpeg",
    stats: { maxHp: Math.floor(110 * 1.2 * 1.2), currentHp: Math.floor(110 * 1.2 * 1.2), maxMp: 10, currentMp: 10, attack: Math.floor(22*1.15 * 1.15), defense: Math.floor(15 * 1.1), speed: 7, goldYield: 95, expYield: 70 },
    skills: [ALL_SKILLS.s_power_strike], aiBehavior: "こんごう", resistances: { fire: 'resist' }, activeDebuffs: []
  },
  e_chotto_jikotte: {
    id: "e_chotto_jikotte", name: "ちょっと事故ちゃってさ", spriteUrl: "https://i.imgur.com/uuU2AJy.jpeg",
    stats: { maxHp: Math.floor(85 * 1.2 * 1.2), currentHp: Math.floor(85 * 1.2 * 1.2), maxMp: 0, currentMp: 0, attack: Math.floor(16*1.15 * 1.15), defense: Math.floor(10 * 1.1), speed: 12, goldYield: 75, expYield: 58 },
    skills: [ALL_SKILLS.s_bash], aiBehavior: "こうげきてき", resistances: { ice: 'weak' }, activeDebuffs: []
  },
  e_omaemo_ippai_yarudaro: {
    id: "e_omaemo_ippai_yarudaro", name: "お前も一杯やるだろ？", spriteUrl: "https://i.imgur.com/gIqQQWK.jpeg",
    stats: { maxHp: Math.floor(100 * 1.2 * 1.2), currentHp: Math.floor(100 * 1.2 * 1.2), maxMp: 15, currentMp: 15, attack: Math.floor(17*1.15 * 1.15), defense: Math.floor(18 * 1.1), speed: 6, goldYield: 85, expYield: 65 },
    skills: [ALL_SKILLS.s_defend], aiBehavior: "ぼうぎょてき", resistances: {}, activeDebuffs: []
  },
  e_kinou_tetsuyade: {
    id: "e_kinou_tetsuyade", name: "昨日徹夜でさー", spriteUrl: "https://i.imgur.com/FnnkRQv.jpeg",
    stats: { maxHp: Math.floor(95 * 1.2 * 1.2), currentHp: Math.floor(95 * 1.2 * 1.2), maxMp: 5, currentMp: 5, attack: Math.floor(19*1.15 * 1.15), defense: Math.floor(11 * 1.1), speed: 10, goldYield: 82, expYield: 62 },
    skills: [ALL_SKILLS.s_bash], aiBehavior: "こんごう", resistances: { dark: 'weak' }, activeDebuffs: []
  },
  e_ago_ga_agoga: {
    id: "e_ago_ga_agoga", name: "アゴがアゴが", spriteUrl: "https://i.imgur.com/AbMYlS1.jpeg",
    stats: { maxHp: Math.floor(120 * 1.2 * 1.2), currentHp: Math.floor(120 * 1.2 * 1.2), maxMp: 12, currentMp: 12, attack: Math.floor(24*1.15 * 1.15), defense: Math.floor(14 * 1.1), speed: 5, goldYield: 100, expYield: 75 },
    skills: [ALL_SKILLS.s_power_strike], aiBehavior: "こうげきてき", resistances: { fire: 'weak' }, activeDebuffs: []
  },
  e_seiji: {
    id: "e_seiji", name: "せいじ", spriteUrl: "https://i.imgur.com/OPy4iC9.jpeg",
    stats: { maxHp: Math.floor(80 * 1.2 * 1.2), currentHp: Math.floor(80 * 1.2 * 1.2), maxMp: 20, currentMp: 20, attack: Math.floor(15*1.15 * 1.15), defense: Math.floor(10 * 1.1), speed: 8, goldYield: 70, expYield: 55 },
    skills: [ALL_SKILLS.s_heal_light, ALL_SKILLS.s_bash], aiBehavior: "こんごう", resistances: {}, activeDebuffs: []
  },
  e_dorami_chan: {
    id: "e_dorami_chan", name: "ドラミちゃん", spriteUrl: "https://i.imgur.com/kRHqH0h.jpeg",
    stats: { maxHp: Math.floor(75 * 1.2 * 1.2), currentHp: Math.floor(75 * 1.2 * 1.2), maxMp: 0, currentMp: 0, attack: Math.floor(14*1.15 * 1.15), defense: Math.floor(8 * 1.1), speed: 14, goldYield: 65, expYield: 50 },
    skills: [], aiBehavior: "こうげきてき", resistances: {}, activeDebuffs: []
  },
  e_koukaku_10mm: {
    id: "e_koukaku_10mm", name: "広角10ミリ", spriteUrl: "https://i.imgur.com/zb1jRQw.jpeg",
    stats: { maxHp: Math.floor(105 * 1.2 * 1.2), currentHp: Math.floor(105 * 1.2 * 1.2), maxMp: 10, currentMp: 10, attack: Math.floor(16*1.15 * 1.15), defense: Math.floor(20 * 1.1), speed: 4, goldYield: 90, expYield: 68 },
    skills: [ALL_SKILLS.s_defend], aiBehavior: "ぼうぎょてき", resistances: { ice: 'resist' }, activeDebuffs: []
  },
  e_bizetsu: {
    id: "e_bizetsu", name: "美舌", spriteUrl: "https://i.imgur.com/7sbd6zb.jpeg",
    stats: { maxHp: Math.floor(90 * 1.2 * 1.2), currentHp: Math.floor(90 * 1.2 * 1.2), maxMp: 5, currentMp: 5, attack: Math.floor(20*1.15 * 1.15), defense: Math.floor(13 * 1.1), speed: 11, goldYield: 88, expYield: 66 },
    skills: [ALL_SKILLS.s_bash], aiBehavior: "こんごう", resistances: { dark: 'weak' }, activeDebuffs: []
  },
  e_led_100w: {
    id: "e_led_100w", name: "LED100W", spriteUrl: "https://i.imgur.com/qrpfiTK.jpeg",
    stats: { maxHp: Math.floor(80 * 1.2 * 1.2), currentHp: Math.floor(80 * 1.2 * 1.2), maxMp: 25, currentMp: 25, attack: Math.floor(17*1.15 * 1.15), defense: Math.floor(9 * 1.1), speed: 10, goldYield: 78, expYield: 59 },
    skills: [ALL_SKILLS.s_fireball], aiBehavior: "こんごう", resistances: { fire: 'resist', ice: 'weak' }, activeDebuffs: []
  },
  e_king_metal_mitchy: { 
    id: "e_king_metal_mitchy", 
    name: "キングメタルミッチー", 
    spriteUrl: "https://imgur.com/X7S9sWv.gif", 
    stats: { 
        maxHp: 35, currentHp: 35, maxMp: 50, currentMp: 50, 
        attack: 10, defense: 999, speed: 200, 
        goldYield: 1050, expYield: 10050 
    },
    skills: [ALL_SKILLS.s_escape, ALL_SKILLS.s_blizzard], 
    aiBehavior: "ぼうぎょてき", 
    resistances: { fire: 'resist', ice: 'resist', dark: 'resist' }, 
    activeDebuffs: []
  },
  e_micchy_final_boss: {
    id: "e_micchy_final_boss", name: "ミッチー大魔王", spriteUrl: "https://i.imgur.com/gNqM5v8.mp4", 
    stats: { maxHp: Math.floor(500 * 1.35 * 1.25), currentHp: Math.floor(500 * 1.35 * 1.25), maxMp: 100, currentMp: 100, attack: Math.floor(35*1.3 * 1.2), defense: Math.floor(30 * 1.15), speed: 15, goldYield: 1000, expYield: 500 },
    skills: [ALL_SKILLS.s_doom_blast, ALL_SKILLS.s_firestorm, ALL_SKILLS.s_blizzard, ALL_SKILLS.s_cleave, ALL_SKILLS.s_explosion],
    aiBehavior: "こんごう",
    hasGeneratedSprite: true,
    isVideoSprite: true,
    resistances: { fire: 'resist', ice: 'resist', dark: 'resist' }, activeDebuffs: []
  },
};

export const REGIONS: Record<string, Region> = {
  r_starting_plains: {
    id: "r_starting_plains",
    name: "はじまりのそうげん",
    description: "新米冒険者が旅を始める草原。",
    encounters: [ ["e_slime"], ["e_slime", "e_bat"], ["e_goblin"] ],
    bossId: "e_orc_boss",
    bossUnlockLevel: 5, // Changed from 4 to 5 (matches r_dark_forest.unlockPlayerLevel)
    shopInventoryIds: ["i_herb", "i_magic_water", "i_wooden_sword", "i_leather_armor", "i_small_shield", "i_gacha_ticket"],
    gachaPrizeIds: ["i_herb", "i_magic_water", "i_wooden_sword"], 
    battleBackgroundUrl: "https://i.imgur.com/ZScuSao.jpeg", 
    isUnlocked: true,
    isCleared: false,
  },
  r_dark_forest: {
    id: "r_dark_forest",
    name: "くらやみのもり",
    description: "より強い魔物が生息する不気味な森。",
    encounters: [ ["e_goblin", "e_bat"], ["e_goblin", "e_shadow_panther"], ["e_bat", "e_bat", "e_bat"] ],
    bossId: "e_micchy_sexy_knight_boss",
    bossUnlockLevel: 10, // Changed from 5 to 10 (matches r_mountain_cave.unlockPlayerLevel)
    unlockPlayerLevel: 5,
    shopInventoryIds: ["i_herb", "i_magic_water", "i_bronze_sword", "i_chain_mail", "i_gacha_ticket"],
    gachaPrizeIds: ["i_herb", "i_magic_water", "i_bronze_sword", "i_chain_mail"],
    battleBackgroundUrl: "https://i.imgur.com/T8rnbDp.jpeg", 
    isUnlocked: false,
    isCleared: false,
  },
  r_mountain_cave: {
    id: "r_mountain_cave",
    name: "がんくつのどうくつ",
    description: "険しい岩山に掘られた洞窟。頑丈な魔物が潜む。",
    encounters: [ ["e_rock_golem"], ["e_goblin", "e_cave_troll"], ["e_bat", "e_rock_golem", "e_bat"] ], 
    bossId: "e_micchy_baroku_saburou_boss", 
    bossUnlockLevel: 15, // Changed from 10 to 15 (matches r_micchy_tower.unlockPlayerLevel)
    unlockPlayerLevel: 10,
    shopInventoryIds: ["i_magic_water", "i_steel_sword", "i_plate_armor", "i_knight_shield", "i_gacha_ticket", "i_super_magic_water"],
    gachaPrizeIds: ["i_magic_water", "i_steel_sword", "i_plate_armor", "i_knight_shield"],
    battleBackgroundUrl: "https://i.imgur.com/RrQoDKp.jpeg", 
    isUnlocked: false,
    isCleared: false,
  },
  r_micchy_tower: {
    id: "r_micchy_tower",
    name: "ミッチータワー",
    description: "天高くそびえるミッチーの塔。奇妙な魔物たちがうろついている。",
    encounters: [
      ["e_wonda_omaewa", "e_chotto_jikotte"],
      ["e_ono_no_imoo", "e_kinou_tetsuyade"],
      ["e_ago_ga_agoga", "e_seiji", "e_dorami_chan"],
      ["e_koukaku_10mm", "e_bizetsu", "e_led_100w"]
    ],
    bossId: "e_senden_biker_boss", 
    bossUnlockLevel: 20, // Changed from 15 to 20 (matches r_micchy_castle.unlockPlayerLevel)
    unlockPlayerLevel: 15,
    shopInventoryIds: ["i_magic_water", "i_super_magic_water", "i_steel_sword", "i_knight_sword", "i_plate_armor", "i_knight_armor", "i_knight_shield", "i_sacred_shield", "i_gacha_ticket", "i_gm_dew"],
    gachaPrizeIds: ["i_knight_sword", "i_knight_armor", "i_sacred_shield", "i_steel_sword", "i_plate_armor", "i_knight_shield", "i_gm_dew"],
    battleBackgroundUrl: "https://i.imgur.com/pKQyfkj.jpeg",
    isUnlocked: false,
    isCleared: false,
  },
  r_micchy_castle: {
    id: "r_micchy_castle",
    name: "ミッチーの配信部屋",
    description: "ミッチー大魔王が配信しているという、おそれおおきへや。",
    encounters: [/* No regular encounters */], 
    bossId: "e_micchy_final_boss",
    bossUnlockLevel: 25, // Changed from 20 to 25 (final boss, slightly higher than area unlock)
    unlockPlayerLevel: 20, 
    shopInventoryIds: ["i_magic_water", "i_super_magic_water", "i_steel_sword", "i_knight_sword", "i_plate_armor", "i_knight_armor", "i_knight_shield", "i_sacred_shield", "i_gacha_ticket", "i_gm_dew"], 
    gachaPrizeIds: ["i_micchy_buster", "i_micchy_brave", "i_micchy_guard", "i_micchy_armor", "i_knight_sword", "i_knight_armor", "i_sacred_shield", "i_gm_dew"],
    battleBackgroundUrl: "https://i.imgur.com/pKQyfkj.jpeg",
    isUnlocked: false,
    isCleared: false,
  }
};

export const XP_FOR_LEVEL: number[] = [ 
  0,    // Lv 1
  15,   // Lv 2
  40,   // Lv 3
  80,   // Lv 4
  150,  // Lv 5
  280,  // Lv 6
  450,  // Lv 7
  700,  // Lv 8
  1000, // Lv 9
  1400, // Lv 10
  2000, // Lv 11
  2800, // Lv 12
  3800, // Lv 13
  5000, // Lv 14
  6500, // Lv 15
  8300, // Lv 16
  10300,// Lv 17
  12600,// Lv 18
  15200,// Lv 19
  18200,// Lv 20
  21600,// Lv 21
  25400,// Lv 22
  29600,// Lv 23
  34200,// Lv 24
  39200 // Lv 25
];

export const STAT_INCREASE_PER_LEVEL: Record<PlayerClass, StatBoost> = {
  [PlayerClass.HERO]: { maxHp: 4, maxMp: 2, attack: 1.5, defense: 1, speed: 1 },
};

export const AVAILABLE_SKILL_CARDS: SkillCardOption[] = [
  { type: "STAT_BOOST", boost: { maxHp: 10 }, description: "この冒険中 最大HP+10" },
  { type: "STAT_BOOST", boost: { maxMp: 5 }, description: "この冒険中 最大MP+5" },
  { type: "STAT_BOOST", boost: { attack: 3 }, description: "この冒険中 こうげき力+3" },
  { type: "STAT_BOOST", boost: { defense: 3 }, description: "この冒険中 しゅび力+3" },
  { type: "STAT_BOOST", boost: { speed: 2 }, description: "この冒険中 すばやさ+2" },
  { type: "NEW_SKILL", skill: ALL_SKILLS.s_cleave },
  { type: "NEW_SKILL", skill: ALL_SKILLS.s_ice_lance },
  { type: "NEW_SKILL", skill: ALL_SKILLS.s_bless },
  { type: "NEW_SKILL", skill: ALL_SKILLS.s_mitchy_scelt },
  { type: "NEW_SKILL", skill: ALL_SKILLS.s_heal_mid }, 
  { type: "NEW_SKILL", skill: ALL_SKILLS.s_firestorm },
  { type: "NEW_SKILL", skill: ALL_SKILLS.s_blizzard },
  { type: "NEW_SKILL", skill: ALL_SKILLS.s_drain_slash },
  { type: "NEW_SKILL", skill: ALL_SKILLS.s_32bit_float_shout },
  { type: "NEW_SKILL", skill: ALL_SKILLS.s_gm_lens_flash },
  { type: "NEW_SKILL", skill: ALL_SKILLS.s_enjo_kaihi_move },
  { type: "NEW_SKILL", skill: ALL_SKILLS.s_90en_membership_prayer },
  { type: "NEW_SKILL", skill: ALL_SKILLS.s_kaifu_no_gi_rta },
  { type: "NEW_SKILL", skill: ALL_SKILLS.s_anken_douga_rush },
  { type: "NEW_SKILL", skill: ALL_SKILLS.s_divine_edit_heal },
  { type: "NEW_SKILL", skill: ALL_SKILLS.s_asmr_regen },
  { type: "NEW_SKILL", skill: ALL_SKILLS.s_desperate_backup_restore },
];

export const ALL_WISDOM_FRAGMENTS: Record<string, WisdomFragment> = {
  wf_boss_orc_defeat: {
    id: "wf_boss_orc_defeat",
    text: "「ぐふっ…このミッチースライム様が敗れるとは…。だが覚えておけ、俺の色違いはもっと強いぜ！たぶん！」",
    category: "ボス",
    hint: "はじまりのそうげんの支配者を倒すと何か聞けるらしい。",
  },
  wf_item_gmdew_firstget: {
    id: "wf_item_gmdew_firstget",
    text: "「GMのしずく…だと！？ こ、これはゲームマスターしか使えないという伝説の…いや待て、これ本当に飲んでも大丈夫なやつか？使用期限とか書いてないぞ！ by 超慎重なミッチー」",
    category: "アイテム",
    hint: "究極の回復薬を手に入れた時、誰かがその効果以外のことを気にしていた。",
  },
  wf_action_run_fail_first: {
    id: "wf_action_run_fail_first",
    text: "「に、逃げられないだと！？ バカな、俺の俊足ならどんな敵からも…って、足がもつれた！クソッ、こんなダサい終わり方でいいのか俺の冒険！？ by ちょっぴりパニックなミッチー」",
    category: "アクション",
    hint: "時には逃げることも肝心だが、うまくいかない初回もある。",
  },
   wf_equip_micchy_buster_first: {
    id: "wf_equip_micchy_buster_first",
    text: "「ミッチーバスターを装備した！なんだこの高揚感…！コメントがすごい勢いで流れていくのが見えるようだぜ！…気のせいか？」",
    category: "アイテム",
    hint: "伝説の剣を初めて装備した時、不思議な感覚に襲われる。",
  },
  wf_level_5_reached: {
    id: "wf_level_5_reached",
    text: "「レベル5か…新人卒業ってとこだな。だがな、本当の地獄はこれからだぜ？知らんけど。 by 先輩風ミッチー」",
    category: "成長",
    hint: "一人前の冒険者への第一歩を踏み出した時。",
  },
  wf_quiz_master_set1: { 
    id: "wf_quiz_master_set1",
    text: "「ミッチークイズに見事正解しただと？フッ、俺様のことをよく勉強しているようだな。だが、俺の魅力はまだまだこんなもんじゃないぜ！ by クイズ王ミッチー」",
    category: "イベント",
    hint: "ミッチークイズ その1で良い成績を収めた時。",
  },
  wf_quiz_master_set2: {
    id: "wf_quiz_master_set2",
    text: "「クイズその2もクリアか！俺様の日常は奥が深いだろう？まだまだクイズは続くぜ！ by 連続クイズ王ミッチー」",
    category: "イベント",
    hint: "ミッチークイズ その2で良い成績を収めた時。",
  },
  wf_quiz_master_set3: {
    id: "wf_quiz_master_set3",
    text: "「まさかクイズその3まで…！お前はもはやミッチー研究家だな！だが、俺の全てを知るにはまだ早すぎるぜ！ by 最終クイズ王ミッチー」",
    category: "イベント",
    hint: "ミッチークイズ その3で良い成績を収めた時。",
  },
};

export const WISDOM_COLLECTION_REWARDS: { count: number; message: string; items?: { itemId: string; quantity: number }[] }[] = [
  {
    count: 3,
    message: "「知恵のかけら」を3つ集めた！ミッチーが褒美に「ふくびきけん」を1枚くれた！",
    items: [{ itemId: "i_gacha_ticket", quantity: 1 }],
  },
];

export const ALL_MITCHY_QUIZZES_SET1: QuizQuestion[] = [
  {
    id: "mq_1_1",
    questionText: "ミッチーさんが、カメラやガジェットに関するVlogを主に投稿しているメインのYouTubeチャンネル名は何でしょう？",
    options: [
      { id: "A", text: "A. ミッチーのバイク" },
      { id: "B", text: "B. MicchiVlogミッチーブログ" },
      { id: "C", text: "C. ミッチーゲーム" },
    ],
    correctOptionId: "B",
    explanation: "正解：B. MicchiVlogミッチーブログ\nソースで確認できるチャンネル名です。ソースの動画もこのチャンネルにアップロードされています。他の選択肢は、ミッチーさんが運営している別のチャンネル名（ソース）です。",
  },
  {
    id: "mq_1_2",
    questionText: "ミッチーさんがAmazonアソシエイトから警告を受けた際、Amazon側から伝えられた主な理由は何でしたか？",
    options: [
      { id: "A", text: "A. アフィリエイトリンクからの売上が少なかった" },
      { id: "B", text: "B. 登録されていないウェブサイトやプラットフォームにアフィリエイトリンクを掲載していた" },
      { id: "C", text: "C. 規約で禁止されている商品を宣伝していた" },
    ],
    correctOptionId: "B",
    explanation: "正解：B. 登録されていないウェブサイトやプラットフォームにアフィリエイトリンクを掲載していた\nAmazonからは「アソシエイトに登録してないサイトにアフィリエイトのリンク貼ってるけどどういうこっ茶」というニュアンスの警告があったとミッチーさんは解釈しています。具体的には、旧Twitter（現X）やFacebook、過去のYouTube動画やライブ配信の概要欄に、登録されていないままリンクを貼っていたことが原因でした。",
  },
  {
    id: "mq_1_3",
    questionText: "「2024年ベストバイ」の動画で、ミッチーさんが映像クリエイターにおすすめのガジェットとして紹介したワイヤレスマイクで、大きな音でも音割れせずに内部収録ができる点が特徴のものは何でしたか？",
    options: [
      { id: "A", text: "A. Rode Wireless Pro" },
      { id: "B", text: "B. ZOOM H1essential" },
      { id: "C", text: "C. DJI Mic" },
    ],
    correctOptionId: "A",
    explanation: "正解：A. Rode Wireless Pro\nRode Wireless Proは、内部収録時に32ビットフロートに対応しており、音割れを防いでくれます。ZOOM H1essentialも32ビットフロート対応のレコーダーですが、ワイヤレスマイクとして紹介されたのはRode Wireless Proです。",
  },
  {
    id: "mq_1_4",
    questionText: "ミッチーさんがYouTubeでの映像品質向上のために、初めて購入したというソニーの一眼カメラは何でしたか？",
    options: [
      { id: "A", text: "A. α7S III" },
      { id: "B", text: "B. ZV-E1" },
      { id: "C", text: "C. α6300" },
    ],
    correctOptionId: "C",
    explanation: "正解：C. α6300\nミッチーさんは、YouTubeを始めて映像の品質を高めたいと思い、このα6300を最初のミラーレス一眼として購入しました。よっちゃんさんのチャンネルで見た映像作品に影響を受けたのが購入のきっかけだったそうです。",
  },
  {
    id: "mq_1_5",
    questionText: "映像クリエイターにとって「保険」になる必須ツールとして、ミッチーさんが強く推奨している、誤って削除したり紛失したりした映像データを復旧するためのソフトウェアは何ですか？",
    options: [
      { id: "A", text: "A. Dehancer" },
      { id: "B", text: "B. EaseUS Data Recovery Wizard" },
      { id: "C", text: "C. Neat Video" },
    ],
    correctOptionId: "B",
    explanation: "正解：B. EaseUS Data Recovery Wizard\nミッチーさんは、仕事で撮影したデータが予期せず消えてしまった際に、このEaseUS Data Recovery Wizardを使ってデータを復旧した経験があり、非常に役立つ「保険」になると述べています。買い切り版もあるため、映像クリエイターには必須のツールだと推薦しています。",
  },
  {
    id: "mq_1_6",
    questionText: "CP+ 2025のイベント中、ミッチーさんが会場で会いたいという視聴者に向けて、どのようにして自分を見つけてほしいと伝えましたか？",
    options: [
      { id: "A", text: "A. 事前に決められた時間に特定の場所に集合する" },
      { id: "B", text: "B. 当日X（旧Twitter）に投稿する服装を見て会場内を探す" },
      { id: "C", text: "C. 会場アナウンスで呼び出してもらう" },
    ],
    correctOptionId: "B",
    explanation: "正解：B. 当日X（旧Twitter）に投稿する服装を見て会場内を探す\nミッチーさんは、大人数での集合は難しく、周囲への配慮も必要になるため、CP+当日に自身のXアカウント（@MicchiVlog）に服装を投稿するので、それを見て会場内で探して声をかけてほしいと呼びかけました。",
  },
  {
    id: "mq_1_7",
    questionText: "ミッチーさんのゲームチャンネル「ミッチーゲーム」でプレイされているゲーム「龍が如く7 光と闇の行方」で、主人公の春日一番が物語の途中で就任することになった（ゲーム内での）役職は何でしたか？",
    options: [
      { id: "A", text: "A. 居酒屋の店長" },
      { id: "B", text: "B. 探偵事務所の助手" },
      { id: "C", text: "C. 会社（一番製菓）の社長" },
    ],
    correctOptionId: "C",
    explanation: "正解：C. 会社（一番製菓）の社長\nゲームの第5章で、春日一番は「一番製菓」という会社の社長に就任しました。ゲームチャンネルの動画タイトルも「社長一番誕生！！」となっています。",
  },
];

export const ALL_MITCHY_QUIZZES_SET2: QuizQuestion[] = [
  {
    id: "mq_2_1",
    questionText: "2024年のベストバイとしてミッチーさんが紹介したスマートウォッチ、Xiaomi Redmi Watch 5 Liteの特に気に入っている点として、Apple Watchと比較して挙げられていたメリットは何でしょう？",
    options: [
      { id: "A", text: "A. 軽量でコンパクトなデザイン" },
      { id: "B", text: "B. 連携できるアプリの豊富さ" },
      { id: "C", text: "C. バッテリー持ちの良さ" },
    ],
    correctOptionId: "C",
    explanation: "正解：C. バッテリー持ちの良さ\nミッチーさんは、Apple Watchのバッテリー持ちが悪いことを懸念しており、以前使っていたXiaomiのスマートバンドも2週間程度、今回購入したRedmi Watch 5 Liteは18日持つと紹介しています。充電が面倒くさいと感じるズボラなミッチーさんにとって、バッテリー持ちの良さは非常に魅力的だと述べています。",
  },
  {
    id: "mq_2_2",
    questionText: "SUNPOWERのカメラフィルター「ASALOMA GT」セットの大きな特徴の一つとして、フィルターをレンズに取り付ける際に採用されている方式は何でしょう？",
    options: [
      { id: "A", text: "A. ネジ込み式" },
      { id: "B", text: "B. クリップ式" },
      { id: "C", text: "C. マグネット式" },
    ],
    correctOptionId: "C",
    explanation: "正解：C. マグネット式\nASALOMA GTフィルターは全てマグネットで取り付けることができるため、今までのようにネジ式で回す必要がなく、取り付けが簡単になったと紹介されています。フィルター同士を重ねて付けることも可能です。",
  },
  {
    id: "mq_2_3",
    questionText: "CP+ 2025にクリエイターとして参加したミッチーさんが、今回のイベントで特に変化を感じた点として挙げた来場者層の変化とは何でしょう？",
    options: [
      { id: "A", text: "A. 海外からの来場者が大幅に増加した" },
      { id: "B", text: "B. 若年層の来場者が減少した" },
      { id: "C", text: "C. ファミリー層やインフルエンサーが増加した" },
    ],
    correctOptionId: "C",
    explanation: "正解：C. ファミリー層やインフルエンサーが増加した\nミッチーさんは、今回のCP+がよりコンシューマー寄りになったと感じており、特にファミリー層やインフルエンサーの来場者が増えたと述べています。各ブースでのインフルエンサーの登壇も大幅に増えたことが、イベント全体の客層にも影響を与えたと考えているようです。",
  },
  {
    id: "mq_2_4",
    questionText: "ミッチーさんが映像の品質向上を目指してYouTube用に初めて購入したというSONYのAPS-Cカメラ、α6300を選んだきっかけとなった出来事は何でしょう？",
    options: [
      { id: "A", text: "A. カメラ店で店員に強く勧められた" },
      { id: "B", text: "B. 友人におすすめされた" },
      { id: "C", text: "C. 尊敬するYouTuberの映像作品に影響を受けた" },
    ],
    correctOptionId: "C",
    explanation: "正解：C. 尊敬するYouTuberの映像作品に影響を受けた\nミッチーさんは、YouTubeを始めて映像品質を高めたいと考え、ミラーレス一眼を探していた際に、お世話になっているよっちゃんさんのチャンネルで見たα6300を使った映像作品に影響を受け、「これを使えば自分もあんな映像が撮れるんじゃないか」と思い購入を決めたと述べています。",
  },
  {
    id: "mq_2_5",
    questionText: "映像クリエイターにおすすめのプラグインとして紹介された「Dehancer」は、どのような映像効果を得るためのツールでしょう？",
    options: [
      { id: "A", text: "A. 手ブレを強力に補正する" },
      { id: "B", text: "B. フィルムのような色合いやノイズ感を再現する" },
      { id: "C", text: "C. 映像内の不要なオブジェクトを自動で削除する" },
    ],
    correctOptionId: "B",
    explanation: "正解：B. フィルムのような色合いやノイズ感を再現する\nDehancerは「フィルムエミュレーション」として、昔のフィルムの色合いやブレ、ノイズ感を再現することができるプラグインです。LUTだけでは再現できない独特の効果を加えることで、シネマティックな映像に抑揚や面白さを出すのに役立つと紹介されています。",
  },
  {
    id: "mq_2_6",
    questionText: "ゲーム実況「龍が如く7 光と闇の行方」の動画で、春日一番が社長に就任することになった「一番製菓」の元従業員で、会社の危機に際して春日一番たちを受け入れ、一番製菓立て直しに協力的な姿勢を見せた人物は誰でしょう？",
    options: [
      { id: "A", text: "A. ナンバ" },
      { id: "B", text: "B. 紗栄子" },
      { id: "C", text: "C. 鎌田" },
    ],
    correctOptionId: "C",
    explanation: "正解：C. 鎌田\n一番製菓の社長であるエリちゃんが倒産寸前になった際、元従業員の鎌田さんが春日一番たちを店に受け入れ、一番製菓の買収騒動の情報を教えたり、立て直しに協力的な姿勢を見せました。",
  },
  {
    id: "mq_2_7",
    questionText: "新しいソファの組み立て動画で、届いた新しいソファの色はどのような色だとミッチーさんは紹介していましたか？",
    options: [
      { id: "A", text: "A. 茶色っぽい感じ" },
      { id: "B", text: "B. 青っぽい感じ" },
      { id: "C", text: "C. グレーっぽい感じ" },
    ],
    correctOptionId: "B",
    explanation: "正解：B. 青っぽい感じ\n新しいソファの色について、ミッチーさんはカメラ越しでは灰色っぽく見えてしまうかもしれないが、実際は「青みがかかった感じ」「青っぽい感じ」だと説明しています。奥さんが選んだ色で、以前の茶色いソファよりも一回り大きいサイズだと述べています。",
  },
];

export const ALL_MITCHY_QUIZZES_SET3: QuizQuestion[] = [
  {
    id: "mq_3_1",
    questionText: "Amazonアソシエイトから警告を受けたミッチーさんが、過去に投稿した違反の可能性があるツイートを効率的に見つけるために、あるキーワードで検索を行ったと語っています。その検索キーワードは何でしょう？",
    options: [
      { id: "A", text: "A. amazonlink" },
      { id: "B", text: "B. amzn" },
      { id: "C", text: "C. affiliate" },
    ],
    correctOptionId: "B",
    explanation: "正解：B. amzn\nミッチーさんは、アソシエイトリンクがAmazonのリンクを短縮したものだったりするため、「amzn」というキーワードで検索をかけた結果、該当するであろうリンクが一通り出てきたと述べています。",
  },
  {
    id: "mq_3_2",
    questionText: "ミッチーさんがレビューしたSUNPOWER ASALOMA GTカメラフィルターセットには、フィルターを収納・持ち運びするためのケースが付属しています。このケースの、撮影中にフィルターをすぐに取り出して使えるようにするための便利な特徴は何でしょう？",
    options: [
      { id: "A", text: "A. 首から下げられるストラップ付き" },
      { id: "B", text: "B. ベルトなどに付けられるカラビナ付き" },
      { id: "C", text: "C. カメラバッグに固定できるフック付き" },
    ],
    correctOptionId: "B",
    explanation: "正解：B. ベルトなどに付けられるカラビナ付き\nASALOMA GTフィルターのケースはセミハードケースで、ベルトなどに取り付けができるようにカラビナが付いています。ミッチーさんは、このケースをベルトに付けておけば、撮影中にケースを開けてもフィルターが落ちにくく、手元でフィルター交換ができるため便利だと述べています。",
  },
  {
    id: "mq_3_3",
    questionText: "ミッチーさんが静岡県浜松市を訪れた際、徳川家康公ゆかりの城として知られる浜松城に立ち寄りました。この浜松城の大人（中学生以上）の入場料はいくらでしょう？（天守閣・天守門共通券）",
    options: [
      { id: "A", text: "A. 100円" },
      { id: "B", text: "B. 200円" },
      { id: "C", text: "C. 500円" },
    ],
    correctOptionId: "B",
    explanation: "正解：B. 200円\n浜松城の入場料について、ミッチーさんは「入場料だけでは天守閣、入場料で天守門も入れますよ」として、大人200円、中学生から有料だと紹介しています。",
  },
  {
    id: "mq_3_4",
    questionText: "ミッチーさんのモトブログチャンネル「ミッチーのバイク」の動画で、2025年の走り初めとして三重県四日市市方面へ向かいました。この時、お友達とコーヒーを飲むために立ち寄った、四日市市富田にあるコーヒー店の名前は何でしょう？",
    options: [
      { id: "A", text: "A. フジコーヒー" },
      { id: "B", text: "B. アサギコーヒー" },
      { id: "C", text: "C. ヨコハマコーヒー" },
    ],
    correctOptionId: "B",
    explanation: "正解：B. アサギコーヒー\nミッチーさんは、目的地であるコーヒー店について、四日市市富田にある「アサギコーヒーさん」だと述べており、中塩チャンネルさんの視聴者さんから教えてもらったお店だと説明しています。",
  },
  {
    id: "mq_3_5",
    questionText: "ミッチーさんが噂されているSONYの新しいズームレンズ、FE 50-150mm F2 GMについて考察する動画の中で、自身の所有するFE 70-200mm F2.8 GM IIレンズと比較を行いました。噂されているFE 50-150mm F2 GMの質量と長さは、FE 70-200mm F2.8 GM IIと比べてそれぞれどうだと述べられていましたか？",
    options: [
      { id: "A", text: "A. 質量は同じくらい、長さは若干短い" },
      { id: "B", text: "B. 質量は若干重い、長さはほぼ同じ" },
      { id: "C", text: "C. 質量は若干軽い、長さは若干長い" },
    ],
    correctOptionId: "B",
    explanation: "正解：B. 質量は若干重い、長さはほぼ同じ\n噂されている50-150mmレンズの質量は約1340gで、70-200mm GM2（1045g）よりも若干重いと述べています。一方、フードを外したレンズの長さは、どちらも約200mmでほぼ同じだと比較しています。",
  },
  {
    id: "mq_3_6",
    questionText: "ミッチーさんが自身のチャンネルで、映像クリエイターにとって役立つプラグインやサブスクリプションサービスを4つ紹介しました。その中で、AIが自動生成した、クライアントワークでも安心して使える権利クリアなBGMを提供するサブスクリプションサービスの名前は何でしょう？",
    options: [
      { id: "A", text: "A. Soundraw" },
      { id: "B", text: "B. Dehancer" },
      { id: "C", text: "C. Neat Video" },
    ],
    correctOptionId: "A",
    explanation: "正解：A. Soundraw\nSoundrawは、AIが自動生成するBGMサービスで、クライアントワークでも使用できる権利関係がクリアな音源を提供すると紹介されています。予算が限られている場合などに便利だと述べています。",
  },
  {
    id: "mq_3_7",
    questionText: "新しいソファの組み立て動画でミッチーさんが言及した、以前使用していたソファの色は何色でしたか？",
    options: [
      { id: "A", text: "A. 黒っぽい色" },
      { id: "B", text: "B. 白っぽい色" },
      { id: "C", text: "C. 茶色いソファ" },
    ],
    correctOptionId: "C",
    explanation: "正解：C. 茶色いソファ\nミッチーさんは新しい青っぽいソファを紹介する際、以前使っていたソファが「茶色いソファ」だったと述べています。",
  },
];


export const QUIZ_SET1_COMPLETION_FLAG_ID = "quiz_set1_completed_successfully";
export const QUIZ_SET2_COMPLETION_FLAG_ID = "quiz_set2_completed_successfully";
export const QUIZ_SET3_COMPLETION_FLAG_ID = "quiz_set3_completed_successfully";

export const QUIZ_MIN_CORRECT_FOR_REWARD = 4;

export const QUIZ_SET_IDENTIFIERS = {
  SET1: "set1",
  SET2: "set2",
  SET3: "set3",
};