import { AuditIssue } from "@/app/types/audit";
import { CheerioAPI } from "cheerio";

export function checkRenderBlockingScripts($: CheerioAPI): AuditIssue[] {
  let blockingScriptCount = 0;

  $("head script[src]").each((_, el) => {
    const isAsync = $(el).attr("async") !== undefined;
    const isDeferred = $(el).attr("defer") !== undefined;
    const type = $(el).attr("type")?.trim().toLowerCase();

    if (!isAsync && !isDeferred && type !== "module") {
      blockingScriptCount += 1;
    }
  });

  if (blockingScriptCount === 0) {
    return [];
  }

  return [
    {
      id: "render-blocking-scripts",
      type: "performance",
      group: "Document",
      severity: blockingScriptCount >= 3 ? "high" : "medium",
      message: `${blockingScriptCount} head script${
        blockingScriptCount === 1 ? "" : "s"
      } may block rendering`,
      suggestion: "Use defer, async, or module scripts when possible",
    },
  ];
}

export function checkLargeDomSize($: CheerioAPI): AuditIssue[] {
  const elementCount = $("*").length;

  if (elementCount > 4000) {
    return [
      {
        id: "dom-size-large",
        type: "performance",
        group: "Document",
        severity: "high",
        message: `Page has a very large DOM size (${elementCount} elements)`,
        suggestion: "Reduce unnecessary markup and deeply nested elements",
      },
    ];
  }

  if (elementCount > 2500) {
    return [
      {
        id: "dom-size-large",
        type: "performance",
        group: "Document",
        severity: "medium",
        message: `Page has a large DOM size (${elementCount} elements)`,
        suggestion: "Reduce unnecessary markup and deeply nested elements",
      },
    ];
  }

  if (elementCount > 1500) {
    return [
      {
        id: "dom-size-large",
        type: "performance",
        group: "Document",
        severity: "low",
        message: `Page DOM is getting large (${elementCount} elements)`,
        suggestion: "Keep DOM size under control to reduce layout and rendering work",
      },
    ];
  }

  return [];
}

export function checkLazyLoadedImages($: CheerioAPI): AuditIssue[] {
  let nonLazyImageCount = 0;

  $("img").each((i, el) => {
    if (i < 3) {
      return;
    }

    const src = $(el).attr("src")?.trim().toLowerCase() || "";
    const loading = $(el).attr("loading")?.trim().toLowerCase();
    const fetchPriority = $(el).attr("fetchpriority")?.trim().toLowerCase();
    const width = Number($(el).attr("width"));
    const height = Number($(el).attr("height"));

    if (
      fetchPriority === "high" ||
      src.startsWith("data:image/svg") ||
      src.endsWith(".svg") ||
      (Number.isFinite(width) && Number.isFinite(height) && width <= 64 && height <= 64)
    ) {
      return;
    }

    if (loading !== "lazy") {
      nonLazyImageCount += 1;
    }
  });

  if (nonLazyImageCount < 3) {
    return [];
  }

  return [
    {
      id: "images-lazy-loading",
      type: "performance",
      group: "Images",
      severity:
        nonLazyImageCount >= 10 ? "high" : nonLazyImageCount >= 6 ? "medium" : "low",
      message: `${nonLazyImageCount} non-critical image${
        nonLazyImageCount === 1 ? "" : "s"
      } may be missing lazy loading`,
      suggestion: "Add loading='lazy' to non-critical images",
    },
  ];
}

export function checkImageDimensions($: CheerioAPI): AuditIssue[] {
  let missingDimensionCount = 0;

  $("img").each((_, el) => {
    const src = $(el).attr("src")?.trim().toLowerCase() || "";
    const width = $(el).attr("width")?.trim();
    const height = $(el).attr("height")?.trim();

    if (src.startsWith("data:image/svg") || src.endsWith(".svg")) {
      return;
    }

    if (!width || !height) {
      missingDimensionCount += 1;
    }
  });

  if (missingDimensionCount < 3) {
    return [];
  }

  return [
    {
      id: "image-dimensions",
      type: "performance",
      group: "Images",
      severity:
        missingDimensionCount >= 10 ? "high" : missingDimensionCount >= 6 ? "medium" : "low",
      message: `${missingDimensionCount} image${
        missingDimensionCount === 1 ? "" : "s"
      } are missing explicit dimensions`,
      suggestion: "Set width and height to reduce layout shifts",
    },
  ];
}

export function checkLazyLoadedIframes($: CheerioAPI): AuditIssue[] {
  let nonLazyIframeCount = 0;

  $("iframe").each((_, el) => {
    const loading = $(el).attr("loading")?.trim().toLowerCase();

    if (loading !== "lazy") {
      nonLazyIframeCount += 1;
    }
  });

  if (nonLazyIframeCount === 0) {
    return [];
  }

  return [
    {
      id: "iframes-lazy-loading",
      type: "performance",
      group: "Media",
      severity:
        nonLazyIframeCount >= 4 ? "high" : nonLazyIframeCount >= 2 ? "medium" : "low",
      message: `${nonLazyIframeCount} iframe${
        nonLazyIframeCount === 1 ? "" : "s"
      } may be loading too early`,
      suggestion: "Add loading='lazy' to defer offscreen iframe work",
    },
  ];
}

export function checkStylesheetCount($: CheerioAPI): AuditIssue[] {
  const stylesheetCount = $('link[rel="stylesheet"]').length;

  if (stylesheetCount > 12) {
    return [
      {
        id: "stylesheet-count",
        type: "performance",
        group: "Metadata",
        severity: "high",
        message: `Page loads ${stylesheetCount} stylesheet files`,
        suggestion: "Reduce stylesheet requests or combine non-critical CSS",
      },
    ];
  }

  if (stylesheetCount > 8) {
    return [
      {
        id: "stylesheet-count",
        type: "performance",
        group: "Metadata",
        severity: "medium",
        message: `Page loads ${stylesheetCount} stylesheet files`,
        suggestion: "Reduce stylesheet requests or combine non-critical CSS",
      },
    ];
  }

  if (stylesheetCount > 5) {
    return [
      {
        id: "stylesheet-count",
        type: "performance",
        group: "Metadata",
        severity: "low",
        message: `Page loads ${stylesheetCount} stylesheet files`,
        suggestion: "Review whether all stylesheet requests are necessary",
      },
    ];
  }

  return [];
}
