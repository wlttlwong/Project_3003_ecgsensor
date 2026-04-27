"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '../store/userStore';

export default function OnboardingPage() {
  const router = useRouter();
  const { setUser } = useUserStore();

  // Form states from your original code
  const [fName, setFName] = useState("");
  const [fAge, setFAge] = useState("");
  const [fHeight, setFHeight] = useState("");
  const [fTrigger, setFTrigger] = useState("");
  const [fGoal, setFGoal] = useState("");
  const [isCustomTrigger, setIsCustomTrigger] = useState(false);
  const [isCustomGoal, setIsCustomGoal] = useState(false);

  const handleSaveProfile = () => {
    if (!fName.trim() || !fAge || !fHeight) return alert("Please fill fields");
    setUser({ username: fName, age: fAge, height: fHeight, stressTrigger: fTrigger, goals: fGoal });
    router.push('/home'); // Go to your homepage
  };

  return (
    <div className="min-h-screen bg-[#0A0F2C] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#1E2A5E] rounded-[40px] p-10 shadow-2xl border border-white/5">
        <h2 className="text-3xl font-bold mb-2 text-center tracking-tight">Welcome</h2>
        <p className="text-gray-400 text-center mb-8">Let's personalize your experience</p>
        
        {/* ... Paste your original Onboarding Form JSX here (inputs, selects, button) ... */}
        
        <button onClick={handleSaveProfile} className="w-full py-4 bg-blue-600 rounded-2xl font-bold mt-4">
            Complete Setup
        </button>
      </div>
    </div>
  );
}