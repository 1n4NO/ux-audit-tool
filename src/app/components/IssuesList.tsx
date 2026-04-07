import { AuditIssue } from "@/app/types/audit";

type SeverityLevel = AuditIssue["severity"];

const colors: Record<SeverityLevel, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

export default function IssuesList({ issues }: { issues: AuditIssue[] }) {
  return (
    <div className="space-y-4">
      {issues.map((issue) => (
        <div
          key={issue.id}
          className="border rounded-xl p-4 bg-white dark:bg-gray-800 shadow-sm"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">{issue.message}</span>
            <SeverityBadge level={issue.severity} />
          </div>

          <p className="text-sm text-gray-600">
            {issue.suggestion}
          </p>
        </div>
      ))}
    </div>
  );
}

function SeverityBadge({ level }: { level: SeverityLevel }) {
  return (
    <span className={`text-xs px-2 py-1 rounded ${colors[level]}`}>
      {level.toUpperCase()}
    </span>
  );
}
