import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const wrangler = fileURLToPath(
  new URL("../node_modules/.bin/wrangler", import.meta.url),
);

function waitForReady(child, output) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error(`Wrangler did not start:\n${output.text}`)),
      20_000,
    );
    const inspect = (chunk) => {
      output.text += chunk.toString();
      if (output.text.includes("Ready on")) {
        clearTimeout(timeout);
        resolve();
      }
    };

    child.stdout.on("data", inspect);
    child.stderr.on("data", inspect);
    child.once("exit", (code) => {
      clearTimeout(timeout);
      reject(new Error(`Wrangler exited with ${code}:\n${output.text}`));
    });
  });
}

async function stop(child) {
  if (child.exitCode !== null) return;
  child.kill("SIGTERM");
  await Promise.race([
    once(child, "exit"),
    new Promise((resolve) =>
      setTimeout(() => {
        child.kill("SIGKILL");
        resolve();
      }, 3_000),
    ),
  ]);
}

test(
  "production build renders inside Cloudflare Workerd",
  { timeout: 30_000 },
  async () => {
    const port = 32_000 + (process.pid % 1_000);
    const output = { text: "" };
    const child = spawn(
      wrangler,
      ["dev", "--config", "dist/server/wrangler.json", "--port", String(port)],
      {
        cwd: projectRoot,
        env: {
          ...process.env,
          WRANGLER_LOG_PATH: ".wrangler/workerd-smoke.log",
        },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    try {
      await waitForReady(child, output);
      const response = await fetch(`http://127.0.0.1:${port}/`);
      const html = await response.text();

      assert.equal(response.status, 200, output.text);
      assert.match(
        response.headers.get("content-type") ?? "",
        /^text\/html\b/i,
      );
      assert.doesNotMatch(html, /This page couldn.t load|id="__next_error__"/i);
      assert.match(html, /把业务难题/);
    } finally {
      await stop(child);
    }
  },
);
