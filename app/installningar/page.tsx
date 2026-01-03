"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAffirmation } from "@/lib/steps";

interface NotificationSettings {
    morningEnabled: boolean;
    morningTime: string;
    eveningEnabled: boolean;
    eveningTime: string;
}

function getDefaultSettings(): NotificationSettings {
    return {
        morningEnabled: true,
        morningTime: "07:00",
        eveningEnabled: true,
        eveningTime: "22:00"
    };
}

function loadSettings(): NotificationSettings {
    if (typeof window === "undefined") return getDefaultSettings();
    const saved = localStorage.getItem("rikedom_notification_settings");
    return saved ? JSON.parse(saved) : getDefaultSettings();
}

function saveSettings(settings: NotificationSettings): void {
    localStorage.setItem("rikedom_notification_settings", JSON.stringify(settings));
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<NotificationSettings>(getDefaultSettings());
    const [hasAffirmation, setHasAffirmation] = useState(false);
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setSettings(loadSettings());
        setHasAffirmation(!!getAffirmation());

        if ("Notification" in window) {
            setNotificationPermission(Notification.permission);
        }
    }, []);

    const requestNotificationPermission = async () => {
        if ("Notification" in window) {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);

            if (permission === "granted") {
                // Show test notification
                new Notification("Rikedom", {
                    body: "Notifikationer är nu aktiverade! 🎉",
                    icon: "/icon-192.png"
                });
            }
        }
    };

    const handleSave = () => {
        saveSettings(settings);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleDeleteAffirmation = () => {
        if (confirm("Är du säker på att du vill radera din affirmation? Detta går inte att ångra.")) {
            localStorage.removeItem("rikedom_affirmation");
            localStorage.removeItem("rikedom_reading_log");
            setHasAffirmation(false);
        }
    };

    return (
        <div className="page">
            <div className="container">
                {/* Header */}
                <header style={{ marginBottom: "var(--space-2xl)" }}>
                    <Link
                        href={hasAffirmation ? "/affirmation" : "/"}
                        className="btn btn-ghost"
                        style={{ marginLeft: "-var(--space-md)", marginBottom: "var(--space-md)" }}
                    >
                        ← Tillbaka
                    </Link>
                    <h1>Inställningar</h1>
                </header>

                {/* Notifications Section */}
                <section className="card mb-xl">
                    <h3 className="mb-lg">Påminnelser</h3>

                    {notificationPermission !== "granted" ? (
                        <div style={{ textAlign: "center", padding: "var(--space-lg) 0" }}>
                            <p className="mb-lg" style={{ color: "var(--text-secondary)" }}>
                                Aktivera notifikationer för att få påminnelser om att läsa din affirmation.
                            </p>
                            <button
                                onClick={requestNotificationPermission}
                                className="btn btn-primary"
                            >
                                Aktivera notifikationer
                            </button>
                            {notificationPermission === "denied" && (
                                <p style={{
                                    color: "var(--error)",
                                    fontSize: "0.875rem",
                                    marginTop: "var(--space-md)"
                                }}>
                                    Notifikationer är blockerade. Ändra i webbläsarens inställningar.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div>
                            {/* Morning */}
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "var(--space-md) 0",
                                borderBottom: "1px solid var(--border)"
                            }}>
                                <div>
                                    <p style={{ fontWeight: 500, marginBottom: "var(--space-xs)" }}>
                                        ☀️ Morgonpåminnelse
                                    </p>
                                    <p className="text-muted" style={{ fontSize: "0.875rem", marginBottom: 0 }}>
                                        Påminnelse när du vaknar
                                    </p>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
                                    <input
                                        type="time"
                                        className="input"
                                        value={settings.morningTime}
                                        onChange={(e) => setSettings({ ...settings, morningTime: e.target.value })}
                                        disabled={!settings.morningEnabled}
                                        style={{ width: "auto", padding: "var(--space-sm) var(--space-md)" }}
                                    />
                                    <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                                        <input
                                            type="checkbox"
                                            checked={settings.morningEnabled}
                                            onChange={(e) => setSettings({ ...settings, morningEnabled: e.target.checked })}
                                            style={{
                                                width: "20px",
                                                height: "20px",
                                                accentColor: "var(--accent)"
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Evening */}
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "var(--space-md) 0"
                            }}>
                                <div>
                                    <p style={{ fontWeight: 500, marginBottom: "var(--space-xs)" }}>
                                        🌙 Kvällspåminnelse
                                    </p>
                                    <p className="text-muted" style={{ fontSize: "0.875rem", marginBottom: 0 }}>
                                        Påminnelse innan du somnar
                                    </p>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
                                    <input
                                        type="time"
                                        className="input"
                                        value={settings.eveningTime}
                                        onChange={(e) => setSettings({ ...settings, eveningTime: e.target.value })}
                                        disabled={!settings.eveningEnabled}
                                        style={{ width: "auto", padding: "var(--space-sm) var(--space-md)" }}
                                    />
                                    <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                                        <input
                                            type="checkbox"
                                            checked={settings.eveningEnabled}
                                            onChange={(e) => setSettings({ ...settings, eveningEnabled: e.target.checked })}
                                            style={{
                                                width: "20px",
                                                height: "20px",
                                                accentColor: "var(--accent)"
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>

                            <button
                                onClick={handleSave}
                                className="btn btn-primary btn-full"
                                style={{ marginTop: "var(--space-lg)" }}
                            >
                                {saved ? "✓ Sparat!" : "Spara inställningar"}
                            </button>

                            <p className="text-muted text-center" style={{
                                fontSize: "0.75rem",
                                marginTop: "var(--space-md)",
                                marginBottom: 0
                            }}>
                                Notifikationer kräver att appen är installerad och webbläsaren är öppen.
                            </p>
                        </div>
                    )}
                </section>

                {/* Affirmation Management */}
                {hasAffirmation && (
                    <section className="card mb-xl">
                        <h3 className="mb-lg">Din affirmation</h3>

                        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
                            <Link href="/steg/1" className="btn btn-secondary btn-full">
                                Skapa ny affirmation
                            </Link>
                            <button
                                onClick={handleDeleteAffirmation}
                                className="btn btn-ghost"
                                style={{ color: "var(--error)" }}
                            >
                                Radera affirmation
                            </button>
                        </div>
                    </section>
                )}

                {/* About */}
                <section className="card">
                    <h3 className="mb-lg">Om appen</h3>
                    <p style={{ marginBottom: "var(--space-md)" }}>
                        Denna app är baserad på Napoleon Hills bok &ldquo;Think and Grow Rich&rdquo;
                        och de sex praktiska stegen för att omvandla önskan till rikedom.
                    </p>
                    <p className="text-muted" style={{ fontSize: "0.875rem", marginBottom: 0 }}>
                        Läs din affirmation två gånger dagligen – på morgonen och kvällen –
                        och se, känn och tro på dig själv som att du redan äger pengarna.
                    </p>
                </section>
            </div>
        </div>
    );
}
