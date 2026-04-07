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
  categories: {
    accessibility: number;
    readability: number;
    performance: number;
  };
  issues: AuditIssue[];
};

export type SavedAuditReport = AuditResult & {
  id: number;
  url: string;
};

export type SavedAuditHistoryItem = {
  id: number;
  url: string;
  result: AuditResult;
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
    typeof value.categories.accessibility === "number" &&
    typeof value.categories.readability === "number" &&
    typeof value.categories.performance === "number" &&
    value.issues.every(isAuditIssue)
  );
}

export function isSavedAuditReport(value: unknown): value is SavedAuditReport {
  return (
    isAuditResult(value) &&
    typeof value.id === "number" &&
    typeof value.url === "string"
  );
}

export function isSavedAuditHistoryItem(value: unknown): value is SavedAuditHistoryItem {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "number" &&
    typeof value.url === "string" &&
    isAuditResult(value.result)
  );
}
