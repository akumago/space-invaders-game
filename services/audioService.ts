// services/audioService.ts

// GitHub raw content URLs
const SFX_BASE_URL = "https://raw.githubusercontent.com/akumago/space-invaders-game/main/assets/audio/";

export const SFX_FILES = {
  DAMAGE: `${SFX_BASE_URL}damage_retro_1.mp3`,
  LEVEL_UP: `${SFX_BASE_URL}levelup_fanfare_retro_1.mp3`,
  GAME_OVER: `${SFX_BASE_URL}gameover_retro_2.mp3`,
  VICTORY: `${SFX_BASE_URL}victory_fanfare_retro_3.mp3`,
  SPELL_CAST: `${SFX_BASE_URL}spellcast_retro_1.mp3`,
  BOSS_APPEAR: `${SFX_BASE_URL}spellcast_retro_1.mp3`, // Using SPELL_CAST as placeholder
};

export const BGM_FILES = {
  TITLE: `${SFX_BASE_URL}mitchy_tragedy.mp3`,
  BATTLE_NORMAL: `${SFX_BASE_URL}battle_drumming.mp3`,
  BATTLE_BOSS: `${SFX_BASE_URL}lastboss_darkness.mp3`,
};


let isAudioContextInitialized = false;
let masterSfxVolume = 0.3; // Default volume for SFX
let masterBgmVolume = 0.2; // Default volume for BGM

const initializeAudioContext = () => {
  if (isAudioContextInitialized) return true;
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    isAudioContextInitialized = true;
    console.log("Audio context initialized.");
    return true;
  } catch (e) {
    console.warn("Could not initialize AudioContext:", e);
    return false;
  }
};

export const ensureAudioContext = () => {
    if (!isAudioContextInitialized) {
        return initializeAudioContext();
    }
    return true;
};

export const setSfxVolume = (volume: number) => {
    masterSfxVolume = Math.max(0, Math.min(1, volume));
}

export const setBgmVolume = (volume: number) => {
    masterBgmVolume = Math.max(0, Math.min(1, volume));
    // Potentially update any currently playing BGM volume here if refs are managed globally
}


export const playSfx = (sfxUrl: string, volume?: number) => {
  if (!isAudioContextInitialized) {
    console.warn("Audio context not initialized. SFX might not play. Trigger ensureAudioContext() on user interaction.");
    if(!initializeAudioContext()){ // Attempt to initialize
        return; // Still not initialized, bail.
    }
  }

  const audio = new Audio(sfxUrl);
  audio.crossOrigin = "anonymous";
  audio.volume = volume !== undefined ? Math.max(0, Math.min(1, volume)) : masterSfxVolume;
  
  // エラーハンドリングを追加
  audio.onerror = (error) => {
    console.error(`音声ファイルの読み込みに失敗しました (${sfxUrl}):`, error);
  };
  
  audio.play().catch(error => {
    console.warn(`SFX再生エラー (${sfxUrl}):`, error);
    // エラーが発生した場合、代替の音声ファイルを試す
    if (sfxUrl.includes('damage')) {
      console.log('代替のダメージ音を再生します。');
      // 代替のダメージ音を再生
    }
  });
};

// Basic BGM play function - BattleScreen and App will manage their own Audio elements for more control (loop, pause, etc)
// This function could be expanded if more complex shared BGM logic is needed.
export const getMasterBgmVolume = () => masterBgmVolume;
