
import React, { useState } from 'react';
import { Player, GamePhase, Region } from '../types';
import { generatePassword as genPass, loadFromPassword as loadPass } from '../services/gameService';

interface PasswordManagementScreenProps {
  mode: 'save' | 'load';
  playerData: Player | null;
  regionsData: Record<string, Region>;
  setGamePhase: (phase: GamePhase) => void;
  onLoadSuccess: (loadedPlayer: Player, loadedRegions: Record<string, Region>) => void;
}

export const PasswordManagementScreen: React.FC<PasswordManagementScreenProps> = ({ mode, playerData, regionsData, setGamePhase, onLoadSuccess }) => {
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleGeneratePassword = () => {
    if (playerData) {
      const pass = genPass(playerData, regionsData);
      setPassword(pass);
      setFeedback('ふっかつのじゅもん をつくりました。なくさないようにメモしてください！');
    } else {
      setFeedback('プレイヤーデータがないため、ふっかつのじゅもん をつくれません。');
    }
  };

  const handleCopyPassword = async () => {
    if (password) {
      try {
        await navigator.clipboard.writeText(password);
        setFeedback('ふっかつのじゅもん をコピーしました！');
      } catch (err) {
        setFeedback('コピーにしっぱいしました。て動でコピーしてください。');
      }
    }
  };

  const handleLoadPassword = () => {
    if (password.trim()) {
      const { player, regions } = loadPass(password.trim());
      if (player) {
        onLoadSuccess(player, regions);
        setFeedback('ぼうけんのしょをよみこみました！');
        setTimeout(() => setGamePhase(GamePhase.WORLD_MAP), 1500);
      } else {
        setFeedback('ふっかつのじゅもんが ちがうか、形式が正しくないようです。コピー＆ペーストの際に余分な文字が入っていないか確認してください。');
      }
    } else {
      setFeedback('ふっかつのじゅもんを にゅうりょくしてください。');
    }
  };

  return (
    <div className="flex flex-col h-full w-full p-3 sm:p-4 text-white">
      <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-6 text-shadow-dq text-center">
        {mode === 'save' ? 'ぼうけんのしょをつくる' : 'ふっかつのじゅもんをいれる'}
      </h2>

      <div className="flex-grow overflow-y-auto">
        {mode === 'save' && (
          <>
            <button
              onClick={handleGeneratePassword}
              className="dq-button confirm w-full-dq-button mb-4"
            >
              ふっかつのじゅもんをつくる
            </button>
            {password && (
              <div className="mb-4">
                <textarea
                  readOnly
                  value={password}
                  className="w-full h-32 p-2 bg-black bg-opacity-40 border-2 border-blue-600 rounded text-white text-xs shadow-inner"
                  aria-label="生成されたふっかつのじゅもん"
                />
                <button
                  onClick={handleCopyPassword}
                  className="dq-button w-full-dq-button mt-2"
                >
                  コピーする
                </button>
              </div>
            )}
          </>
        )}

        {mode === 'load' && (
          <>
            <textarea
              placeholder="ここにふっかつのじゅもんをいれてください..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-32 p-2 bg-black bg-opacity-40 border-2 border-blue-600 rounded text-white text-xs mb-4 placeholder-gray-500 shadow-inner"
              aria-label="ふっかつのじゅもん入力欄"
            />
            <button
              onClick={handleLoadPassword}
              className="dq-button confirm w-full-dq-button"
            >
              よみこむ
            </button>
          </>
        )}

        {feedback && <p className="mt-4 text-sm text-yellow-300 text-center text-shadow-dq">{feedback}</p>}
      </div>

      <button
        onClick={() => setGamePhase(mode === 'save' ? GamePhase.WORLD_MAP : GamePhase.TITLE)}
        className="dq-button danger w-full-dq-button mt-6"
      >
        {mode === 'save' ? 'マップへもどる' : 'タイトルへもどる'}
      </button>
    </div>
  );
};
