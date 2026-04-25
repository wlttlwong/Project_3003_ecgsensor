"use client";

import React, { useState, useEffect } from 'react';
import { useHeartRateSensor } from '../hooks/useHeartRateSensor';
import { useUserStore } from '../store/userStore';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get real sensor data from your hook
  const { username, age, height, stressTrigger, goals } = useUserStore();
  const sensorData = useHeartRateSensor();

  // Optional: Get last session data from localStorage (for better context)
  const [lastSession, setLastSession] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("lastSessionEndTime");
    if (saved) {
      setLastSession({
        endTime: localStorage.getItem("lastSessionEndTime"),
        duration: localStorage.getItem("lastSessionDuration"),
        avgHRV: localStorage.getItem("lastAvgHRV"),
        avgHR: localStorage.getItem("lastAvgHR"),
        stressLevel: localStorage.getItem("lastStressScore"),
      });
    }
  }, []);

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    // Prepare rich context for your ECG/HRV stress app
    const context = {
      userProfile: { 
        username,
        age, 
        height,
        stressTriggers: [stressTrigger], 
        goals
      },
      currentLiveData: {
        heartRate: sensorData.heartRate || 0,           // Real current HR from wearable
        isConnected: sensorData.isConnected,
        isECGStreaming: sensorData.isECGStreaming,
      },
      lastSession: lastSession || {
        avgHR: 0,
        avgHRV: 0,
        stressLevel: "N/A",
        durationMinutes: 0
      },
      recentInsight: "Reviewing your latest trends..."
    };

    try {
      const res = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage, 
          context 
        }),
      });

      const data = await res.json();
      const reply = data.reply || data.error || "Sorry, I could not respond right now.";

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Error connecting to the AI server. Please make sure the backend is running on port 8000." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickButtons = [
    "Explain my current HRV",
    "How is my stress trend this week?"
  ];

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-[#9ea7db] hover:bg-[#c8c9cc] text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-3xl z-50 transition-all active:scale-95"
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[520px] bg-[#0A0F2C]/50 border border-white/10 rounded-[30px] shadow-2xl flex flex-col z-50 overflow-hidden backdrop-blur-xl">
          {/* Header */}
          <div className="bg-[#1E2A5E]/50 text-white p-5 flex justify-between items-center border-b border-white/10">
            <div>
              <p className="font-bold tracking-tight text-lg">StressGuard AI</p>
              <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold">Your ECG-based Stress Coach</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-xl hover:opacity-60"
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#0A0F2C]/50">
            {messages.length === 0 && (
              <p className="text-white/40 text-sm text-center py-8">
                Hi {username}! I'm your stress coach. Ask me anything about your HRV or stress-release techniques.
              </p>
            )}

            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-[#6a72a6] text-white ml-auto' 
                    : 'bg-[#d4d5d9] border border-gray-200 text-gray-800'
                }`}
              >
                {msg.content}
              </div>
            ))}

            {isLoading && (
              <p className="text-[#6a72a6] italic pl-2 animate-pulse">StressGuard is thinking...</p>
            )}
          </div>

          {/* Quick Reply Buttons */}
          {messages.length === 0 && (
            <div className="p-3 border-t border-white/20 bg-white/10 bg-[#1E2A5E]/20 flex flex-wrap gap-2">
            {quickButtons.map((btn, i) => (
              <button
                key={i}
                onClick={() => sendMessage(btn)}
                disabled={isLoading}
                className="text-[10px] font-bold uppercase tracking-wider px-3 py-2 bg-[#868cb5]/50 hover:bg-white/10 border border-white/10 rounded-full text-white/70 transition-all"
              >
                {btn}
              </button>
            ))}
          </div>
         )}
        
          {/* Input Area */}
          <div className="p-4 border-t border-white/20 bg-[#1E2A5E]/50 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="Type message..."
              className="flex-1 bg-[#0A0F2C] text-white rounded-xl px-4 py-3 outline-none border border-white/5 focus:border-[#7c8bcf] text-sm"
              disabled={isLoading}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={isLoading || !input.trim()}
              className="bg-[#9298b3] text-white px-5 rounded-xl font-bold text-sm disabled:opacity-50 hover:bg-[#7c8bcf] transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;