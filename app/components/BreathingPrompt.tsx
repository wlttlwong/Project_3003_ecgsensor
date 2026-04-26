"use client";
import React, { useState, useEffect } from "react";

interface BreathingPromptProps {
  onStop: () => void;
}

const BreathingPrompt: React.FC<BreathingPromptProps> = ({ onStop }) => {
  const [phase, setPhase] = useState("Breathe In");
  const [cycle, setCycle] = useState(1);
  const [scale, setScale] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const startPhase = (
      name: string,
      duration: number,
      newScale: number,
      next: () => void
    ) => {
      setPhase(name);
      setScale(newScale);
      setSecondsLeft(duration);

      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev === 1) {
            clearInterval(timer);
            next();
            return 1;
          }
          return prev - 1;
        });
      }, 1000);
    };

    const runCycle = (currentCycle: number) => {
      startPhase("Breathe In", 4, 1.4, () => {
        startPhase("Hold", 7, 1.4, () => {
          startPhase("Breathe Out", 8, 0.9, () => {
            if (currentCycle < 5) {
              setCycle(currentCycle + 1);
              runCycle(currentCycle + 1);
            } else {
              setPhase("Done");
              setSecondsLeft(0);
              setFinished(true);
            }
          });
        });
      });
    };

    runCycle(cycle);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#0A0F2C] flex flex-col items-center justify-center text-white p-10 font-sans">
      {/* Title */}
      <h2 className="text-4xl font-bold mb-10">Breathing Exercise</h2>

      {/* Cycle indicator moved higher */}
      <p className="text-lg font-semibold mb-12 mt-4">Cycle {cycle} of 5</p>

      {/* Animated circle */}
      <div
        className="rounded-full flex flex-col items-center justify-center transition-transform ease-in-out mb-12"
        style={{
          width: "220px",
          height: "220px",
          transform: `scale(${scale})`,
          transitionDuration:
            phase === "Breathe In"
              ? "4000ms"
              : phase === "Hold"
              ? "7000ms"
              : "8000ms",
          background: "radial-gradient(circle, #0A0F2C 2%, #5C66A3 100%)",
          boxShadow: "0 0 25px 10px #5C66A3",
        }}
      >
        <span className="text-xl font-medium mb-2">{phase}</span>
        <span className="text-6xl font-extrabold">{secondsLeft}</span>
      </div>

      {/* Controls */}
      <div className="flex gap-6 mt-6">
        {finished && (
          <button
            onClick={() => {
              setCycle(1);
              setFinished(false);
              setPhase("Breathe In");
              setSecondsLeft(4);
            }}
            className="px-8 py-4 bg-[#5C66A3] text-white rounded-full shadow hover:bg-[#6C76B3] text-lg font-bold"
          >
            Continue
          </button>
        )}
        <button
          onClick={onStop}
          className="px-8 py-4 bg-red-500 text-white rounded-full shadow hover:bg-red-600 text-lg font-bold"
        >
          Back to Choices
        </button>
      </div>
    </div>
  );
};

export default BreathingPrompt;
