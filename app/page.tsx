"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

export default function SplashPage() {
    const router = useRouter();

    return (
        <div className='min-h-screen bg-[#0A0F2C] text-white flex flex-col items-center justify-center p-6 animate-in fade-in duration-1000'>
          <h1 className='text-6xl md:text-8xl font-black tracking-tighter text-center mb-12 bg-gradient-to-b from-white to-white/20 bg-clip-text text-transparent'>
            Stress Detection<br/>Application
          </h1>
          <button
            onClick={() => router.push('/login')} // Redirects to the team's login
            className='px-12 py-5 bg-blue-600 hover:bg-blue-500 rounded-full text-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-blue-900/40'
          >
            Get Started
          </button>
        </div>
    );
}
