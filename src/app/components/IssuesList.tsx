import { AuditIssue } from "@/app/types/audit";

type SeverityLevel = AuditIssue["severity"];
type IssueGroup = AuditIssue["group"];
type IssueType = AuditIssue["type"];

const colors: Record<SeverityLevel, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

const typeColors: Record<IssueType, string> = {
  accessibility: "bg-blue-100 text-blue-700",
  readability: "bg-slate-100 text-slate-700",
  performance: "bg-purple-100 text-purple-700",
};

const groupOrder: IssueGroup[] = [
  "Document",
  "Metadata",
  "Headings",
  "Content",
  "Forms",
  "Links",
  "Images",
  "Media",
];

export default function IssuesList({ issues }: { issues: AuditIssue[] }) {
  const groupedIssues = groupOrder.map((group) => ({
    group,
    issues: issues.filter((issue) => issue.group === group),
  }));

  return (
    <div className="space-y-6">
      {groupedIssues.map((section) => (
        <section key={section.group}>
          <div className="mb-3 flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold">{section.group}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{section.issues.length} issue{section.issues.length === 1 ? "" : "s"}</span>
              {section.issues.length > 0 && <SeveritySummary issues={section.issues} />}
            </div>
          </div>

          {section.issues.length === 0 ? (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              No issues found in this group.
            </div>
          ) : (
            <div className="space-y-4">
              {section.issues.map((issue) => (
                <div
                  key={issue.id}
                  className="border rounded-xl p-4 bg-white dark:bg-gray-800 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-2 gap-3">
                    <span className="font-semibold">{issue.message}</span>
                    <div className="flex items-center gap-2">
                      <TypeBadge type={issue.type} />
                      <SeverityBadge level={issue.severity} />
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">{issue.suggestion}</p>
                </div>
              ))}
            </div>
          )}
        </section>
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

function TypeBadge({ type }: { type: IssueType }) {
  return (
    <span className={`text-xs px-2 py-1 rounded ${typeColors[type]}`}>
      {type}
    </span>
  );
}

function SeveritySummary({ issues }: { issues: AuditIssue[] }) {
  const counts = {
    high: issues.filter((issue) => issue.severity === "high").length,
    medium: issues.filter((issue) => issue.severity === "medium").length,
    low: issues.filter((issue) => issue.severity === "low").length,
  };

  return (
    <div className="flex items-center gap-1">
      {counts.high > 0 && <span className="rounded bg-red-100 px-2 py-1 text-red-700">{counts.high} high</span>}
      {counts.medium > 0 && (
        <span className="rounded bg-yellow-100 px-2 py-1 text-yellow-700">
          {counts.medium} medium
        </span>
      )}
      {counts.low > 0 && <span className="rounded bg-green-100 px-2 py-1 text-green-700">{counts.low} low</span>}
    </div>
  );
}
