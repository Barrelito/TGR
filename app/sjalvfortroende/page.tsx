"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    getPledge,
    PledgeData,
    PRINCIPLES,
    logConfidenceActivity,
    getConfidenceStreak,
    hasReadConfidenceToday,
    hasCompletedTimerToday
} from "@/lib/confidence";
import ConfidenceTimer from "./components/ConfidenceTimer";

function getGreeting(): { text: string; emoji: string } {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return { text: "God morgon", emoji: "☀️" };
    } else if (hour >= 12 && hour < 17) {
        return { text: "God eftermiddag", emoji: "🌤️" };
    } else if (hour >= 17 && hour < 21) {
        return { text: "God kväll", emoji: "🌅" };
    } else {
        return { text: "God natt", emoji: "🌙" };
    }
}

export default function SjalvfortroendePage() {
    const [pledge, setPledge] = useState<PledgeData | null>(null);
    const [greeting, setGreeting] = useState(getGreeting());
    const [streak, setStreak] = useState(0);
    const [hasRead, setHasRead] = useState(false);
    const [hasVisualized, setHasVisualized] = useState(false);
    const [hasMentalTrained, setHasMentalTrained] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [expandedPrinciple, setExpandedPrinciple] = useState<number | null>(null);

    useEffect(() => {
        async function loadData() {
            const [
                savedPledge,
                currentStreak,
                readToday,
                visualizedToday,
                mentalTrainedToday
            ] = await Promise.all([
                getPledge(),
                getConfidenceStreak(),
                hasReadConfidenceToday(),
                hasCompletedTimerToday('visualization'),
                hasCompletedTimerToday('mental_training')
            ]);
            setPledge(savedPledge);
            setStreak(currentStreak);
            setHasRead(readToday);
            setHasVisualized(visualizedToday);
            setHasMentalTrained(mentalTrainedToday);
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
        await logConfidenceActivity('reading');
        setHasRead(true);
        const newStreak = await getConfidenceStreak();
        setStreak(newStreak);
    };

    const handleVisualizationComplete = async () => {
        await logConfidenceActivity('visualization', 30);
        setHasVisualized(true);
    };

    const handleMentalTrainingComplete = async () => {
        await logConfidenceActivity('mental_training', 10);
        setHasMentalTrained(true);
    };

    if (!isLoaded) {
        return (
            <div className="affirmation-container">
                <div className="spinner" />
            </div>
        );
    }

    if (!pledge) {
        return (
            <div className="affirmation-container">
                <div style={{ textAlign: "center" }}>
                    <h2 style={{ marginBottom: "var(--space-lg)" }}>
                        💪 Min Plan för Självförtroende
                    </h2>
                    <p style={{ marginBottom: "var(--space-xl)", color: "var(--text-secondary)" }}>
                        Du har inte skapat din personliga självförtroendeplan ännu.
                    </p>
                    <Link href="/sjalvfortroende/steg/1" className="btn btn-primary btn-lg">
                        Börja din resa
                    </Link>
                    <div style={{ marginTop: "var(--space-xl)" }}>
                        <Link href="/" className="btn btn-ghost">
                            ← Tillbaka till start
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Get today's progress
    const dailyProgress = [hasRead, hasVisualized, hasMentalTrained].filter(Boolean).length;
    const totalDailyGoals = 3;

    return (
        <div className="page">
            <div className="container">
                {/* Header */}
                <header style={{ textAlign: "center", paddingTop: "var(--space-xl)" }}>
                    <div className="affirmation-greeting" style={{ marginBottom: "var(--space-md)" }}>
                        <span style={{ marginRight: "var(--space-sm)" }}>{greeting.emoji}</span>
                        {greeting.text}
                    </div>
                    <h1 style={{ marginBottom: "var(--space-md)" }}>
                        💪 Självförtroende
                    </h1>

                    {/* Daily progress */}
                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "var(--space-md)",
                        marginBottom: "var(--space-lg)"
                    }}>
                        {streak > 0 && (
                            <div className="streak-badge">
                                <span>🔥</span>
                                <span>{streak} {streak === 1 ? "dag" : "dagar"} i rad</span>
                            </div>
                        )}
                        <div className="streak-badge" style={{
                            background: dailyProgress === totalDailyGoals
                                ? "rgba(74, 222, 128, 0.15)"
                                : "var(--accent-muted)",
                            color: dailyProgress === totalDailyGoals
                                ? "var(--success)"
                                : "var(--accent)"
                        }}>
                            <span>{dailyProgress === totalDailyGoals ? "✓" : "📊"}</span>
                            <span>{dailyProgress}/{totalDailyGoals} idag</span>
                        </div>
                    </div>
                </header>

                {/* Principles */}
                <section style={{ marginTop: "var(--space-xl)" }}>
                    {PRINCIPLES.slice(0, 5).map((principle, i) => (
                        <div
                            key={i}
                            className="card"
                            style={{
                                marginBottom: "var(--space-md)",
                                cursor: "pointer",
                                transition: "all var(--transition-normal)"
                            }}
                            onClick={() => setExpandedPrinciple(
                                expandedPrinciple === i ? null : i
                            )}
                        >
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "var(--space-md)"
                            }}>
                                <span style={{
                                    fontSize: "1.5rem",
                                    width: "40px",
                                    height: "40px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: "var(--accent-muted)",
                                    borderRadius: "var(--radius-full)"
                                }}>
                                    {i + 1}
                                </span>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{
                                        fontSize: "1.1rem",
                                        marginBottom: "0.25rem"
                                    }}>
                                        {principle.title}
                                    </h3>
                                    {expandedPrinciple !== i && (
                                        <p style={{
                                            margin: 0,
                                            fontSize: "0.875rem",
                                            color: "var(--text-muted)",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap"
                                        }}>
                                            {principle.fullText.slice(0, 60)}...
                                        </p>
                                    )}
                                </div>
                                <span style={{ color: "var(--text-muted)" }}>
                                    {expandedPrinciple === i ? "▲" : "▼"}
                                </span>
                            </div>

                            {expandedPrinciple === i && (
                                <div style={{
                                    marginTop: "var(--space-lg)",
                                    paddingTop: "var(--space-lg)",
                                    borderTop: "1px solid var(--border)"
                                }}>
                                    <p style={{
                                        fontFamily: "var(--font-serif)",
                                        fontSize: "1.1rem",
                                        lineHeight: "1.8",
                                        color: "var(--text-primary)",
                                        margin: 0
                                    }}>
                                        {principle.fullText}
                                    </p>

                                    {/* Show user's personal reflection if available */}
                                    {principle.field !== "signature" &&
                                        pledge[principle.field as keyof PledgeData] && (
                                            <div style={{
                                                marginTop: "var(--space-lg)",
                                                padding: "var(--space-md)",
                                                background: "var(--accent-muted)",
                                                borderRadius: "var(--radius-md)",
                                                borderLeft: "3px solid var(--accent)"
                                            }}>
                                                <p style={{
                                                    margin: 0,
                                                    fontSize: "0.9rem",
                                                    color: "var(--accent)",
                                                    fontWeight: 500,
                                                    marginBottom: "var(--space-sm)"
                                                }}>
                                                    Din reflektion:
                                                </p>
                                                <p style={{
                                                    margin: 0,
                                                    color: "var(--text-secondary)"
                                                }}>
                                                    {pledge[principle.field as keyof PledgeData]}
                                                </p>
                                            </div>
                                        )}
                                </div>
                            )}
                        </div>
                    ))}
                </section>

                {/* Mark as read button */}
                <div style={{
                    marginTop: "var(--space-xl)",
                    textAlign: "center"
                }}>
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
                            Jag har läst principerna ✓
                        </button>
                    )}
                </div>

                {/* Timers section */}
                <section style={{ marginTop: "var(--space-2xl)" }}>
                    <h2 style={{
                        marginBottom: "var(--space-lg)",
                        fontSize: "1.25rem",
                        textAlign: "center"
                    }}>
                        ⏱️ Dagliga övningar
                    </h2>

                    <ConfidenceTimer
                        title="Visualisering"
                        durationMinutes={30}
                        icon="🧘"
                        isCompleted={hasVisualized}
                        onComplete={handleVisualizationComplete}
                    />

                    <div style={{ height: "var(--space-md)" }} />

                    <ConfidenceTimer
                        title="Mental träning"
                        durationMinutes={10}
                        icon="💭"
                        isCompleted={hasMentalTrained}
                        onComplete={handleMentalTrainingComplete}
                    />
                </section>

                {/* Navigation */}
                <div style={{
                    marginTop: "var(--space-2xl)",
                    paddingBottom: "var(--space-xl)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-md)"
                }}>
                    <Link href="/" className="btn btn-secondary btn-full">
                        ← Tillbaka till start
                    </Link>
                    <Link
                        href="/installningar"
                        className="btn btn-ghost"
                        style={{ fontSize: "0.875rem", textAlign: "center" }}
                    >
                        ⚙️ Inställningar
                    </Link>
                </div>
            </div>
        </div>
    );
}
