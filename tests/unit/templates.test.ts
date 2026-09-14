import { describe, expect, it } from "vitest";
import { renderTemplate } from "@/services/templates";

describe("renderTemplate", () => {
  it("replaces known variables", () => {
    expect(
      renderTemplate("Hi {{name}}, your {{service}} visit is set.", {
        name: "Kumar",
        service: "plumbing",
      }),
    ).toBe("Hi Kumar, your plumbing visit is set.");
  });

  it("tolerates whitespace inside braces", () => {
    expect(renderTemplate("Hi {{ name }}!", { name: "A" })).toBe("Hi A!");
  });

  it("leaves unknown variables untouched", () => {
    expect(renderTemplate("Hi {{name}}, {{mystery}}", { name: "B" })).toBe(
      "Hi B, {{mystery}}",
    );
  });
});
