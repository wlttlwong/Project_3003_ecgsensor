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
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [sessionDuration, setSessionDuration] = useState<number>(0);
  const [, setHrValues] = useState<number[]>([]);
  const [avgHR, setAvgHR] = useState<number>(0);
  const [maxHR, setMaxHR] = useState<number>(0);
  const [avgHRV, setAvgHRV] = useState<number>(0);
  const [stressLevel, setStressLevel] = useState<string>("Normal");
  const [notes, setNotes] = useState<string>("");
  const [showBreathingPrompt, setShowBreathingPrompt] = useState(false);
  const [criticalFor5s, setCriticalFor5s] = useState(false);
  const criticalHandledRef = useRef(false);

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
    criticalHandledRef.current = false;
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
        avgHRV,
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

  useEffect(() => {
    if (ecgData.length > 2) {
      const rrIntervals = ecgData.map((d, i, arr) =>
        i > 0 ? d.timestamp - arr[i - 1].timestamp : 0
      );
      const validRR = rrIntervals.filter((r) => r > 0);
      if (validRR.length > 0) {
        const avg = validRR.reduce((a, b) => a + b, 0) / validRR.length;
        setAvgHRV(avg);

        let level = "Low";
        if (avg < 20) level = "Critical";
        else if (avg < 50) level = "High";
        else if (avg < 80) level = "Medium";

        setStressLevel(level);
        onStressUpdate?.(level);
      }
    }
  }, [ecgData, onStressUpdate]);

  useEffect(() => {
    if (stressLevel !== "Critical") {
      setShowBreathingPrompt(false);
      setCriticalFor5s(false);
      criticalHandledRef.current = false;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCriticalFor5s(true);
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [stressLevel]);

  useEffect(() => {
    if (!criticalFor5s) return;
    if (criticalHandledRef.current) return;
    criticalHandledRef.current = true;
    alert("Stress level rising!");
    const beep = new Audio("/sounds/alert.mp3");
    beep.play().catch((err) => console.error("Audio play failed:", err));
    setShowBreathingPrompt(true);
    void endSession();
  }, [criticalFor5s, endSession]);

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
            className="rounded-full bg-blue-500 px-4 py-2 font-bold text-white transition duration-300 ease-in-out hover:scale-105 hover:bg-blue-600"
          >
            Connect to Polar H10
          </button>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-lg bg-gray-100 p-4">
              <span className="text-lg font-semibold text-gray-700">Heart Rate:</span>
              <span className="text-2xl font-bold text-blue-600">
                {heartRate ? `${heartRate} BPM` : "Waiting for data..."}
              </span>
            </div>

            <div className="mt-4 rounded-lg bg-gray-100 p-4 text-gray-800">
              <p>Average HR: {avgHR.toFixed(1)} BPM</p>
              <p>Max HR: {maxHR} BPM</p>
              <p>Average HRV: {avgHRV.toFixed(1)} ms</p>
              <p>Stress Level: {stressLevel}</p>
              <p>Session Duration: {sessionDuration}s</p>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes for this session..."
              className="mt-4 w-full rounded border p-2 text-gray-900"
            />

            {showBreathingPrompt && (
              <div className="mt-4 rounded bg-blue-100 p-4 text-gray-800">
                <p className="font-semibold">Try 4-7-8 breathing:</p>
                <p>Inhale for 4s -&gt; Hold for 7s -&gt; Exhale for 8s</p>
                <button
                  onClick={() => setShowBreathingPrompt(false)}
                  className="mt-2 rounded bg-gray-500 px-4 py-2 text-white"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              <button
                onClick={disconnect}
                className="rounded-full bg-red-500 px-4 py-2 font-bold text-white transition duration-300 ease-in-out hover:scale-105 hover:bg-red-600"
              >
                Disconnect
              </button>

              {!isECGStreaming ? (
                <button
                  onClick={() => void handleStartMonitoring()}
                  className="rounded-full bg-green-500 px-4 py-2 font-bold text-white transition duration-300 ease-in-out hover:scale-105 hover:bg-green-600"
                >
                  Start ECG Stream
                </button>
              ) : (
                <button
                  onClick={() => void endSession()}
                  className="rounded-full bg-yellow-500 px-4 py-2 font-bold text-white transition duration-300 ease-in-out hover:scale-105 hover:bg-yellow-600"
                >
                  Stop ECG Stream
                </button>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-4">
              <button onClick={startSession} className="rounded bg-green-600 px-4 py-2 text-white">
                Start Session
              </button>
              <button
                onClick={async () => {
                  await endSession();
                  window.location.href = "/dashboard";
                }}
                className="rounded bg-gray-600 px-4 py-2 text-white"
              >
                End Session & Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeartRateMonitor;
