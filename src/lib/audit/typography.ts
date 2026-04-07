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

export function checkPageTitle($: CheerioAPI): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const title = $("title").first().text().trim();

  if (!title) {
    issues.push({
      id: "page-title",
      type: "readability",
      severity: "high",
      message: "Page is missing a title",
      suggestion: "Add a descriptive title element in the document head",
    });
  }

  return issues;
}

export function checkHeadingStructure($: CheerioAPI): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const headings = $("h1, h2, h3, h4, h5, h6").toArray();
  const h1Count = $("h1").length;

  if (headings.length === 0) {
    issues.push({
      id: "headings-missing",
      type: "readability",
      severity: "medium",
      message: "Page has no headings",
      suggestion: "Use headings to organize page content",
    });
    return issues;
  }

  if (h1Count === 0) {
    issues.push({
      id: "h1-missing",
      type: "readability",
      severity: "medium",
      message: "Page is missing an H1 heading",
      suggestion: "Add a clear H1 to describe the main page topic",
    });
  }

  if (h1Count > 1) {
    issues.push({
      id: "h1-multiple",
      type: "readability",
      severity: "low",
      message: "Page has multiple H1 headings",
      suggestion: "Use a single primary H1 and reserve lower levels for sections",
    });
  }

  let previousLevel = 0;

  headings.forEach((heading, i) => {
    const level = Number(heading.tagName.toLowerCase().replace("h", ""));

    if (previousLevel > 0 && level > previousLevel + 1) {
      issues.push({
        id: `heading-skip-${i}`,
        type: "readability",
        severity: "medium",
        message: `Heading structure skips from H${previousLevel} to H${level}`,
        suggestion: "Keep heading levels in a logical sequence",
      });
    }

    previousLevel = level;
  });

  return issues;
}
