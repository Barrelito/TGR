"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAffirmation, AffirmationData } from "@/lib/steps";

function getGreeting(): { text: string; emoji: string; period: "morning" | "evening" } {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return { text: "God morgon", emoji: "☀️", period: "morning" };
    } else if (hour >= 12 && hour < 17) {
        return { text: "God eftermiddag", emoji: "🌤️", period: "morning" };
    } else if (hour >= 17 && hour < 21) {
        return { text: "God kväll", emoji: "🌅", period: "evening" };
    } else {
        return { text: "God natt", emoji: "🌙", period: "evening" };
    }
}

function getStreak(): number {
    if (typeof window === "undefined") return 0;
    const log = localStorage.getItem("rikedom_reading_log");
    if (!log) return 0;

    const readings: string[] = JSON.parse(log);
    if (readings.length === 0) return 0;

    // Count consecutive days
    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    // Sort readings by date (newest first)
    const uniqueDays = [...new Set(readings.map(r => new Date(r).toDateString()))].sort((a, b) =>
        new Date(b).getTime() - new Date(a).getTime()
    );

    // Check if we read today or yesterday
    if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) {
        return 0; // Streak broken
    }

    // Count consecutive days
    let expectedDate = new Date(uniqueDays[0]);
    for (const day of uniqueDays) {
        if (new Date(day).toDateString() === expectedDate.toDateString()) {
            streak++;
            expectedDate = new Date(expectedDate.getTime() - 86400000);
        } else {
            break;
        }
    }

    return streak;
}

function logReading(): void {
    const log = localStorage.getItem("rikedom_reading_log");
    const readings: string[] = log ? JSON.parse(log) : [];
    readings.push(new Date().toISOString());
    localStorage.setItem("rikedom_reading_log", JSON.stringify(readings));
}

function hasReadToday(): boolean {
    if (typeof window === "undefined") return false;
    const log = localStorage.getItem("rikedom_reading_log");
    if (!log) return false;

    const readings: string[] = JSON.parse(log);
    const today = new Date().toDateString();

    return readings.some(r => new Date(r).toDateString() === today);
}

export default function AffirmationPage() {
    const [affirmation, setAffirmation] = useState<AffirmationData | null>(null);
    const [greeting, setGreeting] = useState(getGreeting());
    const [streak, setStreak] = useState(0);
    const [hasRead, setHasRead] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const saved = getAffirmation();
        setAffirmation(saved);
        setStreak(getStreak());
        setHasRead(hasReadToday());
        setIsLoaded(true);

        // Update greeting every minute
        const interval = setInterval(() => {
            setGreeting(getGreeting());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = () => {
        logReading();
        setHasRead(true);
        setStreak(getStreak());
    };

    if (!isLoaded) {
        return (
            <div className="affirmation-container">
                <div className="spinner" />
            </div>
        );
    }

    if (!affirmation) {
        return (
            <div className="affirmation-container">
                <div style={{ textAlign: "center" }}>
                    <h2 style={{ marginBottom: "var(--space-lg)" }}>Ingen affirmation än</h2>
                    <p style={{ marginBottom: "var(--space-xl)", color: "var(--text-secondary)" }}>
                        Du har inte skapat din personliga affirmation ännu.
                    </p>
                    <Link href="/steg/1" className="btn btn-primary btn-lg">
                        Skapa din affirmation
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="affirmation-container">
            {/* Greeting */}
            <div className="affirmation-greeting">
                <span style={{ marginRight: "var(--space-sm)" }}>{greeting.emoji}</span>
                {greeting.text}
            </div>

            {/* Affirmation Text */}
            <div className="affirmation-text">
                {affirmation.statement.split("\n").map((line, i) => (
                    <span key={i}>
                        {line}
                        {i < affirmation.statement.split("\n").length - 1 && <br />}
                    </span>
                ))}
            </div>

            {/* Actions */}
            <div className="affirmation-actions">
                {hasRead ? (
                    <div
                        className="btn btn-secondary"
                        style={{
                            cursor: "default",
                            background: "var(--accent-muted)",
                            borderColor: "var(--accent)",
                            color: "var(--accent)"
                        }}
                    >
                        ✓ Läst idag
                    </div>
                ) : (
                    <button onClick={handleMarkAsRead} className="btn btn-primary btn-lg">
                        Jag har läst ✓
                    </button>
                )}

                {/* Streak */}
                {streak > 0 && (
                    <div className="streak-badge">
                        <span>🔥</span>
                        <span>{streak} {streak === 1 ? "dag" : "dagar"} i rad</span>
                    </div>
                )}
            </div>

            {/* Settings Link */}
            <div style={{ marginTop: "var(--space-3xl)" }}>
                <Link
                    href="/installningar"
                    className="btn btn-ghost"
                    style={{ fontSize: "0.875rem" }}
                >
                    ⚙️ Inställningar
                </Link>
            </div>
        </div>
    );
}
