import { useState, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioURL: string | null;
  audioBlob: Blob | null;
}

export function useRecording() {
  const { toast } = useToast();
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioURL: null,
    audioBlob: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioURL = URL.createObjectURL(audioBlob);
        
        setRecordingState(prev => ({
          ...prev,
          isRecording: false,
          audioURL,
          audioBlob
        }));

        // Stop all tracks on the stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      startTimeRef.current = Date.now();
      
      timerRef.current = setInterval(() => {
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setRecordingState(prev => ({ ...prev, duration }));
      }, 1000);
      
      setRecordingState({
        isRecording: true,
        isPaused: false,
        duration: 0,
        audioURL: null,
        audioBlob: null
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Failed to start recording. Please check your microphone permissions.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, []);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Clear the recording state
      setRecordingState({
        isRecording: false,
        isPaused: false,
        duration: 0,
        audioURL: null,
        audioBlob: null
      });
    }
  }, []);

  const resetRecording = useCallback(() => {
    if (recordingState.audioURL) {
      URL.revokeObjectURL(recordingState.audioURL);
    }
    
    setRecordingState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioURL: null,
      audioBlob: null
    });
  }, [recordingState.audioURL]);

  const transcribeAudio = useCallback(async (audioBlob: Blob, language?: string): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      // Add language parameter if specified
      if (language) {
        formData.append('language', language);
      }
      
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Transcription failed: ${errorText}`);
      }
      
      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      toast({
        title: "Transcription Error",
        description: "Failed to transcribe audio. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    recordingState,
    startRecording,
    stopRecording,
    cancelRecording,
    resetRecording,
    transcribeAudio,
    formatDuration
  };
}
