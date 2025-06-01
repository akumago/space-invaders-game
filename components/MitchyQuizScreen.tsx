

import React, { useState } from 'react';
import { Player, GamePhase, QuizQuestion } from '../types';
import { Modal } from './Modal';

interface MitchyQuizScreenProps {
  player: Player;
  questions: QuizQuestion[];
  onQuizComplete: (score: number, totalQuestions: number) => void;
  setGamePhase: (phase: GamePhase) => void;
}

export const MitchyQuizScreen: React.FC<MitchyQuizScreenProps> = ({ player, questions, onQuizComplete, setGamePhase }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionSelect = (optionId: string) => {
    if (showResult) return; // Don't allow changing answer after submission
    setSelectedOptionId(optionId);
  };

  const handleSubmitAnswer = () => {
    if (selectedOptionId === null) {
      alert("こたえをえらんでください！");
      return;
    }
    const correct = selectedOptionId === currentQuestion.correctOptionId;
    setIsCorrect(correct);
    if (correct) {
      setScore(prevScore => prevScore + 1);
    }
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedOptionId(null);
      setShowResult(false);
      setIsCorrect(false);
    } else {
      // Quiz finished
      onQuizComplete(score, questions.length);
      // App.tsx will handle navigation and rewards via onQuizComplete
    }
  };

  // Reset quiz state if questions prop changes (e.g., new quiz set loaded)
  React.useEffect(() => {
    setCurrentQuestionIndex(0);
    setSelectedOptionId(null);
    setShowResult(false);
    setScore(0);
    setIsCorrect(false);
  }, [questions]);


  return (
    <div className="flex flex-col h-full w-full p-3 sm:p-4 text-white">
      <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-2 text-shadow-dq text-center">ミッチークイズ！</h2>
      <p className="text-sm text-center text-gray-300 mb-4 text-shadow-dq">
        だい {currentQuestionIndex + 1} もん / {questions.length} もん中 | せいかいすう: {score}
      </p>

      <div className="flex-grow overflow-y-auto space-y-3 pr-1 pb-2 bg-black bg-opacity-30 p-3 rounded border border-blue-700 shadow-inner">
        {currentQuestion && (
          <>
            <p className="text-md sm:text-lg font-semibold mb-3 text-shadow-dq whitespace-pre-wrap">{currentQuestion.questionText}</p>
            <div className="space-y-2">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  disabled={showResult}
                  className={`dq-button w-full-dq-button text-sm text-left p-2.5 sm:p-3
                    ${selectedOptionId === option.id && !showResult ? 'bg-yellow-600 border-yellow-400' : ''}
                    ${showResult && option.id === currentQuestion.correctOptionId ? 'bg-green-700 border-green-500' : ''}
                    ${showResult && selectedOptionId === option.id && option.id !== currentQuestion.correctOptionId ? 'bg-red-800 border-red-600' : ''}
                    ${showResult ? 'opacity-80 cursor-default' : 'hover:bg-blue-700'}`}
                >
                  {option.text}
                </button>
              ))}
            </div>

            {showResult && (
              <div className="mt-4 p-3 bg-black bg-opacity-50 border border-blue-500 rounded">
                <p className={`text-lg font-bold mb-2 text-shadow-dq ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {isCorrect ? "せいかい！" : `ざんねん！せいかいは 「${currentQuestion.options.find(o => o.id === currentQuestion.correctOptionId)?.text.substring(0,30) || ''}...」でした。`}
                </p>
                <h4 className="text-md font-semibold text-yellow-300 mb-1 text-shadow-dq">【かいせつ】</h4>
                <p className="text-sm text-gray-200 text-shadow-dq whitespace-pre-wrap leading-relaxed">{currentQuestion.explanation}</p>
              </div>
            )}
          </>
        )}
         {!currentQuestion && questions.length > 0 && (
            <p className="text-center text-gray-400">クイズの読み込みに問題があるようです。</p>
        )}
        {questions.length === 0 && (
            <p className="text-center text-gray-400">このクイズセットには問題がありません。</p>
        )}
      </div>

      <div className="mt-4">
        {!showResult ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={selectedOptionId === null || !currentQuestion}
            className="dq-button confirm w-full-dq-button text-lg"
          >
            けってい
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="dq-button confirm w-full-dq-button text-lg"
            disabled={!currentQuestion}
          >
            {currentQuestionIndex < questions.length - 1 ? "つぎのもんだいへ" : "クイズをおわる"}
          </button>
        )}
        <button
            onClick={() => setGamePhase(GamePhase.WORLD_MAP)}
            className="dq-button danger w-full-dq-button mt-3"
        >
            ワールドマップへもどる
        </button>
      </div>
    </div>
  );
};