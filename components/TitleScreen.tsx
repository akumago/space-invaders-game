
import React, { useState, useEffect, useRef } from 'react';
import { GamePhase } from '../types';

interface TitleScreenProps {
  setGamePhase: (phase: GamePhase) => void;
  hasSaveData: boolean;
  startNewGame: () => void;
  continueGame: () => void;
  onAudioStart: () => void; 
  onPlayTitleMusicRequest: () => void; 
  isTitleMusicPlaying: boolean; 
  // onGenerateDebugHighLevelPassword prop removed
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ 
  setGamePhase, 
  hasSaveData, 
  startNewGame, 
  continueGame, 
  onAudioStart, 
  onPlayTitleMusicRequest,
  isTitleMusicPlaying,
  // onGenerateDebugHighLevelPassword // Removed
}) => {
  const [imageLoadError, setImageLoadError] = useState<string | null>(null);

  const defaultTitleImageUrl = "https://i.imgur.com/i4ktLtJ.png"; // This image contains the character and the logo

  const handlePlayMusicAndEnableMenu = () => {
    onPlayTitleMusicRequest(); 
    onAudioStart(); 
  };

  return (
    <div
      className="w-full max-w-md mx-auto text-center flex flex-col items-center h-full"
      style={{
        backgroundImage: "url('https://i.imgur.com/ooULMqt.jpeg')",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'bottom center',
        backgroundSize: '100% auto',
      }}
    >
      <img
        src={defaultTitleImageUrl}
        alt="ミッチークエスト - 勇者ミッチーの伝説"
        className="mt-24 mb-1 w-full max-w-[300px] md:max-w-[350px]" // Increased size and pushed down
        onError={() => {
          setImageLoadError("デフォルト画像の読み込みに失敗しました。インターネット接続を確認してください。");
        }}
      />
      {imageLoadError && <p className="text-red-400 text-xs mb-2 text-shadow-dq">{imageLoadError}</p>}

      {/* 説明テキストブロックのマージンを調整 */}
      <div className="mt-1 mb-2 p-2 bg-black bg-opacity-60 rounded-md max-w-xs sm:max-w-sm w-full">
        <p className="text-xs sm:text-sm text-gray-200 text-center text-shadow-dq leading-normal">
          GMの呪いで「<span className="text-red-400 font-bold">大魔王</span>」と化した<br />
          元勇者カメラユーチューバー、ミッチー。<br />
          彼の失われた〈<span className="text-yellow-300 font-bold">初心</span>〉を取り戻し、<br />
          世界に平和の光を取り戻せ！
        </p>
      </div>

      <div className="dq-window w-full mt-auto">
        {!isTitleMusicPlaying ? ( 
          <button
            onClick={handlePlayMusicAndEnableMenu}
            className="dq-button confirm w-full-dq-button text-lg mb-2"
          >
            ♪ おんがくをならす
          </button>
        ) : (
          <div className="space-y-1 w-full">
            <button
              onClick={startNewGame}
              className="dq-button w-full-dq-button text-lg"
            >
              はじめから
            </button>
            {hasSaveData && (
              <button
                onClick={continueGame}
                className="dq-button confirm w-full-dq-button text-lg"
              >
                つづきから
              </button>
            )}
            <button
              onClick={() => setGamePhase(GamePhase.PASSWORD_LOAD)}
              className="dq-button w-full-dq-button text-lg"
            >
              ふっかつのじゅもん
            </button>
            {/* Debug button removed */}
          </div>
        )}
        <p className="mt-1 text-xs text-gray-300 text-shadow-dq">
            {isTitleMusicPlaying ? "ちいさなぼうけんがまっている！" : "おんがくをならしてゲームをはじめよう！"}
        </p>
      </div>
    </div>
  );
};
