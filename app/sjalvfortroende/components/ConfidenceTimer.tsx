"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface ConfidenceTimerProps {
    title: string;
    durationMinutes: number;
    icon: string;
    isCompleted: boolean;
    onComplete: () => void;
}

export default function ConfidenceTimer({
    title,
    durationMinutes,
    icon,
    isCompleted,
    onComplete
}: ConfidenceTimerProps) {
    const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const totalSeconds = durationMinutes * 60;
    const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

    const handleComplete = useCallback(() => {
        setIsRunning(false);
        onComplete();
    }, [onComplete]);

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, timeLeft, handleComplete]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleStart = () => {
        setIsRunning(true);
        setHasStarted(true);
    };

    const handlePause = () => {
        setIsRunning(false);
    };

    const handleReset = () => {
        setIsRunning(false);
        setHasStarted(false);
        setTimeLeft(durationMinutes * 60);
    };

    if (isCompleted) {
        return (
            <div className="timer-card timer-completed">
                <div className="timer-header">
                    <span className="timer-icon">{icon}</span>
                    <span className="timer-title">{title}</span>
                </div>
                <div className="timer-status">
                    <span className="timer-check">✓</span>
                    <span>Genomförd idag</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`timer-card ${isRunning ? "timer-active" : ""}`}>
            <div className="timer-header">
                <span className="timer-icon">{icon}</span>
                <span className="timer-title">{title}</span>
                <span className="timer-duration">{durationMinutes} min</span>
            </div>

            {hasStarted ? (
                <>
                    {/* Progress ring */}
                    <div className="timer-display">
                        <svg className="timer-ring" viewBox="0 0 100 100">
                            <circle
                                className="timer-ring-bg"
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                strokeWidth="6"
                            />
                            <circle
                                className="timer-ring-progress"
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                strokeWidth="6"
                                strokeDasharray={`${progress * 2.827} 282.7`}
                                transform="rotate(-90 50 50)"
                            />
                        </svg>
                        <div className="timer-time">{formatTime(timeLeft)}</div>
                    </div>

                    {/* Controls */}
                    <div className="timer-controls">
                        {isRunning ? (
                            <button onClick={handlePause} className="btn btn-secondary">
                                ⏸️ Paus
                            </button>
                        ) : (
                            <button onClick={handleStart} className="btn btn-primary">
                                ▶️ Fortsätt
                            </button>
                        )}
                        <button onClick={handleReset} className="btn btn-ghost">
                            🔄 Börja om
                        </button>
                    </div>
                </>
            ) : (
                <button onClick={handleStart} className="btn btn-primary btn-full">
                    ▶️ Starta {title.toLowerCase()}
                </button>
            )}
        </div>
    );
}
