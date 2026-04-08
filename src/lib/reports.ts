import {
  AuditResult,
  PersistedReportRecord,
  SavedAuditHistoryItem,
  SavedAuditReport,
  toSavedAuditHistoryItem,
  toSavedAuditReport,
} from "@/app/types/audit";

export function buildInsertPayload({
  url,
  result,
  selectedChecks,
  userId,
}: {
  url: string;
  result: AuditResult;
  selectedChecks: string[];
  userId: string;
}) {
  return {
    user_id: userId,
    url,
    page_title: result.pageTitle,
    selected_checks: selectedChecks,
    overall_score: result.score,
    accessibility_score: result.categories.accessibility,
    readability_score: result.categories.readability,
    performance_score: result.categories.performance,
    issues: result.issues,
  };
}

export function mapRecordToSavedReport(record: PersistedReportRecord): SavedAuditReport {
  return toSavedAuditReport(record);
}

export function mapRecordToHistoryItem(record: PersistedReportRecord): SavedAuditHistoryItem {
  return toSavedAuditHistoryItem(record);
}
