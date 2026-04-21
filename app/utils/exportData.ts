import { ECGDataPoint } from '../hooks/useHeartRateSensor';

export function downloadECGData(data: ECGDataPoint[]) {
    if (data.length === 0) {
      alert("No data available to export.");
      return;
    }

    // 1. Create CSV content
    const headers = "ISO_Time,Unix_Timestamp,ECG_Value_uV";
    const rows = data.map(point => {
        const isoTime = new Date(point.timestamp).toISOString();
        return `${isoTime},${point.timestamp},${point.value.toFixed(2)}`;
    });

    const csvContent = [headers, ...rows].join("\n");

    // 2. Create a download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    // 3. Trigger the download
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    link.setAttribute("href", url);
    link.setAttribute("download", `ecg_data_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}