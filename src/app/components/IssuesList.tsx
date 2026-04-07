import { AuditIssue } from "@/app/types/audit";

type SeverityLevel = AuditIssue["severity"];
type IssueGroup = AuditIssue["group"];

const colors: Record<SeverityLevel, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
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
  const groupedIssues = groupOrder
    .map((group) => ({
      group,
      issues: issues.filter((issue) => issue.group === group),
    }))
    .filter((section) => section.issues.length > 0);

  return (
    <div className="space-y-6">
      {groupedIssues.map((section) => (
        <section key={section.group}>
          <h3 className="mb-3 text-lg font-semibold">{section.group}</h3>
          <div className="space-y-4">
            {section.issues.map((issue) => (
              <div
                key={issue.id}
                className="border rounded-xl p-4 bg-white dark:bg-gray-800 shadow-sm"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{issue.message}</span>
                  <SeverityBadge level={issue.severity} />
                </div>

                <p className="text-sm text-gray-600">{issue.suggestion}</p>
              </div>
            ))}
          </div>
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
