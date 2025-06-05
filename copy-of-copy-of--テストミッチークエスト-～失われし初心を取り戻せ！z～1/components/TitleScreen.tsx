
import React, { useState, useEffect, useRef } from 'react';
import { GamePhase } from '../types';

interface TitleScreenProps {
  setGamePhase: (phase: GamePhase) => void;
  hasSaveData: boolean;
  startNewGame: () => void;
  continueGame: () => void;
  isActive: boolean; // New prop
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  setGamePhase,
  hasSaveData,
  startNewGame,
  continueGame,
  isActive,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const backgroundVideoUrl = "https://raw.githubusercontent.com/akumago/kaihatu/main/mittigazou/zurazurazura1.mp4";
  const titleImageUrl = "https://i.imgur.com/Eo8RXKr.png"; 
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.muted = true;
      console.log('[Video Event - TitleScreen] Attempting to play video as isActive is true.');
      const playVideo = () => {
        if (videoRef.current) {
            videoRef.current.play().then(() => {
                if (videoError) {
                    console.log("[Video Event - TitleScreen] Video started playing after an error state, clearing error.");
                    setVideoError(false);
                }
            }).catch(e => {
            console.warn("[Video Event - TitleScreen] Video play() promise rejected:", e);
            setVideoError(true); 
          });
        }
      };

      if (videoRef.current.readyState >= HTMLMediaElement.HAVE_METADATA) {
        playVideo();
      } else {
        const onLoadedMetadata = () => {
          playVideo();
          videoRef.current?.removeEventListener('loadedmetadata', onLoadedMetadata);
        };
        videoRef.current.addEventListener('loadedmetadata', onLoadedMetadata);
      }
    } else if (!isActive && videoRef.current) {
      // If screen becomes inactive, pause and reset video to avoid issues
      videoRef.current.pause();
      // videoRef.current.currentTime = 0; // Optional: reset time
      console.log('[Video Event - TitleScreen] Screen became inactive, video paused.');
    }
  }, [isActive, videoError]); // Depend on isActive and videoError

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error("[Video Event - TitleScreen] onError event triggered.", e);
    const videoElement = e.target as HTMLVideoElement;
    if (videoElement.error) {
        console.error("[Video Event - TitleScreen] Video error code:", videoElement.error.code);
        console.error("[Video Event - TitleScreen] Video error message:", videoElement.error.message);
    }
    setVideoError(true);
  };

  const handleVideoStalled = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.warn("[Video Event - TitleScreen] onStalled event triggered.", e);
    setVideoError(true); 
  };

  const handleVideoCanPlay = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.log("[Video Event - TitleScreen] onCanPlay event triggered.", e);
  };

  const handleVideoPlaying = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.log("[Video Event - TitleScreen] onPlaying event triggered.", e);
     if (videoError) { 
        console.log("[Video Event - TitleScreen] Video started playing after an error state, clearing error.");
        setVideoError(false);
    }
  };

  const handleVideoWaiting = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.warn("[Video Event - TitleScreen] onWaiting event triggered.", e);
  };
  
  const handleVideoSuspend = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.log("[Video Event - TitleScreen] onSuspend event triggered (download intentionally stopped).", e);
  };
  
  const handleLoadedData = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.log("[Video Event - TitleScreen] onLoadedData event triggered.", e);
  };

  if (!isActive) {
    return null; // Render nothing if not active to prevent video interference
  }

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center text-white relative overflow-hidden bg-black" 
    >
      {!videoError && (
        <video
          ref={videoRef}
          src={backgroundVideoUrl}
          className="absolute top-0 left-0 w-full h-full object-cover z-[1]"
          loop
          muted 
          playsInline
          poster={titleImageUrl} 
          onError={handleVideoError}
          onStalled={handleVideoStalled}
          onCanPlay={handleVideoCanPlay}
          onPlaying={handleVideoPlaying}
          onWaiting={handleVideoWaiting}
          onSuspend={handleVideoSuspend}
          onLoadedData={handleLoadedData}
          aria-label="背景ビデオ"
        />
      )}
       {videoError && (
        <div className="absolute top-0 left-0 w-full h-full object-cover z-[1] bg-black flex items-center justify-center p-4">
          <img 
            src={titleImageUrl} 
            alt="タイトル背景代替" 
            className="absolute top-0 left-0 w-full h-full object-cover opacity-50" 
            aria-hidden="true"
          />
          <p className="text-red-500 text-shadow-dq text-center relative z-10">背景動画の読み込みに失敗しました。ゲームは引き続きプレイ可能です。</p>
        </div>
      )}

      <img
        src={titleImageUrl}
        alt="ミッチークエスト タイトル"
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[2] object-contain"
        style={{
          maxWidth: '90%', 
          maxHeight: '70vh', 
        }}
        aria-label="タイトル画像"
      />

      <div className="absolute bottom-0 left-0 right-0 p-4 z-[3]">
        <div className="dq-window w-full max-w-md mx-auto">
          <div className="space-y-1 w-full">
            <button
              onClick={startNewGame}
              className="dq-button w-full-dq-button text-lg"
              aria-label="はじめからゲームをはじめる"
            >
              はじめから
            </button>
            {hasSaveData && (
              <button
                onClick={continueGame}
                className="dq-button confirm w-full-dq-button text-lg"
                aria-label="つづきからゲームをはじめる"
              >
                つづきから
              </button>
            )}
            <button
              onClick={() => setGamePhase(GamePhase.PASSWORD_LOAD)}
              className="dq-button w-full-dq-button text-lg"
              aria-label="ふっかつのじゅもんでゲームをはじめる"
            >
              ふっかつのじゅもん
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-300 text-shadow-dq text-center" aria-live="polite">
              ちいさなぼうけんがまっている！
          </p>
        </div>
      </div>
    </div>
  );
};
