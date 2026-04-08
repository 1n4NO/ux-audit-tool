export type AuditIssue = {
  id: string;
  type: "accessibility" | "readability" | "performance";
  group:
    | "Document"
    | "Forms"
    | "Headings"
    | "Images"
    | "Links"
    | "Media"
    | "Metadata"
    | "Content";
  severity: "low" | "medium" | "high";
  message: string;
  suggestion: string;
};

export type AuditResult = {
  score: number;
  pageTitle: string | null;
  categories: {
    accessibility: number;
    readability: number;
    performance: number;
  };
  issues: AuditIssue[];
};

export type SavedAuditReport = AuditResult & {
  id: string;
  url: string;
  createdAt: string;
  selectedChecks?: string[];
};

export type SavedAuditHistoryItem = {
  id: string;
  url: string;
  createdAt: string;
  result: AuditResult;
  selectedChecks?: string[];
};

export type PersistedReportRecord = {
  id: string;
  created_at: string;
  url: string;
  page_title: string | null;
  selected_checks: string[] | null;
  overall_score: number;
  accessibility_score: number;
  readability_score: number;
  performance_score: number;
  issues: AuditIssue[];
};

export type AuditErrorResponse = {
  error: string;
  suggestion?: string;
  details?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isAuditIssue(value: unknown): value is AuditIssue {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    (value.type === "accessibility" ||
      value.type === "readability" ||
      value.type === "performance") &&
    [
      "Document",
      "Forms",
      "Headings",
      "Images",
      "Links",
      "Media",
      "Metadata",
      "Content",
    ].includes(value.group) &&
    (value.severity === "low" || value.severity === "medium" || value.severity === "high") &&
    typeof value.message === "string" &&
    typeof value.suggestion === "string"
  );
}

export function isAuditResult(value: unknown): value is AuditResult {
  if (!isRecord(value) || !isRecord(value.categories) || !Array.isArray(value.issues)) {
    return false;
  }

  return (
    typeof value.score === "number" &&
    (value.pageTitle === undefined ||
      value.pageTitle === null ||
      typeof value.pageTitle === "string") &&
    typeof value.categories.accessibility === "number" &&
    typeof value.categories.readability === "number" &&
    typeof value.categories.performance === "number" &&
    value.issues.every(isAuditIssue)
  );
}

export function isSavedAuditReport(value: unknown): value is SavedAuditReport {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isAuditResult(value) &&
    typeof value.id === "string" &&
    typeof value.url === "string" &&
    typeof value.createdAt === "string" &&
    (value.selectedChecks === undefined ||
      (Array.isArray(value.selectedChecks) &&
        value.selectedChecks.every((check) => typeof check === "string")))
  );
}

export function isSavedAuditHistoryItem(value: unknown): value is SavedAuditHistoryItem {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.url === "string" &&
    typeof value.createdAt === "string" &&
    isAuditResult(value.result) &&
    (value.selectedChecks === undefined ||
      (Array.isArray(value.selectedChecks) &&
        value.selectedChecks.every((check) => typeof check === "string")))
  );
}

export function isPersistedReportRecord(value: unknown): value is PersistedReportRecord {
  if (!isRecord(value) || !Array.isArray(value.issues)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.created_at === "string" &&
    typeof value.url === "string" &&
    (value.page_title === null || typeof value.page_title === "string") &&
    (value.selected_checks === null ||
      (Array.isArray(value.selected_checks) &&
        value.selected_checks.every((check) => typeof check === "string"))) &&
    typeof value.overall_score === "number" &&
    typeof value.accessibility_score === "number" &&
    typeof value.readability_score === "number" &&
    typeof value.performance_score === "number" &&
    value.issues.every(isAuditIssue)
  );
}

export function toSavedAuditReport(record: PersistedReportRecord): SavedAuditReport {
  return {
    id: record.id,
    url: record.url,
    createdAt: record.created_at,
    pageTitle: record.page_title,
    score: record.overall_score,
    categories: {
      accessibility: record.accessibility_score,
      readability: record.readability_score,
      performance: record.performance_score,
    },
    issues: record.issues,
    selectedChecks: record.selected_checks ?? [],
  };
}

export function toSavedAuditHistoryItem(record: PersistedReportRecord): SavedAuditHistoryItem {
  return {
    id: record.id,
    url: record.url,
    createdAt: record.created_at,
    selectedChecks: record.selected_checks ?? [],
    result: {
      pageTitle: record.page_title,
      score: record.overall_score,
      categories: {
        accessibility: record.accessibility_score,
        readability: record.readability_score,
        performance: record.performance_score,
      },
      issues: record.issues,
    },
  };
}
