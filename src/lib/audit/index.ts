import {
  checkImagesAlt,
  checkButtons,
  checkInputs,
  checkLinks,
  checkDocumentLanguage,
  checkBrokenActionLinks,
  checkMainLandmark,
  checkIframesTitle,
  checkMediaControls,
  checkFormSubmitButtons,
} from "./accessibility";
import {
  checkParagraphLength,
  checkPageTitle,
  checkHeadingStructure,
  checkMetaDescription,
  checkHeadingText,
  checkEmptyLists,
  checkPageLength,
} from "./typography";
import {
  checkRenderBlockingScripts,
  checkLargeDomSize,
  checkLazyLoadedImages,
  checkImageDimensions,
  checkLazyLoadedIframes,
  checkStylesheetCount,
} from "./performance";
import { AuditIssue, AuditResult } from "@/app/types/audit";
import { CheerioAPI } from "cheerio";
import { AUDIT_CHECK_IDS } from "./checks";

const SEVERITY_DEDUCTION = {
  low: 5,
  medium: 10,
  high: 20,
} as const;

type AuditCheckRunner = {
  id: string;
  type: AuditIssue["type"];
  maxDeduction: number;
  run: (root: CheerioAPI) => AuditIssue[];
};

type CheckResult = {
  id: string;
  type: AuditIssue["type"];
  maxDeduction: number;
  issues: AuditIssue[];
};

const CHECK_RUNNERS: AuditCheckRunner[] = [
  { id: "images-alt", type: "accessibility", maxDeduction: 30, run: checkImagesAlt },
  { id: "buttons-label", type: "accessibility", maxDeduction: 20, run: checkButtons },
  { id: "inputs-label", type: "accessibility", maxDeduction: 30, run: checkInputs },
  { id: "links-name", type: "accessibility", maxDeduction: 20, run: checkLinks },
  { id: "document-language", type: "accessibility", maxDeduction: 15, run: checkDocumentLanguage },
  { id: "links-action", type: "accessibility", maxDeduction: 20, run: checkBrokenActionLinks },
  { id: "main-landmark", type: "accessibility", maxDeduction: 20, run: checkMainLandmark },
  { id: "iframes-title", type: "accessibility", maxDeduction: 30, run: checkIframesTitle },
  { id: "media-controls", type: "accessibility", maxDeduction: 20, run: checkMediaControls },
  { id: "forms-submit", type: "accessibility", maxDeduction: 20, run: checkFormSubmitButtons },
  { id: "paragraph-length", type: "readability", maxDeduction: 20, run: checkParagraphLength },
  { id: "page-title", type: "readability", maxDeduction: 30, run: checkPageTitle },
  { id: "heading-structure", type: "readability", maxDeduction: 25, run: checkHeadingStructure },
  { id: "meta-description", type: "readability", maxDeduction: 20, run: checkMetaDescription },
  { id: "heading-text", type: "readability", maxDeduction: 20, run: checkHeadingText },
  { id: "empty-lists", type: "readability", maxDeduction: 10, run: checkEmptyLists },
  { id: "page-length", type: "readability", maxDeduction: 10, run: checkPageLength },
  { id: "render-blocking-scripts", type: "performance", maxDeduction: 30, run: checkRenderBlockingScripts },
  { id: "dom-size", type: "performance", maxDeduction: 25, run: checkLargeDomSize },
  { id: "images-lazy-loading", type: "performance", maxDeduction: 25, run: checkLazyLoadedImages },
  { id: "image-dimensions", type: "performance", maxDeduction: 25, run: checkImageDimensions },
  { id: "iframes-lazy-loading", type: "performance", maxDeduction: 20, run: checkLazyLoadedIframes },
  { id: "stylesheet-count", type: "performance", maxDeduction: 20, run: checkStylesheetCount },
];

function calculateCheckDeduction(issues: AuditIssue[], maxDeduction: number) {
  const totalDeduction = issues.reduce(
    (sum, issue) => sum + SEVERITY_DEDUCTION[issue.severity],
    0
  );

  return Math.min(totalDeduction, maxDeduction);
}

function calculateCategoryScore(results: CheckResult[], type: AuditIssue["type"]) {
  const categoryResults = results.filter((result) => result.type === type);

  if (categoryResults.length === 0) {
    return null;
  }

  const maxDeduction = categoryResults.reduce(
    (sum, result) => sum + result.maxDeduction,
    0
  );
  const actualDeduction = categoryResults.reduce(
    (sum, result) => sum + calculateCheckDeduction(result.issues, result.maxDeduction),
    0
  );

  return Math.max(0, Math.round(100 - (actualDeduction / maxDeduction) * 100));
}

export async function runAudit(
  $: CheerioAPI,
  selectedChecks: string[] = AUDIT_CHECK_IDS
): Promise<AuditResult> {
  const enabledChecks = new Set(
    selectedChecks.filter((checkId) => AUDIT_CHECK_IDS.includes(checkId))
  );
  const results = CHECK_RUNNERS.flatMap<CheckResult>((check) => {
    if (!enabledChecks.has(check.id)) {
      return [];
    }

    return [
      {
        id: check.id,
        type: check.type,
        maxDeduction: check.maxDeduction,
        issues: check.run($),
      },
    ];
  });
  const issues = results.flatMap((result) => result.issues);

  const accessibilityScore = calculateCategoryScore(results, "accessibility");
  const readabilityScore = calculateCategoryScore(results, "readability");
  const performanceScore = calculateCategoryScore(results, "performance");
  const categoryScores = [accessibilityScore, readabilityScore, performanceScore].filter(
    (value): value is number => value !== null
  );

  const score =
    categoryScores.length > 0
      ? Math.round(
          categoryScores.reduce((sum, value) => sum + value, 0) / categoryScores.length
        )
      : 100;

  return {
    score,
    categories: {
      accessibility: accessibilityScore ?? 100,
      readability: readabilityScore ?? 100,
      performance: performanceScore ?? 100,
    },
    issues,
  };
}
