"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAffirmation } from "@/lib/steps";
import { getPledge } from "@/lib/confidence";

export default function Home() {
  const [hasAffirmation, setHasAffirmation] = useState(false);
  const [hasPledge, setHasPledge] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function checkData() {
      const [affirmation, pledge] = await Promise.all([
        getAffirmation(),
        getPledge()
      ]);
      setHasAffirmation(!!affirmation);
      setHasPledge(!!pledge);
      setIsLoaded(true);
    }
    checkData();
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
            Think and Grow <span className="text-accent">Rich</span>
          </h1>
          <p style={{ maxWidth: "500px", margin: "0 auto" }}>
            Två kraftfulla program för att transformera ditt sinne och uppnå dina mål.
          </p>
        </header>

        {/* Quote */}
        <blockquote className="quote" style={{ marginTop: "var(--space-2xl)" }}>
          &ldquo;Vad sinnet kan föreställa sig och tro på, kan det uppnå.&rdquo;
          <cite className="quote-author">— Napoleon Hill</cite>
        </blockquote>

        {/* Program Cards */}
        {!isLoaded ? (
          <div className="loading" style={{ marginTop: "var(--space-2xl)" }}>
            <div className="spinner" />
          </div>
        ) : (
          <section style={{ marginTop: "var(--space-2xl)" }}>
            {/* Rikedom Program */}
            <div className="card program-card" style={{ marginBottom: "var(--space-lg)" }}>
              <div className="program-card-header">
                <span className="program-icon">📈</span>
                <div>
                  <h3 style={{ marginBottom: "0.25rem" }}>Sex Steg för Rikedom</h3>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                    Omvandla din önskan till ekonomisk verklighet
                  </p>
                </div>
              </div>
              <div className="program-card-content">
                <ul className="program-features">
                  <li>✓ Definiera ditt exakta mål</li>
                  <li>✓ Skapa din personliga affirmation</li>
                  <li>✓ Daglig läsning med streak</li>
                </ul>
              </div>
              <div className="program-card-actions">
                {hasAffirmation ? (
                  <>
                    <Link href="/affirmation" className="btn btn-primary btn-full">
                      📖 Läs din affirmation
                    </Link>
                    <Link href="/steg/1" className="btn btn-ghost" style={{ marginTop: "var(--space-sm)", fontSize: "0.875rem" }}>
                      Skapa ny affirmation
                    </Link>
                  </>
                ) : (
                  <Link href="/steg/1" className="btn btn-primary btn-full">
                    Börja programmet →
                  </Link>
                )}
              </div>
            </div>

            {/* Självförtroende Program */}
            <div className="card program-card">
              <div className="program-card-header">
                <span className="program-icon">💪</span>
                <div>
                  <h3 style={{ marginBottom: "0.25rem" }}>Min Plan för Självförtroende</h3>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                    Bygg mental styrka och orubblig tro på dig själv
                  </p>
                </div>
              </div>
              <div className="program-card-content">
                <ul className="program-features">
                  <li>✓ 5 kraftfulla principer</li>
                  <li>✓ 30 min visualisering</li>
                  <li>✓ 10 min mental träning</li>
                </ul>
              </div>
              <div className="program-card-actions">
                {hasPledge ? (
                  <>
                    <Link href="/sjalvfortroende" className="btn btn-primary btn-full">
                      💪 Öppna programmet
                    </Link>
                    <Link href="/sjalvfortroende/steg/1" className="btn btn-ghost" style={{ marginTop: "var(--space-sm)", fontSize: "0.875rem" }}>
                      Skapa ny plan
                    </Link>
                  </>
                ) : (
                  <Link href="/sjalvfortroende/steg/1" className="btn btn-primary btn-full">
                    Börja programmet →
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Settings Link */}
        <div style={{ marginTop: "auto", paddingTop: "var(--space-xl)", paddingBottom: "var(--space-xl)", textAlign: "center" }}>
          <Link
            href="/installningar"
            className="btn btn-ghost"
            style={{ fontSize: "0.875rem" }}
          >
            ⚙️ Inställningar
          </Link>
        </div>
      </div>
    </div>
  );
}
