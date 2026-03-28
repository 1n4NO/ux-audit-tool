export type AuditIssue = {
  id: string;
  type: "accessibility" | "performance" | "readability";
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