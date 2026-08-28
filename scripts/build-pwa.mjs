import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));

async function filesAt(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => entry.isDirectory()
    ? filesAt(join(directory, entry.name))
    : [join(directory, entry.name)]));
  return nested.flat();
}

const paths = await filesAt(dist);
const precacheFiles = paths
  .filter((path) => !path.endsWith(`${sep}sw.js`) && !path.endsWith(`${sep}staticwebapp.config.json`))
  .filter((path) => !path.endsWith(".map"));
const shell = precacheFiles
  .map((path) => `/${relative(dist, path).split(sep).join("/")}`)
  .sort();
for (const alias of ["/privacy/", "/terms/", "/demo/"]) {
  const index = shell.indexOf(`${alias}index.html`);
  if (index !== -1) shell.splice(index, 1, alias);
}
shell.unshift("/");

const cacheDigest = createHash("sha256").update(JSON.stringify(shell));
for (const path of precacheFiles.sort()) cacheDigest.update(await readFile(path));
const version = cacheDigest.digest("hex").slice(0, 16);
const worker = `const VERSION = "csv-contract-${version}";
const SHELL = ${JSON.stringify(shell)};

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then((response) => { const copy = response.clone(); caches.open(VERSION).then((cache) => cache.put(request, copy)); return response; }).catch(() => caches.match(request).then((match) => match || caches.match("/") || caches.match("/offline.html"))));
    return;
  }
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => { if (response.ok) { const copy = response.clone(); caches.open(VERSION).then((cache) => cache.put(request, copy)); } return response; })));
});
`;
await writeFile(join(dist, "sw.js"), worker);
