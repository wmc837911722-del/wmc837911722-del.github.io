import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("ticker keeps enough repeated, viewport-wide content to avoid a blank tail", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/home.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /\[0,\s*1,\s*2\]\.map/, "ticker must render three repeated groups");
  assert.match(css, /\.ticker-group\s*\{[^}]*min-width:\s*100vw/s, "each ticker group must cover at least one viewport");
  assert.match(page, /xPercent:\s*-33\.333/, "scroll distance must equal exactly one of three groups");
});
