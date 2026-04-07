import { load } from "cheerio";
import { describe, expect, it } from "vitest";
import {
  checkImageDimensions,
  checkLazyLoadedImages,
  checkLargeDomSize,
  checkStylesheetCount,
} from "./performance";

describe("performance audit rules", () => {
  it("uses calibrated thresholds for DOM size", () => {
    const smallDom = load(`<body>${"<div></div>".repeat(1600)}</body>`);
    const mediumDom = load(`<body>${"<div></div>".repeat(2600)}</body>`);
    const largeDom = load(`<body>${"<div></div>".repeat(4200)}</body>`);

    expect(checkLargeDomSize(smallDom)[0]?.severity).toBe("low");
    expect(checkLargeDomSize(mediumDom)[0]?.severity).toBe("medium");
    expect(checkLargeDomSize(largeDom)[0]?.severity).toBe("high");
  });

  it("skips tiny or svg-like images when checking lazy loading and dimensions", () => {
    const $ = load(`
      <img src="/hero.jpg" width="1200" height="800" />
      <img src="/thumb.jpg" width="48" height="48" />
      <img src="/icon.svg" />
      <img src="/gallery-1.jpg" />
      <img src="/gallery-2.jpg" />
      <img src="/gallery-3.jpg" />
      <img src="/gallery-4.jpg" />
    `);

    expect(checkLazyLoadedImages($)).toHaveLength(1);
    expect(checkImageDimensions($)).toHaveLength(1);
  });

  it("only flags stylesheet count when it crosses the tuned thresholds", () => {
    const mild = load(`
      <head>${'<link rel="stylesheet" href="/a.css" />'.repeat(6)}</head>
    `);
    const heavy = load(`
      <head>${'<link rel="stylesheet" href="/a.css" />'.repeat(13)}</head>
    `);

    expect(checkStylesheetCount(mild)[0]?.severity).toBe("low");
    expect(checkStylesheetCount(heavy)[0]?.severity).toBe("high");
  });
});
