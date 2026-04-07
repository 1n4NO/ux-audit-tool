import { AuditIssue } from "@/app/types/audit";
import { CheerioAPI } from "cheerio";

export function checkRenderBlockingScripts($: CheerioAPI): AuditIssue[] {
  const issues: AuditIssue[] = [];

  $("head script[src]").each((i, el) => {
    const isAsync = $(el).attr("async") !== undefined;
    const isDeferred = $(el).attr("defer") !== undefined;
    const type = $(el).attr("type")?.trim().toLowerCase();

    if (!isAsync && !isDeferred && type !== "module") {
      issues.push({
        id: `render-blocking-script-${i}`,
        type: "performance",
        group: "Document",
        severity: "high",
        message: "Script in head may block rendering",
        suggestion: "Use defer, async, or module scripts when possible",
      });
    }
  });

  return issues;
}

export function checkLargeDomSize($: CheerioAPI): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const elementCount = $("*").length;

  if (elementCount > 1500) {
    issues.push({
      id: "dom-size-large",
      type: "performance",
      group: "Document",
      severity: elementCount > 3000 ? "high" : "medium",
      message: "Page has a large DOM size",
      suggestion: "Reduce unnecessary markup and deeply nested elements",
    });
  }

  return issues;
}

export function checkLazyLoadedImages($: CheerioAPI): AuditIssue[] {
  const issues: AuditIssue[] = [];

  $("img").each((i, el) => {
    if (i < 2) {
      return;
    }

    const loading = $(el).attr("loading")?.trim().toLowerCase();

    if (loading !== "lazy") {
      issues.push({
        id: `image-lazy-${i}`,
        type: "performance",
        group: "Images",
        severity: "medium",
        message: "Offscreen image is missing lazy loading",
        suggestion: "Add loading='lazy' to non-critical images",
      });
    }
  });

  return issues;
}

export function checkImageDimensions($: CheerioAPI): AuditIssue[] {
  const issues: AuditIssue[] = [];

  $("img").each((i, el) => {
    const width = $(el).attr("width")?.trim();
    const height = $(el).attr("height")?.trim();

    if (!width || !height) {
      issues.push({
        id: `image-dimensions-${i}`,
        type: "performance",
        group: "Images",
        severity: "medium",
        message: "Image is missing explicit dimensions",
        suggestion: "Set width and height to reduce layout shifts",
      });
    }
  });

  return issues;
}

export function checkLazyLoadedIframes($: CheerioAPI): AuditIssue[] {
  const issues: AuditIssue[] = [];

  $("iframe").each((i, el) => {
    const loading = $(el).attr("loading")?.trim().toLowerCase();

    if (loading !== "lazy") {
      issues.push({
        id: `iframe-lazy-${i}`,
        type: "performance",
        group: "Media",
        severity: "medium",
        message: "Iframe is missing lazy loading",
        suggestion: "Add loading='lazy' to defer offscreen iframe work",
      });
    }
  });

  return issues;
}

export function checkStylesheetCount($: CheerioAPI): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const stylesheetCount = $('link[rel="stylesheet"]').length;

  if (stylesheetCount > 4) {
    issues.push({
      id: "stylesheet-count",
      type: "performance",
      group: "Metadata",
      severity: stylesheetCount > 8 ? "high" : "medium",
      message: "Page uses many stylesheet files",
      suggestion: "Reduce stylesheet requests or combine non-critical CSS",
    });
  }

  return issues;
}
