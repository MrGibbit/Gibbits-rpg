export function createDebugAPI(deps) {
  const {
    debugApiEnabled,
    testMode,
    getActiveZone,
    player,
    mobs,
    resources,
    interactables,
    groundLoot,
    windowsOpen,
    overworldLadderDown,
    dungeonLadderUp,
    startNewGame,
    setCurrentZone,
    defaultSpawnForZone,
    teleportPlayerTo,
    updateCamera,
    inBounds,
    getEntityAt,
    beginInteraction,
    useLadder,
    saveCharacterPrefs,
    getCurrentSaveKey,
    serialize,
    deserialize,
    clamp,
    update,
    render
  } = deps;

  function getDebugState() {
    return {
      zone: getActiveZone(),
      player: {
        x: player.x | 0,
        y: player.y | 0,
        hp: player.hp | 0,
        maxHp: player.maxHp | 0,
        class: player.class,
        name: player.name
      },
      counts: {
        mobs: mobs.length | 0,
        resources: resources.length | 0,
        interactables: interactables.length | 0,
        lootPiles: groundLoot.size | 0
      },
      windowsOpen: { ...windowsOpen }
    };
  }

  function mountDebugApi() {
    if (!debugApiEnabled) return;

    const api = {
      testMode,
      getState: () => getDebugState(),
      getLadders: () => ({
        overworldDown: { ...overworldLadderDown },
        dungeonUp: { ...dungeonLadderUp }
      }),
      newGame: () => {
        startNewGame();
        return getDebugState();
      },
      setZone: (zoneKey, options = {}) => {
        const key = String(zoneKey || "").toLowerCase();
        const spawn = (options?.spawn !== false);
        const changed = setCurrentZone(key);
        if (spawn) {
          const p = defaultSpawnForZone(key);
          teleportPlayerTo(p.x, p.y, { requireWalkable: false, invulnMs: 1200 });
        } else {
          updateCamera();
        }
        return { changed, zone: getActiveZone(), ok: (getActiveZone() === key) };
      },
      interactTile: (x, y) => {
        const tx = x | 0;
        const ty = y | 0;
        if (!inBounds(tx, ty)) return { ok: false, reason: "out_of_bounds" };
        const ent = getEntityAt(tx, ty);
        if (!ent) return { ok: false, reason: "no_entity" };
        if (ent.kind === "decor") return { ok: false, reason: "decor_only", kind: ent.kind };
        beginInteraction(ent);
        return { ok: true, kind: ent.kind };
      },
      useLadder: (direction) => useLadder(direction),
      teleport: (x, y, options = {}) => teleportPlayerTo(x, y, options),
      saveNow: () => {
        saveCharacterPrefs({ createNew: false });
        localStorage.setItem(getCurrentSaveKey(), serialize());
        return true;
      },
      loadNow: () => {
        const raw = localStorage.getItem(getCurrentSaveKey());
        if (!raw) return false;
        deserialize(raw);
        return true;
      },
      clearSave: () => {
        localStorage.removeItem(getCurrentSaveKey());
        return true;
      },
      tickMs: (ms = 16) => {
        const dt = clamp((Number(ms) || 0) / 1000, 0, 0.25);
        update(dt);
        render();
        return getDebugState();
      }
    };

    window.__classicRpg = api;
  }

  return {
    getDebugState,
    mountDebugApi
  };
}
