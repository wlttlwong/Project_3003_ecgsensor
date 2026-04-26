import { useState, useCallback, useEffect, useRef } from 'react';
import { ECGFilter } from '../utils/ecgFilters';
import { calculateRMSSD } from '../utils/ecgAnalysis';

const PMD_SERVICE_UUID = "fb005c80-02e7-f387-1cad-8acd2d8df0c8";
const PMD_CONTROL_CHARACTERISTIC_UUID = "fb005c81-02e7-f387-1cad-8acd2d8df0c8";
const PMD_DATA_CHARACTERISTIC_UUID = "fb005c82-02e7-f387-1cad-8acd2d8df0c8";
const POLAR_HR_SERVICE_UUID = 0x180d;
const POLAR_HR_CHARACTERISTIC_UUID = 0x2a37;

export interface ECGDataPoint {
  timestamp: number;
  value: number;
}

interface HeartRateSensorHook {
  connect: () => Promise<void>;
  disconnect: () => void;
  startECGStream: () => Promise<void>;
  stopECGStream: () => Promise<void>;
  togglePaused: () => void;
  isPaused: boolean;
  heartRate: number | null;
  ecgData: ECGDataPoint[];
  rmssd: number;
  rrIntervals: number[]; // Added to fix the TypeScript error in page.tsx
  sessionSeconds: number;
  error: string | null;
  qualityError: string | null; 
  isConnected: boolean;
  isECGStreaming: boolean;
}

