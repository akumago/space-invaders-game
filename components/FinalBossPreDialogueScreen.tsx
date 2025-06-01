
import React, { useState, useEffect } from 'react';
import { ALL_ENEMIES } from '../constants'; // For boss sprite

interface FinalBossPreDialogueScreenProps {
  onDialogueComplete: () => void;
}

export const FinalBossPreDialogueScreen: React.FC<FinalBossPreDialogueScreenProps> = ({ onDialogueComplete }) => {
  const [dialogueStep, setDialogueStep] = useState<'offer' | 'response'>('offer');
  const finalBoss = ALL_ENEMIES.e_micchy_final_boss;

  useEffect(() => {
    if (dialogueStep === 'response') {
      const timer = setTimeout(() => {
        onDialogueComplete();
      }, 3000); // 3 seconds delay
      return () => clearTimeout(timer);
    }
  }, [dialogueStep, onDialogueComplete]);

  const handleChoice = () => {
    setDialogueStep('response');
  };

  return (
    <div 
        className="flex flex-col h-full w-full text-white items-center justify-center p-4"
        style={{ 
            backgroundImage: `url(${finalBoss.isVideoSprite ? '' : finalBoss.spriteUrl})`, // Show image if not video
            backgroundColor: finalBoss.isVideoSprite ? '#000000' : '#0C0C0C', // Black bg for video
            backgroundSize: 'contain', 
            backgroundPosition: 'center 20%', 
            backgroundRepeat: 'no-repeat'
        }}
    >
      <div className="dq-window w-full max-w-md text-center">
        {finalBoss.isVideoSprite && (
             <video
                src={finalBoss.spriteUrl}
                autoPlay
                loop
                muted // Mute to avoid issues, BGM will handle sound
                playsInline
                className="w-full max-w-xs mx-auto mb-4 rounded-lg shadow-xl border-2 border-red-700"
                style={{aspectRatio: '16/9', objectFit: 'cover'}}
            />
        )}
        {dialogueStep === 'offer' && (
          <>
            <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-2 text-shadow-dq">ミッチー大魔王</h2>
            <p className="text-md sm:text-lg mb-6 text-shadow-dq">「よくここまできたな、<span className="text-yellow-300">ゆうしゃ</span>よ！」</p>
            <p className="text-md sm:text-lg mb-6 text-shadow-dq">「褒美(ほうび)をやろう。<span className="text-lime-400">フルサイズカメラ</span>か、<span className="text-orange-400">GMレンズ</span>か…えらぶが良い！」</p>
            <div className="space-y-3">
              <button
                onClick={handleChoice}
                className="dq-button confirm w-full-dq-button text-lg"
              >
                フルサイズカメラをもらう
              </button>
              <button
                onClick={handleChoice}
                className="dq-button confirm w-full-dq-button text-lg"
              >
                GMレンズをもらう
              </button>
            </div>
          </>
        )}
        {dialogueStep === 'response' && (
          <>
            <h2 className="text-xl sm:text-2xl font-bold text-red-500 mb-2 text-shadow-dq animate-pulse">ミッチー大魔王</h2>
            <p className="text-2xl sm:text-3xl font-bold my-8 text-red-400 text-shadow-dq">
              「ふざけるなッ！！」
            </p>
            <p className="text-sm text-gray-300 text-shadow-dq animate-pulse">（たたかいのじゅんびをしています...）</p>
          </>
        )}
      </div>
    </div>
  );
};
