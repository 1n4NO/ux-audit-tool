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
import { AuditIssue, AuditResult } from "@/app/types/audit";
import { CheerioAPI } from "cheerio";
import { AUDIT_CHECK_IDS } from "./checks";

const SEVERITY_DEDUCTION = {
  low: 5,
  medium: 10,
  high: 20,
} as const;

function calculateCategoryScore(issues: AuditIssue[], type: AuditIssue["type"]) {
  const totalDeduction = issues
    .filter((issue) => issue.type === type)
    .reduce((sum, issue) => sum + SEVERITY_DEDUCTION[issue.severity], 0);

  return Math.max(0, 100 - totalDeduction);
}

type AuditCheckRunner = {
  id: string;
  run: (root: CheerioAPI) => AuditIssue[];
};

const CHECK_RUNNERS: AuditCheckRunner[] = [
  { id: "images-alt", run: checkImagesAlt },
  { id: "buttons-label", run: checkButtons },
  { id: "inputs-label", run: checkInputs },
  { id: "links-name", run: checkLinks },
  { id: "document-language", run: checkDocumentLanguage },
  { id: "links-action", run: checkBrokenActionLinks },
  { id: "main-landmark", run: checkMainLandmark },
  { id: "iframes-title", run: checkIframesTitle },
  { id: "media-controls", run: checkMediaControls },
  { id: "forms-submit", run: checkFormSubmitButtons },
  { id: "paragraph-length", run: checkParagraphLength },
  { id: "page-title", run: checkPageTitle },
  { id: "heading-structure", run: checkHeadingStructure },
  { id: "meta-description", run: checkMetaDescription },
  { id: "heading-text", run: checkHeadingText },
  { id: "empty-lists", run: checkEmptyLists },
  { id: "page-length", run: checkPageLength },
];

export async function runAudit(
  $: CheerioAPI,
  selectedChecks: string[] = AUDIT_CHECK_IDS
): Promise<AuditResult> {
  const enabledChecks = new Set(
    selectedChecks.filter((checkId) => AUDIT_CHECK_IDS.includes(checkId))
  );
  const issues = CHECK_RUNNERS.flatMap((check) => {
    if (!enabledChecks.has(check.id)) {
      return [];
    }

    return check.run($);
  });

  const accessibilityScore = calculateCategoryScore(issues, "accessibility");
  const readabilityScore = calculateCategoryScore(issues, "readability");

  const score = Math.round(
    (accessibilityScore + readabilityScore) / 2
  );

  return {
    score,
    categories: {
      accessibility: accessibilityScore,
      readability: readabilityScore,
    },
    issues,
  };
}