export function useHeartRateSensor(): HeartRateSensorHook {
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [ecgData, setECGData] = useState<ECGDataPoint[]>([]);
  const [rmssd, setRmssd] = useState<number>(0);
  const [rrIntervals, setRrIntervals] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [qualityError, setQualityError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isECGStreaming, setIsECGStreaming] = useState<boolean>(false);
  const [pmdControlCharacteristic, setPmdControlCharacteristic] = useState<BluetoothRemoteGATTCharacteristic | null>(null);
  const [pmdDataCharacteristic, setPmdDataCharacteristic] = useState<BluetoothRemoteGATTCharacteristic | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);

  const simulationRef = useRef<NodeJS.Timeout | null>(null);
  const simulationCounterRef = useRef<number>(0);
  const filterRef = useRef(new ECGFilter());
  const lastPeakTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isPausedRef = useRef<boolean>(false);

  const togglePaused = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const checkSignalQuality = useCallback((samples: number[]) => {
    if (samples.length === 0) return;
    
    // Spikes > 3500uV usually indicate static from clothing or movement
    const hasSpikes = samples.some(v => Math.abs(v) > 3500);
    // Range < 15uV usually indicates the sensor isn't touching skin
    const range = Math.max(...samples) - Math.min(...samples);
    const isFlat = range < 15 && samples.length > 10;

    if (hasSpikes) {
      setQualityError("Noise detected. Please adjust the strap or check for clothing interference.");
    } else if (isFlat) {
      setQualityError("Poor signal. Ensure the strap is tight and electrodes are slightly damp.");
    } else {
      setQualityError(null);
    }
  }, []);

  const analyzeSample = useCallback((value: number, timestamp: number) => {
    const threshold = 600; 
    // Basic peak detection (R-wave) with a 400ms refractory period
    if (value > threshold && (timestamp - lastPeakTimeRef.current) > 400) {
      if (lastPeakTimeRef.current !== 0) {
        const rr = timestamp - lastPeakTimeRef.current;
        setRrIntervals(prev => {
          const updated = [...prev, rr].slice(-30);
          setRmssd(calculateRMSSD(updated));
          return updated;
        });
      }
      lastPeakTimeRef.current = timestamp;
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      if (!navigator.bluetooth) throw new Error('Web Bluetooth API not supported.');
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [POLAR_HR_SERVICE_UUID] }],
        optionalServices: [PMD_SERVICE_UUID]
      });
      setDevice(device);
      device.addEventListener('gattserverdisconnected', () => {
        setIsConnected(false);
        setIsECGStreaming(false);
      });
      const server = await device.gatt?.connect();
      const hrService = await server?.getPrimaryService(POLAR_HR_SERVICE_UUID);
      const hrChar = await hrService?.getCharacteristic(POLAR_HR_CHARACTERISTIC_UUID);
      await hrChar?.startNotifications();
      hrChar?.addEventListener('characteristicvaluechanged', (e) => {
        const val = (e.target as BluetoothRemoteGATTCharacteristic).value;
        if (val) setHeartRate(parseHeartRate(val));
      });
      const pmdService = await server?.getPrimaryService(PMD_SERVICE_UUID);
      const pmdControl = pmdService
        ? await pmdService.getCharacteristic(PMD_CONTROL_CHARACTERISTIC_UUID)
        : null;
      const pmdData = pmdService
        ? await pmdService.getCharacteristic(PMD_DATA_CHARACTERISTIC_UUID)
        : null;
      setPmdControlCharacteristic(pmdControl);
      setPmdDataCharacteristic(pmdData);
      setIsConnected(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    }
  }, []);

  const disconnect = useCallback(() => {
    if (device?.gatt?.connected) device.gatt.disconnect();
    if (simulationRef.current) {
      clearInterval(simulationRef.current);
      simulationRef.current = null;
    }
    setDevice(null);
    setIsConnected(false);
    setIsECGStreaming(false);
    setIsPaused(false);
    setECGData([]);
    setRrIntervals([]);
    setRmssd(0);
    setQualityError(null);
    filterRef.current.reset();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [device]);

  const startECGStream = useCallback(async () => {
    setIsPaused(false);
    setSessionSeconds(0);
    setECGData([]);
    setRrIntervals([]);
    setRmssd(0);
    setQualityError(null);
    lastPeakTimeRef.current = 0;
    filterRef.current.reset();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (!isPausedRef.current) setSessionSeconds(prev => prev + 1);
    }, 1000);

    if (!pmdControlCharacteristic || !pmdDataCharacteristic) {
      setIsECGStreaming(true);
      if (simulationRef.current) clearInterval(simulationRef.current);
      simulationRef.current = setInterval(() => {
        if (isPausedRef.current) return;
        const currentTime = Date.now();
        const raw = generateSimulatedECG(simulationCounterRef.current);
        const filtered = filterRef.current.process(raw);
        analyzeSample(filtered, currentTime);
        checkSignalQuality([filtered]);
        setECGData(prev => [...prev, { timestamp: currentTime, value: filtered }].slice(-1000));
        simulationCounterRef.current++;
      }, 1000 / 130);
      return;
    }

    try {
      await pmdControlCharacteristic.writeValue(new Uint8Array([0x01, 0x02]));
      await pmdControlCharacteristic.writeValue(new Uint8Array([0x01, 0x00]));
      await pmdControlCharacteristic.writeValue(new Uint8Array([0x02, 0x00, 0x00, 0x01, 0x82, 0x00, 0x01, 0x01, 0x0E, 0x00]));
      await pmdDataCharacteristic.startNotifications();
      pmdDataCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
        if (isPausedRef.current) return;
        const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
        if (value) {
          const { samples } = parseECGData(value);
          const currentTime = Date.now();
          const sampleInterval = 1000 / 130;
          
          checkSignalQuality(samples);

          const filteredBatch = samples.map((sample, index) => {
            const filtered = filterRef.current.process(sample);
            const ts = currentTime + index * sampleInterval;
            analyzeSample(filtered, ts);
            return { timestamp: ts, value: filtered };
          });
          setECGData(prev => [...prev, ...filteredBatch].slice(-1000));
        }
      });
      setIsECGStreaming(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Stream start failed');
    }
  }, [pmdControlCharacteristic, pmdDataCharacteristic, analyzeSample, checkSignalQuality]);

  const stopECGStream = useCallback(async () => {
    if (simulationRef.current) {
      clearInterval(simulationRef.current);
      simulationRef.current = null;
    }
    if (pmdDataCharacteristic) await pmdDataCharacteristic.stopNotifications();
    setIsECGStreaming(false);
    setIsPaused(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [pmdDataCharacteristic]);

  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  return {
    connect, disconnect, startECGStream, stopECGStream, togglePaused,
    isPaused, heartRate, ecgData, rmssd, rrIntervals, sessionSeconds, 
    error, qualityError, isConnected, isECGStreaming
  };
}

function parseHeartRate(value: DataView): number {
  const flags = value.getUint8(0);
  return (flags & 0x01) ? value.getUint16(1, true) : value.getUint8(1);
}

function parseECGData(value: DataView): { samples: number[] } {
  const samples: number[] = [];
  for (let i = 0; i < 73; i++) {
    const startByte = 10 + i * 3;
    let sample = value.getUint8(startByte) | (value.getUint8(startByte + 1) << 8) | (value.getUint8(startByte + 2) << 16);
    if (sample & 0x800000) sample -= 0x1000000;
    samples.push(sample);
  }
  return { samples };
}

function generateSimulatedECG(index: number): number {
  const phase = index % 130;
  let val = (Math.random() - 0.5) * 50; 
  if (phase > 60 && phase < 65) val += 800;
  else if (phase > 80 && phase < 95) val += 150;
  return val;
}
