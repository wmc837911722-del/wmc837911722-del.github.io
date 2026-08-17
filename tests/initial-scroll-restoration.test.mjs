import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const projectRoot = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, projectRoot), "utf8");

function firstGithubHeadScript(html) {
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1];
  assert.ok(head, "github-pages/index.html should contain a head element");

  const script = head.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i)?.[1];
  assert.ok(script, "github-pages/index.html should contain an early boot script");
  return script;
}

function firstLayoutHeadScript(layout) {
  const head = layout.match(/<head\b[^>]*>([\s\S]*?)<\/head>/)?.[1];
  assert.ok(head, "app/root-document.tsx should render a head element");

  const identifier = head.match(
    /<script\b[^>]*dangerouslySetInnerHTML=\{\{\s*__html:\s*([A-Za-z_$][\w$]*)\s*\}\}[^>]*\/>/,
  )?.[1];
  assert.ok(
    identifier,
    "the first layout head script should be an inline boot script",
  );

  const declaration = new RegExp(
    "const\\s+" + identifier + "\\s*=\\s*(?:String\\.raw)?`([\\s\\S]*?)`;",
  );
  const script = layout.match(declaration)?.[1];
  assert.ok(script, `expected ${identifier} to be an inline script literal`);
  return script;
}

function runBootScript(script, hash) {
  const scrollCalls = [];
  const scrollBehaviorChanges = [];
  const listeners = new Map();
  const themeMeta = { content: "#080b12" };
  let scrollBehavior = "";
  const rootStyle = {};
  Object.defineProperty(rootStyle, "scrollBehavior", {
    get: () => scrollBehavior,
    set: (value) => {
      scrollBehavior = value;
      scrollBehaviorChanges.push(value);
    },
  });
  const context = {
    document: {
      documentElement: { dataset: {}, style: rootStyle },
      querySelector: () => themeMeta,
    },
    history: { scrollRestoration: "auto" },
    location: { hash },
    localStorage: { getItem: () => null },
    matchMedia: () => ({ matches: false }),
    scrollTo: (...args) => scrollCalls.push(args),
    addEventListener: (type, listener) => listeners.set(type, listener),
    requestAnimationFrame: (callback) => callback(),
    setTimeout: (callback) => callback(),
  };
  context.window = context;

  vm.runInNewContext(script, context);

  return {
    history: context.history,
    scrollCalls,
    scrollBehaviorChanges,
    rootStyle,
    pageshow: listeners.get("pageshow"),
  };
}

test("the earliest boot script restores root pages to the top without overriding hash navigation", async (t) => {
  const [layout, githubHtml] = await Promise.all([
    read("app/root-document.tsx"),
    read("github-pages/index.html"),
  ]);
  const entries = [
    ["Sites layout", firstLayoutHeadScript(layout)],
    ["GitHub Pages", firstGithubHeadScript(githubHtml)],
  ];

  for (const [name, script] of entries) {
    await t.test(name, () => {
      const root = runBootScript(script, "");

      assert.equal(
        root.history.scrollRestoration,
        "manual",
        "the earliest script must disable browser scroll restoration",
      );
      assert.deepEqual(
        root.scrollCalls,
        [[0, 0]],
        "a root URL should start at the top",
      );
      assert.deepEqual(
        root.scrollBehaviorChanges,
        ["auto", ""],
        "the initial reset should bypass smooth scrolling without changing the site preference",
      );
      assert.equal(
        typeof root.pageshow,
        "function",
        "the boot script should listen for pageshow to handle bfcache restores",
      );

      root.scrollCalls.length = 0;
      root.pageshow({ persisted: false });
      assert.deepEqual(
        root.scrollCalls,
        [[0, 0]],
        "a normal pageshow event should win the race with late browser restoration",
      );
      assert.equal(
        root.history.scrollRestoration,
        "auto",
        "native restoration should resume after the entry has been normalized",
      );
      assert.equal(root.rootStyle.scrollBehavior, "");
      root.scrollCalls.length = 0;
      root.pageshow({ persisted: true });
      assert.deepEqual(
        root.scrollCalls,
        [[0, 0]],
        "a bfcache-restored root URL should return to the top",
      );
      assert.equal(root.history.scrollRestoration, "auto");

      const anchored = runBootScript(script, "#case-study");
      assert.equal(
        anchored.history.scrollRestoration,
        "auto",
        "an explicit hash should keep native fragment restoration enabled",
      );
      assert.deepEqual(
        anchored.scrollCalls,
        [],
        "initial hash navigation must not be overwritten",
      );
      assert.deepEqual(anchored.scrollBehaviorChanges, []);
      assert.equal(typeof anchored.pageshow, "function");
      anchored.pageshow({ persisted: true });
      assert.deepEqual(
        anchored.scrollCalls,
        [],
        "bfcache handling must still preserve an explicit hash target",
      );
    });
  }
});
