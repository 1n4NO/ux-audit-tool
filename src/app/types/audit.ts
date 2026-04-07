export type AuditIssue = {
  id: string;
  type: "accessibility" | "readability";
  severity: "low" | "medium" | "high";
  message: string;
  suggestion: string;
};

export type AuditResult = {
  score: number;
  categories: {
    accessibility: number;
    readability: number;
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
