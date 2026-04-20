"use client";
import React, { useState, useEffect } from "react";

interface MonitorControlsProps {
  isConnected: boolean;
  isECGStreaming: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  startECGStream: () => Promise<void>;
  stopECGStream: () => void;
  error: string | null;
  heartRate: number | null;
  ecgData?: { timestamp: number }[]; // optional ECG data for HRV calculation
}

const HeartRateMonitor: React.FC<MonitorControlsProps> = ({
  isConnected,
  isECGStreaming,
  connect,
  disconnect,
  startECGStream,
  stopECGStream,
  error,
  heartRate,
  ecgData = [],
}) => {
  // --- Session state ---
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [sessionDuration, setSessionDuration] = useState<number>(0);

  // --- Metrics state ---
  const [hrValues, setHrValues] = useState<number[]>([]);
  const [avgHR, setAvgHR] = useState<number>(0);
  const [maxHR, setMaxHR] = useState<number>(0);
  const [avgHRV, setAvgHRV] = useState<number>(0);
  const [stressLevel, setStressLevel] = useState<string>("Normal");

  // --- Notes state ---
  const [notes, setNotes] = useState<string>("");

  // --- Feedback state ---
  const [showBreathingPrompt, setShowBreathingPrompt] = useState(false);

  // Start session
  function startSession() {
    setSessionStart(Date.now());
    setHrValues([]);
  }

  // End session
  function endSession() {
    if (sessionStart) {
      const duration = Math.floor((Date.now() - sessionStart) / 1000);
      setSessionDuration(duration);
    }
    saveSessionLog();   // automatically save log when ending
    stopECGStream();
  }

  // --- Save session log ---
  function saveSessionLog() {
    const logEntry = {
      duration: sessionDuration,
      avgHR,
      maxHR,
      avgHRV,
      stressLevel,
      notes,
      timestamp: new Date().toISOString(),
    };
    const logs = JSON.parse(localStorage.getItem("sessionLogs") || "[]");
    logs.push(logEntry);
    localStorage.setItem("sessionLogs", JSON.stringify(logs));
  }

  // --- Update HR metrics ---
  useEffect(() => {
    if (heartRate) {
      setHrValues((prev) => {
        const updated = [...prev, heartRate];
        setAvgHR(updated.reduce((a, b) => a + b, 0) / updated.length);
        setMaxHR(Math.max(...updated));
        return updated;
      });
    }
  }, [heartRate]);

  // --- Calculate HRV & classify stress ---
  useEffect(() => {
    if (ecgData.length > 2) {
      const rrIntervals = ecgData.map((d, i, arr) =>
        i > 0 ? d.timestamp - arr[i - 1].timestamp : 0
      );
      const validRR = rrIntervals.filter((r) => r > 0);
      if (validRR.length > 0) {
        const avg = validRR.reduce((a, b) => a + b, 0) / validRR.length;
        setAvgHRV(avg);

        if (avg < 20) setStressLevel("Critical");
        else if (avg < 50) setStressLevel("Mediocre");
        else if (avg < 80) setStressLevel("Great");
        else setStressLevel("Amazing");
      }
    }
  }, [ecgData]);

  // --- Feedback control: notifications when stress is too high ---
  useEffect(() => {
    if (stressLevel === "Critical") {
      alert("Stress level rising!"); // visual alert
      const beep = new Audio("/sounds/beep.mp3"); // sound alert
      beep.play();
      setShowBreathingPrompt(true); // show breathing prompt
      endSession(); // auto-stop session
    } else {
      setShowBreathingPrompt(false);
    }
  }, [stressLevel]);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Heart Rate & ECG Monitor
        </h1>

        {/* Error alert box */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {!isConnected ? (
          <button
            onClick={connect}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
          >
            Connect to Polar H10
          </button>
        ) : (
          <div className="space-y-6">
            {/* Heart rate display */}
            <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-700">Heart Rate:</span>
              <span className="text-2xl font-bold text-blue-600">
                {heartRate ? `${heartRate} BPM` : "Waiting for data..."}
              </span>
            </div>

            {/* Metrics summary */}
            <div className="bg-gray-100 rounded-lg p-4 mt-4">
              <p>Average HR: {avgHR.toFixed(1)} BPM</p>
              <p>Max HR: {maxHR} BPM</p>
              <p>Average HRV: {avgHRV.toFixed(1)} ms</p>
              <p>Stress Level: {stressLevel}</p>
              <p>Session Duration: {sessionDuration}s</p>
            </div>

            {/* Notes input */}
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes for this session..."
              className="w-full border rounded p-2 mt-4"
            />

            {/* Breathing prompt UI */}
            {showBreathingPrompt && (
              <div className="bg-blue-100 p-4 rounded mt-4">
                <p className="font-semibold">Try 4-7-8 breathing:</p>
                <p>Inhale for 4s → Hold for 7s → Exhale for 8s</p>
                <button
                  onClick={() => setShowBreathingPrompt(false)}
                  className="mt-2 px-4 py-2 bg-gray-500 text-white rounded"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Control buttons */}
            <div className="flex space-x-4">
              <button
                onClick={disconnect}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
              >
                Disconnect
              </button>

              {!isECGStreaming ? (
                <button
                  onClick={startECGStream}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Start ECG Stream
                </button>
              ) : (
                <button
                  onClick={stopECGStream}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Stop ECG Stream
                </button>
              )}
            </div>

            {/* Session controls */}
            <div className="flex space-x-4 mt-4">
              <button
                onClick={startSession}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Start Session
              </button>
              <button
                onClick={() => { endSession(); window.location.href = "/dashboard"; }}
                className="bg-gray-600 text-white px-4 py-2 rounded"
              >
                End Session & Back to Homepage
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeartRateMonitor;
