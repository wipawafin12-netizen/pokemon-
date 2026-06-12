/* Browser verification: boot → save select → starter → world canvas.
   Run with: node scripts/verify-boot.mjs */
import { chromium } from "playwright";
import { mkdirSync } from "fs";

const BASE = "http://localhost:3000";
mkdirSync("scripts/verify-out", { recursive: true });

const consoleErrors = [];
const pageErrors = [];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => pageErrors.push(String(err)));

const step = (n, msg) => console.log(`[${n}] ${msg}`);

try {
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForSelector("text=ETERNAL MONSTERS", { timeout: 20000 });
  step(1, "Main menu rendered (title visible)");
  await page.screenshot({ path: "scripts/verify-out/1-menu.png" });

  await page.click("text=Press Start");
  await page.waitForSelector("text=Choose a Save", { timeout: 10000 });
  step(2, "Save select rendered");
  await page.screenshot({ path: "scripts/verify-out/2-saves.png" });

  await page.click("text=Slot 1 — Empty");
  await page.fill("input[placeholder='Your tamer name...']", "Tester");
  await page.click("text=Begin");
  await page.waitForSelector("text=Choose Your Partner", { timeout: 10000 });
  step(3, "Starter select rendered");

  await page.click("text=Sproutling");
  await page.click("text=Choose Sproutling!");
  await page.waitForSelector("canvas", { timeout: 20000 });
  step(4, "Phaser canvas mounted");
  // give the scene a moment to draw + settle
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "scripts/verify-out/3-world.png" });

  // HUD sanity
  await page.waitForSelector("text=Origin Village", { timeout: 5000 });
  step(5, "World HUD shows Origin Village");

  // probe: walk a few steps and open/close a menu overlay
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(220);
  }
  await page.click("text=Party");
  await page.waitForSelector("text=LEAD", { timeout: 5000 });
  step(6, "Party overlay opens; starter is LEAD");
  await page.screenshot({ path: "scripts/verify-out/4-party.png" });
  await page.click("text=✕ Close");
  await page.waitForSelector("canvas", { timeout: 5000 });
  step(7, "Returned to world after overlay");

  // probe: save persists
  await page.click("text=💾");
  await page.waitForTimeout(400);
  const saved = await page.evaluate(() => !!localStorage.getItem("eternal-monsters:save:0"));
  if (!saved) throw new Error("save slot 0 not written to localStorage");
  step(8, "Save written to localStorage");

  // probe: reload restores session to save select with slot populated
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector("text=ETERNAL MONSTERS", { timeout: 20000 });
  await page.click("text=Press Start");
  await page.waitForSelector("text=Tester", { timeout: 10000 });
  step(9, "Reload: slot 1 shows Tester's save");
  await page.click("text=Tester");
  await page.waitForSelector("canvas", { timeout: 20000 });
  await page.waitForSelector("text=Origin Village", { timeout: 8000 });
  step(10, "Loaded save back into the world");
  await page.screenshot({ path: "scripts/verify-out/5-reloaded.png" });

  // 404s for optional assets (creature art, audio files) are expected —
  // the game probes for them and falls back to procedural art/synth.
  const fatal = pageErrors.length + consoleErrors.filter((e) => !e.includes("favicon") && !e.includes("404")).length;
  console.log(`\nconsole errors: ${consoleErrors.length ? consoleErrors.join("\n  ") : "none"}`);
  console.log(`page errors: ${pageErrors.length ? pageErrors.join("\n  ") : "none"}`);
  if (fatal > 0) {
    console.error("❌ errors detected");
    process.exit(1);
  }
  console.log("\n✅ Browser verification passed");
} catch (e) {
  console.error("❌ " + e);
  await page.screenshot({ path: "scripts/verify-out/error.png" }).catch(() => {});
  console.log(`console errors: ${consoleErrors.join("\n  ") || "none"}`);
  console.log(`page errors: ${pageErrors.join("\n  ") || "none"}`);
  process.exit(1);
} finally {
  await browser.close();
}
