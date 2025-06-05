
import React from 'react';

interface PreTitleTapToStartScreenProps {
  onProceed: () => void;
}

const titleImageUrl = "https://i.imgur.com/Eo8RXKr.png";

export const PreTitleTapToStartScreen: React.FC<PreTitleTapToStartScreenProps> = ({ onProceed }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-white bg-black p-4 relative z-50">
      {/* Single content block that will be centered by the parent flex container */}
      <div className="flex flex-col items-center text-center">
        <img
          src={titleImageUrl}
          alt="ミッチークエスト"
          className="max-w-[75%] sm:max-w-[320px] h-auto object-contain mb-10" // Simplified image sizing
          aria-label="タイトルロゴ"
        />
        <div className="w-full max-w-xs">
          <button
            onClick={onProceed}
            className="dq-button confirm w-full-dq-button text-lg py-3 mb-3"
            aria-label="タップしてゲームをはじめる"
          >
            タップしてはじめる
          </button>
          <p className="text-xs text-gray-400 text-center text-shadow-dq">
            ※タップすると音楽が再生されます。音量にご注意ください。
          </p>
        </div>
      </div>
    </div>
  );
};
