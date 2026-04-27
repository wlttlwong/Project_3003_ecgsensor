"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useHeartRateSensor } from '../hooks/useHeartRateSensor';
import { useUserStore } from '../store/userStore';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-scroll reference
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { username, age, height, stressTrigger, goals } = useUserStore();
  const sensorData = useHeartRateSensor();
  const [lastSession, setLastSession] = useState<any>(null);

  // Function to scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Sync and Validate Data
  useEffect(() => {
    const hrv = localStorage.getItem("lastAvgHRV");
    const saved = localStorage.getItem("lastSessionEndTime");

    // CRITICAL: Only set state if HRV is a real number > 0
    if (saved && hrv && parseInt(hrv) > 0) {
      setLastSession({
        lastSessionEndTime: saved,
        lastSessionDuration: localStorage.getItem("lastSessionDuration"),
        lastAvgHRV: hrv,
        lastAvgHR: localStorage.getItem("lastAvgHR"),
        lastStressLevel: localStorage.getItem("lastStressScore"), 
      });
    } else {
      // Hard reset to null so the backend logic correctly triggers
      setLastSession(null);
    }
  }, [isOpen]);

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    const context = {
      userProfile: { 
        username,
        age: parseInt(age), 
        height: parseInt(height),
        stressTriggers: stressTrigger, 
        goals
      },
      currentLiveData: {
        heartRate: sensorData.heartRate || 0,
        isConnected: sensorData.isConnected,
        isECGStreaming: sensorData.isECGStreaming,
      },
      lastSession: lastSession, // Explicitly null if no real data
      recentInsight: "Reviewing latest trends..."
    };

    try {
      const res = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, context }),
      });

      const data = await res.json();
      const reply = data.reply || data.error || "Sorry, I could not respond right now.";

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Error connecting to the AI server. Please check the backend." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickButtons = ["Explain my current HRV", "How is my stress trend?"];

  return (
    <>
    {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-[#9ea7db] hover:bg-[#c8c9cc] text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-3xl z-50 transition-all active:scale-95"
      >
        💬
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[520px] bg-[#0A0F2C]/50 border border-white/10 rounded-[30px] shadow-2xl flex flex-col z-50 overflow-hidden backdrop-blur-xl">
          <div className="bg-[#1E2A5E]/50 text-white p-5 flex justify-between items-center border-b border-white/10">
            <div>
              <p className="font-bold tracking-tight text-lg">StressGuard AI</p>
              <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold">Your Stress Coach</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-xl hover:opacity-60">✕</button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#0A0F2C]/50">
            {messages.length === 0 && (
              <p className="text-white/40 text-sm text-center py-8">
                Hi {username}! I'm your stress coach. Ask me anything about your HRV.
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
                style={{ whiteSpace: 'pre-wrap' }} // Preserves AI formatting
              >
                {msg.content}
              </div>
            ))}

            {isLoading && (
              <p className="text-[#6a72a6] italic pl-2 animate-pulse">Thinking...</p>
            )}
            
            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 0 && (
            <div className="p-3 border-t border-white/20 bg-[#1E2A5E]/20 flex flex-wrap gap-2">
            {quickButtons.map((btn, i) => (
              <button
                key={i}
                onClick={() => sendMessage(btn)}
                disabled={isLoading}
                className="text-[10px] font-bold uppercase px-3 py-2 bg-[#868cb5]/50 border border-white/10 rounded-full text-white/70"
              >
                {btn}
              </button>
            ))}
          </div>
         )}
        
          <div className="p-4 border-t border-white/20 bg-[#1E2A5E]/50 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="Type message..."
              className="flex-1 bg-[#0A0F2C] text-white rounded-xl px-4 py-3 outline-none border border-white/5 text-sm"
              disabled={isLoading}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={isLoading || !input.trim()}
              className="bg-[#9298b3] text-white px-5 rounded-xl font-bold text-sm"
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