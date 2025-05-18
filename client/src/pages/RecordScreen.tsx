import React, { useState } from "react";
import { useRecording } from "@/hooks/useRecording";
import { Button } from "@/components/ui/button";
import { Mic, X, StopCircle, Delete, Play, Pause, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RecordingWave from "@/components/RecordingWave";
import PostEditor from "@/components/PostEditor";
import { useLocation } from "wouter";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RecordScreen() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const {
    recordingState,
    startRecording,
    stopRecording,
    cancelRecording,
    resetRecording,
    transcribeAudio,
    formatDuration
  } = useRecording();
  
  const [transcribedText, setTranscribedText] = useState("");
  const [transcribing, setTranscribing] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [audioElem, setAudioElem] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  
  const handleStartRecording = () => {
    startRecording();
  };
  
  const handleStopRecording = async () => {
    stopRecording();
    
    // Create audio element for playback
    if (recordingState.audioURL) {
      const audio = new Audio(recordingState.audioURL);
      setAudioElem(audio);
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
      });
    }
  };
  
  const handleCancelRecording = () => {
    cancelRecording();
  };
  
  const handlePlayPause = () => {
    if (!audioElem) return;
    
    if (isPlaying) {
      audioElem.pause();
    } else {
      audioElem.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  const handleTranscribe = async () => {
    if (!recordingState.audioBlob) {
      toast({
        title: "Error",
        description: "No recording available to transcribe",
        variant: "destructive"
      });
      return;
    }
    
    setTranscribing(true);
    
    try {
      // Pass the selected language for transcription
      const text = await transcribeAudio(recordingState.audioBlob, selectedLanguage);
      if (text) {
        setTranscribedText(text);
        setShowEditor(true);
      }
    } catch (error) {
      toast({
        title: "Transcription Failed",
        description: "Could not transcribe your recording. Please try again.",
        variant: "destructive"
      });
    } finally {
      setTranscribing(false);
    }
  };
  
  const handleReset = () => {
    resetRecording();
    setTranscribedText("");
    setShowEditor(false);
    if (audioElem) {
      audioElem.pause();
      setIsPlaying(false);
      setAudioElem(null);
    }
  };
  
  return (
    <div className="flex-1 flex flex-col">
      <header className="px-4 py-3 border-b border-neutral-200 sticky top-0 bg-white z-10">
        <div className="flex justify-between items-center">
          <h1 className="font-heading font-bold text-2xl text-primary">Record</h1>
          <Button
            variant="ghost"
            size="icon"
            className="text-neutral-500 hover:text-primary"
            onClick={() => navigate("/")}
          >
            <X size={20} />
          </Button>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col p-4">
        {showEditor ? (
          <PostEditor 
            initialContent={transcribedText} 
            isVoiceTranscription={true}
            onCancel={handleReset}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <img 
              src="https://pixabay.com/get/gbb7beb35f504ebf2a9157d34b8564532da8f6ff06fc3925f7060a184c0f52ef73bf5a1a9fc7b6f4be1c78fa9abc10fcb6d462fbdd0b652285fd0c8e9fdb8bbd5_1280.jpg" 
              alt="Voice recording illustration" 
              className="w-48 h-48 object-cover rounded-lg mb-6" 
            />
            
            <h2 className="font-heading font-bold text-xl mb-2">Share your voice</h2>
            <p className="text-neutral-500 mb-4 max-w-xs">
              {!recordingState.audioBlob 
                ? "Tap the button below to start recording. Your voice will be transcribed automatically."
                : "Your recording is ready! You can play it back, re-record, or transcribe it to text."}
            </p>
            
            <div className="mb-6 flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <Globe size={16} className="text-neutral-500" />
                <span className="text-sm text-neutral-500">Language:</span>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="he">Hebrew</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {recordingState.isRecording && (
              <RecordingWave 
                duration={recordingState.duration}
                formatDuration={formatDuration}
              />
            )}
            
            {!recordingState.isRecording && !recordingState.audioBlob && (
              <div className="record-controls">
                <Button
                  onClick={handleStartRecording}
                  className="bg-accent hover:bg-accent-dark text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg"
                >
                  <Mic size={24} />
                </Button>
              </div>
            )}
            
            {recordingState.isRecording && (
              <div className="record-controls flex space-x-4">
                <Button
                  onClick={handleStopRecording}
                  variant="outline"
                  className="bg-white border border-neutral-300 text-neutral-700 rounded-full px-4 py-2 flex items-center"
                >
                  <StopCircle className="mr-1" size={18} />
                  <span>Stop</span>
                </Button>
                
                <Button
                  onClick={handleCancelRecording}
                  variant="outline"
                  className="bg-white border border-neutral-300 text-neutral-700 rounded-full px-4 py-2 flex items-center"
                >
                  <Delete className="mr-1" size={18} />
                  <span>Cancel</span>
                </Button>
              </div>
            )}
            
            {!recordingState.isRecording && recordingState.audioBlob && (
              <div className="record-controls flex flex-col items-center">
                <div className="flex items-center space-x-2 mb-6">
                  <Button
                    onClick={handlePlayPause}
                    variant="outline"
                    className="bg-white border border-neutral-300 text-neutral-700 rounded-full px-4 py-2 flex items-center"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="mr-1" size={18} />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="mr-1" size={18} />
                        <span>Play</span>
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="bg-white border border-neutral-300 text-neutral-700 rounded-full px-4 py-2 flex items-center"
                  >
                    <Delete className="mr-1" size={18} />
                    <span>Discard</span>
                  </Button>
                </div>
                
                <Button
                  onClick={handleTranscribe}
                  className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-2 rounded-lg"
                  disabled={transcribing}
                >
                  {transcribing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white border-r-2 border-b-2 border-transparent mr-2"></div>
                      <span>Transcribing...</span>
                    </div>
                  ) : (
                    <span>Transcribe & Continue</span>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
