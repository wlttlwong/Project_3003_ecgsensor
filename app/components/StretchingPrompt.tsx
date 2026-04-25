"use client";
import React, { useState, useEffect } from "react";

interface StretchingPromptProps {
  onStop: () => void;
}

const stretches = [
  {
    name: "Hamstring Stretch",
    instruction:
      "Sit upright, extend one leg forward, and reach towards your foot. Hold for 1 minute.",
    image: "/images/hamstring.png",
  },
  {
    name: "Neck Stretch",
    instruction:
      "Tilt your head gently to one side, using your hand to guide. Hold for 1 minute.",
    image: "/images/neck.png",
  },
  {
    name: "Shoulder Rolls",
    instruction:
      "Roll your shoulders slowly backward in a circular motion. Continue for 1 minute.",
    image: "/images/shoulder.png",
  },
  {
    name: "Side Stretch",
    instruction:
      "Stand tall, raise one arm overhead, and bend sideways. Hold for 1 minute.",
    image: "/images/side.png",
  },
];

const StretchingPrompt: React.FC<StretchingPromptProps> = ({ onStop }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(60);

  useEffect(() => {
    if (secondsLeft === 0) {
      if (currentIndex < stretches.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSecondsLeft(60);
      }
    }
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : prev));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, currentIndex]);

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSecondsLeft(60);
    }
  };

  const goForward = () => {
    if (currentIndex < stretches.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSecondsLeft(60);
    }
  };

  const currentStretch = stretches[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0F2C] p-8 font-sans text-white">
      <h2 className="text-3xl font-bold mb-10">Stretching Routine</h2>

      {/* Wider card */}
      <div className="flex flex-row bg-[#5C66A3] rounded-xl shadow-lg w-full max-w-6xl overflow-hidden">
        {/* Image side */}
        <div className="flex-1">
          <img
            src={currentStretch.image}
            alt={currentStretch.name}
            className="w-full h-full object-cover rounded-l-xl"
          />
        </div>

        {/* Instructions side */}
        <div className="flex flex-col justify-center items-center p-8 w-1/2 text-center">
          <p className="text-2xl font-semibold mb-4">{currentStretch.name}</p>
          <p className="mb-6 text-lg">{currentStretch.instruction}</p>
          <p className="text-5xl font-extrabold mb-8">{secondsLeft}s</p>

          {/* Stop button */}
          <button
            onClick={onStop}
            className="px-8 py-4 bg-red-500 text-white rounded-full shadow hover:bg-red-600 mb-6 text-lg font-bold"
          >
            Stop Stretching
          </button>

          {/* Navigation arrows */}
          <div className="flex gap-8">
            <button
              onClick={goBack}
              disabled={currentIndex === 0}
              className={`px-6 py-3 rounded-full text-lg font-bold ${
                currentIndex === 0
                  ? "bg-gray-500 text-white cursor-not-allowed"
                  : "bg-[#0A0F2C] text-white border border-white hover:bg-[#1A1F3C]"
              }`}
            >
              ← Previous
            </button>
            <button
              onClick={goForward}
              disabled={currentIndex === stretches.length - 1}
              className={`px-6 py-3 rounded-full text-lg font-bold ${
                currentIndex === stretches.length - 1
                  ? "bg-gray-500 text-white cursor-not-allowed"
                  : "bg-[#0A0F2C] text-white border border-white hover:bg-[#1A1F3C]"
              }`}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StretchingPrompt;
