/* Browser verification: AR Hunt — camera mode, monster spawn, orb throw, outcome.
   Run with: node scripts/verify-ar.mjs (dev server must be running) */
import { chromium } from "playwright";
import { mkdirSync } from "fs";

const BASE = "http://localhost:3000";
mkdirSync("scripts/verify-out", { recursive: true });

const pageErrors = [];
const browser = await chromium.launch({
  args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
});
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 }, // mobile-first
  permissions: ["camera"],
  hasTouch: true,
});
const page = await ctx.newPage();
page.on("pageerror", (err) => pageErrors.push(String(err)));

const step = (n, msg) => console.log(`[${n}] ${msg}`);

// Save with plenty of orbs, standing in the village (AR works anywhere).
const save = {
  version: 1, slot: 2, playerName: "ArTester", createdAt: Date.now(), updatedAt: Date.now(),
  playTimeSec: 0, gold: 999, crystals: 0,
  mapId: "origin-village", pos: { x: 12, y: 8 }, facing: "down",
  party: [{
    uid: "t1", speciesId: "sproutling", level: 12, xp: 1728,
    currentHp: 36, stats: { hp: 36, attack: 18, defense: 18, magic: 19, speed: 19 },
    skills: ["leaf-dart", "vine-snap", "spore-cloud"], status: null, friendship: 100,
  }],
  storage: [], inventory: { "mythic-orb": 30 }, // strong orbs → high capture odds for a deterministic-ish test
  quests: [], dexSeen: ["sproutling"], dexCaught: ["sproutling"],
  flags: { "visited-origin-village": true }, defeatedTrainers: [], badges: [],
};

try {
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.evaluate((s) => localStorage.setItem("eternal-monsters:save:2", JSON.stringify(s)), save);
  await page.reload({ waitUntil: "networkidle" });
  await page.click("text=Press Start");
  await page.click("text=ArTester");
  await page.waitForSelector("text=Origin Village", { timeout: 20000 });
  step(1, "Loaded save into the world (mobile viewport)");

  // open AR Hunt from the HUD
  await page.click('button[title="AR Hunt"]');
  await page.waitForSelector("text=AR Hunt", { timeout: 10000 });
  step(2, "AR mode opened (intro visible)");
  await page.screenshot({ path: "scripts/verify-out/ar-1-intro.png" });

  await page.click("text=Start the hunt");
  await page.waitForSelector("text=swipe up to throw", { timeout: 8000 });
  const monsterName = await page.locator("div.absolute.inset-x-0.top-0 span.text-sm").first().textContent();
  step(3, `Aiming phase — wild ${monsterName} spawned over the camera feed`);
  await page.screenshot({ path: "scripts/verify-out/ar-2-aiming.png" });

  // AR photo button: composites camera + monster, then downloads (no Web Share in headless)
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 8000 }).catch(() => null),
    page.click('button[title="Take photo"]'),
  ]);
  await page.waitForSelector("text=Photo saved!", { timeout: 5000 });
  step(3.5, `AR photo captured${download ? ` (${download.suggestedFilename()})` : ""}`);

  // throw orbs until captured or fled (swipe up from the orb pad)
  let outcome = null;
  for (let i = 0; i < 8 && !outcome; i++) {
    const pad = await page.locator("div.h-24.w-24").boundingBox();
    if (!pad) break;
    const sx = pad.x + pad.width / 2;
    const sy = pad.y + pad.height / 2;
    await page.mouse.move(sx, sy);
    await page.mouse.down();
    await page.mouse.move(sx + 2, sy - 220, { steps: 6 });
    await page.mouse.up();
    step(4 + i, `Threw orb #${i + 1}`);
    // flight (0.65s) + up to 3 shakes (2.1s) + verdict buffer
    await page.waitForTimeout(4500);
    if (await page.locator("text=Gotcha!").isVisible().catch(() => false)) outcome = "captured";
    else if (await page.locator("text=It fled").isVisible().catch(() => false)) outcome = "fled";
  }
  if (!outcome) throw new Error("no outcome after 8 throws");
  step(12, `Hunt resolved: ${outcome}`);
  await page.screenshot({ path: "scripts/verify-out/ar-3-outcome.png" });

  // orb count must have decreased
  const orbsLeft = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("eternal-monsters:save:2"));
    return s.inventory["mythic-orb"] ?? 0;
  });
  if (orbsLeft >= 30) throw new Error(`orbs not consumed (still ${orbsLeft})`);
  step(13, `Orbs consumed correctly (30 → ${orbsLeft})`);

  // on capture, collection must have grown
  if (outcome === "captured") {
    await page.click("text=Continue");
    await page.waitForSelector("text=Origin Village", { timeout: 10000 });
    const caught = await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem("eternal-monsters:save:2"));
      return { dex: s.dexCaught, party: s.party.length };
    });
    if (caught.dex.length < 2 && caught.party < 2) throw new Error("captured creature not saved");
    step(14, `Captured creature persisted (dex: ${caught.dex.join(", ")})`);
  } else {
    await page.click("text=Back to the world");
    await page.waitForSelector("text=Origin Village", { timeout: 10000 });
    step(14, "Returned to world after flee");
  }

  console.log(`\npage errors: ${pageErrors.length ? pageErrors.join("\n  ") : "none"}`);
  if (pageErrors.length) process.exit(1);
  console.log("OK: AR verification passed");
} catch (e) {
  console.error("FAIL: " + e);
  await page.screenshot({ path: "scripts/verify-out/ar-error.png" }).catch(() => {});
  console.log(`page errors: ${pageErrors.join("\n  ") || "none"}`);
  process.exit(1);
} finally {
  await browser.close();
}
