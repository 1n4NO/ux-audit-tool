export default function IssuesList({ issues }: any) {
  return (
    <div className="space-y-4">
      {issues.map((issue: any) => (
        <div
          key={issue.id}
          className="border rounded-xl p-4 bg-white shadow-sm"
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

function SeverityBadge({ level }: any) {
  const colors: any = {
    low: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-red-100 text-red-700",
  };

  return (
    <span className={`text-xs px-2 py-1 rounded ${colors[level]}`}>
      {level.toUpperCase()}
    </span>
  );
}