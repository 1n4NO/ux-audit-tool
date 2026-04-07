import {
  Alert,
  Box,
  Chip,
  Paper,
  Typography,
} from "@mui/material";
import { AuditIssue } from "@/app/types/audit";

type SeverityLevel = AuditIssue["severity"];
type IssueGroup = AuditIssue["group"];
type IssueType = AuditIssue["type"];

const colors: Record<SeverityLevel, string> = {
  low: "#15803d",
  medium: "#ca8a04",
  high: "#dc2626",
};

const typeColors: Record<IssueType, string> = {
  accessibility: "#2563eb",
  readability: "#475569",
  performance: "#7c3aed",
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
    <Box sx={{ display: "grid", gap: 3 }}>
      {groupedIssues.map((section) => (
        <Box key={section.group} component="section">
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              gap: 1.5,
              mb: 1.5,
            }}
          >
            <Typography variant="h6">{section.group}</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
              <Typography variant="caption">
                {section.issues.length} issue{section.issues.length === 1 ? "" : "s"}
              </Typography>
              {section.issues.length > 0 && <SeveritySummary issues={section.issues} />}
            </Box>
          </Box>

          {section.issues.length === 0 ? (
            <Alert severity="success" variant="outlined">
              No issues found in this group.
            </Alert>
          ) : (
            <Box sx={{ display: "grid", gap: 2 }}>
              {section.issues.map((issue) => (
                <Paper
                  key={issue.id}
                  variant="outlined"
                  sx={{ p: 2 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { xs: "flex-start", sm: "center" },
                      justifyContent: "space-between",
                      gap: 1.5,
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={700}>
                      {issue.message}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <TypeBadge type={issue.type} />
                      <SeverityBadge level={issue.severity} />
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    {issue.suggestion}
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
}

function SeverityBadge({ level }: { level: SeverityLevel }) {
  return (
    <Chip
      label={level.toUpperCase()}
      size="small"
      sx={{
        bgcolor: `${colors[level]}1A`,
        color: colors[level],
        fontWeight: 700,
      }}
    />
  );
}

function TypeBadge({ type }: { type: IssueType }) {
  return (
    <Chip
      label={type}
      size="small"
      sx={{
        bgcolor: `${typeColors[type]}1A`,
        color: typeColors[type],
        textTransform: "capitalize",
      }}
    />
  );
}

function SeveritySummary({ issues }: { issues: AuditIssue[] }) {
  const counts = {
    high: issues.filter((issue) => issue.severity === "high").length,
    medium: issues.filter((issue) => issue.severity === "medium").length,
    low: issues.filter((issue) => issue.severity === "low").length,
  };

  return (
    <Box sx={{ display: "flex", gap: 0.75 }}>
      {counts.high > 0 && (
        <Chip size="small" label={`${counts.high} high`} sx={{ bgcolor: "#dc26261A", color: "#dc2626" }} />
      )}
      {counts.medium > 0 && (
        <Chip size="small" label={`${counts.medium} medium`} sx={{ bgcolor: "#ca8a041A", color: "#ca8a04" }} />
      )}
      {counts.low > 0 && (
        <Chip size="small" label={`${counts.low} low`} sx={{ bgcolor: "#15803d1A", color: "#15803d" }} />
      )}
    </Box>
  );
}
