
import React from 'react';

interface EndingMessageScreenProps {
  onProceed: () => void;
}

export const EndingMessageScreen: React.FC<EndingMessageScreenProps> = ({ onProceed }) => {
  return (
    <div className="flex flex-col h-full w-full items-center justify-center p-8 bg-black text-white">
      <div className="dq-window max-w-lg text-center">
        <h1 className="text-3xl font-bold text-yellow-400 mb-6 text-shadow-dq animate-pulse">
          しゅくはい！
        </h1>
        <p className="text-lg mb-4 text-shadow-dq">
          ミッチー大魔王はたおれ、せかいにへいわがおとずれた！
        </p>
        <p className="text-lg mb-8 text-shadow-dq">
          あなたのゆうかんなるかつやくは、えいえんにかたりつがれるだろう…
        </p>
        <p className="text-2xl font-bold text-green-400 mb-10 text-shadow-dq">
          おめでとう！
        </p>
        <button
          onClick={onProceed}
          className="dq-button confirm w-full-dq-button text-xl"
        >
          エンドロールへ
        </button>
      </div>
    </div>
  );
};
