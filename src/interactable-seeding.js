export function buildBaseInteractables({
  startCastle,
  VENDOR_TILE,
  OVERWORLD_LADDER_DOWN,
  SMITHING_FURNACE_TILE,
  SMITHING_ANVIL_TILE,
  SMITHING_BLACKSMITH_TILE,
  RIVER_Y,
  TOWN_PROJECT_NPC
}) {
  const base = [];

  base.push({ type: "bank", x: startCastle.x0 + 4, y: startCastle.y0 + 3 });
  base.push({
    type: "quest_npc",
    x: startCastle.x0 + 5,
    y: startCastle.y0 + 4,
    npcId: "quartermaster",
    name: "Quartermaster Bryn"
  });
  base.push({ type: "vendor", x: VENDOR_TILE.x, y: VENDOR_TILE.y });
  base.push({ type: "ladder_down", x: OVERWORLD_LADDER_DOWN.x, y: OVERWORLD_LADDER_DOWN.y });

  base.push({ type: "fish", x: 6, y: RIVER_Y });
  base.push({ type: "fish", x: 10, y: RIVER_Y + 1 });

  base.push({ type: "furnace", x: SMITHING_FURNACE_TILE.x, y: SMITHING_FURNACE_TILE.y });
  base.push({ type: "anvil", x: SMITHING_ANVIL_TILE.x, y: SMITHING_ANVIL_TILE.y });

  base.push({
    type: "project_npc",
    x: SMITHING_BLACKSMITH_TILE.x,
    y: SMITHING_BLACKSMITH_TILE.y,
    npcId: "blacksmith_torren",
    name: TOWN_PROJECT_NPC.blacksmith_torren.name
  });

  base.push({
    type: "project_npc",
    x: 30,
    y: 19,
    npcId: "dock_foreman",
    name: TOWN_PROJECT_NPC.dock_foreman.name
  });

  base.push({
    type: "project_npc",
    x: 7,
    y: 16,
    npcId: "hearth_keeper",
    name: TOWN_PROJECT_NPC.hearth_keeper.name
  });

  base.push({
    type: "project_npc",
    x: 8,
    y: 3,
    npcId: "mayor",
    name: TOWN_PROJECT_NPC.mayor.name
  });

  return base;
}

export function seedInteractables({
  interactables,
  buildBaseInteractables,
  getProjectState,
  getHearthCampCauldronTile
}) {
  interactables.length = 0;

  const base = buildBaseInteractables();
  for (const it of base) {
    interactables.push(it);
  }

  const dockState = getProjectState("rivermoor", "dock");
  if (dockState === "complete") {
    interactables.push({ type: "fish_dock", x: 31, y: 23 });
  }

  const hearthState = getProjectState("rivermoor", "hearth");
  if (hearthState === "complete") {
    const cauldronTile = getHearthCampCauldronTile();
    interactables.push({ type: "cauldron", x: cauldronTile.x, y: cauldronTile.y });
  }
}
