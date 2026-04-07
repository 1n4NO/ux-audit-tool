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
    const type = ($(el).attr("type") || "text").toLowerCase();

    if (["hidden", "submit", "button", "reset", "image"].includes(type)) {
      return;
    }

    const inputId = $(el).attr("id");
    const ariaLabel = $(el).attr("aria-label")?.trim();
    const ariaLabelledBy = $(el).attr("aria-labelledby")?.trim();
    const wrappedByLabel = $(el).closest("label").length > 0;
    const hasLabelFor =
      Boolean(inputId) &&
      $(`label[for="${inputId}"]`).toArray().some((label) => {
        return $(label).text().trim().length > 0;
      });

    if (!ariaLabel && !ariaLabelledBy && !wrappedByLabel && !hasLabelFor) {
      issues.push({
        id: `input-${i}`,
        type: "accessibility",
        severity: "high",
        message: "Input field missing label",
        suggestion: "Use a visible label, aria-label, or aria-labelledby for accessibility",
      });
    }
  });

  return issues;
}

export function checkLinks($: CheerioAPI): AuditIssue[] {
  const issues: AuditIssue[] = [];

  $("a").each((i, el) => {
    const text = $(el).text().trim();
    const ariaLabel = $(el).attr("aria-label")?.trim();
    const title = $(el).attr("title")?.trim();
    const hasImageWithAlt = $(el)
      .find("img")
      .toArray()
      .some((img) => {
        const alt = $(img).attr("alt")?.trim();
        return Boolean(alt);
      });

    if (!text && !ariaLabel && !title && !hasImageWithAlt) {
      issues.push({
        id: `link-${i}`,
        type: "accessibility",
        severity: "medium",
        message: "Link has no accessible name",
        suggestion: "Add visible link text or an accessible label",
      });
    }
  });

  return issues;
}

export function checkDocumentLanguage($: CheerioAPI): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const lang = $("html").attr("lang")?.trim();

  if (!lang) {
    issues.push({
      id: "html-lang",
      type: "accessibility",
      severity: "medium",
      message: "Document language is missing",
      suggestion: "Add a lang attribute to the html element",
    });
  }

  return issues;
}
