import { describe, it, expect } from "vitest";
import { generateCsrfToken, validateCsrf } from "./security";
import { NextRequest } from "next/server";

describe("security", () => {
  describe("generateCsrfToken", () => {
    it("should generate a 64-character hex string", () => {
      const token = generateCsrfToken();
      expect(token).toHaveLength(64);
      expect(/^[0-9a-f]+$/i.test(token)).toBe(true);
    });

    it("should generate unique tokens", () => {
      const t1 = generateCsrfToken();
      const t2 = generateCsrfToken();
      expect(t1).not.toBe(t2);
    });
  });

  describe("validateCsrf", () => {
    it("should allow GET requests without CSRF token", () => {
      const req = new NextRequest("http://localhost/api/test", { method: "GET" });
      expect(validateCsrf(req)).toBe(true);
    });
  });
});
