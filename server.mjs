import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { execSync } from "node:child_process";

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

async function loadHandler() {
  if (!existsSync(new URL("./dist/server/server.js", import.meta.url))) {
    console.log("Build output not found. Running npm run build first...");
    execSync("npm run build", {
      stdio: "inherit",
      shell: true,
    });
  }

  const mod = await import("./dist/server/server.js");
  const handler = mod.default ?? mod;
  if (!handler || typeof handler.fetch !== "function") {
    throw new Error("Built server entry does not export a fetch handler.");
  }
  return handler;
}

function toRequest(request, origin) {
  const url = new URL(request.url ?? "/", origin);
  const headers = new Headers();

  for (const [key, value] of Object.entries(request.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else {
      headers.set(key, value);
    }
  }

  const init = {
    method: request.method,
    headers,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request;
    init.duplex = "half";
  }

  return new Request(url, init);
}

async function writeResponse(response, res) {
  res.statusCode = response.status;
  res.statusMessage = response.statusText;

  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === "content-length") return;
    res.setHeader(key, value);
  });

  if (!response.body) {
    res.end();
    return;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (!res.hasHeader("content-length")) {
    res.setHeader("content-length", String(buffer.length));
  }
  res.end(buffer);
}

function serveStaticAsset(pathname) {
  if (pathname === "/favicon.ico") {
    return new Response(null, { status: 204 });
  }

  if (!pathname.startsWith("/assets/")) {
    return null;
  }

  const assetPath = normalize(resolve(process.cwd(), "dist/client", pathname.slice(1)));
  const rootPath = normalize(resolve(process.cwd(), "dist/client"));
  if (!assetPath.startsWith(rootPath)) {
    return new Response("Not Found", { status: 404 });
  }

  if (!existsSync(assetPath)) {
    return new Response("Not Found", { status: 404 });
  }

  const contentTypeMap = {
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".svg": "image/svg+xml",
    ".json": "application/json; charset=utf-8",
    ".map": "application/json; charset=utf-8",
    ".ico": "image/x-icon",
  };

  const contentType = contentTypeMap[extname(assetPath)] ?? "application/octet-stream";
  return new Response(readFileSync(assetPath), {
    status: 200,
    headers: {
      "content-type": contentType,
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}

const handlerPromise = loadHandler();

createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? `${host}:${port}`}`);
    const staticResponse = serveStaticAsset(url.pathname);
    if (staticResponse) {
      await writeResponse(staticResponse, res);
      return;
    }

    const handler = await handlerPromise;
    const authority = req.headers.host ?? `${host}:${port}`;
    const response = await handler.fetch(toRequest(req, `http://${authority}`), {}, {});
    await writeResponse(response, res);
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.end("Internal Server Error");
  }
}).listen(port, host, () => {
  console.log(`GoFast listening on http://${host}:${port}`);
});
