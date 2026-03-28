import { CheerioAPI } from "cheerio";
import { checkImagesAlt } from "./accessibility";
import { checkParagraphLength } from "./typography";
import { AuditResult } from "@/app/types/audit";

export async function runAudit($: CheerioAPI): Promise<AuditResult> {
  const issues = [
    ...checkImagesAlt($),
    ...checkParagraphLength($),
  ];

  const accessibilityIssues = issues.filter(i => i.type === "accessibility").length;
  const readabilityIssues = issues.filter(i => i.type === "readability").length;

  const contrastScore = 80; // placeholder for now
  const accessibilityScore = Math.max(0, 100 - accessibilityIssues * 5);
  const readabilityScore = Math.max(0, 100 - readabilityIssues * 3);
  const performanceScore = 80; // placeholder for now

  const overallScore = Math.round(
    (accessibilityScore + readabilityScore + performanceScore) / 3
  );

  return {
    score: overallScore,
    categories: {
		contrast: contrastScore,
		accessibility: accessibilityScore,
		readability: readabilityScore,
		performance: performanceScore,
    },
    issues,
  };
}