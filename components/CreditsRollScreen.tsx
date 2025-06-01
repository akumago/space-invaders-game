
import React, { useEffect, useRef, useState } from 'react';

interface CreditsRollScreenProps {
  playerName: string;
  onCreditsEnd: () => void;
}

const creditsContent = (playerName: string) => [
  { type: 'header', text: 'CAST' },
  { type: 'credit', label: '主人公', value: playerName },
  { type: 'credit', label: 'ミッチー大魔王（ラスボス）', value: 'ミッチー（本人）' },
  { type: 'credit', label: 'ミッチースライム（草原の支配者）', value: 'ミッチー（スライム形態）' },
  { type: 'credit', label: 'ミッチーセクシーナイト（森の騎士）', value: 'ミッチー（イケメン風）' },
  { type: 'credit', label: 'ミッチバロクサブロウ（洞窟の番人）', value: 'ミッチー（ワイルド系）' },
  { type: 'credit', label: '宣伝バイカー（塔の広告塔）', value: 'ミッチー（スポンサー募集中）' },
  { type: 'space' },
  { type: 'credit', label: 'カメラ', value: 'いつものSONY' },
  { type: 'credit', label: 'マイク', value: '安心のSHURE' },
  { type: 'credit', label: 'ナレーション', value: 'Google Gemini API (AI)' },
  { type: 'space' },
  { type: 'header', text: 'MUSIC' },
  { type: 'music_title', text: '「大魔王ミッチーの悲劇」' },
  { type: 'space' },
  { type: 'header', text: 'LYRICS' },
  { type: 'lyric_stanza', lines: ["[Verse]", "闇に響くミッチーの声", "勇者の心 砕け散る夢", "Gmほいほい 呪われた絆", "光は消え 闇に染まる空"] },
  { type: 'lyric_stanza', lines: ["[Chorus]", "守るべきもの 忘れたまま", "闇の王座に座る勇者", "村人たち 恐怖に震え", "Gmレンズが街に舞い散る"] },
  { type: 'lyric_stanza', lines: ["[Verse 2]", "勇者の瞳 深い闇の色", "仲間も夢も 消え去る影", "魔物と化した その姿には", "かつての勇者の面影なし"] },
  { type: 'lyric_stanza', lines: ["[Bridge]", "カメラケー 勇者たちが立つ", "希望の光を取り戻すため", "失われた正義を抱いて", "闇の王に挑むその刃"] },
  { type: 'lyric_stanza', lines: ["[Chorus]", "守るべきもの 忘れたまま", "闇の王座に座る勇者", "村人たち 恐怖に震え", "Gmレンズが街に舞い散る"] },
  { type: 'lyric_stanza', lines: ["[Outro]", "ミッチーの叫び 風に消え", "闇の中に響く哀しき歌", "カメラケーの勇者たちが進む", "光を取り戻す 新たな伝説"] },
  { type: 'space' },
  { type: 'header', text: 'SPECIAL THANKS' },
  { type: 'thanks', text: '視聴者のみなさん' },
  { type: 'thanks', text: 'チャンネルメンバー' },
  { type: 'thanks', text: 'GMレンズ貯金' },
  { type: 'thanks', text: '90円メンバーシップの皆さま' },
  { type: 'thanks', text: 'ミッチーにフルサイズを買わせる会の皆様' },
  { type: 'thanks', text: 'ミッチーにGM貰う会の皆様' },
  { type: 'thanks', text: 'カメラ系ユーチューバーの友人の皆様' },
  { type: 'space' },
  { type: 'header', text: 'PRODUCED BY' },
  { type: 'producer', text: 'Akuma Shogun' },
  { type: 'space' },
  { type: 'disclaimer', text: 'このゲームはフィクションであり、実在の人物・団体とは（たぶん）関係ありません' },
  { type: 'space' },
  { type: 'fin', text: 'FIN' },
];

