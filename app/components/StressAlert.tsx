"use client";
import React, { useEffect } from "react";

interface StressAlertProps {
  onClose: () => void;
}

const StressAlert: React.FC<StressAlertProps> = ({ onClose }) => {
  useEffect(() => {
    const audio = new Audio("/sounds/alert.mp3");
    audio.play().catch((err) => console.error("Audio play failed:", err));
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full text-center">
        <p className="text-4xl font-extrabold text-red-600 mb-4">
          Stress levels are high!
        </p>
        <p className="text-lg text-gray-700 mb-6">It’s time to take a break.</p>

        <div className="flex gap-6 justify-center">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-500 text-white rounded-full shadow hover:bg-blue-600"
          >
            Return to Monitoring
          </button>
          <button
            onClick={() => alert("Show relaxation exercises")}
            className="px-6 py-3 bg-green-500 text-white rounded-full shadow hover:bg-green-600"
          >
            Checkout Exercises
          </button>
        </div>
      </div>
    </div>
  );
};

export default StressAlert;
