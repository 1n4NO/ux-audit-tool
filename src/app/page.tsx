"use client";

import { useState } from "react";
import ScoreCards from "./components/ScoreCards";
import IssuesList from "./components/IssuesList";
import History from "./components/History";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAudit = async () => {
    setLoading(true);
    const res = await fetch("/api/audit", {
      method: "POST",
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
    const savedReports = JSON.parse(localStorage.getItem("reports") || "[]");

    const newReport = {
      id: Date.now(),
      url,
      result: data,
    };

    localStorage.setItem(
      "reports",
      JSON.stringify([newReport, ...savedReports])
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* 🔥 HERO */}
      <section className="text-center py-20 px-6">
        <h1 className="text-5xl font-bold mb-4">
          UX Audit Engine
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Instantly analyze any website for UX & accessibility issues
        </p>

        <div className="max-w-xl mx-auto bg-white shadow-lg rounded-2xl p-6">
          <input
            type="text"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full border rounded-lg p-3 mb-4"
          />

          <button
            onClick={handleAudit}
            className="w-full bg-black text-white py-3 rounded-lg"
          >
            {loading ? "Analyzing..." : "Run Audit"}
          </button>
        </div>
      </section>

      {/* 🚀 FEATURES */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">
          Features
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            title="Accessibility Checks"
            desc="Detect missing alt text, labels, and usability issues"
          />
          <FeatureCard
            title="UX Insights"
            desc="Identify readability and layout problems instantly"
          />
          <FeatureCard
            title="Smart Scoring"
            desc="Get a clear score with actionable improvements"
          />
        </div>
      </section>

      {/* 🧠 HOW IT WORKS */}
      <section className="bg-white py-16 px-6">
        <h2 className="text-3xl font-bold text-center mb-10">
          How It Works
        </h2>

        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6 text-center">
          <Step title="1. Enter URL" desc="Paste any website link" />
          <Step title="2. Analyze" desc="We scan for UX issues" />
          <Step title="3. Improve" desc="Get actionable insights" />
        </div>
      </section>

      {/* 📊 RESULTS */}
      {result && (
        <section className="py-16 px-6 max-w-4xl mx-auto">
          <ScoreCards result={result} />
          <IssuesList issues={result.issues} />
        </section>
      )}

      {/* 📊 HISTORY */}
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

function FeatureCard({ title, desc }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{desc}</p>
    </div>
  );
}

function Step({ title, desc }: any) {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{desc}</p>
    </div>
  );
}