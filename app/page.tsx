"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAffirmation } from "@/lib/steps";

export default function Home() {
  const [hasAffirmation, setHasAffirmation] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function checkAffirmation() {
      const saved = await getAffirmation();
      setHasAffirmation(!!saved);
      setIsLoaded(true);
    }
    checkAffirmation();
  }, []);

  return (
    <div className="page">
      <div className="container" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Header */}
        <header style={{ textAlign: "center", paddingTop: "var(--space-3xl)" }}>
          <p className="text-accent mb-md" style={{ fontSize: "0.875rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            Baserad på Napoleon Hills tidlösa visdom
          </p>
          <h1 style={{ marginBottom: "var(--space-lg)" }}>
            Sex Steg för <span className="text-accent">Rikedom</span>
          </h1>
          <p style={{ maxWidth: "500px", margin: "0 auto" }}>
            Omvandla din önskan om rikedom till dess ekonomiska motsvarighet
            genom sex definitiva, praktiska steg.
          </p>
        </header>

        {/* Quote */}
        <blockquote className="quote" style={{ marginTop: "var(--space-3xl)" }}>
          &ldquo;Vad sinnet kan föreställa sig och tro på, kan det uppnå.&rdquo;
          <cite className="quote-author">— Napoleon Hill, Think and Grow Rich</cite>
        </blockquote>

        {/* Steps Preview */}
        <section style={{ marginTop: "var(--space-2xl)" }}>
          <div className="card">
            <h3 className="mb-lg">De Sex Stegen</h3>
            <ol style={{
              listStyle: "none",
              counterReset: "step",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-md)"
            }}>
              {[
                "Fastställ det exakta beloppet du önskar",
                "Bestäm vad du ger i utbyte",
                "Sätt en deadline för ditt mål",
                "Skapa din konkreta plan",
                "Skriv ditt personliga uttalande",
                "Läs din affirmation dagligen"
              ].map((step, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "var(--space-md)",
                    color: "var(--text-secondary)"
                  }}
                >
                  <span
                    className="text-accent"
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "1.25rem",
                      fontWeight: 500,
                      minWidth: "1.5rem"
                    }}
                  >
                    {i + 1}.
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CTA */}
        <div style={{ marginTop: "auto", paddingTop: "var(--space-2xl)", paddingBottom: "var(--space-xl)" }}>
          {!isLoaded ? (
            <div className="loading">
              <div className="spinner" />
            </div>
          ) : hasAffirmation ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
              <Link href="/affirmation" className="btn btn-primary btn-lg btn-full">
                Läs din affirmation
              </Link>
              <Link href="/steg/1" className="btn btn-secondary btn-full">
                Skapa ny affirmation
              </Link>
            </div>
          ) : (
            <Link href="/steg/1" className="btn btn-primary btn-lg btn-full">
              Börja din resa
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
