"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    getAffirmation,
    AffirmationData,
    logReading,
    getStreak,
    hasReadToday
} from "@/lib/steps";

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

export default function AffirmationPage() {
    const [affirmation, setAffirmation] = useState<AffirmationData | null>(null);
    const [greeting, setGreeting] = useState(getGreeting());
    const [streak, setStreak] = useState(0);
    const [hasRead, setHasRead] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        async function loadData() {
            const [saved, currentStreak, readToday] = await Promise.all([
                getAffirmation(),
                getStreak(),
                hasReadToday()
            ]);
            setAffirmation(saved);
            setStreak(currentStreak);
            setHasRead(readToday);
            setIsLoaded(true);
        }

        loadData();

        // Update greeting every minute
        const interval = setInterval(() => {
            setGreeting(getGreeting());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async () => {
        await logReading(affirmation?.id);
        setHasRead(true);
        const newStreak = await getStreak();
        setStreak(newStreak);
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
