import { useState, useEffect, useCallback, useRef } from "react";

interface UseTimerOptions {
  initialTime?: number; // in seconds
  countdown?: boolean; // countdown vs count up
  onComplete?: () => void;
}

export function useTimer({ initialTime = 300, countdown = true, onComplete }: UseTimerOptions = {}) {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start timer
  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  // Pause timer
  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  // Reset timer
  const reset = useCallback(() => {
    setIsRunning(false);
    setTime(initialTime);
  }, [initialTime]);

  // Set custom time
  const setCustomTime = useCallback((newTime: number) => {
    setTime(newTime);
  }, []);

  // Timer tick effect
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => {
          const newTime = countdown ? prevTime - 1 : prevTime + 1;

          // Check if countdown reached zero
          if (countdown && newTime <= 0) {
            setIsRunning(false);
            if (onComplete) {
              onComplete();
            }
            return 0;
          }

          return newTime;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, countdown, onComplete]);

  return {
    time,
    isRunning,
    start,
    pause,
    reset,
    setCustomTime,
  };
}
