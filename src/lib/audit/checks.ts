export type AuditCheckGroup =
  | "Document"
  | "Forms"
  | "Headings"
  | "Images"
  | "Links"
  | "Media"
  | "Metadata"
  | "Content";

export type AuditCheckDefinition = {
  id: string;
  label: string;
  group: AuditCheckGroup;
};

export const AUDIT_CHECKS: AuditCheckDefinition[] = [
  { id: "images-alt", label: "Images missing alt text", group: "Images" },
  { id: "buttons-label", label: "Buttons without labels", group: "Forms" },
  { id: "inputs-label", label: "Inputs missing labels", group: "Forms" },
  { id: "links-name", label: "Links without accessible names", group: "Links" },
  { id: "document-language", label: "Missing document language", group: "Document" },
  { id: "links-action", label: "Non-navigational links", group: "Links" },
  { id: "main-landmark", label: "Missing main landmark", group: "Document" },
  { id: "iframes-title", label: "Iframes missing titles", group: "Media" },
  { id: "media-controls", label: "Media without controls", group: "Media" },
  { id: "forms-submit", label: "Forms without submit controls", group: "Forms" },
  { id: "paragraph-length", label: "Overly long paragraphs", group: "Content" },
  { id: "page-title", label: "Missing page title", group: "Metadata" },
  { id: "heading-structure", label: "Heading structure issues", group: "Headings" },
  { id: "meta-description", label: "Missing meta description", group: "Metadata" },
  { id: "heading-text", label: "Empty headings", group: "Headings" },
  { id: "empty-lists", label: "Empty lists", group: "Content" },
  { id: "page-length", label: "Very thin page content", group: "Content" },
];

export const AUDIT_CHECK_IDS = AUDIT_CHECKS.map((check) => check.id);
