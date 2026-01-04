"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
    PRINCIPLES,
    PledgeData,
    getConfidenceStepData,
    saveConfidenceStepData,
    savePledge,
    generateFullPledge,
    clearConfidenceStepData
} from "@/lib/confidence";

export default function ConfidenceStepPage() {
    const params = useParams();
    const router = useRouter();
    const stepNumber = parseInt(params.nummer as string);
    const stepIndex = stepNumber - 1;
    const principle = PRINCIPLES[stepIndex];

    const [data, setData] = useState<Partial<PledgeData>>({});
    const [currentValue, setCurrentValue] = useState("");
    const [isLoaded, setIsLoaded] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const savedData = getConfidenceStepData();
        setData(savedData);

        if (principle && principle.field !== "signature") {
            const fieldValue = savedData[principle.field as keyof PledgeData] || "";
            setCurrentValue(fieldValue);
        }
        setIsLoaded(true);
    }, [principle]);

    if (!principle) {
        return (
            <div className="page">
                <div className="container text-center" style={{ paddingTop: "var(--space-3xl)" }}>
                    <h1>Steg finns inte</h1>
                    <Link href="/" className="btn btn-primary" style={{ marginTop: "var(--space-xl)" }}>
                        Tillbaka till start
                    </Link>
                </div>
            </div>
        );
    }

    const handleNext = async () => {
        if (principle.inputType === "signature") {
            setIsSaving(true);
            // Save final pledge to Supabase
            await savePledge(data);
            clearConfidenceStepData();
            router.push("/sjalvfortroende");
        } else {
            const newData = { ...data, [principle.field]: currentValue };
            saveConfidenceStepData(newData);
            setData(newData);
            router.push(`/sjalvfortroende/steg/${stepNumber + 1}`);
        }
    };

    const handleBack = () => {
        if (principle.field !== "signature") {
            const newData = { ...data, [principle.field]: currentValue };
            saveConfidenceStepData(newData);
        }
        router.push(stepNumber === 1 ? "/" : `/sjalvfortroende/steg/${stepNumber - 1}`);
    };

    const isValid = principle.inputType === "signature" || currentValue.trim().length > 0;

    if (!isLoaded) {
        return (
            <div className="page">
                <div className="loading" style={{ minHeight: "100vh" }}>
                    <div className="spinner" />
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
                {/* Progress */}
                <div className="progress-container">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${(stepNumber / 5) * 100}%` }}
                        />
                    </div>
                    <span className="progress-text">Steg {stepNumber} av 5</span>
                </div>

                {/* Content */}
                <div className="page-content">
                    <header style={{ marginBottom: "var(--space-xl)" }}>
                        <p
                            className="mb-sm"
                            style={{
                                fontSize: "0.875rem",
                                letterSpacing: "0.15em",
                                textTransform: "uppercase",
                                color: "var(--accent)"
                            }}
                        >
                            💪 Självförtroende
                        </p>
                        <h2 style={{ marginBottom: "var(--space-md)" }}>{principle.title}</h2>
                        <p style={{ marginBottom: 0, color: "var(--text-secondary)" }}>
                            {principle.fullText}
                        </p>
                    </header>

                    {/* Quote */}
                    <blockquote className="quote" style={{ margin: "var(--space-lg) 0" }}>
                        {principle.quote}
                    </blockquote>

                    {/* Input */}
                    <div className="input-group" style={{ marginTop: "var(--space-xl)" }}>
                        {principle.inputType === "textarea" && (
                            <div>
                                <label className="input-label mb-sm">{principle.instruction}</label>
                                <textarea
                                    className="input"
                                    value={currentValue}
                                    onChange={(e) => setCurrentValue(e.target.value)}
                                    placeholder={principle.placeholder}
                                    rows={6}
                                />
                            </div>
                        )}

                        {principle.inputType === "signature" && (
                            <div>
                                <label className="input-label mb-md">{principle.instruction}</label>

                                {/* Full pledge preview */}
                                <div
                                    className="card"
                                    style={{
                                        maxHeight: "400px",
                                        overflow: "auto",
                                        fontFamily: "var(--font-serif)",
                                        fontSize: "0.95rem",
                                        lineHeight: "1.8",
                                        whiteSpace: "pre-wrap"
                                    }}
                                >
                                    {generateFullPledge(data)}
                                </div>

                                <div
                                    style={{
                                        marginTop: "var(--space-xl)",
                                        padding: "var(--space-lg)",
                                        background: "var(--accent-muted)",
                                        borderRadius: "var(--radius-md)",
                                        textAlign: "center"
                                    }}
                                >
                                    <p style={{
                                        margin: 0,
                                        color: "var(--accent)",
                                        fontWeight: 500
                                    }}>
                                        ✍️ Genom att klicka &quot;Jag förbinder mig&quot; signerar du detta åtagande
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="step-navigation">
                    <button
                        onClick={handleBack}
                        className="btn btn-secondary"
                        disabled={isSaving}
                    >
                        Tillbaka
                    </button>
                    <button
                        onClick={handleNext}
                        className="btn btn-primary"
                        disabled={!isValid || isSaving}
                    >
                        {isSaving
                            ? "Sparar..."
                            : principle.inputType === "signature"
                                ? "Jag förbinder mig ✍️"
                                : "Nästa"
                        }
                    </button>
                </nav>
            </div>
        </div>
    );
}
