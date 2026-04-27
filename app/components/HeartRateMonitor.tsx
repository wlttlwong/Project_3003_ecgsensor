"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { getStoredUser } from "../lib/auth";

interface MonitorControlsProps {
  isConnected: boolean;
  isECGStreaming: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  startECGStream: () => Promise<void>;
  stopECGStream: () => void | Promise<void>;
  error: string | null;
  heartRate: number | null;
  ecgData?: { timestamp: number }[];
  onStressUpdate?: (level: string) => void;
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
  onStressUpdate,
}) => {
  // Session States
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [sessionDuration, setSessionDuration] = useState<number>(0);
  const [, setHrValues] = useState<number[]>([]);
  const [avgHR, setAvgHR] = useState<number>(0);
  const [maxHR, setMaxHR] = useState<number>(0);
  
  // Analytics States
  const [avgHRV, setAvgHRV] = useState<number>(0); // This is our RMSSD
  const [stressLevel, setStressLevel] = useState<string>("Normal");
  const [notes, setNotes] = useState<string>("");
  
  // Alert & Intervention States
  const [showBreathingPrompt, setShowBreathingPrompt] = useState(false);
  const [stressDetectedFor5s, setStressDetectedFor5s] = useState(false);
  const alertHandledRef = useRef(false);

  const getSessionLogKey = useCallback(() => {
    const user = getStoredUser();
    return user?.id ? `sessionLogs:${user.id}` : "sessionLogs:guest";
  }, []);

  function startSession() {
    setSessionStart(Date.now());
    setSessionDuration(0);
    setHrValues([]);
    setAvgHR(0);
    setMaxHR(0);
    setAvgHRV(0);
    setStressLevel("Normal");
    setShowBreathingPrompt(false);
    alertHandledRef.current = false;
  }

  const handleStartMonitoring = useCallback(async () => {
    startSession();
    await startECGStream();
  }, [startECGStream]);

  const saveSessionLog = useCallback(
    (duration: number) => {
      if (typeof window === "undefined") return;
      const logEntry = {
        duration,
        avgHR,
        maxHR,
        avgHRV, // Exported as RMSSD
        stressLevel,
        notes,
        timestamp: new Date().toISOString(),
      };
      const logKey = getSessionLogKey();
      const logs = JSON.parse(window.localStorage.getItem(logKey) || "[]");
      logs.push(logEntry);
      window.localStorage.setItem(logKey, JSON.stringify(logs));
    },
    [avgHR, avgHRV, getSessionLogKey, maxHR, notes, stressLevel]
  );

  const endSession = useCallback(async () => {
    const duration = sessionStart ? Math.floor((Date.now() - sessionStart) / 1000) : sessionDuration;
    setSessionDuration(duration);
    saveSessionLog(duration);
    await stopECGStream();
  }, [saveSessionLog, sessionDuration, sessionStart, stopECGStream]);

  // Handle Heart Rate Averaging
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

  // --- RMSSD (HRV) CALCULATION & STRESS MAPPING ---
  useEffect(() => {
    if (ecgData.length > 2) {
      // Extract gaps and filter for realistic physiological R-R intervals (300ms to 1500ms)
      const rrIntervals = ecgData.map((d, i, arr) =>
        i > 0 ? d.timestamp - arr[i - 1].timestamp : 0
      ).filter(r => r > 300 && r < 1500);

      if (rrIntervals.length > 2) {
        // Calculate Successive Differences
        const differences = [];
        for (let i = 1; i < rrIntervals.length; i++) {
          differences.push(rrIntervals[i] - rrIntervals[i-1]);
        }

        // RMSSD formula: Root Mean Square of Successive Differences
        const squaredDiffs = differences.map(d => d * d);
        const meanSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length;
        const rmssdValue = Math.sqrt(meanSquaredDiff);
        
        setAvgHRV(rmssdValue);

        // Map RMSSD to Stress Labels (High RMSSD = Relaxed)
        let level = "Moderate";
        if (rmssdValue > 75) level = "Relaxed";
        else if (rmssdValue < 50 && rmssdValue >= 20) level = "High Stress";
        else if (rmssdValue < 20) level = "Critical";

        setStressLevel(level);
        onStressUpdate?.(level);
      }
    }
  }, [ecgData, onStressUpdate]);

  // --- ALERT TIMER LOGIC ---
  useEffect(() => {
    // Trigger if stress is "High Stress" OR "Critical"
    if (stressLevel !== "High Stress" && stressLevel !== "Critical") {
      setShowBreathingPrompt(false);
      setStressDetectedFor5s(false);
      alertHandledRef.current = false;
      return;
    }

    // Start 5s timer for biofeedback prompt
    const timeoutId = window.setTimeout(() => {
      setStressDetectedFor5s(true);
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [stressLevel]);

  // --- ALERT EXECUTION ---
  useEffect(() => {
    if (!stressDetectedFor5s || alertHandledRef.current) return;
    
    alertHandledRef.current = true;
    
    // Play alert sound
    const beep = new Audio("/sounds/alert.mp3");
    beep.play().catch((err) => console.error("Audio play failed:", err));
    
    // Show visual breathing prompt
    setShowBreathingPrompt(true);
    
    console.warn(`Biofeedback Triggered: ${stressLevel} detected for 5 seconds.`);
  }, [stressDetectedFor5s, stressLevel]);

  return (
    <div className="mx-auto max-w-4xl overflow-hidden rounded-xl bg-white shadow-lg">
      <div className="p-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">Heart Rate & ECG Monitor</h1>

        {error && (
          <div className="mb-6 border-l-4 border-red-500 bg-red-100 p-4 text-red-700" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {!isConnected ? (
          <button
            onClick={connect}
            className="rounded-full bg-blue-500 px-4 py-2 font-bold text-white transition duration-300 ease-in-out hover:scale-105 hover:bg-blue-600 shadow-md"
          >
            Connect to Polar H10
          </button>
        ) : (
          <div className="space-y-6">
            {/* Live Data Display */}
            <div className="flex items-center justify-between rounded-lg bg-gray-100 p-4 shadow-sm border border-gray-200">
              <span className="text-lg font-semibold text-gray-700">Heart Rate:</span>
              <span className="text-2xl font-bold text-blue-600">
                {heartRate ? `${heartRate} BPM` : "Waiting for data..."}
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="mt-4 rounded-lg bg-gray-50 p-4 text-gray-800 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                <p><span className="font-semibold text-gray-600">Average HR:</span> {avgHR.toFixed(1)} BPM</p>
                <p><span className="font-semibold text-gray-600">Max HR:</span> {maxHR} BPM</p>
                <p><span className="font-semibold text-gray-600">Live HRV (RMSSD):</span> {avgHRV.toFixed(1)} ms</p>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-600">Stress Level:</span> 
                  <span className={`ml-2 px-3 py-1 rounded-full text-xs font-black tracking-wide ${
                    stressLevel === 'Relaxed' ? 'bg-green-100 text-green-700 border border-green-200' : 
                    stressLevel === 'Moderate' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 
                    'bg-red-100 text-red-700 border border-red-200 animate-pulse'
                  }`}>
                    {stressLevel.toUpperCase()}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-500 font-medium">Session Duration: {sessionDuration}s</p>
            </div>

            {/* Notes Section */}
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add session observations (e.g., activity type, feelings)..."
              className="mt-4 w-full rounded-lg border border-gray-300 p-3 text-gray-900 focus:ring-2 focus:ring-blue-400 outline-none transition-all"
              rows={3}
            />

            {/* Biofeedback Prompt */}
            {showBreathingPrompt && (
              <div className="mt-4 rounded-lg border-2 border-blue-400 bg-blue-50 p-5 text-blue-900 shadow-inner">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🫁</span>
                  <p className="font-bold text-lg text-blue-700">Stress Detected: Take a Moment</p>
                </div>
                <p className="text-sm font-medium mb-3 italic">Try 4-7-8 breathing to regulate your Autonomic Nervous System:</p>
                <p className="text-md">Inhale for 4s → Hold for 7s → Exhale for 8s</p>
                <button
                  onClick={() => setShowBreathingPrompt(false)}
                  className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-white font-bold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  I'm Calming Down
                </button>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={disconnect}
                className="rounded-full bg-red-500 px-6 py-2 font-bold text-white transition duration-200 hover:bg-red-600 shadow-md"
              >
                Disconnect
              </button>

              {!isECGStreaming ? (
                <button
                  onClick={() => void handleStartMonitoring()}
                  className="rounded-full bg-green-500 px-6 py-2 font-bold text-white transition duration-200 hover:bg-green-600 shadow-md"
                >
                  Start ECG Stream
                </button>
              ) : (
                <button
                  onClick={() => void endSession()}
                  className="rounded-full bg-yellow-500 px-6 py-2 font-bold text-white transition duration-200 hover:bg-yellow-600 shadow-md"
                >
                  Stop & Log Data
                </button>
              )}
            </div>

            {/* Bottom Navigation */}
            <div className="mt-6 flex flex-wrap gap-4 border-t border-gray-100 pt-6">
              <button onClick={startSession} className="rounded-lg bg-indigo-50 px-4 py-2 text-indigo-600 font-semibold hover:bg-indigo-100 transition-colors border border-indigo-200">
                Reset Session
              </button>
              <button
                onClick={async () => {
                  await endSession();
                  window.location.href = "/dashboard";
                }}
                className="rounded-lg bg-slate-600 px-4 py-2 text-white font-semibold hover:bg-slate-700 transition-colors shadow-sm"
              >
                End & Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeartRateMonitor;
