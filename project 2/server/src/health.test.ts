import { describe, expect, it } from "vitest";
import { healthStatus } from "./health.js";

describe("API health response", () => {
  it("reports the service as ready", () => {
    expect(healthStatus()).toEqual({ status: "ok" });
  });
});
