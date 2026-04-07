import {
  Box,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
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
    <Box sx={{ display: "grid", gap: 2.5, mb: 3 }}>
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            md: "repeat(4, minmax(0, 1fr))",
          },
        }}
      >
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
      </Box>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Scores are normalized against the checks you enabled. Each rule has a capped
          deduction budget, so repeated issues from one heuristic do not overwhelm the full
          report.
        </Typography>
      </Paper>
    </Box>
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
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: `1px solid ${theme.palette.divider}`,
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h4" sx={{ mt: 0.5 }}>
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
            {issueCount} issue{issueCount === 1 ? "" : "s"}
          </Typography>
        </Box>
        <ScoreDial value={value} />
      </Box>
    </Paper>
  );
}

function ScoreDial({ value }: { value: number }) {
  const theme = useTheme();
  const size = 68;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;
  const color = getScoreColor(value);

  return (
    <Box sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          stroke={theme.palette.mode === "dark" ? theme.palette.grey[700] : theme.palette.grey[200]}
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
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          typography: "caption",
          fontWeight: 700,
        }}
      >
        {value}
      </Box>
    </Box>
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
