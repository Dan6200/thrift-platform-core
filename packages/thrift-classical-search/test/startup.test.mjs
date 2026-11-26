import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import test from "node:test";

const root = resolve(import.meta.dirname, "..");
const image =
  process.env.SEARCH_TEST_IMAGE ||
  "us-central1-docker.pkg.dev/thrift-ecommerce-project/thrift-images/thrift-classical-search:latest";
const key = "local-integration-test-key-only";
const docker = (...args) => execFileSync("docker", args, { encoding: "utf8" }).trim();

function start(t, source) {
  const name = `thrift-search-test-${process.pid}-${Date.now()}`;
  t.after(() => docker("rm", "-f", name));
  docker(
    "run",
    "-d",
    "--name",
    name,
    "-p",
    "127.0.0.1::7700",
    "-e",
    `APP_API_URL=${source}`,
    "-e",
    `API_KEY=${key}`,
    "-e",
    "MEILISEARCH_SERVER=http://127.0.0.1:7700",
    "-v",
    `${root}:/test-src:ro`,
    "--entrypoint",
    "/bin/sh",
    image,
    "-c",
    "cp /test-src/entrypoint.sh /opt/src/entrypoint.sh && cp /test-src/populate-search/*.sh /opt/src/ && chmod +x /opt/src/*.sh && exec /opt/src/entrypoint.sh tail -f /dev/null",
  );
  const port = JSON.parse(docker("inspect", name))[0].NetworkSettings.Ports["7700/tcp"][0].HostPort;
  return { name, origin: `http://127.0.0.1:${port}` };
}

test("the first public health response is backed by a populated search index", { timeout: 90000 }, async (t) => {
  const { name, origin } = start(t, "https://api.thrift-commerce.workers.dev");
  let ready = false;
  for (let i = 0; i < 600; i++) {
    try {
      const response = await fetch(`${origin}/health`, { signal: AbortSignal.timeout(300) });
      if (response.ok) {
        ready = true;
        break;
      }
    } catch (error) {
      // Only connection failures are expected before the public listener opens.
      if (error.name !== "TimeoutError" && !(error.name === "TypeError" && error.message === "fetch failed"))
        throw error;
    }
    if (JSON.parse(docker("inspect", name))[0].State.Status === "exited")
      assert.fail(`Startup exited: ${docker("logs", name)}`);
    await delay(100);
  }
  assert.ok(ready, "Public search listener did not become ready");
  const response = await fetch(`${origin}/indexes/products/search`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ q: "dress" }),
  });
  const body = await response.json();
  assert.equal(response.status, 200, `Search must be available on the first public request: ${JSON.stringify(body)}`);
  assert.ok(body.hits?.length > 0, "A live dress query must return products");
  const stats = await fetch(`${origin}/indexes/products/stats`, { headers: { Authorization: `Bearer ${key}` } }).then(
    (r) => r.json(),
  );
  assert.ok(stats.numberOfDocuments > 0, "The index must contain live products");
});

test("an unavailable catalog prevents the container from serving an empty index", { timeout: 20000 }, async (t) => {
  const { name } = start(t, "http://127.0.0.1:9");
  let state;
  for (let i = 0; i < 100; i++) {
    state = JSON.parse(docker("inspect", name))[0].State;
    if (state.Status === "exited") break;
    await delay(100);
  }
  assert.equal(state.Status, "exited", "Failed indexing must terminate startup");
  assert.notEqual(state.ExitCode, 0, "Failed indexing must return a failure exit code");
});
