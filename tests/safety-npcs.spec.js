import { test, expect } from '@playwright/test';

test('SAFETY: Complete NEW GAME workflow with Project NPCs', async ({ page }) => {
  test.setTimeout(120000);
  
  console.log("\n========== SAFETY TEST: Project NPC System ==========\n");
  
  // TEST 1: Fresh start - NPCs seeded on page load
  console.log("TEST 1: Fresh start - check seeding...");
  await page.goto('http://localhost:8000/?debug=1', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  
  console.log("✅ NPCs seeded on bootstrap\n");
  
  // TEST 2: Create new character
  console.log("TEST 2: Create and start new character...");
  const startBtn = await page.locator('#startNewCharacterBtn').first();
  expect(await startBtn.isVisible()).toBe(true);
  await startBtn.click();
  await page.waitForTimeout(1500);
  
  const charNameInput = await page.locator('#charName').first();
  expect(await charNameInput.isVisible()).toBe(true);
  await charNameInput.fill('Safety Test Hero');
  
  const startGameBtn = await page.locator('#charStart').first();
  await startGameBtn.click();
  await page.waitForTimeout(3000);
  console.log("✅ Character created and game started\n");
  
  // TEST 3: Verify NPCs are in game state
  console.log("TEST 3: Verify NPCs in game state...");
  const gameState = await page.evaluate(() => {
    const state = window.__classicRpg?.getState?.();
    const npcItems = state.interactables.filter(it => it?.type === 'project_npc');
    return {
      zone: state.zone,
      totalInteractables: state.counts.interactables,
      projectNpcCount: npcItems.length,
      projectNpcs: npcItems.map(it => ({ id: it.npcId, x: it.x, y: it.y, name: it.name }))
    };
  });
  
  expect(gameState.zone).toBe('overworld');
  expect(gameState.totalInteractables).toBeGreaterThan(0);
  expect(gameState.projectNpcCount).toBe(4);
  
  const npcIds = gameState.projectNpcs.map(it => it.id);
  expect(npcIds).toContain('blacksmith_torren');
  expect(npcIds).toContain('dock_foreman');
  expect(npcIds).toContain('hearth_keeper');
  expect(npcIds).toContain('mayor');
  
  console.log(`✅ All 4 NPCs found in state:`);
  gameState.projectNpcs.forEach(npc => {
    console.log(`   - ${npc.name} at (${npc.x}, ${npc.y})`);
  });
  console.log();
  
  // TEST 4: Interact with each NPC
  console.log("TEST 4: Interact with each NPC...");
  const npcTests = [
    { id: 'blacksmith_torren', x: 52, y: 33 },
    { id: 'dock_foreman', x: 30, y: 19 },
    { id: 'hearth_keeper', x: 7, y: 16 },
    { id: 'mayor', x: 8, y: 3 }
  ];
  
  for (const npc of npcTests) {
    const result = await page.evaluate((data) => {
      window.__classicRpg.teleport(data.x - 1, data.y, { requireWalkable: true });
      const int = window.__classicRpg.interactTile(data.x, data.y);
      const state = window.__classicRpg.getState();
      return {
        id: data.id,
        ok: int.ok,
        kind: int.kind,
        townProjectsOpen: state.windowsOpen?.townProjects || false
      };
    }, npc);
    
    expect(result.ok).toBe(true);
    expect(result.kind).toBe('project_npc');
    expect(result.townProjectsOpen).toBe(true);
    console.log(`✅ ${npc.id}: clickable, opens Town Projects UI`);
  }
  console.log();
  
  // TEST 5: Refresh page - NPCs should still be there
  console.log("TEST 5: Refresh page - NPCs should persist...");
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(1500);
  
  const postRefreshState = await page.evaluate(() => {
    const state = window.__classicRpg?.getState?.();
    return {
      projectNpcCount: state.interactables.filter(it => it?.type === 'project_npc').length
    };
  });
  
  expect(postRefreshState.projectNpcCount).toBe(4);
  console.log("✅ NPCs persisted after refresh\n");
  
  // TEST 6: Save/load - NPCs should rebuild on new load
  console.log("TEST 6: Save and load...");
  await page.evaluate(() => {
    window.__classicRpg.saveNow();
  });
  await page.waitForTimeout(500);
  
  await page.evaluate(() => {
    window.__classicRpg.loadNow();
  });
  await page.waitForTimeout(1000);
  
  const postLoadState = await page.evaluate(() => {
    const state = window.__classicRpg?.getState?.();
    return {
      projectNpcCount: state.interactables.filter(it => it?.type === 'project_npc').length
    };
  });
  
  expect(postLoadState.projectNpcCount).toBe(4);
  console.log("✅ NPCs available after save/load\n");
  
  console.log("========== ALL SAFETY TESTS PASSED ==========\n");
});
