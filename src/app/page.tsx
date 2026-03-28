"use client";

import { useState } from "react";
import ScoreCards from "./components/ScoreCards";
import IssuesList from "./components/IssuesList";

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
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <h1 className="text-4xl font-bold mb-2 text-center">
        UX Audit Engine
      </h1>
      <p className="text-gray-600 mb-6 text-center">
        Analyze any website for UX & accessibility issues instantly
      </p>

      <div className="w-full max-w-xl bg-white shadow-lg rounded-2xl p-6">
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

      {result && (
        <div className="mt-10 w-full max-w-3xl">
          <ScoreCards result={result} />
          <IssuesList issues={result.issues} />
        </div>
      )}
    </div>
  );
}