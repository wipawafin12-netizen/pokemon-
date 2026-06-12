/* Verify the starter-select confirm button is reachable on a short phone viewport. */
import { chromium } from "playwright";

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 700 } });
const errs = [];
p.on("pageerror", (e) => errs.push(String(e)));

await p.goto("http://localhost:3000", { waitUntil: "networkidle" });
await p.click("text=Press Start");
await p.click("text=Slot 1");
await p.fill("input[placeholder='Your tamer name...']", "MobileTest");
await p.click("text=Begin");
await p.waitForSelector("text=Choose Your Partner");
await p.click("text=Cindercub");
const btn = p.locator("text=Choose Cindercub!");
console.log("confirm button visible:", await btn.isVisible());
await p.screenshot({ path: "scripts/verify-out/starter-mobile.png" });
await btn.click();
await p.waitForSelector("canvas", { timeout: 20000 });
console.log("entered world: true");
console.log("page errors:", errs.length ? errs.join(";") : "none");
await b.close();
