"use client";

import {
  AuditErrorResponse,
  AuditResult,
  isAuditResult,
  SavedAuditHistoryItem,
  SavedAuditReport,
} from "@/app/types/audit";
import { useState } from "react";
import ScoreCards from "@/app/components/ScoreCards";
import IssuesList from "@/app/components/IssuesList";
import History from "./components/History";

type AuditNotice = {
  tone: "error" | "warning";
  title: string;
  message: string;
};

function isValidAuditUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SavedAuditReport | null>(null);
  const [notice, setNotice] = useState<AuditNotice | null>(null);

  const handleAudit = async () => {
    const trimmedUrl = url.trim();

    if (!isValidAuditUrl(trimmedUrl)) {
      setResult(null);
      setNotice({
        tone: "warning",
        title: "Invalid URL",
        message: "Enter a valid URL starting with http:// or https://",
      });
      return;
    }

    setLoading(true);
    setNotice(null);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: trimmedUrl }),
      });

      if (!res.ok) {
        const errorData = (await res.json()) as AuditErrorResponse;
        setResult(null);
        setNotice({
          tone: "error",
          title: getErrorTitle(res.status),
          message: errorData.suggestion
            ? `${errorData.error}. ${errorData.suggestion}`
            : errorData.error,
        });
        return;
      }

      const parsed = (await res.json()) as unknown;

      if (!isAuditResult(parsed)) {
        setResult(null);
        setNotice({
          tone: "error",
          title: "Unexpected response",
          message: "The audit completed, but the response format was invalid. Please try again.",
        });
        return;
      }

      const data: AuditResult = parsed;
      const id = Date.now();
      const savedReport: SavedAuditReport = { ...data, id, url: trimmedUrl };

      localStorage.setItem(`report-${id}`, JSON.stringify(savedReport));

      const newReport: SavedAuditHistoryItem = {
        id,
        url: trimmedUrl,
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
      setNotice({
        tone: "error",
        title: "Network error",
        message: "Failed to run audit. Check your connection and try again.",
      });
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
            onChange={(e) => {
              setUrl(e.target.value);
              if (notice) {
                setNotice(null);
              }
            }}
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

          <p className="mt-3 text-xs text-gray-500">
            Use a public page URL. Some sites may block automated access or time out.
          </p>

          {notice && (
            <div
              className={`mt-4 rounded border px-3 py-3 text-sm ${
                notice.tone === "warning"
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              <p className="font-semibold">{notice.title}</p>
              <p className="mt-1">{notice.message}</p>
            </div>
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

function getErrorTitle(status: number) {
  if (status === 400) {
    return "Invalid request";
  }

  if (status === 403) {
    return "Access blocked";
  }

  if (status === 504) {
    return "Request timed out";
  }

  return "Audit failed";
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
