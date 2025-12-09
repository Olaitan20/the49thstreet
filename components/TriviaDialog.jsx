"use client";

import { useState } from "react";
import confetti from "canvas-confetti";

export default function TriviaDialog() {
  const [showTrivia, setShowTrivia] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const questions = [
    {
      text: "Who won the Grammy for Best Global Music Album in 2024?",
      options: ["Burna Boy", "Wizkid", "Davido", "Tems"],
      answer: "Burna Boy",
    },
    {
      text: "Which country hosted the 2022 FIFA World Cup?",
      options: ["Nigeria", "Russia", "USA", "Qatar"],
      answer: "Qatar",
    },
    {
      text: "What is the capital of South Korea?",
      options: ["Busan", "Seoul", "Incheon", "Daegu"],
      answer: "Seoul",
    },
    {
      text: "Which streaming platform released ‘Squid Game’?",
      options: ["Netflix", "HBO", "Amazon Prime", "Hulu"],
      answer: "Netflix",
    },
  ];

  const totalQuestions = questions.length;
  const progress = ((currentIndex + (selected ? 1 : 0)) / totalQuestions) * 100;

  const handleAnswer = (option) => {
    setSelected(option);
    const correct = option === questions[currentIndex].answer;
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 1);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelected("");
        setIsCorrect(null);
      } else {
        setFinished(true);
        if (score + (correct ? 1 : 0) === totalQuestions) {
          confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.6 },
          });
        }
      }
    }, 1000);
  };

  const handleClose = () => {
    setShowTrivia(false);
    setSelected("");
    setIsCorrect(null);
    setCurrentIndex(0);
    setScore(0);
    setFinished(false);
  };

  const getMessage = () => {
    if (!isCorrect) return "❌ Oops! Try again next time!";
    const messages = ["🔥 Nice!", "👏 Great job!", "💪 You got it!", "✨ Awesome!"];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowTrivia(true)}
          className="bg-[#F26509] hover:bg-[#d85400] text-white font-bold px-5 py-3 rounded-full shadow-lg"
        >
          🎯 Play Trivia
        </button>
      </div>

      {/* Popup Overlay */}
      {showTrivia && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-[#000] text-white p-6 rounded-2xl max-w-sm w-full shadow-lg relative">
            <button
              onClick={handleClose}
              className="absolute top-3 right-4 text-white/70 hover:text-white text-xl"
            >
              ×
            </button>

            {!finished ? (
              <>
                <h2 className="text-xl font-semibold mb-4 text-center">
                  Question {currentIndex + 1} of {totalQuestions}
                </h2>

                {/* Progress Bar */}
                <div className="w-full bg-white/10 rounded-full h-2 mb-4 overflow-hidden">
                  <div
                    className="h-full bg-[#F26509] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                <p className="text-sm mb-4 text-center">
                  {questions[currentIndex].text}
                </p>

                <div className="grid gap-3">
                  {questions[currentIndex].options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      disabled={!!selected}
                      className={`px-4 py-2 rounded-xl border text-sm transition-all ${
                        selected === option
                          ? option === questions[currentIndex].answer
                            ? "bg-green-600 border-green-500"
                            : "bg-red-600 border-red-500"
                          : "bg-white/10 hover:bg-white/20 border-white/20"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {/* Feedback */}
                {selected && (
                  <p
                    className={`mt-5 text-center font-bold text-[12px] ${
                      isCorrect ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {getMessage()}
                  </p>
                )}
              </>
            ) : (
              // 🎉 Final Score
              <div className="text-center py-6">
                <h2 className="text-xl font-bold mb-2">🎉 Trivia Complete!</h2>
                <p className="text-[14px] text-white/80 mb-4">
                  You got {score} out of {totalQuestions} questions right.
                </p>
                <p className="text-[12px] font-semibold mb-6">
                  {score === totalQuestions
                    ? "🏆 Perfect! You’re a genius!"
                    : score > totalQuestions / 2
                    ? "👏 Great effort! You know your stuff!"
                    : "💡 Keep learning and try again!"}
                </p>
                <button
                  onClick={handleClose}
                  className="w-full bg-[#F26509] hover:bg-[#d85400] text-white rounded-xl py-2 text-sm font-bold"
                >
                  Play Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

