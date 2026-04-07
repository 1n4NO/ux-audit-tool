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
        group: "Images",
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
        id: `btn-${i}`,
        type: "accessibility",
        group: "Forms",
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
        group: "Forms",
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
        group: "Links",
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
      group: "Document",
      severity: "medium",
      message: "Document language is missing",
      suggestion: "Add a lang attribute to the html element",
    });
  }

  return issues;
}

export function checkBrokenActionLinks($: CheerioAPI): AuditIssue[] {
  const issues: AuditIssue[] = [];

  $("a").each((i, el) => {
    const href = $(el).attr("href")?.trim().toLowerCase();

    if (!href || href === "#" || href.startsWith("javascript:")) {
      issues.push({
        id: `link-action-${i}`,
        type: "accessibility",
        group: "Links",
        severity: "medium",
        message: "Link uses a non-navigational href",
        suggestion: "Use a real destination URL or use a button for actions",
      });
    }
  });

  return issues;
}

export function checkMainLandmark($: CheerioAPI): AuditIssue[] {
  const issues: AuditIssue[] = [];

  if ($("main, [role='main']").length === 0) {
    issues.push({
      id: "main-landmark",
      type: "accessibility",
      group: "Document",
      severity: "medium",
      message: "Page is missing a main landmark",
      suggestion: "Add a main element or role='main' around primary content",
    });
  }

  return issues;
}

export function checkIframesTitle($: CheerioAPI): AuditIssue[] {
  const issues: AuditIssue[] = [];

  $("iframe").each((i, el) => {
    const title = $(el).attr("title")?.trim();

    if (!title) {
      issues.push({
        id: `iframe-title-${i}`,
        type: "accessibility",
        group: "Media",
        severity: "high",
        message: "Iframe is missing a title",
        suggestion: "Add a descriptive title so assistive technology can identify the frame",
      });
    }
  });

  return issues;
}

export function checkMediaControls($: CheerioAPI): AuditIssue[] {
  const issues: AuditIssue[] = [];

  $("audio, video").each((i, el) => {
    const hasControls = $(el).attr("controls") !== undefined;

    if (!hasControls) {
      issues.push({
        id: `media-controls-${i}`,
        type: "accessibility",
        group: "Media",
        severity: "medium",
        message: "Embedded media is missing controls",
        suggestion: "Add controls so users can play, pause, and navigate media",
      });
    }
  });

  return issues;
}

export function checkFormSubmitButtons($: CheerioAPI): AuditIssue[] {
  const issues: AuditIssue[] = [];

  $("form").each((i, el) => {
    const submitControl = $(el).find(
      "button[type='submit'], input[type='submit'], button:not([type])"
    );

    if (submitControl.length === 0) {
      issues.push({
        id: `form-submit-${i}`,
        type: "accessibility",
        group: "Forms",
        severity: "medium",
        message: "Form has no submit control",
        suggestion: "Add a submit button so users can complete the form",
      });
    }
  });

  return issues;
}
