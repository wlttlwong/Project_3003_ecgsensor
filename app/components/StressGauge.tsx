// components/StressGauge.tsx
export const StressGauge = ({ score }: { score: number }) => {
    const getStatus = (s: number) => {
      if (!s || s === 0) return { label: 'N/A', color: 'text-white/40', stroke: 'rgba(255,255,255,0.1)' };
      if (s < 40) return { label: 'Low', color: 'text-green-400', stroke: '#4ade80' };
      if (s < 70) return { label: 'Moderate', color: 'text-yellow-400', stroke: '#facc15' };
      return { label: 'High', color: 'text-red-500', stroke: '#ef4444' };
    };
  
    const status = getStatus(score);
    const radius = 80;
    const circumference = Math.PI * radius; 
    const dashOffset = circumference - (Math.min(score, 100) / 100) * circumference;
  
    return (
      <div className="flex flex-col items-center justify-center w-full py-4">
        <div className="relative w-72 h-40 flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 200 120">
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke={status.stroke}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
  
          <div className="absolute top-12 flex flex-col items-center">
            <span className="text-7xl font-bold tracking-tighter">{score || 0}</span>
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">Stress Level</p>
            <span className={`text-2xl font-bold mt-1 ${status.color}`}>
              {status.label}
            </span>
          </div>
        </div>
      </div>
    );
  };