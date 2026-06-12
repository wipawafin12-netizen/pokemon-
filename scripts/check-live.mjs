/* Quick health check of both localhost and the Vercel deployment. */
import { chromium } from "playwright";

const b = await chromium.launch();
for (const url of ["http://localhost:3000", "https://pokemon-snowy-ten.vercel.app"]) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  try {
    await p.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    const title = await p.locator("text=ETERNAL MONSTERS").first().isVisible().catch(() => false);
    const start = await p.locator("text=Press Start").first().isVisible().catch(() => false);
    console.log(`${url} → title: ${title}, start button: ${start}, page errors: ${errs.length ? errs.join("; ") : "none"}`);
    await p.screenshot({ path: `scripts/verify-out/live-${url.includes("vercel") ? "vercel" : "local"}.png` });
  } catch (e) {
    console.log(`${url} → FAILED: ${e}`);
  }
  await p.close();
}
await b.close();
