"use client";

import {
  AuditErrorResponse,
  AuditResult,
  SavedAuditHistoryItem,
  SavedAuditReport,
} from "@/app/types/audit";
import { useState } from "react";
import ScoreCards from "@/app/components/ScoreCards";
import IssuesList from "@/app/components/IssuesList";
import History from "./components/History";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SavedAuditReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAudit = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const errorData = (await res.json()) as AuditErrorResponse;
        setResult(null);
        setError(
          errorData.suggestion
            ? `${errorData.error}. ${errorData.suggestion}`
            : errorData.error
        );
        return;
      }

      const data = (await res.json()) as AuditResult;
      const id = Date.now();
      const savedReport: SavedAuditReport = { ...data, id, url };

      localStorage.setItem(`report-${id}`, JSON.stringify(savedReport));

      const newReport: SavedAuditHistoryItem = {
        id,
        url,
        result: data,
      };

      const existing = JSON.parse(
        localStorage.getItem("reports") || "[]"
      ) as SavedAuditHistoryItem[];

      localStorage.setItem(
        "reports",
        JSON.stringify([newReport, ...existing].slice(0, 10))
      );

      setResult(savedReport);
    } catch {
      setResult(null);
      setError("Failed to run audit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>

      {/* HERO */}
      <section className="text-center py-16">
        <h1 className="text-5xl font-bold mb-4">
          UX Audit Engine
        </h1>
        <p className="text-gray-600 mb-6">
          Analyze any website for UX & accessibility issues
        </p>

        <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full border p-3 rounded mb-4"
          />

          <button
            onClick={handleAudit}
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded"
          >
            {loading ? "Analyzing..." : "Run Audit"}
          </button>

          {error && (
            <p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-16">
        <h2 className="text-3xl font-bold text-center mb-10">
          Features
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <Feature title="Accessibility" desc="Detect UX issues" />
          <Feature title="Insights" desc="Actionable suggestions" />
          <Feature title="Scoring" desc="Understand quality instantly" />
        </div>
      </section>

      {/* 🧠 HOW IT WORKS */}
      <section className="bg-white dark:bg-gray-800 py-16 px-6">
        <h2 className="text-3xl font-bold text-center mb-10">
          How It Works
        </h2>

        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6 text-center">
          <Step title="1. Enter URL" desc="Paste any website link" />
          <Step title="2. Analyze" desc="We scan for UX issues" />
          <Step title="3. Improve" desc="Get actionable insights" />
        </div>
      </section>

      {/* RESULTS */}
      {result && (
        <section className="py-10">
          <ScoreCards result={result} />
          <IssuesList issues={result.issues} />

          {/* SAVE CONFIRMATION */}
          <div className="mt-6 p-4 bg-green-100 text-green-700 rounded">
            ✅ Report saved
            <div>
              <a href={`/report/${result.id}`} className="underline text-sm">
                View Report
              </a>
            </div>
          </div>
        </section>
      )}

      <History />

      {/* 🎯 CTA */}
      <section className="text-center py-20 px-6">
        <h2 className="text-3xl font-bold mb-4">
          Start improving your UX today
        </h2>
        <p className="text-gray-600 mb-6">
          Run a free audit in seconds
        </p>

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="bg-black text-white px-6 py-3 rounded-lg"
        >
          Try Now
        </button>
      </section>

    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{desc}</p>
    </div>
  );
}

function Step({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{desc}</p>
    </div>
  );
}
