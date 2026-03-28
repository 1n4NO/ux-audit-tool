"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ScoreCards from "@/app/components/ScoreCards";
import IssuesList from "@/app/components/IssuesList";

export default function ReportPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem(`report-${id}`);
    if (saved) {
      setData(JSON.parse(saved));
    }
  }, [id]);

  if (!data) return <p>Loading...</p>;

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