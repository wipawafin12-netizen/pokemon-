/* Browser verification: wild encounter -> skill use -> capture attempt.
   Run with: node scripts/verify-battle.mjs */
import { chromium } from "playwright";
import { mkdirSync } from "fs";

const BASE = "http://localhost:3000";
mkdirSync("scripts/verify-out", { recursive: true });

const pageErrors = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on("pageerror", (err) => pageErrors.push(String(err)));

const step = (n, msg) => console.log(`[${n}] ${msg}`);
const ATTACK = 'button:has-text("Attack")';

// Hand-crafted save: sproutling L10 standing in Verdant Forest tall grass.
const save = {
  version: 1, slot: 2, playerName: "Grassy", createdAt: Date.now(), updatedAt: Date.now(),
  playTimeSec: 60, gold: 2000, crystals: 5,
  mapId: "verdant-forest", pos: { x: 4, y: 7 }, facing: "down",
  party: [{
    uid: "test-1", speciesId: "sproutling", level: 10, xp: 1000,
    currentHp: 32, stats: { hp: 32, attack: 16, defense: 16, magic: 17, speed: 17 },
    skills: ["leaf-dart", "vine-snap", "spore-cloud"], status: null, friendship: 100,
  }],
  storage: [], inventory: { "basic-orb": 20, "small-potion": 5 },
  quests: [], dexSeen: ["sproutling"], dexCaught: ["sproutling"],
  flags: { "visited-origin-village": true, "visited-verdant-forest": true },
  defeatedTrainers: [], badges: [],
};

try {
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.evaluate((s) => localStorage.setItem("eternal-monsters:save:2", JSON.stringify(s)), save);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector("text=ETERNAL MONSTERS", { timeout: 20000 });
  await page.click("text=Press Start");
  await page.click("text=Grassy");
  await page.waitForSelector("text=Verdant Forest", { timeout: 20000 });
  step(1, "Loaded crafted save into Verdant Forest tall grass");

  // pace in the grass until a wild battle triggers (hold keys like a real player)
  let inBattle = false;
  for (let i = 0; i < 60 && !inBattle; i++) {
    const key = i % 2 ? "ArrowUp" : "ArrowDown";
    await page.keyboard.down(key);
    await page.waitForTimeout(200);
    await page.keyboard.up(key);
    await page.waitForTimeout(140);
    inBattle = await page.locator("text=Wild Encounter").isVisible().catch(() => false);
  }
  if (!inBattle) throw new Error("no wild encounter after 60 steps in tall grass");
  step(2, "Wild encounter triggered - battle screen visible");
  await page.screenshot({ path: "scripts/verify-out/6-battle.png" });

  // wait for choice phase, attack with first skill
  await page.waitForSelector(ATTACK, { timeout: 25000 });
  step(3, "Choice phase reached (intro playback completed)");
  await page.click(ATTACK);
  await page.waitForSelector("text=Leaf Dart", { timeout: 5000 });
  await page.click("text=Leaf Dart");
  step(4, "Used skill Leaf Dart");
  await page.waitForSelector(ATTACK, { timeout: 30000 });
  step(5, "Turn resolved, back to choice phase");
  await page.screenshot({ path: "scripts/verify-out/7-after-attack.png" });

  // capture attempt
  await page.click('button:has-text("Capture")');
  await page.waitForSelector("text=Basic Orb", { timeout: 5000 });
  await page.click("text=Basic Orb");
  step(6, "Threw a Basic Orb");

  // either captured (outcome overlay) or broke free (back to choice) - both valid
  const outcome = await Promise.race([
    page.waitForSelector("text=Captured!", { timeout: 35000 }).then(() => "captured"),
    page.waitForSelector(ATTACK, { timeout: 35000 }).then(() => "broke-free"),
    page.waitForSelector("text=Victory!", { timeout: 35000 }).then(() => "victory"),
  ]);
  step(7, `Capture resolved: ${outcome}`);
  await page.screenshot({ path: "scripts/verify-out/8-capture.png" });

  // finish the battle one way or another
  for (let i = 0; i < 12; i++) {
    if (await page.locator("text=Continue").isVisible().catch(() => false)) {
      await page.click("text=Continue");
      break;
    }
    if (await page.locator(ATTACK).isVisible().catch(() => false)) {
      await page.click(ATTACK);
      await page.waitForTimeout(300);
      const skill = page.locator("button", { hasText: "Leaf Dart" }).first();
      if (await skill.isEnabled().catch(() => false)) await skill.click();
      else await page.click("text=Vine Snap");
    }
    await page.waitForTimeout(2500);
  }
  await page.waitForSelector("text=Verdant Forest", { timeout: 30000 });
  step(8, "Battle ended, returned to the world");
  await page.screenshot({ path: "scripts/verify-out/9-back-to-world.png" });

  console.log(`\npage errors: ${pageErrors.length ? pageErrors.join("\n  ") : "none"}`);
  if (pageErrors.length) process.exit(1);
  console.log("OK: Battle verification passed");
} catch (e) {
  console.error("FAIL: " + e);
  await page.screenshot({ path: "scripts/verify-out/battle-error.png" }).catch(() => {});
  console.log(`page errors: ${pageErrors.join("\n  ") || "none"}`);
  process.exit(1);
} finally {
  await browser.close();
}
