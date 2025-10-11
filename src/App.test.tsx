import { describe, it, expect } from "vitest";

describe("App tests", () => {
  it("should have a working test environment", () => {
    expect(true).toBe(true);
  });

  it("should have document available", () => {
    expect(document).toBeDefined();
    expect(document.body).toBeInTheDocument();
  });
});
