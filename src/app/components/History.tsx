"use client";

import { useEffect, useState } from "react";

export default function History() {
	const [mounted, setMounted] = useState(false);
	const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("reports") || "[]");
    setReports(data);
  }, []);

  if (!mounted) return null;

  return (
    <div className="mt-10">
      <h3 className="text-xl font-semibold mb-4">Recent Audits</h3>

      <div className="space-y-3">
        {reports.map((r) => (
          <div key={r.id} className="p-3 border rounded-lg bg-white">
            <p className="font-medium">{r.url}</p>
            <p className="text-sm text-gray-500">
              Score: {r.result.score}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}