import { load } from "cheerio";
import { describe, expect, it } from "vitest";
import {
  checkMetaDescription,
  checkPageLength,
  checkParagraphLength,
} from "./typography";

describe("readability audit rules", () => {
  it("uses graduated paragraph-length severity", () => {
    const mediumParagraph = "word ".repeat(95);
    const lowParagraph = "word ".repeat(60);
    const $ = load(`
      <p>${lowParagraph}</p>
      <p>${mediumParagraph}</p>
    `);

    const issues = checkParagraphLength($);

    expect(issues).toHaveLength(2);
    expect(issues[0]?.severity).toBe("low");
    expect(issues[1]?.severity).toBe("medium");
  });

  it("treats missing meta description as low severity", () => {
    const $ = load("<html><head></head><body><main><p>Hello world</p></main></body></html>");

    const issues = checkMetaDescription($);

    expect(issues).toHaveLength(1);
    expect(issues[0]?.severity).toBe("low");
  });

  it("only flags thin pages when content is genuinely sparse", () => {
    const sparse = load("<body><main><p>Short text</p></main></body>");
    const structured = load(`
      <body>
        <main>
          <section><p>Short text</p></section>
          <section><p>Another short text</p></section>
          <ul><li>One</li><li>Two</li></ul>
        </main>
      </body>
    `);

    expect(checkPageLength(sparse)).toHaveLength(1);
    expect(checkPageLength(structured)).toHaveLength(0);
  });
});
