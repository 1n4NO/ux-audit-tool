export type AuditIssue = {
  id: string;
  type: "contrast" | "accessibility" | "performance" | "readability";
  severity: "low" | "medium" | "high";
  message: string;
  suggestion: string;
};

export type AuditResult = {
  score: number;
  categories: {
    conytrast: number;
    accessibility: number;
    readability: number;
    performance: number;
  };
  issues: AuditIssue[];
};