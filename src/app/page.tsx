"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAudit = async () => {
    setLoading(true);

    const res = await fetch("./api/audit", {
      method: "POST",
      body: JSON.stringify({ url }),
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  console.log("result", result);

  return (
    <div className="p-10 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">UX Audit Tool</h1>

      <input
        type="text"
        placeholder="Enter website URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full border p-2 mb-4"
      />

      <button
        onClick={handleAudit}
        className="bg-black text-white px-4 py-2"
      >
        {loading ? "Analyzing..." : "Run Audit"}
      </button>

      {result && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">
            Score: {result.score}
          </h2>

          <ul className="mt-4 space-y-2">
            {result?.issues?.map((issue: any) => (
              <li key={issue.id} className="border p-2">
                <strong>{issue.message}</strong>
                <p className="text-sm">{issue.suggestion}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}