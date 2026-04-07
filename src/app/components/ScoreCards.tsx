import { AuditResult } from "@/app/types/audit";

export default function ScoreCards({ result }: { result: AuditResult }) {
  const { score, categories } = result;
  const issueCounts = {
    overall: result.issues.length,
    accessibility: result.issues.filter((issue) => issue.type === "accessibility").length,
    readability: result.issues.filter((issue) => issue.type === "readability").length,
    performance: result.issues.filter((issue) => issue.type === "performance").length,
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Overall" value={score} issueCount={issueCounts.overall} />
        <Card
          title="Accessibility"
          value={categories.accessibility}
          issueCount={issueCounts.accessibility}
        />
        <Card
          title="Readability"
          value={categories.readability}
          issueCount={issueCounts.readability}
        />
        <Card
          title="Performance"
          value={categories.performance}
          issueCount={issueCounts.performance}
        />
      </div>

      <div className="rounded-xl border bg-white p-4 text-sm text-gray-600 shadow-sm dark:bg-gray-800 dark:text-gray-300">
        Scores are normalized against the checks you enabled. Each rule has a capped deduction
        budget, so repeated issues from one heuristic do not overwhelm the full report.
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  issueCount,
}: {
  title: string;
  value: number;
  issueCount: number;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
          <p className="mt-1 text-xs text-gray-500">
            {issueCount} issue{issueCount === 1 ? "" : "s"}
          </p>
        </div>
        <ScoreDial value={value} />
      </div>
    </div>
  );
}

function ScoreDial({ value }: { value: number }) {
  const size = 68;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;
  const color = getScoreColor(value);

  return (
    <div className="relative h-[68px] w-[68px] shrink-0">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
        {value}
      </div>
    </div>
  );
}

function getScoreColor(value: number) {
  if (value >= 85) {
    return "#15803d";
  }

  if (value >= 70) {
    return "#65a30d";
  }

  if (value >= 50) {
    return "#ca8a04";
  }

  if (value >= 30) {
    return "#ea580c";
  }

  return "#dc2626";
}
