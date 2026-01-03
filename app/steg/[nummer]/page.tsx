"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
    STEPS,
    AffirmationData,
    getStepData,
    saveStepData,
    saveAffirmation,
    generateStatement,
    clearStepData
} from "@/lib/steps";

export default function StepPage() {
    const params = useParams();
    const router = useRouter();
    const stepNumber = parseInt(params.nummer as string);
    const stepIndex = stepNumber - 1;
    const step = STEPS[stepIndex];

    const [data, setData] = useState<Partial<AffirmationData>>({});
    const [currentValue, setCurrentValue] = useState("");
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const savedData = getStepData();
        setData(savedData);

        if (step) {
            const fieldValue = savedData[step.field as keyof AffirmationData] || "";
            setCurrentValue(fieldValue);
        }
        setIsLoaded(true);
    }, [step]);

    // Generate statement for step 5
    useEffect(() => {
        if (stepNumber === 5 && isLoaded) {
            const statement = generateStatement(data);
            setCurrentValue(statement);
        }
    }, [stepNumber, data, isLoaded]);

    if (!step) {
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

    const handleNext = () => {
        const newData = { ...data, [step.field]: currentValue };
        saveStepData(newData);

        if (stepNumber === 5) {
            // Save final affirmation
            const affirmation: AffirmationData = {
                amount: newData.amount || "",
                exchange: newData.exchange || "",
                deadline: newData.deadline || "",
                plan: newData.plan || "",
                statement: currentValue,
                createdAt: new Date().toISOString()
            };
            saveAffirmation(affirmation);
            clearStepData();
            router.push("/affirmation");
        } else {
            router.push(`/steg/${stepNumber + 1}`);
        }
    };

    const handleBack = () => {
        const newData = { ...data, [step.field]: currentValue };
        saveStepData(newData);
        router.push(stepNumber === 1 ? "/" : `/steg/${stepNumber - 1}`);
    };

    const isValid = currentValue.trim().length > 0;

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
                            style={{ width: `${(stepNumber / 6) * 100}%` }}
                        />
                    </div>
                    <span className="progress-text">Steg {stepNumber} av 6</span>
                </div>

                {/* Content */}
                <div className="page-content">
                    <header style={{ marginBottom: "var(--space-xl)" }}>
                        <p
                            className="text-accent mb-sm"
                            style={{
                                fontSize: "0.875rem",
                                letterSpacing: "0.15em",
                                textTransform: "uppercase"
                            }}
                        >
                            Steg {stepNumber}
                        </p>
                        <h2 style={{ marginBottom: "var(--space-md)" }}>{step.title}</h2>
                        <p style={{ marginBottom: 0 }}>{step.instruction}</p>
                    </header>

                    {/* Quote */}
                    <blockquote className="quote" style={{ margin: "var(--space-lg) 0" }}>
                        {step.quote}
                    </blockquote>

                    {/* Input */}
                    <div className="input-group" style={{ marginTop: "var(--space-xl)" }}>
                        {step.inputType === "number" && (
                            <div style={{ position: "relative" }}>
                                <input
                                    type="number"
                                    className="input input-lg"
                                    value={currentValue}
                                    onChange={(e) => setCurrentValue(e.target.value)}
                                    placeholder={step.placeholder}
                                    min="0"
                                    step="1000"
                                    style={{ paddingRight: "80px" }}
                                />
                                <span
                                    style={{
                                        position: "absolute",
                                        right: "var(--space-lg)",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        color: "var(--text-muted)",
                                        fontWeight: 500
                                    }}
                                >
                                    {step.suffix}
                                </span>
                            </div>
                        )}

                        {step.inputType === "textarea" && (
                            <textarea
                                className="input"
                                value={currentValue}
                                onChange={(e) => setCurrentValue(e.target.value)}
                                placeholder={step.placeholder}
                                rows={6}
                            />
                        )}

                        {step.inputType === "date" && (
                            <input
                                type="date"
                                className="input input-lg"
                                value={currentValue}
                                onChange={(e) => setCurrentValue(e.target.value)}
                                min={new Date().toISOString().split("T")[0]}
                            />
                        )}

                        {step.inputType === "preview" && (
                            <div>
                                <label className="input-label mb-sm">Din personliga affirmation:</label>
                                <textarea
                                    className="input"
                                    value={currentValue}
                                    onChange={(e) => setCurrentValue(e.target.value)}
                                    rows={12}
                                    style={{
                                        fontFamily: "var(--font-serif)",
                                        fontSize: "1.1rem",
                                        lineHeight: "1.8"
                                    }}
                                />
                                <p className="text-muted" style={{ fontSize: "0.875rem", marginTop: "var(--space-sm)" }}>
                                    Du kan redigera texten om du vill anpassa den.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="step-navigation">
                    <button
                        onClick={handleBack}
                        className="btn btn-secondary"
                    >
                        Tillbaka
                    </button>
                    <button
                        onClick={handleNext}
                        className="btn btn-primary"
                        disabled={!isValid}
                    >
                        {stepNumber === 5 ? "Slutför" : "Nästa"}
                    </button>
                </nav>
            </div>
        </div>
    );
}
