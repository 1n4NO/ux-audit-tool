"use client";

import { getAuditCheckLabel } from "@/lib/audit/checks";
import { isSavedAuditReport, SavedAuditReport } from "@/app/types/audit";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Snackbar,
  Typography,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";
import IssuesList from "@/app/components/IssuesList";
import ScoreCards from "@/app/components/ScoreCards";

function subscribeToBrowserState() {
  return () => {};
}

export default function ReportPage() {
  const { id } = useParams();
  const router = useRouter();
  const isClient = useSyncExternalStore(
    subscribeToBrowserState,
    () => true,
    () => false
  );
  const reportId = Array.isArray(id) ? id[0] : id;
  const [feedback, setFeedback] = useState<string | null>(null);
  const data = useMemo<SavedAuditReport | null>(() => {
    if (!isClient || !reportId) {
      return null;
    }

    try {
      const saved = localStorage.getItem(`report-${reportId}`);
      if (!saved) {
        return null;
      }

      const parsed = JSON.parse(saved) as unknown;
      return isSavedAuditReport(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }, [isClient, reportId]);

  if (!isClient) {
    return (
      <Typography variant="body2" color="text.secondary">
        Loading report...
      </Typography>
    );
  }

  if (!reportId || !data) {
    return (
      <Box sx={{ display: "grid", gap: 3, maxWidth: 720 }}>
        <Button
          variant="text"
          color="inherit"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => router.push("/")}
          sx={{ alignSelf: "flex-start" }}
        >
          Back to Home
        </Button>

        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Report not found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This report is missing, invalid, or unavailable in this browser.
          </Typography>
        </Paper>
      </Box>
    );
  }

  const exportFilename = getReportFilename(data);

  return (
    <Box sx={{ display: "grid", gap: 3 }}>
      <Button
        variant="text"
        color="inherit"
        startIcon={<ArrowBackRoundedIcon />}
        onClick={() => router.push("/")}
        sx={{ alignSelf: "flex-start" }}
      >
        Back to Home
      </Button>

      <Box>
        <Typography variant="h3" sx={{ mb: 1 }}>
          Audit Report
        </Typography>
        <Typography variant="body2" color="text.secondary">
          URL: {data.url}
        </Typography>
      </Box>

      <ScoreCards result={data} />

      {data.selectedChecks && data.selectedChecks.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              mb: 1.5,
            }}
          >
            <Typography variant="subtitle2">Audit Scope</Typography>
            <Typography variant="caption" color="text.secondary">
              {data.selectedChecks.length} selected
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {data.selectedChecks.map((checkId) => (
              <Chip key={checkId} size="small" label={getAuditCheckLabel(checkId)} />
            ))}
          </Box>
        </Paper>
      )}

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
          Export Actions
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Copy this local report link or download the full audit payload as JSON.
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1.5,
            alignItems: { sm: "center" },
          }}
        >
          <Button
            variant="contained"
            startIcon={<ContentCopyRoundedIcon />}
            onClick={async () => {
              await navigator.clipboard.writeText(window.location.href);
              setFeedback("Report link copied.");
            }}
          >
            Copy Link
          </Button>

          <Button
            variant="outlined"
            startIcon={<DownloadRoundedIcon />}
            onClick={() => {
              const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: "application/json",
              });
              const objectUrl = URL.createObjectURL(blob);
              const anchor = document.createElement("a");
              anchor.href = objectUrl;
              anchor.download = exportFilename;
              anchor.click();
              URL.revokeObjectURL(objectUrl);
              setFeedback(`Downloaded ${exportFilename}`);
            }}
          >
            Download JSON
          </Button>

          <Typography variant="caption" color="text.secondary">
            Filename: {exportFilename}
          </Typography>
        </Box>
      </Paper>

      {data.pageTitle && (
        <Alert severity="info" variant="outlined">
          Source page title: {data.pageTitle}
        </Alert>
      )}

      <IssuesList issues={data.issues} />

      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={2400}
        onClose={() => setFeedback(null)}
        message={feedback}
      />
    </Box>
  );
}

function getReportFilename(report: SavedAuditReport) {
  const hostname = getHostname(report.url);
  const timestamp = new Date(report.id).toISOString().slice(0, 19).replace(/[:T]/g, "-");
  return `ux-audit-${hostname}-${timestamp}.json`;
}

function getHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/[^a-z0-9.-]/gi, "-");
  } catch {
    return "report";
  }
}
