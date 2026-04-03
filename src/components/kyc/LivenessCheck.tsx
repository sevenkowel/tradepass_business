"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LivenessCheckProps {
  onComplete: (success: boolean, videoData?: string) => void;
  onSkip?: () => void;
  maxAttempts?: number;
}

type LivenessState = "idle" | "countdown" | "recording" | "processing" | "success" | "failed";
type LivenessAction = "blink" | "turn_left" | "turn_right";

const actions: LivenessAction[] = ["blink", "turn_left", "turn_right"];

const actionLabels: Record<LivenessAction, { title: string; description: string }> = {
  blink: {
    title: "Blink Your Eyes",
    description: "Slowly blink your eyes 2 times",
  },
  turn_left: {
    title: "Turn Left",
    description: "Turn your head to the left",
  },
  turn_right: {
    title: "Turn Right",
    description: "Turn your head to the right",
  },
};

export function LivenessCheck({ onComplete, onSkip, maxAttempts = 3 }: LivenessCheckProps) {
  const [state, setState] = useState<LivenessState>("idle");
  const [currentAction, setCurrentAction] = useState<LivenessAction>("blink");
  const [countdown, setCountdown] = useState(3);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: false,
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Unable to access camera. Please ensure you have granted camera permissions.");
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Start recording
  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    
    recordedChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: "video/webm",
    });
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };
    
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
  }, []);

  // Stop recording and get video data
  const stopRecording = useCallback(async (): Promise<string> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve("");
        return;
      }
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1];
          resolve(base64);
        };
        reader.readAsDataURL(blob);
      };
      
      mediaRecorderRef.current.stop();
    });
  }, []);

  // Start liveness check
  const handleStart = () => {
    setState("countdown");
    setCountdown(3);
    setError(null);
  };

  // Countdown effect
  useEffect(() => {
    if (state === "countdown" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (state === "countdown" && countdown === 0) {
      setState("recording");
      startRecording();
      
      // Auto stop after 5 seconds
      setTimeout(() => {
        handleStop();
      }, 5000);
    }
  }, [state, countdown, startRecording]);

  // Stop recording and process
  const handleStop = async () => {
    setState("processing");
    
    try {
      const videoData = await stopRecording();
      
      // Call API
      const response = await fetch("/api/kyc/liveness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoBase64: videoData,
          requiredActions: [currentAction],
        }),
      });
      
      if (!response.ok) {
        throw new Error("Liveness check failed");
      }
      
      const data = await response.json();
      
      if (data.data.passed) {
        setState("success");
        setTimeout(() => {
          onComplete(true, videoData);
        }, 1500);
      } else {
        handleFailure(data.data.error || "Verification failed");
      }
    } catch (err) {
      handleFailure("Network error. Please try again.");
    }
  };

  const handleFailure = (errorMsg: string) => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    if (newAttempts >= maxAttempts) {
      setError(`Maximum attempts (${maxAttempts}) reached. ${errorMsg}`);
      setState("failed");
    } else {
      setError(`${errorMsg} (${newAttempts}/${maxAttempts} attempts)`);
      setState("failed");
    }
  };

  const handleRetry = () => {
    setState("idle");
    setError(null);
    setCurrentAction(actions[Math.floor(Math.random() * actions.length)]);
  };

  // Initialize camera on mount
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  return (
    <div className="space-y-6">
      {/* Camera Preview */}
      <Card className="overflow-hidden">
        <CardContent className="p-0 relative">
          <div className="relative aspect-[4/3] bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Face Oval Guide */}
              <div className={cn(
                "w-48 h-64 border-2 border-dashed rounded-full transition-colors",
                state === "recording" ? "border-green-400 animate-pulse" : "border-white/50"
              )} />
            </div>
            
            {/* Countdown Overlay */}
            <AnimatePresence>
              {state === "countdown" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.5 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/50"
                >
                  <span className="text-6xl font-bold text-white">{countdown}</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Processing Overlay */}
            {state === "processing" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                <Loader2 className="w-12 h-12 text-white animate-spin mb-4" />
                <span className="text-white font-medium">Verifying...</span>
              </div>
            )}
            
            {/* Success Overlay */}
            <AnimatePresence>
              {state === "success" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-green-500/80"
                >
                  <CheckCircle2 className="w-16 h-16 text-white mb-4" />
                  <span className="text-white font-medium text-lg">Verification Successful!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center space-y-4"
          >
            <div className="p-4 rounded-xl bg-[rgba(var(--tp-accent-rgb),0.1)]">
              <h3 className="font-semibold text-[rgb(var(--tp-fg-rgb))] mb-2">
                {actionLabels[currentAction].title}
              </h3>
              <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.7)]">
                {actionLabels[currentAction].description}
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={handleStart}
                className="flex-1 h-12 bg-[rgb(var(--tp-accent-rgb))] hover:bg-[rgba(var(--tp-accent-rgb),0.9)] text-white"
              >
                <Camera className="w-4 h-4 mr-2" />
                Start Verification
              </Button>
              {onSkip && (
                <Button
                  variant="outline"
                  onClick={onSkip}
                  className="h-12"
                >
                  Skip
                </Button>
              )}
            </div>
            
            <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)]">
              Position your face within the oval frame
            </p>
          </motion.div>
        )}
        
        {state === "recording" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-500">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Recording...
            </div>
            <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.6)] mt-2">
              {actionLabels[currentAction].description}
            </p>
          </motion.div>
        )}
        
        {state === "failed" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-4"
          >
            <div className="p-4 rounded-xl bg-red-500/10">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
            
            {attempts < maxAttempts && (
              <Button
                onClick={handleRetry}
                variant="outline"
                className="h-12"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Attempts Indicator */}
      <div className="flex justify-center gap-1">
        {Array.from({ length: maxAttempts }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              i < attempts ? "bg-red-500" : "bg-[rgba(var(--tp-fg-rgb),0.2)]"
            )}
          />
        ))}
      </div>
    </div>
  );
}
