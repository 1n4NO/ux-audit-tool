"use client";

import { SavedAuditHistoryItem } from "@/app/types/audit";
import { useState, useSyncExternalStore } from "react";

function subscribeToBrowserState() {
  return () => {};
}

export default function History() {
  const isClient = useSyncExternalStore(
    subscribeToBrowserState,
    () => true,
    () => false
  );
  const [, setRefreshTick] = useState(0);

  let reports: SavedAuditHistoryItem[] = [];

  if (isClient) {
    try {
      reports = JSON.parse(localStorage.getItem("reports") || "[]") as SavedAuditHistoryItem[];
    } catch {
      reports = [];
    }
  }

  if (!isClient) return null;

  return (
    <div className="mt-10">
      <h3 className="text-xl font-semibold mb-4">Recent Audits</h3>

      {reports.length === 0 ? (
        <p className="text-sm text-gray-500">No recent audits yet.</p>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="p-3 border rounded-lg bg-white dark:bg-gray-800"
            >
              <p className="font-medium">{report.url}</p>
              <p className="text-sm text-gray-500">Score: {report.result.score}</p>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => {
          localStorage.removeItem("reports");
          setRefreshTick((tick) => tick + 1);
        }}
        className="text-sm text-red-500 mb-4"
      >
        Clear History
      </button>

    </div>
  );
}
