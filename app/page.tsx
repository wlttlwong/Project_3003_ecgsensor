"use client";

import React, { useState, useEffect } from 'react';
import { useHeartRateSensor } from './hooks/useHeartRateSensor';
import { useUserStore} from './store/userStore';
import HeartRateMonitor from './components/HeartRateMonitor';
import ECGChart from './components/ECGChart';


interface UserProfile {
  username: string;
  age: number;
  stressFactor: string;
  goal: string;
}

export default function Home() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Onboarding form states
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [stressFactor, setStressFactor] = useState("");
  const [goal, setGoal] = useState("");

  const {
    connect, disconnect, startECGStream, stopECGStream,
    heartRate, ecgData, error, isConnected, isECGStreaming
  } = useHeartRateSensor();

  // Label states
  const [selectedLabel, setSelectedLabel] = useState<string>("None");
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [labels, setLabels] = useState(["Study", "Work", "Meditation"]);

  // Recent Session Real Data
  const [lastSessionEndTime, setLastSessionEndTime] = useState<string | null>(null);
  const [lastSessionDuration, setLastSessionDuration] = useState<number>(0);
  const [lastAvgHRV, setLastAvgHRV] = useState<number>(48);
  const [lastAvgHR, setLastAvgHR] = useState<number>(78);
  const [lastStressLevel, setLastStressLevel] = useState<number>(62);
  const [lastStressLabel, setLastStressLabel] = useState<string>("");

  // FAQ Modal
  const [openFaq, setOpenFaq] = useState<"hrv" | "stressScore" | "stressAlerts" | null>(null);

  const { name, setName } = useUserStore();
  // Load profile & last session data on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    } else {
      setShowOnboarding(true);
    }

    // Load last session stats
    const savedTime = localStorage.getItem("lastSessionEndTime");
    const savedDuration = localStorage.getItem("lastSessionDuration");
    const savedHRV = localStorage.getItem("lastAvgHRV");
    const savedHR = localStorage.getItem("lastAvgHR");
    const savedStress = localStorage.getItem("lastStressLevel");
    const savedLabel = localStorage.getItem("lastStressLabel");

    if (savedTime) setLastSessionEndTime(savedTime);
    if (savedDuration) setLastSessionDuration(parseInt(savedDuration));
    if (savedHRV) setLastAvgHRV(parseInt(savedHRV));
    if (savedHR) setLastAvgHR(parseInt(savedHR));
    if (savedStress) setLastStressLevel(parseInt(savedStress));
    if (savedLabel) setLastStressLabel(savedLabel);
  }, []);

  const saveProfile = () => {
    if (!username || !age || !stressFactor || !goal) {
      alert("Please fill in all fields");
      return;
    }

    const profile: UserProfile = {
      username: username.trim(),
      age: parseInt(age),
      stressFactor: stressFactor.trim(),
      goal: goal.trim(),
    };

    localStorage.setItem("userProfile", JSON.stringify(profile));
    setUserProfile(profile);
    setShowOnboarding(false);
  };

  const handleStartSession = async () => {
    if (selectedLabel === "None") {
      setIsLabelModalOpen(true);
      return;
    }

    if (!isConnected) {
      await connect();
    }

    startECGStream();
    console.log(`Session started with label: ${selectedLabel}`);
  };

  const selectLabel = (label: string) => {
    setSelectedLabel(label);
    setIsLabelModalOpen(false);
  };

  const addCustomLabel = () => {
    if (customLabel.trim()) {
      const newLabel = customLabel.trim();
      setLabels([...labels, newLabel]);
      setSelectedLabel(newLabel);
      setCustomLabel("");
      setIsLabelModalOpen(false);
    }
  };

  // Call this function when a session ends (in your stopECGStream logic)
  const saveLastSessionData = (
    durationMinutes: number,
    avgHRV: number,
    avgHR: number,
    stressLevel: number,
    label: string
  ) => {
    const now = new Date();
    const formattedTime = now.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    setLastSessionEndTime(formattedTime);
    setLastSessionDuration(durationMinutes);
    setLastAvgHRV(Math.round(avgHRV));
    setLastAvgHR(Math.round(avgHR));
    setLastStressLevel(Math.round(stressLevel));
    setLastStressLabel(label);

    localStorage.setItem("lastSessionEndTime", formattedTime);
    localStorage.setItem("lastSessionDuration", durationMinutes.toString());
    localStorage.setItem("lastAvgHRV", avgHRV.toString());
    localStorage.setItem("lastAvgHR", avgHR.toString());
    localStorage.setItem("lastStressLevel", stressLevel.toString());
    localStorage.setItem("lastStressLabel", label);
  };

  // Onboarding Screen
  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-[#0A0F2C] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#1E2A5E] rounded-3xl p-10">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold tracking-tight mb-3">Welcome To Stress Detection Application!</h1>
            <p className="text-gray-400 text-lg">Let's personalize your experience</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">What should we call you?</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Moon"
                className="w-full bg-[#2A3A6E] border border-white/20 rounded-2xl px-5 py-4 text-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Your age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="25"
                className="w-full bg-[#2A3A6E] border border-white/20 rounded-2xl px-5 py-4 text-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">What is your current main stress factor?</label>
              <select
                value={stressFactor}
                onChange={(e) => setStressFactor(e.target.value)}
                className="w-full bg-[#2A3A6E] border border-white/20 rounded-2xl px-5 py-4 text-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">Select one</option>
                <option value="Work pressure">Work pressure</option>
                <option value="Study / Exams">Study / Exams</option>
                <option value="Sleep issues">Sleep issues</option>
                <option value="Daily commute">Daily commute</option>
                <option value="Family responsibilities">Family responsibilities</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">What is your main goal?</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full bg-[#2A3A6E] border border-white/20 rounded-2xl px-5 py-4 text-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">Select one</option>
                <option value="Reduce daily stress">Reduce daily stress</option>
                <option value="Improve focus and productivity">Improve focus and productivity</option>
                <option value="Better sleep quality">Better sleep quality</option>
                <option value="Build stress resilience">Build stress resilience</option>
                <option value="Manage anxiety">Manage anxiety</option>
              </select>
            </div>

            <button
              onClick={saveProfile}
              className="w-full mt-8 py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl text-xl font-medium transition"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main App
  return (
    <div className="min-h-screen bg-[#0A0F2C] text-white font-sans">
      {/* Top Navigation */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10 bg-[#0A0F2C]">
        <div className="text-xl font-semibold tracking-tight">Stress Detection Application</div>
        <div className="flex gap-10 text-sm font-medium">
          <a href="#" className="text-blue-400 font-semibold">LIVE MONITORING</a>
          <a href="/dashboard" className="hover:text-blue-400 transition-colors">DASHBOARD</a>
          <a href="/chatbot" className="hover:text-blue-400 transition-colors">CHATBOT</a>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Greeting */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold tracking-tighter">
            Hi, {userProfile?.username || "User"}
          </h1>
        </div>

        {/* Start Session Area */}
        <div className="flex flex-col items-center mb-12">
          <button
            onClick={handleStartSession}
            className="px-16 py-5 border-2 border-white rounded-full text-2xl font-medium hover:bg-white hover:text-[#0A0F2C] transition-all active:scale-95"
          >
            Start session
          </button>
          <button
            onClick={() => setIsLabelModalOpen(true)}
            className="mt-4 text-blue-400 hover:text-blue-300 transition flex items-center gap-1"
          >
            Label: {selectedLabel} ▼
          </button>
        </div>

        {/* Live Monitoring when streaming */}
        {isECGStreaming && (
          <div className="mb-12">
            <HeartRateMonitor
              isConnected={isConnected}
              isECGStreaming={isECGStreaming}
              connect={connect}
              disconnect={disconnect}
              startECGStream={startECGStream}
              stopECGStream={stopECGStream}
              error={error}
              heartRate={heartRate}
            />
            <div className="max-w-4xl mx-auto mt-6 bg-[#1E2A5E] p-6 rounded-3xl">
              <ECGChart ecgData={ecgData} />
            </div>
          </div>
        )}

        {/* Recent Session + FAQ */}
        {!isECGStreaming && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Recent Session Card */}
            <div className="lg:col-span-8 bg-[#1E2A5E] rounded-3xl p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-semibold">Recent Session</h2>
                {lastSessionEndTime ? (
                  <div className="text-right text-sm text-gray-300">
                    Last session: <span className="font-medium text-white">{lastSessionEndTime}</span><br />
                    Duration: <span className="font-medium text-white">{lastSessionDuration} minutes</span>
                    {lastStressLabel && <div className="text-blue-400 mt-1">• {lastStressLabel}</div>}
                  </div>
                ) : (
                  <div className="text-right text-sm text-gray-400">
                    No sessions yet<br />
                    Start your first session above
                  </div>
                )}
              </div>

              {lastSessionEndTime ? (
                <>
                  {/* Dynamic Stress Gauge */}
                  <div className="flex justify-center my-8">
                    <div className="relative w-72 h-36">
                      <div
                        className="absolute inset-x-0 bottom-0 h-36 rounded-t-full border-[18px] border-l-[#22C55E] border-t-[#22C55E] border-r-[#FACC15] border-b-transparent"
                        style={{ clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)' }}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
                        <div className="text-center">
                          <div className="text-sm text-gray-400">Overall stress level</div>
                          <div className={`text-5xl font-bold mt-1 ${
                            lastStressLevel < 40 ? 'text-green-400' :
                            lastStressLevel < 70 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {lastStressLevel < 40 ? 'LOW' : lastStressLevel < 70 ? 'MODERATE' : 'HIGH'}
                          </div>
                          <div className="text-2xl text-white">({lastStressLevel}/100)</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Real Statistics */}
                  <div className="grid grid-cols-2 gap-8 text-center mt-4">
                    <div>
                      <div className="text-sm text-gray-400">Average HRV</div>
                      <div className="text-5xl font-semibold mt-1">
                        {lastAvgHRV} <span className="text-2xl text-gray-400">ms</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Average Heart Rate</div>
                      <div className="text-5xl font-semibold mt-1">
                        {lastAvgHR} <span className="text-2xl text-gray-400">bpm</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Your recent session statistics will appear here after your first session.
                </div>
              )}
            </div>

            {/* FAQ Sidebar */}
            <div className="lg:col-span-4 bg-[#1E2A5E] rounded-3xl p-8">
              <h3 className="text-xl font-semibold mb-6">FAQ</h3>
              <div className="space-y-4 text-sm">
                <button
                  onClick={() => setOpenFaq("hrv")}
                  className="w-full text-left p-4 bg-[#2A3A6E] hover:bg-[#33457A] rounded-2xl transition flex justify-between items-center group"
                >
                  <span className="font-medium">What is HRV?</span>
                  <span className="text-blue-400 group-hover:translate-x-1 transition">→</span>
                </button>

                <button
                  onClick={() => setOpenFaq("stressScore")}
                  className="w-full text-left p-4 bg-[#2A3A6E] hover:bg-[#33457A] rounded-2xl transition flex justify-between items-center group"
                >
                  <span className="font-medium">How is “Stress Score” calculated?</span>
                  <span className="text-blue-400 group-hover:translate-x-1 transition">→</span>
                </button>

                <button
                  onClick={() => setOpenFaq("stressAlerts")}
                  className="w-full text-left p-4 bg-[#2A3A6E] hover:bg-[#33457A] rounded-2xl transition flex justify-between items-center group"
                >
                  <span className="font-medium">What do “Stress Alerts” indicate?</span>
                  <span className="text-blue-400 group-hover:translate-x-1 transition">→</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Label Modal */}
      {isLabelModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#1E2A5E] rounded-3xl p-8 w-full max-w-md mx-4">
            <h3 className="text-2xl font-semibold mb-6">Choose Session Label</h3>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {labels.map((label) => (
                <button
                  key={label}
                  onClick={() => selectLabel(label)}
                  className={`py-4 rounded-2xl text-lg font-medium transition ${selectedLabel === label ? 'bg-blue-600 text-white' : 'bg-[#2A3A6E] hover:bg-[#33457A]'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="Custom label (e.g. Commute)"
                className="flex-1 bg-[#2A3A6E] border border-white/20 rounded-2xl px-5 py-4 text-white placeholder-gray-400 focus:outline-none"
              />
              <button
                onClick={addCustomLabel}
                className="px-6 bg-blue-600 rounded-2xl font-medium hover:bg-blue-500"
              >
                Add
              </button>
            </div>
            <button
              onClick={() => setIsLabelModalOpen(false)}
              className="mt-8 w-full py-4 text-gray-400 hover:text-white transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* FAQ Detail Modal */}
      {openFaq && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="bg-[#1E2A5E] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-8 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#1E2A5E]">
              <h3 className="text-2xl font-semibold">
                {openFaq === "hrv" && "What is HRV?"}
                {openFaq === "stressScore" && "How is Stress Score calculated?"}
                {openFaq === "stressAlerts" && "What do Stress Alerts indicate?"}
              </h3>
              <button
                onClick={() => setOpenFaq(null)}
                className="text-3xl text-gray-400 hover:text-white transition"
              >
                ×
              </button>
            </div>

            <div className="p-8 text-gray-300 leading-relaxed space-y-6">
              {openFaq === "hrv" && (
                <>
                  <p>Heart Rate Variability (HRV) is the variation in time between consecutive heartbeats, measured from your wearable ECG device.</p>
                  <p>Higher HRV indicates better stress resilience and autonomic nervous system balance. Lower HRV often signals higher stress or fatigue.</p>
                  <p className="text-blue-400 font-medium">This app uses real ECG data from your device to compute HRV in real time.</p>
                </>
              )}
              {openFaq === "stressScore" && (
                <>
                  <p>Your Stress Score (0–100) is calculated from real-time HRV and heart rate data from your ECG wearable.</p>
                  <p>Sudden drops in HRV or sustained high heart rate increase the score.</p>
                  <p className="text-blue-400 font-medium">The algorithm is based on your personal baseline and becomes more accurate with more sessions.</p>
                </>
              )}
              {openFaq === "stressAlerts" && (
                <>
                  <p>Stress Alerts trigger when the app detects a significant drop in HRV combined with rising heart rate — physiological signs of acute stress.</p>
                  <p>The app can show visual warnings and suggest breathing exercises to help you recover quickly.</p>
                </>
              )}
            </div>

            <div className="p-8 border-t border-white/10">
              <button
                onClick={() => setOpenFaq(null)}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}