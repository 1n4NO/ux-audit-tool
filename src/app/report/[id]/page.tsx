"use client";

import { isSavedAuditReport, SavedAuditReport } from "@/app/types/audit";
import { useParams, useRouter } from "next/navigation";
import ScoreCards from "@/app/components/ScoreCards";
import IssuesList from "@/app/components/IssuesList";
import { useMemo, useSyncExternalStore } from "react";
import { getAuditCheckLabel } from "@/lib/audit/checks";

function subscribeToBrowserState() {
  return () => {};
}

export default function ReportPage() {
  const { id } = useParams();
  const router = useRouter();
  const isClient = useSyncExternalStore(
    subscribeToBrowserState,
    () => true,
    () => false
  );
  const reportId = Array.isArray(id) ? id[0] : id;
  const data = useMemo<SavedAuditReport | null>(() => {
    if (!isClient || !reportId) {
      return null;
    }

    try {
      const saved = localStorage.getItem(`report-${reportId}`);
      if (!saved) {
        return null;
      }

      const parsed = JSON.parse(saved) as unknown;
      return isSavedAuditReport(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }, [isClient, reportId]);

  if (!isClient) {
    return <p className="text-sm text-gray-500">Loading report...</p>;
  }

  if (!reportId || !data) {
    return (
      <div className="max-w-2xl">
        <button
          onClick={() => router.push("/")}
          className="mb-6 text-sm text-gray-600 hover:underline"
        >
          ← Back to Home
        </button>

        <div className="rounded-xl border bg-white p-6 shadow dark:bg-gray-800">
          <h1 className="text-2xl font-bold mb-2">Report not found</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            This report is missing, invalid, or unavailable in this browser.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>

      {/* BACK */}
      <button
        onClick={() => router.push("/")}
        className="mb-6 text-sm text-gray-600 hover:underline"
      >
        ← Back to Home
      </button>

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-2">Audit Report</h1>
      <p className="text-gray-500 mb-4 text-sm">
        URL: {data.url}
      </p>

      {/* SCORES */}
      <ScoreCards result={data} />
      {data.selectedChecks && data.selectedChecks.length > 0 && (
        <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-800">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Audit Scope</h2>
            <span className="text-xs text-gray-500">
              {data.selectedChecks.length} selected
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.selectedChecks.map((checkId) => (
              <span
                key={checkId}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-200"
              >
                {getAuditCheckLabel(checkId)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex gap-3 my-6">
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied!");
          }}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Copy Link
        </button>

        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(data, null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "report.json";
            a.click();
          }}
          className="border px-4 py-2 rounded"
        >
          Download
        </button>
      </div>

      {/* ISSUES */}
      <IssuesList issues={data.issues} />

    </div>
  );
}
