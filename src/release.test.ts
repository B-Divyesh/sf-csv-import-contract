import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("static release policy", () => {
  it("ships CSP, feature restrictions, manifest MIME, and immutable asset caching", () => {
    const config = JSON.parse(readFileSync("public/staticwebapp.config.json", "utf8")) as {
      globalHeaders: Record<string, string>;
      mimeTypes: Record<string, string>;
      routes: Array<{ route: string; headers?: Record<string, string> }>;
    };
    expect(config.globalHeaders["Content-Security-Policy"]).toContain("default-src 'self'");
    expect(config.globalHeaders["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
    expect(config.globalHeaders["Permissions-Policy"]).toContain("camera=()");
    expect(config.globalHeaders["X-Frame-Options"]).toBe("DENY");
    expect(config.mimeTypes[".webmanifest"]).toBe("application/manifest+json");
    expect(config.routes.find((route) => route.route === "/assets/*")?.headers?.["Cache-Control"]).toBe("public, max-age=31536000, immutable");
    expect(config.routes.find((route) => route.route === "/sw.js")?.headers?.["Cache-Control"]).toContain("no-cache");
  });
});
