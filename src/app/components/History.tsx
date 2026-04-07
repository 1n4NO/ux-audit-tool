"use client";

import {
  Box,
  Button,
  Chip,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import { getAuditCheckLabel } from "@/lib/audit/checks";
import { isSavedAuditHistoryItem, SavedAuditHistoryItem } from "@/app/types/audit";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

function subscribeToBrowserState() {
  return () => {};
}

export default function History() {
  const isClient = useSyncExternalStore(
    subscribeToBrowserState,
    () => true,
    () => false
  );
  const [, setRefreshTick] = useState(0);

  let reports: SavedAuditHistoryItem[] = [];

  if (isClient) {
    try {
      const parsed = JSON.parse(localStorage.getItem("reports") || "[]") as unknown;
      reports = Array.isArray(parsed)
        ? parsed.filter(isSavedAuditHistoryItem)
        : [];
    } catch {
      reports = [];
    }
  }

  if (!isClient) return null;

  return (
    <Box sx={{ mt: 5 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 2,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Recent Audits
        </Typography>
        {reports.length > 0 && (
          <Button
            onClick={() => {
              localStorage.removeItem("reports");
              setRefreshTick((tick) => tick + 1);
            }}
            color="error"
            size="small"
          >
            Clear History
          </Button>
        )}
      </Box>

      {reports.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No recent audits yet.
        </Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, minmax(0, 1fr))",
              xl: "repeat(3, minmax(0, 1fr))",
            },
          }}
        >
          {reports.map((report) => (
            <Link
              key={report.id}
              href={`/report/${report.id}`}
              style={{ display: "block", color: "inherit", textDecoration: "none" }}
            >
              <HistoryCard report={report} />
            </Link>
          ))}
        </Box>
      )}
    </Box>
  );
}

function HistoryCard({ report }: { report: SavedAuditHistoryItem }) {
  const title = report.result.pageTitle || getHostname(report.url);
  const truncatedUrl = truncateUrl(report.url);
  const scopeChecks = report.selectedChecks ?? [];
  const visibleScopeChecks = scopeChecks.slice(0, 2);
  const theme = useTheme();

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        height: "100%",
        aspectRatio: "5 / 3.5",
        transition: "transform 160ms ease, box-shadow 160ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 6,
        },
      }}
    >
      <Box sx={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            mb: 2.5,
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 1,
            }}
          >
          <MiniDial label="A11y" value={report.result.categories.accessibility} />
          <MiniDial label="Read" value={report.result.categories.readability} />
          <MiniDial label="Perf" value={report.result.categories.performance} />
          </Box>
          <Typography variant="caption" color="text.secondary" textAlign="right">
            {report.result.issues.length} issue{report.result.issues.length === 1 ? "" : "s"}
          </Typography>
        </Box>

        <Box sx={{ mb: 2.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              mb: 1,
            }}
          >
            <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: 1, textTransform: "uppercase" }} color="text.secondary">
              Overall Score
            </Typography>
            <Typography variant="body2" fontWeight={700}>
              {report.result.score}
            </Typography>
          </Box>
        <Box
          sx={{
            height: 8,
            overflow: "hidden",
            borderRadius: 999,
            bgcolor: theme.palette.mode === "dark" ? theme.palette.grey[700] : theme.palette.grey[200],
          }}
        >
          <Box
            style={{
              width: `${Math.max(0, Math.min(100, report.result.score))}%`,
              backgroundColor: getScoreColor(report.result.score),
            }}
            sx={{ height: "100%", borderRadius: 999 }}
          />
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{
            lineHeight: 1.35,
            display: "-webkit-box",
            overflow: "hidden",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" title={report.url} noWrap sx={{ mt: 1 }}>
          {truncatedUrl}
        </Typography>
      </Box>

      <Box sx={{ mt: "auto", pb: 0.5 }}>
        <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: 1, textTransform: "uppercase", mb: 1, display: "block" }} color="text.secondary">
          Audit Scope
        </Typography>
        {scopeChecks.length > 0 ? (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", overflow: "hidden" }}>
            {visibleScopeChecks.map((checkId) => (
              <Chip
                key={checkId}
                label={getAuditCheckLabel(checkId)}
                title={getAuditCheckLabel(checkId)}
                size="small"
                sx={{ maxWidth: "100%" }}
              />
            ))}
            {scopeChecks.length > visibleScopeChecks.length && (
              <Chip
                label={`+${scopeChecks.length - visibleScopeChecks.length} more`}
                size="small"
              />
            )}
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary">
            Full legacy audit
          </Typography>
        )}
      </Box>
    </Box>
    </Paper>
  );
}

function MiniDial({ label, value }: { label: string; value: number }) {
  const theme = useTheme();
  const size = 52;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
      <Box sx={{ position: "relative", width: size, height: size }}>
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
            stroke={getScoreColor(value)}
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
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {value}
        </Box>
      </Box>
      <Typography variant="caption" sx={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase" }} color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}

function getHostname(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function truncateUrl(url: string) {
  try {
    const parsed = new URL(url);
    const compactPath = parsed.pathname.length > 20
      ? `${parsed.pathname.slice(0, 20)}...`
      : parsed.pathname;

    return `${parsed.hostname}${compactPath}`;
  } catch {
    return url.length > 32 ? `${url.slice(0, 32)}...` : url;
  }
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
