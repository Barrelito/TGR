"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

type Mode = "login" | "signup" | "reset";

export default function AccountPage() {
    const [mode, setMode] = useState<Mode>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { user, signIn, signUp, signOut, resetPassword } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        setIsLoading(true);

        try {
            if (mode === "login") {
                const { error } = await signIn(email, password);
                if (error) {
                    setError(getErrorMessage(error.message));
                } else {
                    router.push("/");
                }
            } else if (mode === "signup") {
                const { error } = await signUp(email, password);
                if (error) {
                    setError(getErrorMessage(error.message));
                } else {
                    setMessage("Konto skapat! Du kan nu logga in.");
                    setMode("login");
                    setPassword("");
                }
            } else if (mode === "reset") {
                const { error } = await resetPassword(email);
                if (error) {
                    setError(getErrorMessage(error.message));
                } else {
                    setMessage("Kolla din email för återställningslänk!");
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

    // If user is logged in, show account info
    if (user) {
        return (
            <div className="page">
                <div className="container">
                    <header style={{ marginBottom: "var(--space-2xl)" }}>
                        <Link
                            href="/installningar"
                            className="btn btn-ghost"
                            style={{ marginLeft: "-var(--space-md)", marginBottom: "var(--space-md)" }}
                        >
                            ← Tillbaka
                        </Link>
                        <h1>Mitt konto</h1>
                    </header>

                    <section className="card">
                        <div style={{ textAlign: "center", padding: "var(--space-lg) 0" }}>
                            <div style={{
                                width: "80px",
                                height: "80px",
                                borderRadius: "50%",
                                background: "var(--accent-muted)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto var(--space-lg)",
                                fontSize: "2rem"
                            }}>
                                👤
                            </div>
                            <p style={{ fontWeight: 500, marginBottom: "var(--space-xs)" }}>
                                Inloggad som
                            </p>
                            <p style={{
                                color: "var(--accent)",
                                marginBottom: "var(--space-xl)",
                                wordBreak: "break-all"
                            }}>
                                {user.email}
                            </p>

                            <div style={{
                                background: "rgba(74, 222, 128, 0.1)",
                                border: "1px solid var(--success)",
                                borderRadius: "var(--radius-md)",
                                padding: "var(--space-md)",
                                marginBottom: "var(--space-xl)"
                            }}>
                                <p style={{
                                    margin: 0,
                                    color: "var(--success)",
                                    fontSize: "0.9rem"
                                }}>
                                    ✓ Din data är säkrad och synkas mellan enheter
                                </p>
                            </div>

                            <button
                                onClick={handleSignOut}
                                className="btn btn-secondary btn-full"
                            >
                                Logga ut
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                <header style={{ marginBottom: "var(--space-2xl)" }}>
                    <Link
                        href="/installningar"
                        className="btn btn-ghost"
                        style={{ marginLeft: "-var(--space-md)", marginBottom: "var(--space-md)" }}
                    >
                        ← Tillbaka
                    </Link>
                    <h1>
                        {mode === "login" && "Logga in"}
                        {mode === "signup" && "Skapa konto"}
                        {mode === "reset" && "Återställ lösenord"}
                    </h1>
                    <p style={{ color: "var(--text-secondary)" }}>
                        {mode === "login" && "Logga in för att synka din data mellan enheter."}
                        {mode === "signup" && "Skapa ett konto för att spara din data permanent."}
                        {mode === "reset" && "Ange din email för att återställa lösenordet."}
                    </p>
                </header>

                <section className="card">
                    <form onSubmit={handleSubmit}>
                        {/* Email */}
                        <div className="input-group">
                            <label className="input-label">Email</label>
                            <input
                                type="email"
                                className="input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="din@email.se"
                                required
                                autoComplete="email"
                            />
                        </div>

                        {/* Password (not for reset) */}
                        {mode !== "reset" && (
                            <div className="input-group">
                                <label className="input-label">Lösenord</label>
                                <input
                                    type="password"
                                    className="input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                                />
                                {mode === "signup" && (
                                    <p className="text-muted" style={{ fontSize: "0.75rem", marginTop: "var(--space-xs)" }}>
                                        Minst 6 tecken
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Error message */}
                        {error && (
                            <div style={{
                                background: "rgba(248, 113, 113, 0.1)",
                                border: "1px solid var(--error)",
                                borderRadius: "var(--radius-md)",
                                padding: "var(--space-md)",
                                marginBottom: "var(--space-lg)"
                            }}>
                                <p style={{ margin: 0, color: "var(--error)", fontSize: "0.9rem" }}>
                                    {error}
                                </p>
                            </div>
                        )}

                        {/* Success message */}
                        {message && (
                            <div style={{
                                background: "rgba(74, 222, 128, 0.1)",
                                border: "1px solid var(--success)",
                                borderRadius: "var(--radius-md)",
                                padding: "var(--space-md)",
                                marginBottom: "var(--space-lg)"
                            }}>
                                <p style={{ margin: 0, color: "var(--success)", fontSize: "0.9rem" }}>
                                    {message}
                                </p>
                            </div>
                        )}

                        {/* Submit button */}
                        <button
                            type="submit"
                            className="btn btn-primary btn-full btn-lg"
                            disabled={isLoading}
                        >
                            {isLoading ? "Laddar..." : (
                                mode === "login" ? "Logga in" :
                                    mode === "signup" ? "Skapa konto" :
                                        "Skicka återställningslänk"
                            )}
                        </button>
                    </form>

                    {/* Mode toggles */}
                    <div style={{
                        marginTop: "var(--space-xl)",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        gap: "var(--space-sm)"
                    }}>
                        {mode === "login" && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => { setMode("signup"); setError(null); setMessage(null); }}
                                    className="btn btn-ghost"
                                    style={{ fontSize: "0.9rem" }}
                                >
                                    Inget konto? <span className="text-accent">Skapa ett</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setMode("reset"); setError(null); setMessage(null); }}
                                    className="btn btn-ghost"
                                    style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}
                                >
                                    Glömt lösenord?
                                </button>
                            </>
                        )}
                        {mode === "signup" && (
                            <button
                                type="button"
                                onClick={() => { setMode("login"); setError(null); setMessage(null); }}
                                className="btn btn-ghost"
                                style={{ fontSize: "0.9rem" }}
                            >
                                Har redan konto? <span className="text-accent">Logga in</span>
                            </button>
                        )}
                        {mode === "reset" && (
                            <button
                                type="button"
                                onClick={() => { setMode("login"); setError(null); setMessage(null); }}
                                className="btn btn-ghost"
                                style={{ fontSize: "0.9rem" }}
                            >
                                ← Tillbaka till inloggning
                            </button>
                        )}
                    </div>
                </section>

                {/* Benefits */}
                {mode === "signup" && (
                    <section className="card" style={{ marginTop: "var(--space-lg)" }}>
                        <h3 className="mb-md">Fördelar med konto</h3>
                        <ul style={{
                            listStyle: "none",
                            display: "flex",
                            flexDirection: "column",
                            gap: "var(--space-sm)"
                        }}>
                            <li style={{ color: "var(--text-secondary)" }}>
                                ✓ Din data bevaras även om du byter enhet
                            </li>
                            <li style={{ color: "var(--text-secondary)" }}>
                                ✓ Synka mellan mobil och dator
                            </li>
                            <li style={{ color: "var(--text-secondary)" }}>
                                ✓ Säker backup av dina mål och affirmationer
                            </li>
                        </ul>
                    </section>
                )}
            </div>
        </div>
    );
}

function getErrorMessage(error: string): string {
    if (error.includes("Invalid login")) {
        return "Fel email eller lösenord";
    }
    if (error.includes("Email not confirmed")) {
        return "Bekräfta din email först (kolla din inbox)";
    }
    if (error.includes("User already registered")) {
        return "Det finns redan ett konto med denna email";
    }
    if (error.includes("Password should be")) {
        return "Lösenordet måste vara minst 6 tecken";
    }
    return error;
}
