export function initHud(deps) {
  const {
    document,
    player,
    Skills,
    BASE_HP,
    HP_PER_LEVEL,
    levelFromXP,
    getGold,
    getQuiverCount,
    renderQuiverSlot,
    inBounds,
    mouse,
    camera,
    viewWorldW,
    viewWorldH,
    VIEW_W,
    VIEW_H,
    TILE,
    getPlayerCombatLevel
  } = deps;

  const hudNameEl = document.getElementById("hudName");
  const hudClassEl = document.getElementById("hudClass");
  const hudHPTextEl = document.getElementById("hudHPText");
  const hudHPBarEl = document.getElementById("hudHPBar");
  const hudQuiverTextEl = document.getElementById("hudQuiverText");
  const hudGoldTextEl = document.getElementById("hudGoldText");
  const hudCombatTextEl = document.getElementById("hudCombatText");

  const coordPlayerEl = document.getElementById("coordPlayer");
  const coordMouseEl = document.getElementById("coordMouse");

  function recalcMaxHPFromHealth() {
    const healthLvl = levelFromXP(Skills.health.xp);
    const newMax = BASE_HP + (healthLvl - 1) * HP_PER_LEVEL;
    if (player.maxHp !== newMax) {
      player.maxHp = newMax;
      player.hp = Math.max(0, Math.min(player.hp, player.maxHp));
    }
    renderHPHUD();
  }

  function renderHPHUD() {
    hudNameEl.textContent = player.name;
    hudClassEl.textContent = player.class;
    hudHPTextEl.textContent = `HP ${player.hp} / ${player.maxHp}`;
    hudHPBarEl.style.width = `${(player.maxHp > 0 ? (player.hp / player.maxHp) : 0) * 100}%`;
    if (hudGoldTextEl) hudGoldTextEl.textContent = `Gold: ${getGold()}`;
    hudQuiverTextEl.textContent = `Quiver: ${getQuiverCount()}`;
    if (hudCombatTextEl) hudCombatTextEl.textContent = `Combat: ${getPlayerCombatLevel(Skills)}`;
  }

  function updateCoordsHUD() {
    if (!coordPlayerEl && !coordMouseEl) return;

    if (coordPlayerEl) {
      const p = `${player.x}, ${player.y}`;
      if (coordPlayerEl.textContent !== p) coordPlayerEl.textContent = p;
    }

    if (!mouse.seen) {
      if (coordMouseEl && coordMouseEl.textContent !== "-") coordMouseEl.textContent = "-";
      return;
    }

    const worldX = (mouse.x / VIEW_W) * viewWorldW() + camera.x;
    const worldY = (mouse.y / VIEW_H) * viewWorldH() + camera.y;
    const tx = Math.floor(worldX / TILE);
    const ty = Math.floor(worldY / TILE);

    const m = inBounds(tx, ty) ? `${tx}, ${ty}` : "-";
    if (coordMouseEl && coordMouseEl.textContent !== m) coordMouseEl.textContent = m;
  }

  function renderGold() {
    const g = getGold();
    if (hudGoldTextEl) hudGoldTextEl.textContent = `Gold: ${g}`;
    const invGoldPill = document.getElementById("invGoldPill");
    if (invGoldPill) invGoldPill.textContent = `Gold: ${g}`;
  }

  function renderQuiver() {
    document.getElementById("invQuiverPill").textContent = `Quiver: ${getQuiverCount()}`;
    document.getElementById("eqQuiverPill").textContent = `Quiver: ${getQuiverCount()}`;
    renderQuiverSlot();
    renderGold();
    renderHPHUD();
  }

  return {
    recalcMaxHPFromHealth,
    renderHPHUD,
    updateCoordsHUD,
    renderGold,
    renderQuiver
  };
}
