"use client";

import React, { useState, useEffect } from 'react';
import { useHeartRateSensor } from '../hooks/useHeartRateSensor';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get real sensor data from your hook
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
        stressLevel: localStorage.getItem("lastStressLevel"),
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
        age: 25, 
        stressTriggers: ["work deadlines"], 
        goals: "Release stress" 
      },
      currentLiveData: {
        heartRate: sensorData.heartRate || 78,           // Real current HR from wearable
        isConnected: sensorData.isConnected,
        isECGStreaming: sensorData.isECGStreaming,
        // You can add ecgData.length if useful
      },
      lastSession: lastSession || {
        avgHR: 78,
        avgHRV: 50,
        stressLevel: "moderate",
        durationMinutes: 15
      },
      recentInsight: "Your average HRV has increased 12% this week. Keep up the good work!"
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
    "Why is my stress high right now?",
    "What breathing exercise should I do?",
    "How is my stress trend this week?"
  ];

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-3xl z-50 transition-all active:scale-95"
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[520px] bg-white border border-gray-300 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center rounded-t-2xl">
            <div>
              <p className="font-bold">StressGuard AI</p>
              <p className="text-xs opacity-90">Your ECG-based Stress Coach</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-2xl leading-none hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
            {messages.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                Hi! Ask me anything about your HRV, current stress, or get personalized advice.
              </p>
            )}

            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`max-w-[85%] p-3.5 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white ml-auto' 
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}
              >
                {msg.content}
              </div>
            ))}

            {isLoading && (
              <p className="text-blue-600 italic pl-2">StressGuard is thinking...</p>
            )}
          </div>

          {/* Quick Reply Buttons */}
          <div className="p-3 border-t bg-white flex flex-wrap gap-2">
            {quickButtons.map((btn, i) => (
              <button
                key={i}
                onClick={() => sendMessage(btn)}
                disabled={isLoading}
                className="text-xs px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
              >
                {btn}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="Ask about your HRV or stress..."
              className="flex-1 border border-gray-300 rounded-full px-5 py-3 focus:outline-none focus:border-blue-500 text-gray-800"
              disabled={isLoading}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 text-white px-6 rounded-full disabled:opacity-50 hover:bg-blue-700 transition"
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