// app/components/Chatbot.tsx
'use client';

import React, { useState } from 'react';
import { useHeartRateSensor } from '../hooks/useHeartRateSensor';

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string} []>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Get live data from device
    const sensorData = useHeartRateSensor();

    const sendMessage = async (userMessage: string) => {
        if (!userMessage.trim()) return;

        setMessages(prev => [...prev, { role: 'user', content: userMessage}]);
        setInput('');
        setIsLoading(true);

        // Prepare real context from app (update with session data)
        const context = {
            userProfile: { age: 25, stressTriggers: ["work deadlines"], goals: "Release stress"},
            currentSession: {
                avgHR: sensorData.hr || 78,
                avgHRV: sensorData.hrv || 50,
                stressLevel: sensorData.stressLevel || "moderate",
                durationMinutes: 15
            },
            recentSessions: [], // You can add recent session data here
            weeklyInsight: "Your average HRV has increased 12% this week"
        };

        try {
            const res = await fetch('http://127.0.0.1:8000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage, context })
            });

            const data = await res.json();
            const reply = data.reply || data.error || "Sorry, I could not respond right now.";

            setMessages(prev => [...prev, { role: 'assistant', content: reply}]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Error connecting to server."}]);
        } finally {
            setIsLoading(false);
        }
    };

    const quickButtons = [
        "Explain my current HRV",
        "Why is my stress high?",
        "What should I do now?"
    ];

    return (
        <>
        {/* Floating Button - visible on all screens */}
        <button
            onClick={() => setIsOpen(!isOpen)}
            className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-3xl z-50 transition-all"
        >
            💬
        </button>
        
        {/* Chat Window */}
        {isOpen && (
            <div className="fixed bottom-24 right-6 w-96 h-[520px] bg-white border-gray-300 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
                <div className="bg-blue-600 text-white p-4 flex justify-between rounded-t-2xl">
                    <div>
                        <p className="font-bold">StressGuard</p>
                        <p className="text-xs">Stress AI Coach</p>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-2xl leading-none">x</button>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
                    {messages.length === 0 && (
                        <p className="text-gray-500 text-center py-8">Hi! Ask me about your stress, HRV or get instant help.</p>
                    )}
                    {messages.map((msg, index) => (
                        <div key={index} className={`max-w-[85%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white ml-auto' : 'bg-white border'}`}>
                            {msg.content}
                        </div>
                    ))}
                    {isLoading && <p className="text-blue-600"> Stress Assistant is thinking...</p>}
                </div>

                {/* Quick Buttons */}
                <div className="p-3 border-t bg-white flex flex-wrap gap-2">
                    {quickButtons.map((btn, i ) => (
                        <button
                            key={i}
                            onClick={() => sendMessage(btn)}
                            disabled={isLoading}
                            className="text-xs px-4 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
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
                        placeholder='Ask me about your stress...'
                        className="flex-1 border rounded-full px-4 py-3 focus:outline-none focus:border-blue-500"
                        disabled={isLoading}
                    />
                    <button
                        onClick={() => sendMessage(input)}
                        disabled={isLoading || !input.trim()}
                        className="bg-blue-600 text-white px-6 rounded-full disabled:opacity-50"
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


