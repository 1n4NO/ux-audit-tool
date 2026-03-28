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

export function checkButtons($: CheerioAPI): AuditIssue[] {
  const issues: AuditIssue[] = [];

  $("button").each((i, el) => {
    const text = $(el).text().trim();

    if (!text) {
      issues.push({
        id: `btn-${i}`,
        type: "accessibility",
        severity: "medium",
        message: "Button has no label",
        suggestion: "Add descriptive text inside button",
      });
    }
  });

  return issues;
}

export function checkInputs($: CheerioAPI): AuditIssue[] {
  const issues: AuditIssue[] = [];

  $("input").each((i, el) => {
    const hasLabel = $(el).attr("aria-label") || $(el).attr("id");

    if (!hasLabel) {
      issues.push({
        id: `input-${i}`,
        type: "accessibility",
        severity: "high",
        message: "Input field missing label",
        suggestion: "Use label or aria-label for accessibility",
      });
    }
  });

  return issues;
}