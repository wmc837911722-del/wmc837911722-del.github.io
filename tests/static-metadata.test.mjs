import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("portfolio metadata stays static for edge hosting", async () => {
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");

  assert.doesNotMatch(layout, /from ["']next\/headers["']/, "request headers force a private dynamic render on the edge");
  assert.doesNotMatch(layout, /generateMetadata/, "metadata should not require a fresh server render");
  assert.match(layout, /export const metadata\s*:\s*Metadata\s*=/, "layout should export static metadata");
  assert.match(layout, /metadataBase:\s*new URL\(/, "relative social assets need a stable public metadata base");
});
