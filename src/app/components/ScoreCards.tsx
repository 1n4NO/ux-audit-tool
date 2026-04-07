import { AuditResult } from "@/app/types/audit";

export default function ScoreCards({ result }: { result: AuditResult }) {
  const { score, categories } = result;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card title="Overall" value={score} />
      <Card title="Accessibility" value={categories.accessibility} />
      <Card title="Readability" value={categories.readability} />
    </div>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-4 text-center">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
