"use client";

import {
  AuditErrorResponse,
  AuditResult,
  isAuditResult,
  SavedAuditHistoryItem,
  SavedAuditReport,
} from "@/app/types/audit";
import {
  AUDIT_CHECKS,
  AuditCheckDefinition,
  getAuditCheckLabel,
} from "@/lib/audit/checks";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  LinearProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";
import History from "./components/History";
import IssuesList from "./components/IssuesList";
import ScoreCards from "./components/ScoreCards";

type AuditNotice = {
  tone: "error" | "warning";
  title: string;
  message: string;
};

type AuditProgressState = {
  label: string;
  value: number;
};

const AUDIT_CHECK_PREFERENCES_KEY = "audit-check-preferences";
const AUDIT_PROGRESS_STEPS: AuditProgressState[] = [
  { label: "Validating request", value: 12 },
  { label: "Fetching page HTML", value: 36 },
  { label: "Running selected checks", value: 68 },
  { label: "Building audit report", value: 88 },
];
const auditCheckboxSx = {
  color: "text.secondary",
  "&.Mui-checked": {
    color: "primary.main",
  },
  "& .MuiSvgIcon-root": {
    fontSize: 22,
  },
  "[data-mui-color-scheme='dark'] &": {
    color: "#cbd5e1",
  },
  "[data-mui-color-scheme='dark'] &.Mui-checked": {
    color: "#93c5fd",
  },
};

function getStoredAuditChecks() {
  if (typeof window === "undefined") {
    return AUDIT_CHECKS.map((check) => check.id);
  }

  try {
    const parsed = JSON.parse(
      localStorage.getItem(AUDIT_CHECK_PREFERENCES_KEY) || "[]"
    ) as unknown;

    if (!Array.isArray(parsed)) {
      return AUDIT_CHECKS.map((check) => check.id);
    }

    const validChecks = parsed.filter(
      (check): check is string =>
        typeof check === "string" &&
        AUDIT_CHECKS.some((availableCheck) => availableCheck.id === check)
    );

    return validChecks.length > 0
      ? validChecks
      : AUDIT_CHECKS.map((check) => check.id);
  } catch {
    return AUDIT_CHECKS.map((check) => check.id);
  }
}

function isValidAuditUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SavedAuditReport | null>(null);
  const [notice, setNotice] = useState<AuditNotice | null>(null);
  const [selectedChecks, setSelectedChecks] = useState<string[]>(getStoredAuditChecks);
  const [progress, setProgress] = useState<AuditProgressState | null>(null);

  const handleAudit = async () => {
    const trimmedUrl = url.trim();

    if (!isValidAuditUrl(trimmedUrl)) {
      setResult(null);
      setNotice({
        tone: "warning",
        title: "Invalid URL",
        message: "Enter a valid URL starting with http:// or https://",
      });
      return;
    }

    if (selectedChecks.length === 0) {
      setResult(null);
      setNotice({
        tone: "warning",
        title: "No checks selected",
        message: "Select at least one audit check before running the audit.",
      });
      return;
    }

    setLoading(true);
    setNotice(null);
    setProgress(AUDIT_PROGRESS_STEPS[0]);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: trimmedUrl, checks: selectedChecks }),
      });

      if (!res.ok) {
        const errorData = (await res.json()) as AuditErrorResponse;
        setResult(null);
        setNotice({
          tone: "error",
          title: getErrorTitle(res.status),
          message: errorData.suggestion
            ? `${errorData.error}. ${errorData.suggestion}`
            : errorData.error,
        });
        return;
      }

      const parsed = (await res.json()) as unknown;

      if (!isAuditResult(parsed)) {
        setResult(null);
        setNotice({
          tone: "error",
          title: "Unexpected response",
          message: "The audit completed, but the response format was invalid. Please try again.",
        });
        return;
      }

      const data: AuditResult = parsed;
      setProgress({ label: "Saving report locally", value: 96 });
      const id = Date.now();
      const savedReport: SavedAuditReport = {
        ...data,
        id,
        url: trimmedUrl,
        selectedChecks,
      };

      localStorage.setItem(`report-${id}`, JSON.stringify(savedReport));

      const newReport: SavedAuditHistoryItem = {
        id,
        url: trimmedUrl,
        result: data,
        selectedChecks,
      };

      const existing = JSON.parse(
        localStorage.getItem("reports") || "[]"
      ) as SavedAuditHistoryItem[];

      localStorage.setItem(
        "reports",
        JSON.stringify([newReport, ...existing].slice(0, 10))
      );

      setResult(savedReport);
      setProgress({ label: "Audit complete", value: 100 });
    } catch {
      setResult(null);
      setNotice({
        tone: "error",
        title: "Network error",
        message: "Failed to run audit. Check your connection and try again.",
      });
    } finally {
      window.setTimeout(() => {
        setProgress(null);
      }, 500);
      setLoading(false);
    }
  };

  const allChecksSelected = selectedChecks.length === AUDIT_CHECKS.length;
  const someChecksSelected = selectedChecks.length > 0 && !allChecksSelected;
  const checksByGroup = AUDIT_CHECKS.reduce<Record<string, AuditCheckDefinition[]>>(
    (groups, check) => {
      groups[check.group] ??= [];
      groups[check.group].push(check);
      return groups;
    },
    {}
  );

  const toggleCheck = (checkId: string) => {
    setSelectedChecks((current) => {
      if (current.includes(checkId)) {
        return current.filter((id) => id !== checkId);
      }

      return [...current, checkId];
    });
  };

  const toggleGroupChecks = (checks: AuditCheckDefinition[]) => {
    const checkIds = checks.map((check) => check.id);
    const allGroupChecksSelected = checkIds.every((checkId) =>
      selectedChecks.includes(checkId)
    );

    setSelectedChecks((current) => {
      if (allGroupChecksSelected) {
        return current.filter((checkId) => !checkIds.includes(checkId));
      }

      return Array.from(new Set([...current, ...checkIds]));
    });
  };

  const toggleAllChecks = () => {
    setSelectedChecks(allChecksSelected ? [] : AUDIT_CHECKS.map((check) => check.id));
  };

  useEffect(() => {
    localStorage.setItem(
      AUDIT_CHECK_PREFERENCES_KEY,
      JSON.stringify(selectedChecks)
    );
  }, [selectedChecks]);

  useEffect(() => {
    if (!loading) {
      return;
    }

    let stepIndex = 0;
    const interval = window.setInterval(() => {
      stepIndex += 1;

      if (stepIndex >= AUDIT_PROGRESS_STEPS.length) {
        window.clearInterval(interval);
        return;
      }

      setProgress(AUDIT_PROGRESS_STEPS[stepIndex]);
    }, 700);

    return () => {
      window.clearInterval(interval);
    };
  }, [loading]);

  return (
    <Box sx={{ display: "grid", gap: 6 }}>
      <Box component="section" sx={{ textAlign: "center", py: { xs: 4, md: 6 } }}>
        <Typography variant="h2" sx={{ mb: 2, fontSize: { xs: "2.5rem", md: "3.75rem" } }}>
          UX Audit Engine
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 760, mx: "auto" }}>
          Run grouped accessibility, readability, and performance audits on public page URLs
        </Typography>

        <Paper
          variant="outlined"
          sx={{
            maxWidth: 720,
            mx: "auto",
            p: { xs: 2, md: 3 },
            textAlign: "left",
          }}
        >
          <Box sx={{ display: "grid", gap: 2 }}>
            <TextField
              fullWidth
              label="Page URL"
              value={url}
              onChange={(event) => {
                setUrl(event.target.value);
                if (notice) {
                  setNotice(null);
                }
              }}
              placeholder="https://example.com"
            />

            <Accordion disableGutters variant="outlined">
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                  <Typography fontWeight={600}>Audit Checks</Typography>
                  <Chip
                    size="small"
                    label={`${selectedChecks.length}/${AUDIT_CHECKS.length} selected`}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: "grid", gap: 3 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={allChecksSelected}
                        indeterminate={someChecksSelected}
                        onChange={toggleAllChecks}
                        sx={auditCheckboxSx}
                      />
                    }
                    label="Select all"
                  />

                  {Object.entries(checksByGroup).map(([group, checks]) => (
                    <Box key={group}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 2,
                          mb: 1,
                        }}
                      >
                        <Typography variant="overline" color="text.secondary">
                          {group}
                        </Typography>
                        <Button
                          type="button"
                          size="small"
                          onClick={() => toggleGroupChecks(checks)}
                        >
                          {checks.every((check) => selectedChecks.includes(check.id))
                            ? "Clear group"
                            : "Select group"}
                        </Button>
                      </Box>
                      <Box sx={{ display: "grid", gap: 0.5 }}>
                        {checks.map((check) => (
                          <FormControlLabel
                            key={check.id}
                            control={
                              <Checkbox
                                checked={selectedChecks.includes(check.id)}
                                onChange={() => toggleCheck(check.id)}
                                sx={auditCheckboxSx}
                              />
                            }
                            label={check.label}
                          />
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>

            <Button
              variant="contained"
              size="large"
              disabled={loading}
              onClick={handleAudit}
              sx={{ py: 1.5 }}
            >
              {loading ? "Analyzing..." : "Run Audit"}
            </Button>

            {progress && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
                  {progress.label}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progress.value}
                  sx={{ height: 8, borderRadius: 999 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: "block" }}>
                  {progress.value}% complete
                </Typography>
              </Paper>
            )}

            <Typography variant="caption" color="text.secondary">
              Use a public page URL. Results come from deterministic HTML checks, and some
              sites may block automated access or time out.
            </Typography>

            {notice && (
              <Alert severity={notice.tone === "warning" ? "warning" : "error"}>
                <Typography variant="subtitle2">{notice.title}</Typography>
                <Typography variant="body2">{notice.message}</Typography>
              </Alert>
            )}
          </Box>
        </Paper>
      </Box>

      <Box component="section" id="features">
        <Typography variant="h4" textAlign="center" sx={{ mb: 4 }}>
          Features
        </Typography>
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
          }}
        >
          <Feature title="Selective Audits" desc="Choose the exact checks you want to run" />
          <Feature
            title="Grouped Reports"
            desc="Review findings by document, forms, links, media, and more"
          />
          <Feature
            title="Normalized Scores"
            desc="Compare enabled categories without a fake baseline"
          />
        </Box>
      </Box>

      <Paper component="section" variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h4" textAlign="center" sx={{ mb: 4 }}>
          How It Works
        </Typography>

        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
          }}
        >
          <Step title="1. Enter URL" desc="Paste a public page URL" />
          <Step
            title="2. Select Checks"
            desc="Choose accessibility, readability, and performance rules"
          />
          <Step
            title="3. Review Report"
            desc="Inspect grouped findings and category scores"
          />
        </Box>
      </Paper>

      {result && (
        <Box component="section">
          <ScoreCards result={result} />
          <SelectedChecksSummary selectedChecks={result.selectedChecks ?? selectedChecks} />
          <IssuesList issues={result.issues} />

          <Alert severity="success" sx={{ mt: 3 }}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
              <Typography variant="body2" fontWeight={600}>
                Report saved.
              </Typography>
              <Link
                href={`/report/${result.id}`}
                style={{ textDecoration: "underline", color: "inherit" }}
              >
                View Report
              </Link>
            </Box>
          </Alert>
        </Box>
      )}

      <History />

      <Box component="section" sx={{ textAlign: "center", py: { xs: 2, md: 4 } }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Audit real pages with targeted checks
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Start with deterministic heuristics, then iterate toward deeper audits
        </Typography>

        <Button
          variant="contained"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          Try Now
        </Button>
      </Box>
    </Box>
  );
}

function getErrorTitle(status: number) {
  if (status === 400) {
    return "Invalid request";
  }

  if (status === 403) {
    return "Access blocked";
  }

  if (status === 504) {
    return "Request timed out";
  }

  return "Audit failed";
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {desc}
      </Typography>
    </Paper>
  );
}

function Step({ title, desc }: { title: string; desc: string }) {
  return (
    <Box textAlign="center">
      <Typography variant="h6" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {desc}
      </Typography>
    </Box>
  );
}

function SelectedChecksSummary({ selectedChecks }: { selectedChecks: string[] }) {
  return (
    <Paper variant="outlined" sx={{ mb: 3, p: 2 }}>
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
          {selectedChecks.length} selected
        </Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {selectedChecks.map((checkId) => (
          <Chip key={checkId} label={getAuditCheckLabel(checkId)} size="small" />
        ))}
      </Box>
    </Paper>
  );
}
