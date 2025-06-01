// services/audioService.ts

// GitHub raw content URLs
const SFX_BASE_URL = "https://raw.githubusercontent.com/akumago/space-invaders-game/main/%E9%9F%B3%E6%A5%BD/";

export const SFX_FILES = {
  DAMAGE: `${SFX_BASE_URL}%E3%83%80%E3%83%A1%E3%83%BC%E3%82%B8%E3%82%92%E4%B8%8E%E3%81%88%E3%82%8B%E3%83%BB%E5%8F%97%E3%81%91%E3%82%8B_%E3%83%AC%E3%83%88%E3%83%AD_%E3%81%9D%E3%81%AE%EF%BC%91%20(1).mp3`,
  LEVEL_UP: `${SFX_BASE_URL}%E3%83%AC%E3%83%99%E3%83%AB%E3%82%A2%E3%83%83%E3%83%97_%E3%83%95%E3%82%A1%E3%83%B3%E3%83%95%E3%82%A1%E3%83%BC%E3%83%AC_%E3%83%AC%E3%83%88%E3%83%AD_%E3%81%9D%E3%81%AE%EF%BC%91.mp3`,
  GAME_OVER: `${SFX_BASE_URL}%E5%85%A8%E6%BB%85_%E3%83%AC%E3%83%88%E3%83%AD_%E3%81%9D%E3%81%AE%EF%BC%92.mp3`,
  VICTORY: `${SFX_BASE_URL}%E5%8B%9D%E5%88%A9_%E3%83%95%E3%82%A1%E3%83%B3%E3%83%95%E3%82%A1%E3%83%BC%E3%83%AC_%E3%83%AC%E3%83%88%E3%83%AD_%E3%81%9D%E3%81%AE%EF%BC%93.mp3`,
  SPELL_CAST: `${SFX_BASE_URL}%E5%91%AA%E6%96%87%E3%82%92%E5%94%B1%E3%81%88%E3%82%8B_%E3%83%AC%E3%83%88%E3%83%AD_%E3%81%9D%E3%81%AE%EF%BC%9１.mp3`,
  BOSS_APPEAR: `${SFX_BASE_URL}%E5%91%AA%E6%96%87%E3%82%92%E5%94%B1%E3%81%88%E3%82%8B_%E3%83%AC%E3%83%88%E3%83%AD_%E3%81%9D%E3%81%AE%EF%BC%9１.mp3`, // Using SPELL_CAST as placeholder
};

export const BGM_FILES = {
  TITLE: "https://raw.githubusercontent.com/akumago/space-invaders-game/main/%E9%9F%B3%E6%A5%BD/%E5%A4%A7%E9%AD%94%E7%8E%8B%E3%83%9F%E3%83%83%E3%83%81%E3%83%BC%E3%81%AE%E6%82%B2%E5%8A%87.mp3",
  BATTLE_NORMAL: "https://raw.githubusercontent.com/akumago/space-invaders-game/main/%E9%9F%B3%E6%A5%BD/%E6%88%A6%E9%97%98%E9%BC%93%E5%8B%95.mp3",
  BATTLE_BOSS: "https://raw.githubusercontent.com/akumago/space-invaders-game/main/%E9%9F%B3%E6%A5%BD/%E3%83%A9%E3%82%B9%E3%83%9C%E3%82%B9%E3%81%AE%E9%97%87.mp3",
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
