const { test, expect } = require("@playwright/test");

test("boot, debug API, zone swap, save/load", async ({ page }) => {
  await page.goto("/?test=1", { waitUntil: "domcontentloaded" });

  await page.waitForFunction(() => {
    return typeof window.__classicRpg === "object" && typeof window.__classicRpg.getState === "function";
  });

  const initial = await page.evaluate(() => window.__classicRpg.getState());
  expect(initial.zone).toBe("overworld");
  expect(initial.player.hp).toBeGreaterThan(0);

  await page.click("#iconQst");
  await page.waitForFunction(() => window.__classicRpg.getState().windowsOpen.quests === true);

  const nearQuartermaster = await page.evaluate(() => {
    return window.__classicRpg.teleport(8, 6, { requireWalkable: true });
  });
  expect(nearQuartermaster).toBeTruthy();

  const talkQuartermaster = await page.evaluate(() => {
    return window.__classicRpg.interactTile(7, 6);
  });
  expect(talkQuartermaster.ok).toBeTruthy();
  expect(talkQuartermaster.kind).toBe("quest_npc");

  const ladders = await page.evaluate(() => window.__classicRpg.getLadders());
  expect(ladders.overworldDown).toBeTruthy();
  expect(ladders.dungeonUp).toBeTruthy();

  const nearOverworldLadder = await page.evaluate(() => {
    const l = window.__classicRpg.getLadders().overworldDown;
    return window.__classicRpg.teleport(l.x + 1, l.y, { requireWalkable: true });
  });
  expect(nearOverworldLadder).toBeTruthy();

  const interactDown = await page.evaluate(() => {
    const l = window.__classicRpg.getLadders().overworldDown;
    return window.__classicRpg.interactTile(l.x, l.y);
  });
  expect(interactDown.ok).toBeTruthy();
  await page.waitForFunction(() => window.__classicRpg.getState().zone === "dungeon");

  const nearSealedGate = await page.evaluate(() => {
    return window.__classicRpg.teleport(35, 29, { requireWalkable: true });
  });
  expect(nearSealedGate).toBeTruthy();

  const interactSealedGate = await page.evaluate(() => {
    return window.__classicRpg.interactTile(36, 29);
  });
  expect(interactSealedGate.ok).toBeTruthy();
  expect(interactSealedGate.kind).toBe("sealed_gate");

  const nearDungeonLadder = await page.evaluate(() => {
    const l = window.__classicRpg.getLadders().dungeonUp;
    return window.__classicRpg.teleport(l.x + 1, l.y, { requireWalkable: true });
  });
  expect(nearDungeonLadder).toBeTruthy();

  const interactUp = await page.evaluate(() => {
    const l = window.__classicRpg.getLadders().dungeonUp;
    return window.__classicRpg.interactTile(l.x, l.y);
  });
  expect(interactUp.ok).toBeTruthy();
  await page.waitForFunction(() => window.__classicRpg.getState().zone === "overworld");

  await page.evaluate(() => window.__classicRpg.saveNow());
  const loadOk = await page.evaluate(() => window.__classicRpg.loadNow());
  expect(loadOk).toBeTruthy();

  const afterLoad = await page.evaluate(() => window.__classicRpg.getState());
  expect(afterLoad.zone).toBe("overworld");
});
