import { AuditIssue } from "@/app/types/audit";
import { CheerioAPI } from "cheerio";

export function checkParagraphLength($: CheerioAPI): AuditIssue[] {
  const issues: AuditIssue[] = [];

  $("p").each((i, el) => {
    const text = $(el).text();

    if (text.length > 300) {
      issues.push({
        id: `p-length-${i}`,
        type: "readability",
        severity: "medium",
        message: "Paragraph too long",
        suggestion: "Break text into smaller paragraphs",
      });
    }
  });

  return issues;
}