export const CreditsRollScreen: React.FC<CreditsRollScreenProps> = ({ playerName, onCreditsEnd }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const finRef = useRef<HTMLParagraphElement>(null);
  const [isScrollFinished, setIsScrollFinished] = useState(false);
  const scrollSpeed = 0.5; 

  const creditsData = creditsContent(playerName);

  useEffect(() => {
    if (isScrollFinished || !scrollContainerRef.current || !finRef.current || !contentRef.current) return;

    let animationFrameId: number;
    const scrollContainer = scrollContainerRef.current;
    const finElement = finRef.current;
    const contentElement = contentRef.current;

    // Set initial scroll to ensure content starts off-screen at the bottom
    // This assumes the content with its new padding is taller than the viewport
    // We want the content to start scrolled such that its top is just below the viewport.
    // However, a simpler approach for credits is to let them naturally start at scrollTop 0,
    // and the initial padding on contentRef pushes the first visible text down.
    // scrollContainer.scrollTop = 0; // Ensure we start at the top of the scrollable area

    const scroll = () => {
      if (isScrollFinished) { // Double check inside loop
        cancelAnimationFrame(animationFrameId);
        return;
      }

      const currentScrollTop = scrollContainer.scrollTop;
      let newScrollTop = currentScrollTop + scrollSpeed;

      // Calculate the target scrollTop for "FIN" to be centered
      const finElementOffsetTop = finElement.offsetTop; // Position of FIN relative to the top of contentRef
      const finElementHeight = finElement.offsetHeight;
      const containerVisibleHeight = scrollContainer.clientHeight;
      
      const targetFinCenterScrollTop = finElementOffsetTop - (containerVisibleHeight / 2) + (finElementHeight / 2);

      if (newScrollTop >= targetFinCenterScrollTop) {
        scrollContainer.scrollTop = targetFinCenterScrollTop; // Snap to target position
        setIsScrollFinished(true);
        cancelAnimationFrame(animationFrameId);
        return;
      }
      
      // Fallback: if something goes wrong, stop at the very end of the content
      const maxScroll = contentElement.scrollHeight - containerVisibleHeight;
      if (newScrollTop >= maxScroll) {
        scrollContainer.scrollTop = maxScroll;
        setIsScrollFinished(true); // Fallback to stop
        cancelAnimationFrame(animationFrameId);
        return;
      }

      scrollContainer.scrollTop = newScrollTop;
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isScrollFinished, scrollSpeed, playerName]); // Added playerName to re-trigger effect if creditsData changes based on it.


  return (
    <div className="flex flex-col h-full w-full items-center justify-center bg-black text-white overflow-hidden relative">
      <div
        ref={scrollContainerRef}
        className="w-full h-full overflow-y-scroll scrollbar-hide relative"
      >
        {/*
          pt-[80vh] pushes the start of the content down, so it appears to scroll from bottom.
          pb-[50vh] gives space after "FIN" so it can truly center.
          Adjust these values as needed for visual pacing.
        */}
        <div ref={contentRef} className="text-center font-bold text-shadow-dq pt-[80vh] pb-[50vh]">
          {creditsData.map((item, index) => {
            const key = `${item.type}-${index}`;
            if (item.type === 'header') {
              return <h2 key={key} className="text-3xl text-yellow-400 mt-12 mb-6">{item.text}</h2>;
            }
            if (item.type === 'credit') {
              return <p key={key} className="text-lg mb-1"><span className="text-gray-400">{item.label}:</span> {item.value}</p>;
            }
            if (item.type === 'music_title') {
              return <p key={key} className="text-2xl text-sky-300 mt-2 mb-8">{item.text}</p>;
            }
            if (item.type === 'lyric_stanza') {
              return (
                <div key={key} className="my-6 px-4">
                  {item.lines.map((line, lineIndex) => (
                    <p key={`${key}-${lineIndex}`} className={`text-md ${lineIndex === 0 ? 'text-yellow-200 mb-1' : 'text-gray-300'} leading-relaxed`}>{line}</p>
                  ))}
                </div>
              );
            }
            if (item.type === 'thanks' || item.type === 'producer') {
              return <p key={key} className="text-xl mb-2">{item.text}</p>;
            }
            if (item.type === 'disclaimer') {
                return <p key={key} className="text-sm text-gray-500 mt-10 mb-6">{item.text}</p>;
            }
            if (item.type === 'fin') {
              return <p key={key} ref={finRef} className="text-4xl text-yellow-300 mt-16 mb-16">{item.text}</p>; // Removed extra mb-48, use pb on contentRef
            }
            if (item.type === 'space') {
              return <div key={key} className="h-8"></div>;
            }
            return null;
          })}
        </div>
      </div>
      {isScrollFinished && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10">
          <button
            onClick={onCreditsEnd}
            className="dq-button confirm text-lg px-8 py-3 animate-pulse"
          >
            タイトルへもどる
          </button>
        </div>
      )}
    </div>
  );
};
