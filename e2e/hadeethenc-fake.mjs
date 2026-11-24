#!/usr/bin/env node
// A fake HadeethEnc API for the browser tests: answers each request with the fixture saved for its path and query
// (scripts/e2e-fixtures.mjs), and 404 for anything else, as the real API does for an unknown id.
//
//   node e2e/hadeethenc-fake.mjs <port>

import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { encFile } from "../scripts/e2e-fixtures.mjs";

const port = Number(process.argv[2] ?? 3101);
const rootDir = resolve(fileURLToPath(new URL("fixtures/hadeethenc/", import.meta.url)));

createServer(async (req, res) => {
  if (req.url === "/health") return res.writeHead(200).end("ok");
  try {
    const fileName = encFile(req.url ?? "");
    const filePath = resolve(rootDir, fileName);
    // With the separator, so that a sibling folder such as hadeethenc-other/ does not pass.
    if (!filePath.startsWith(rootDir + sep)) {
      return res.writeHead(404, { "Content-Type": "application/json" }).end('{"message":"not found"}');
    }
    const body = await readFile(filePath);
    res.writeHead(200, { "Content-Type": "application/json" }).end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "application/json" }).end('{"message":"not found"}');
  }
}).listen(port, "127.0.0.1");
