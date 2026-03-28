import { AuditIssue } from "@/app/types/audit";
import { CheerioAPI } from "cheerio";

export function checkImagesAlt($: CheerioAPI): AuditIssue[] {
  const issues: AuditIssue[] = [];

  $("img").each((_, el) => {
    const alt = $(el).attr("alt");

    if (!alt || alt.trim() === "") {
      issues.push({
        id: `img-alt-${_}`,
        type: "accessibility",
        severity: "high",
        message: "Image missing alt text",
        suggestion: "Add descriptive alt text for accessibility",
      });
    }
  });

  return issues;
}