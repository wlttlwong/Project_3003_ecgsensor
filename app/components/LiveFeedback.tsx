"use client";
import React, { useState, useEffect } from "react";
import BreathingPrompt from "./BreathingPrompt";
import StretchingPrompt from "./StretchingPrompt";

const LiveFeedback: React.FC = () => {
  // Flow states
  const [showAlert, setShowAlert] = useState(true);   // initial stress alert
  const [showMenu, setShowMenu] = useState(false);    // choices menu
  const [showBreathing, setShowBreathing] = useState(false);
  const [showStretching, setShowStretching] = useState(false);

  // Play sound when alert is shown
  useEffect(() => {
    if (showAlert) {
      const audio = new Audio("/sounds/alert.mp3"); // place file in public/sounds/
      audio.play().catch((err) => console.error("Audio play failed:", err));
    }
  }, [showAlert]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0F2C] font-sans text-white">
      {/* Stress Alert Window */}
      {showAlert && (
        <div className="bg-[#0A0F2C] shadow-lg rounded-lg p-6 max-w-md w-full text-center">
          <h2 className="text-4xl font-extrabold mb-2">Stress levels are high!</h2>
          <p className="text-lg mb-6">It’s time to take a break.</p>
          <div className="flex justify-center gap-6">
            <button
              onClick={() => {
                setShowAlert(false);
                setShowMenu(true);
              }}
              className="px-6 py-3 bg-[#5C66A3] text-white rounded-full shadow hover:bg-blue-700"
            >
              Relax Exercise
            </button>
            <button
              onClick={() => setShowAlert(false)}
              className="px-6 py-3 bg-[#0A0F2C] text-white border border-white rounded-full hover:bg-[#1A1F3C]"
            >
              Continue Monitoring
            </button>
          </div>
        </div>
      )}

      {/* Choices Menu */}
      {showMenu && !showBreathing && !showStretching && (
        <div className="bg-[#0A0F2C] shadow-lg rounded-lg p-6 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Choose an exercise to relax</h2>
          <div className="flex flex-col gap-4 mt-4">
            <button
              onClick={() => {
                setShowMenu(false);
                setShowBreathing(true);
              }}
              className="px-6 py-3 bg-[#5C66A3] text-white font-bold rounded-full shadow hover:bg-blue-700"
            >
              Breathing Exercise
            </button>
            <button
              onClick={() => {
                setShowMenu(false);
                setShowStretching(true);
              }}
              className="px-6 py-3 bg-[#5C66A3] text-white font-bold rounded-full shadow hover:bg-blue-700"
            >
              Stretching Exercise
            </button>
            <button
              onClick={() => setShowMenu(false)}
              className="px-6 py-3 bg-[#0A0F2C] text-white font-bold border border-white rounded-full hover:bg-[#1A1F3C]"
            >
              Continue Monitoring
            </button>
          </div>
        </div>
      )}

      {/* Breathing Prompt */}
      {showBreathing && (
        <BreathingPrompt
          onStop={() => {
            setShowBreathing(false);
            setShowMenu(true);
          }}
        />
      )}

      {/* Stretching Prompt */}
      {showStretching && (
        <StretchingPrompt
          onStop={() => {
            setShowStretching(false);
            setShowMenu(true);
          }}
        />
      )}
    </div>
  );
};

export default LiveFeedback;
