"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useHeartRateSensor } from './hooks/useHeartRateSensor';
import { useUserStore } from './store/userStore';
import HeartRateMonitor from './components/HeartRateMonitor';
import ECGChart from './components/ECGChart';
import FAQModal, { FAQ_DATABASE } from './components/FAQModal';

export default function Home() {
  // 1. All needed values
  const { username, age, height, stressTrigger, goals, setUser } = useUserStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Form states for Onboarding
  const [fName, setFName] = useState("");
  const [fAge, setFAge] = useState("");
  const [fHeight, setFHeight] = useState("");
  const [fTrigger, setFTrigger] = useState("");
  const [fGoal, setFGoal] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false); // Settings toggle

  // FAQ Session
  const [selectedFaqId, setSelectedFaqId] = useState<string | null>(null);

  // Label Logic
  const [selectedLabel, setSelectedLabel] = useState<string>("None");
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [availableLabels, setAvailableLabels] = useState(["Study", "Work", "Meditation"]);

  // Recent Session Real Data (Loaded from localStorage)
  const [lastSessionEndTime, setLastSessionEndTime] = useState<string | null>(null);
  const [lastSessionDuration, setLastSessionDuration] = useState<number>(0);
  const [lastAvgHRV, setLastAvgHRV] = useState<number>(0);
  const [lastAvgHR, setLastAvgHR] = useState<number>(0);
  const [lastStressScore, setLastStressScore] = useState<number>(0);

  const {
    connect, disconnect, startECGStream, stopECGStream,
    heartRate, ecgData, error, isConnected, isECGStreaming
  } = useHeartRateSensor();

  // Load profile and last session data
  useEffect(() => {
    setIsHydrated(true);

    // 2. Populate form fields from store (for profile editing)
    if (username) {
      setFName(username);
      setFAge(age || "");
      setFHeight(height || "");
      setFTrigger(stressTrigger || "");
      setFGoal(goals || "");
    }
    const savedTime = localStorage.getItem("lastSessionEndTime");
    if (savedTime) {
      setLastSessionEndTime(savedTime);
      setLastSessionDuration(parseInt(localStorage.getItem("duration") || "0"));
      setLastAvgHRV(parseInt(localStorage.getItem("avgHRV") || "0"));
      setLastAvgHR(parseInt(localStorage.getItem("avgHR") || "0"));
      setLastStressScore(parseInt(localStorage.getItem("stressScore") || "0"));
    }
  }, []);

  // Helper for dynamic UI colors based on stress score
  const getStressStatus = (score: number) => {
    if (score === 0) return { label: 'N/A', color: 'text-white/20', stroke: 'white' };
    if (score < 40) return { label: 'LOW', color: 'text-green-400', stroke: '#4ade80' };
    if (score < 70) return { label: 'MODERATE', color: 'text-yellow-400', stroke: '#facc15' };
    return { label: 'HIGH', color: 'text-red-400', stroke: '#f87171' };
  };

  // Validation for Profile
  const handleSaveProfile = () => {
    if (!fName.trim() || !fAge.trim() || !fHeight.trim() || !fTrigger.trim() || !fGoal.trim()) {
      return alert("Please fill all fields");
    }
    setUser({
      username: fName,
      age: fAge,
      height: fHeight,
      stressTrigger: fTrigger,
      goals: fGoal
    });
    setIsProfileOpen(false);
  };

  const handleStartSession = () => {
    if (!isConnected) {
      connect();
    } else {
      // Logic to record the 'selectedLabel' with the session can be added here
      startECGStream();
    }
  };

  const handleAddCustomLabel = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customLabel.trim() !== "") {
      setAvailableLabels([...availableLabels, customLabel]);
      setSelectedLabel(customLabel);
      setCustomLabel("");
    }
  };

  if (!isHydrated) return null;

  // --- ONBOARDING SCREEN ---
  if (!username) {
    return (
      <div className="min-h-screen bg-[#0A0F2C] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#1E2A5E] rounded-[40px] p-10 shadow-2xl">
          <h2 className="text-3xl font-bold mb-2 text-center tracking-tight">Welcome</h2>
          <p className="text-gray-400 text-center mb-8">Let's personalize your experience</p>
          
          <div className="space-y-4">
            <input 
              className="w-full bg-[#2A3A6E] p-4 rounded-2xl outline-none border border-white/5 focus:border-blue-500 transition-all" 
              placeholder="What is your name?" value={fName} onChange={(e) => setFName(e.target.value)} 
            />
            <input 
              className="w-full bg-[#2A3A6E] p-4 rounded-2xl outline-none border border-white/5 focus:border-blue-500 transition-all" 
              placeholder="Your age" type="number" value={fAge} onChange={(e) => setFAge(e.target.value)} 
            />
            <input 
              className="w-full bg-[#2A3A6E] p-4 rounded-2xl outline-none border border-white/5 focus:border-blue-500 transition-all" 
              placeholder="Your height in cm" type="number" value={fHeight} onChange={(e) => setFHeight(e.target.value)}
            />
            <select 
              className="w-full bg-[#2A3A6E] p-4 rounded-2xl outline-none border border-white/5"
              value={fTrigger} onChange={(e) => setFTrigger(e.target.value)}
            >
              <option value="">Main stress trigger?</option>
              <option value="Work pressure">Work pressure</option>
              <option value="Study / Exams">Study / Exams</option>
              <option value="Sleep issues">Sleep issues</option>
              <option value="Daily commute">Daily commute</option>
            </select>
            <select 
              className="w-full bg-[#2A3A6E] p-4 rounded-2xl outline-none border border-white/5"
              value={fGoal} onChange={(e) => setFGoal(e.target.value)}
            >
              <option value="">What is your main goal?</option>
              <option value="Reduce daily stress">Reduce daily stress</option>
              <option value="Improve focus">Improve focus</option>
              <option value="Better sleep quality">Better sleep quality</option>
            </select>
            <button 
              onClick={handleSaveProfile}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold transition-all mt-4"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN DASHBOARD ---
  return (
    <div className="min-h-screen bg-[#0A0F2C] text-white font-sans pb-20">
      
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-12 py-8">
        <div className="text-lg font-bold tracking-tight">Stress Detection Application</div>
        <div className="flex items-center gap-12">
          <div className='flex gap-12 text-sm font-bold tracking-widest'>
          <Link href="/" className="text-blue-400">LIVE MONITORING</Link>
          <Link href="/history" className="hover:text-blue-400 transition-colors">HISTORY</Link>
          </div>
    
          {/* Profile setting button */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className='bg-white/10 p-2 px-6 rounded-full border border-white/20 hover:bg-white/20 transition-all text-xs font-bold tracking-widest'
          >
            PROFILE SETTINGS
          </button>
        </div>
      </nav>

      {/* Welcome */}
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h1 className="text-[120px] font-bold leading-none mt-12 mb-10 tracking-tighter">
          Hi, {username}
        </h1>
        
        {/* Start session button */}
        <div className="flex flex-col items-center gap-4 mb-20">
          <button 
            onClick={handleStartSession}
            className="px-16 py-4 border-2 border-white rounded-full text-2xl font-bold hover:bg-white hover:text-[#0A0F2C] transition-all active:scale-95"
          >
            {isECGStreaming ? "Streaming..." : `Start ${selectedLabel !== "None" ? selectedLabel : "session"}`}
          </button>
          <button 
            onClick={() => setIsLabelModalOpen(true)}
            className="text-lg font-medium underline underline-offset-4 opacity-60 hover:opacity-100 transition-opacity"
          >
            Label: {selectedLabel}
          </button>
        </div>

        {/* Label Modal */}
        {isLabelModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 text-left">
            <div className="bg-[#1E2A5E] w-full max-w-sm rounded-[30px] p-8 border border-white/10 shadow-2xl">
              <h3 className="text-xl font-bold mb-6 text-center">Select Activity</h3>
              <div className="flex flex-col gap-3">
                {availableLabels.map((l) => (
                  <button 
                    key={l}
                    onClick={() => { setSelectedLabel(l); setIsLabelModalOpen(false); }}
                    className={`py-3 rounded-xl font-semibold transition-all ${selectedLabel === l ? 'bg-blue-600' : 'bg-white/5 hover:bg-white/10'}`}
                  >
                    {l}
                  </button>
                ))}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <input 
                    type="text"
                    placeholder="+ Custom Label (Press Enter)"
                    className="w-full bg-white/5 p-3 rounded-xl outline-none border border-white/5 focus:border-blue-500"
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    onKeyDown={handleAddCustomLabel}
                  />
                </div>
              </div>
              <button onClick={() => setIsLabelModalOpen(false)} className="w-full mt-6 text-sm opacity-50 hover:opacity-100 font-bold">Close</button>
            </div>
          </div>
        )}

        {isECGStreaming && (
          <div className="mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <HeartRateMonitor 
               isConnected={isConnected} isECGStreaming={isECGStreaming} 
               connect={connect} disconnect={disconnect}
               startECGStream={startECGStream} stopECGStream={stopECGStream}
               heartRate={heartRate} error={error}
            />
            <div className="mt-8 bg-white/5 backdrop-blur-md rounded-[40px] p-8 border border-white/10">
              <ECGChart ecgData={ecgData} />
            </div>
          </div>
        )}

        {/* Recent Session Summary */}
        {!isECGStreaming && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
            <div className="lg:col-span-8 bg-[#5C66A3]/80 backdrop-blur-xl rounded-[40px] p-10 shadow-2xl flex flex-col justify-between min-h-[450px]">
              <div className="flex justify-between items-start">
                <h2 className="text-3xl font-bold">Recent Session</h2>
                <div className="text-right">
                  <p className="text-xs font-bold opacity-40 uppercase tracking-widest">Last Recorded</p>
                  <p className="text-sm font-semibold">{lastSessionEndTime || "No data yet"}</p>
                  {lastSessionDuration > 0 && <p className="text-xs text-blue-200">{lastSessionDuration} minute session</p>}
                </div>
              </div>

              <div className="relative flex flex-col items-center justify-center py-4">
                <svg className="w-80 h-40" viewBox="0 0 100 50">
                  <path d="M 10 45 A 40 40 0 0 1 90 45" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.1" strokeLinecap="round" />
                  <path
                    d="M 10 45 A 40 40 0 0 1 90 45" fill="none" stroke={getStressStatus(lastStressScore).stroke}
                    strokeWidth="3" strokeLinecap="round" strokeDasharray="126"
                    strokeDashoffset={126 - (126 * lastStressScore) / 100}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
                  <span className="text-[10px] font-bold tracking-[0.2em] opacity-50 uppercase">Overall Stress Level</span>
                  <span className={`text-6xl font-black tracking-tighter ${getStressStatus(lastStressScore).color}`}>
                    {getStressStatus(lastStressScore).label}
                  </span>
                  <span className="text-xl font-bold mt-1">({lastStressScore}<span className="opacity-40">/100</span>)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/10">
                <div className="text-center border-r border-white/10">
                  <p className="text-xs font-bold opacity-50 uppercase mb-1">Average HRV</p>
                  <p className="text-5xl font-light tracking-tighter">{lastAvgHRV} <span className="text-xl opacity-30">ms</span></p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold opacity-50 uppercase mb-1">Avg Heart Rate</p>
                  <p className="text-5xl font-light tracking-tighter">{lastAvgHR} <span className="text-xl opacity-30">bpm</span></p>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-4 bg-[#5C66A3]/80 backdrop-blur-xl rounded-[40px] p-10 flex flex-col shadow-2xl">
              <h3 className="text-3xl font-bold mb-8 text-center">FAQ</h3>
              <div className="space-y-6 flex-grow">

                {/* Updated */}
                {FAQ_DATABASE.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedFaqId(item.id)} // trigger slide-up page
                    className='w-full text-left font-bold text-lg hover:text-blue-300 transition-colors flex justify-betweem'
                  >
                    <span>{item.q}</span>
                    <span>→</span>
                  </button>
                ))}
              </div>

              {/* Link to quick tip page */}
              <Link href="/tips" className='mt-12 text-lg font-bold underline underline-offset-8 decoration-2 hover:text-blue-200 transition-all text-center'>
                Quick Tips to release stress
              </Link>
            </div>
          </div>
        )}

        {/* Profile modal */}
        {isProfileOpen && (
          <div className='fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6'>
            <div className='bg-[#1E2A5E] w-full max-w-md rounded-[30px] p-8 border border-white/10 shadow-2xl'>
              <h3 className='text-2xl font-bold mb-6'>User Profile</h3>
              <div className='space-y-4 text-left'>
                <div className='text-sm opacity-50 mb-2 font-bold uppercase tracking-wider'>Username: {username}</div>

                <div className='space-y-1'>
                  <label className='text-[10px] uppercase font-bold opacity-40 ml-2'>Age</label>
                  <input className='w-full bg-white/5 p-4 rounded-xl border border-white/10 focus:border-blue-500 outline-none' value={fAge} onChange={(e) => setFAge(e.target.value)} />
                </div>

                <div className='space-y-1'>
                  <label className='text-[10px] uppercase font-bold opacity-40 ml-2'>Height (cm)</label>
                  <input className='w-full bg-white/5 p-4 rounded-xl border border-white/10 focus:border-blue-500 outline-none' value={fHeight} onChange={(e) => setFHeight(e.target.value)} />
                </div>

                <div className='space-y-1'>
                  <label className='text-[10px] uppercase font-bold opacity-40 ml-2'>Main Stress Trigger</label>
                  <input className='w-full bg-white/5 p-4 rounded-xl border border-white/10 focus:border-blue-500 outline-none' value={fTrigger} onChange={(e) => setFTrigger(e.target.value)} />
                </div>

                <div className='space-y-1'>
                  <label className='text-[10px] uppercase font-bold opacity-40 ml-2'>Main Goal</label>
                  <input className='w-full bg-white/5 p-4 rounded-xl border border-white/10 focus:border-blue-500 outline-none' value={fGoal} onChange={(e) => setFGoal(e.target.value)} />
                </div>

                <div className='flex gap-4 pt-4'>
                  <button
                    onClick={() => { handleSaveProfile(); setIsProfileOpen(false); }}
                    className='flex-1 py-4 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition-all'
                  >
                    Save Changes
                  </button>
                  <button onClick={() => setIsProfileOpen(false)} className='flex-1 py-4 bg-white/5 rounded-xl font-bold'>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Modal */}
        <FAQModal
          isOpen={selectedFaqId !== null}
          onClose={() => setSelectedFaqId(null)}
          selectedId={selectedFaqId}
        />
      </div>
    </div>
  
  );
}