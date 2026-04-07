import { load } from "cheerio";
import { describe, expect, it } from "vitest";
import { runAudit } from "./index";

describe("runAudit", () => {
  it("normalizes scores against only the enabled checks", async () => {
    const $ = load(`
      <html>
        <head>
          <title>Example page</title>
        </head>
        <body>
          <main>
            <img src="/hero.jpg" />
            <button></button>
          </main>
        </body>
      </html>
    `);

    const result = await runAudit($, ["images-alt", "buttons-label"]);

    expect(result.categories.readability).toBe(100);
    expect(result.categories.performance).toBe(100);
    expect(result.categories.accessibility).toBeLessThan(100);
    expect(result.score).toBe(result.categories.accessibility);
  });

  it("returns the page title in the audit result", async () => {
    const $ = load(`
      <html>
        <head>
          <title>Audit Fixture</title>
        </head>
        <body><main><p>Hello</p></main></body>
      </html>
    `);

    const result = await runAudit($, ["page-title"]);

    expect(result.pageTitle).toBe("Audit Fixture");
  });
});
