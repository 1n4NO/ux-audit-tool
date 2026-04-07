import { load } from "cheerio";
import { describe, expect, it } from "vitest";
import {
  checkButtons,
  checkBrokenActionLinks,
  checkInputs,
  checkLinks,
} from "./accessibility";

describe("accessibility audit rules", () => {
  it("does not flag buttons that have an accessible name through aria-label or image alt text", () => {
    const $ = load(`
      <button aria-label="Open menu"></button>
      <button><img src="/menu.svg" alt="Menu" /></button>
      <button></button>
    `);

    const issues = checkButtons($);

    expect(issues).toHaveLength(1);
    expect(issues[0]?.message).toBe("Button has no label");
  });

  it("accepts explicit labels for inputs and flags unlabeled text inputs", () => {
    const $ = load(`
      <label for="email">Email</label>
      <input id="email" type="email" />
      <input aria-label="Search" type="search" />
      <input type="text" />
    `);

    const issues = checkInputs($);

    expect(issues).toHaveLength(1);
    expect(issues[0]?.message).toBe("Input field missing label");
  });

  it("flags empty links and javascript action links", () => {
    const $ = load(`
      <a href="#section">Read more</a>
      <a href="javascript:void(0)"></a>
      <a href="#"></a>
    `);

    expect(checkLinks($)).toHaveLength(2);
    expect(checkBrokenActionLinks($)).toHaveLength(2);
  });
});
