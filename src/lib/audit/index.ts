import {
  checkImagesAlt,
  checkButtons,
  checkInputs,
  checkLinks,
  checkDocumentLanguage,
} from "./accessibility";
import {
  checkParagraphLength,
  checkPageTitle,
  checkHeadingStructure,
} from "./typography";
import { AuditIssue, AuditResult } from "@/app/types/audit";
import { CheerioAPI } from "cheerio";

const SEVERITY_DEDUCTION = {
  low: 5,
  medium: 10,
  high: 20,
} as const;

function calculateCategoryScore(issues: AuditIssue[], type: AuditIssue["type"]) {
  const totalDeduction = issues
    .filter((issue) => issue.type === type)
    .reduce((sum, issue) => sum + SEVERITY_DEDUCTION[issue.severity], 0);

  return Math.max(0, 100 - totalDeduction);
}

export async function runAudit($: CheerioAPI): Promise<AuditResult> {
  const issues = [
    ...checkImagesAlt($),
    ...checkButtons($),
    ...checkInputs($),
    ...checkLinks($),
    ...checkDocumentLanguage($),
    ...checkParagraphLength($),
    ...checkPageTitle($),
    ...checkHeadingStructure($),
  ];

  const accessibilityScore = calculateCategoryScore(issues, "accessibility");
  const readabilityScore = calculateCategoryScore(issues, "readability");

  const score = Math.round(
    (accessibilityScore + readabilityScore) / 2
  );

  return {
    score,
    categories: {
      accessibility: accessibilityScore,
      readability: readabilityScore,
    },
    issues,
  };
}
