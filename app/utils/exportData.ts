import { ECGDataPoint } from '../hooks/useHeartRateSensor';

// Interface to match the Python backend's expected JSON structure
interface SessionMetrics {
  activity_type: string;
  duration: number;
  hr_avg: number;
  hr_max: number;
  avg_hrv: number;
  quality_score?: number;
  quality_status?: string;
}

export async function downloadAndSaveSession(
  data: ECGDataPoint[], 
  metrics: SessionMetrics
) {
  if (data.length === 0) {
    alert("No data available to export.");
    return;
  }

  // --- 1. LOCAL CSV DOWNLOAD (Existing Logic) ---
  const headers = "ISO_Time,Unix_Timestamp,ECG_Value_uV";
  const rows = data.map(point => {
    const isoTime = new Date(point.timestamp).toISOString();
    return `${isoTime},${point.timestamp},${point.value.toFixed(2)}`;
  });

  const csvContent = [headers, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  const fileTimestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  link.setAttribute("href", url);
  link.setAttribute("download", `ecg_session_${fileTimestamp}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // --- 2. BACKEND SYNC (New Logic for Activity Log) ---
  try {
    const response = await fetch('http://localhost:8000/api/activities/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...metrics,
        timestamp: new Date().toISOString() // Let the backend know exactly when this finished
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    console.log("Activity successfully logged to Python backend.");
  } catch (error) {
    console.error("Failed to sync with backend database:", error);
    // We don't alert here to avoid interrupting the user experience, 
    // since the CSV was already downloaded successfully.
  }
}