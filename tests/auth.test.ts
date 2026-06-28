import { describe, it, expect } from "vitest";
import { checkBasicAuth } from "@/lib/auth";

function header(user: string, pass: string): string {
  return "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");
}

describe("checkBasicAuth", () => {
  it("accepts the correct password (any username)", () => {
    expect(checkBasicAuth(header("me", "secret"), "secret")).toBe(true);
  });
  it("rejects a wrong password", () => {
    expect(checkBasicAuth(header("me", "nope"), "secret")).toBe(false);
  });
  it("rejects a missing header", () => {
    expect(checkBasicAuth(null, "secret")).toBe(false);
  });
  it("rejects a non-Basic header", () => {
    expect(checkBasicAuth("Bearer xyz", "secret")).toBe(false);
  });
});
