export function checkSignalQuality(data: { value: number }[]): { isNoisy: boolean; message: string | null } {
    if (data.length < 10) return { isNoisy: false, message: null };
  
    const recentPoints = data.slice(-50);
    const values = recentPoints.map(p => p.value);
    
    // 1. Check for Saturation (Sensor maxed out or disconnected)
    // Standard Polar H10 values usually sit between -2000 and 2000 uV
    const isSaturated = values.some(v => Math.abs(v) > 3500);
  
    // 2. Check for "Flatlining" (Poor contact)
    const range = Math.max(...values) - Math.min(...values);
    const isFlat = range < 10; // Signal is too weak to be a heartbeat
  
    if (isSaturated) {
      return { isNoisy: true, message: "High interference detected. Please adjust the strap and move away from electronic devices." };
    }
    if (isFlat) {
      return { isNoisy: true, message: "Poor signal quality. Please ensure the strap is tight and the electrodes are slightly damp." };
    }
  
    return { isNoisy: false, message: null };
  }