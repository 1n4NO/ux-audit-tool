import { checkImagesAlt, checkButtons, checkInputs } from "./accessibility";
import { checkParagraphLength } from "./typography";

export async function runAudit($: any) {
  const issues = [
    ...checkImagesAlt($),
    ...checkButtons($),
    ...checkInputs($),
    ...checkParagraphLength($),
  ];

  const accessibility = issues.filter(i => i.type === "accessibility").length;
  const readability = issues.filter(i => i.type === "readability").length;

  const accessibilityScore = 100 - accessibility * 5;
  const readabilityScore = 100 - readability * 3;
  const performanceScore = 80;

  const score = Math.round(
    (accessibilityScore + readabilityScore + performanceScore) / 3
  );

  return {
    score,
    categories: {
      accessibility: accessibilityScore,
      readability: readabilityScore,
      performance: performanceScore,
    },
    issues,
  };
}