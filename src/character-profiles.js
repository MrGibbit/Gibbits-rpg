export function createCharacterProfiles(deps) {
  const {
    getActiveCharacterId,
    getCharacterById,
    readSaveDataByCharId,
    classDefs,
    calcCombatLevelFromLevels,
    levelFromXP
  } = deps;

  function getStoredCharacterProfile(charId = getActiveCharacterId()) {
    if (!charId) return null;
    const saved = getCharacterById(charId);
    if (!saved) return null;

    const cls = saved.class;
    const name = String(saved.name || "").trim().slice(0, 14);
    if (!name || !cls || !classDefs[cls]) return null;

    return {
      id: saved.id,
      name,
      class: cls,
      color: classDefs[cls].color
    };
  }

  function normalizeSavedAt(rawSavedAt, fallbackMs = null) {
    const n = Number(rawSavedAt);
    if (Number.isFinite(n) && n > 0) {
      // Current format: epoch milliseconds.
      if (n >= 1e12) return Math.floor(n);
      // Legacy format compatibility: epoch seconds.
      if (n >= 1e9 && n < 1e12) return Math.floor(n * 1000);
    }

    const fallback = Number(fallbackMs);
    if (Number.isFinite(fallback) && fallback > 0) {
      return Math.floor(fallback);
    }
    return null;
  }

  function getStoredSaveProfile(charId = getActiveCharacterId()) {
    const row = readSaveDataByCharId(charId);
    if (!row?.data?.player) return null;
    const data = row.data;
    const charMeta = getCharacterById(charId);
    const cls = data.player.class;
    const name = String(data.player.name || "Adventurer").slice(0, 14);
    const hp = Math.max(0, data.player.hp | 0);
    const maxHp = Math.max(1, data.player.maxHp | 0);
    const savedAt = normalizeSavedAt(data.savedAt, charMeta?.updatedAt);
    const sx = data?.skills ?? {};
    const combatLevel = Math.max(1, calcCombatLevelFromLevels({
      accuracy: levelFromXP(sx.accuracy | 0),
      power: levelFromXP(sx.power | 0),
      defense: levelFromXP(sx.defense | 0),
      ranged: levelFromXP(sx.ranged | 0),
      sorcery: levelFromXP(sx.sorcery | 0),
      health: levelFromXP(sx.health | 0)
    }));

    return {
      name,
      class: (cls && classDefs[cls]) ? cls : "Unknown",
      hp,
      maxHp,
      savedAt,
      combatLevel
    };
  }

  function formatSavedAtLabel(savedAt) {
    if (!Number.isFinite(savedAt) || savedAt <= 0) return "Unknown time";
    const d = new Date(savedAt);
    if (Number.isNaN(d.getTime())) return "Unknown time";
    return d.toLocaleString();
  }

  return {
    getStoredCharacterProfile,
    getStoredSaveProfile,
    normalizeSavedAt,
    formatSavedAtLabel
  };
}
