"use client"

import React, { useEffect, userState } from 'react';

import { useHeartRateSensor } from './hooks/useHeartRateSensor';
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

  // For states for onboarding
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
    const [labels, setLabels] = useState(["Study", "Work", "Meditation"])

    // Load profile on first mount
    useEffect(() => {
      const savedProfile = localStorage.getItem("userProfile");
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      } else {
        setShowOnboarding(true);
      }
    }, []);

    const savedProfile = () => {
      if (!username || !age || !stressFactor || !goal) {
        alert("Please fill in all fields");
        return;
      }
      const profile: UserProfile = {
        username: username.trim(),
        age: parseInt(age),
        stressFactor: stressFactor.trim(),
        goal: goal.trim()
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

    // Connect device if not connected
    if (!isConnected) {
      await connect();
    }

    // Start ECG streaming with chosen label
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

  // Show onboarding screen on first launch
  if (showOnboarding) {
    return (
      <div className='min-h-screen bg-[#0A0F2C] text-white flex items-center justify-center p-6'>
        <div className='max-w-md w-full bg-[#1E2A5E] rounded-3xl p-10'>
          <div className='text-center mb-10'>
            <h1 className='text-5xl font-bold tracking-tight mb-3'> Welcome To Stress Detection Application!</h1>
            <p className='text-gray-400 text-lg'>Let's personalize your experience</p>
        </div>

        <div className='space-y-6'>
          <div>
            <label className='block text-sm text-gray-400 mb-2'>What should we call you?</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Jason"
              className='w-full bg-[#2A3A6E] border border-white/20 rounded-2xl px-5 py-4 text-lg focus:outline-none focus:border-blue-500'
            />
          </div>

          <div>
            <label className='block text-sm text-gray-400 mb-2'>Your age</label>
            <input
              type='number'
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="25"
              className='w-full bg-[#2A3A6E] border border-white/20 rounded-2xl px-5 py-4 text-lg focus:outline-none focus:border-blue-500'
            />
          </div>
          
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0F2C] text-white font-sans">
      {/* Top Navigation Bar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10 bg-[#0A0F2C]">
        <div className="text-xl font-semibold tracking-tight">Stress Detection Application</div>

        <div className="flex gap-10 text-sm font-medium">
          <a href="#" className='text-blue-400 font-semibold'>LIVE MONITORING</a>
          <a href="/dashboard" className='hover:text-blue-400 transition-colors'>DASHBOARD</a>
          <a href="/chatbot" className='hover:text-blue-400 transition-colors'>CHATBOT</a>
        </div>
      </nav>

      <div className='max-w-5xl x-auto px-6 py-12'>
        {/* Greeting */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold tracking-tighter">Hi, User</h1>
        </div>
      </div>
    </div>
  );
}
