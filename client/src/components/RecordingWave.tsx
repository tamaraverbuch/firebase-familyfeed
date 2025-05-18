import React from "react";

interface RecordingWaveProps {
  duration: number;
  formatDuration?: (seconds: number) => string;
}

export default function RecordingWave({ 
  duration, 
  formatDuration = (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`
}: RecordingWaveProps) {
  return (
    <div className="recording-status mb-4">
      <div className="recording-wave">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <p className="text-accent text-sm mt-2 text-center">
        Recording... <span id="recordingTimer">{formatDuration(duration)}</span>
      </p>
    </div>
  );
}
