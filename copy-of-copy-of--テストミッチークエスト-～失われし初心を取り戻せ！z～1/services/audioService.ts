// services/audioService.ts

// GitHub raw content URLs for existing SFX
const EXISTING_SFX_BASE_URL = "https://raw.githubusercontent.com/akumago/space-invaders-game/main/%E9%9F%B3%E6%A5%BD/";

// New base URL for user-provided audio files
const NEW_AUDIO_BASE_URL = "https://raw.githubusercontent.com/akumago/kaihatu/main/mittionngaku/";

export const SFX_FILES = {
  DAMAGE: `${NEW_AUDIO_BASE_URL}dameziwoukeru.mp3`, // Updated
  LEVEL_UP: `${NEW_AUDIO_BASE_URL}reberuappu.mp3`,
  GAME_OVER: `${NEW_AUDIO_BASE_URL}zzennmetuonngaku.mp3`,
  VICTORY: `${NEW_AUDIO_BASE_URL}syourino.mp3`,
  SPELL_CAST: `${NEW_AUDIO_BASE_URL}zyumonneisyou.mp3`,
  BOSS_APPEAR: `${NEW_AUDIO_BASE_URL}zyumonneisyou.mp3`,
};

export const BGM_FILES = {
  TITLE: `${NEW_AUDIO_BASE_URL}opuninguendororu.mp3`,
  BATTLE_NORMAL: `${NEW_AUDIO_BASE_URL}tuuzyousentou.mp3`,
  BATTLE_BOSS: `${NEW_AUDIO_BASE_URL}bosurasubosu.mp3`,
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
  audio.play().catch(error => console.warn(`SFX再生エラー (${sfxUrl}):`, error));
};

// Basic BGM play function - BattleScreen and App will manage their own Audio elements for more control (loop, pause, etc)
// This function could be expanded if more complex shared BGM logic is needed.
export const getMasterBgmVolume = () => masterBgmVolume;