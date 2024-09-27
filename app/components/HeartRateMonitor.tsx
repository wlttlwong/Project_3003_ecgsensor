"use client"
import React from 'react';
import { useHeartRateSensor } from '../hooks/useHeartRateSensor';
import ECGChart from './ECGChart';

const HeartRateMonitor: React.FC = () => {
  const { 
    connect, 
    disconnect, 
    startECGStream, 
    stopECGStream, 
    heartRate, 
    ecgData, 
    error, 
    isConnected, 
    isECGStreaming 
  } = useHeartRateSensor();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-teal-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Heart Rate & ECG Monitor</h1>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}
          
          {!isConnected ? (
            <button 
              onClick={connect}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
            >
              Connect to Polar H10
            </button>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-700">Heart Rate:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {heartRate ? `${heartRate} BPM` : 'Waiting for data...'}
                </span>
              </div>
              
              <div className="flex space-x-4">
                <button 
                  onClick={disconnect}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Disconnect
                </button>
                
                {!isECGStreaming ? (
                  <button 
                    onClick={startECGStream}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
                  >
                    Start ECG Stream
                  </button>
                ) : (
                  <button 
                    onClick={stopECGStream}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
                  >
                    Stop ECG Stream
                  </button>
                )}
              </div>
              
              {isECGStreaming && (
                <div className="mt-8 bg-white p-4 rounded-lg shadow-inner">
                  <ECGChart ecgData={ecgData} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeartRateMonitor;
