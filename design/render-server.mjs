// Re-render the hero: `node design/render-server.mjs public/images`, open http://localhost:4455,
// then run `await save("hero-stones.webp")` in the browser console.
// Tiny local server: serves scene.html and saves rendered images POSTed from the page.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const dir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
const out = process.argv[2];
http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  if (req.method === "POST" && url.pathname === "/save") {
    const name = (url.searchParams.get("name") || "render").replace(/[^\w.-]/g, "");
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      const b64 = body.replace(/^data:[^,]+,/, "");
      fs.writeFileSync(path.join(out, name), Buffer.from(b64, "base64"));
      res.end("saved " + name + " " + Math.round((b64.length * 3) / 4 / 1024) + "KB");
    });
    return;
  }
  const file = path.join(dir, url.pathname === "/" ? "hero-stones-scene.html" : url.pathname);
  if (!fs.existsSync(file)) { res.statusCode = 404; return res.end(); }
  res.setHeader("Content-Type", "text/html");
  res.end(fs.readFileSync(file));
}).listen(4455, () => console.log("render server on 4455 ->", out));
