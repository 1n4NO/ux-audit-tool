export default function ScoreCards({ result }: any) {
  const { score, categories } = result;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card title="Overall" value={score} />
      <Card title="Accessibility" value={categories.accessibility} />
      <Card title="Readability" value={categories.readability} />
      <Card title="Performance" value={categories.performance} />
    </div>
  );
}

function Card({ title, value }: any) {
  return (
    <div className="bg-white shadow rounded-xl p-4 text-center">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}