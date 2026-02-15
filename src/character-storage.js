export function createCharacterStorage(deps) {
  const {
    player,
    classDefs,
    saveKey,
    charKey,
    charListKey,
    activeCharIdKey
  } = deps;

  let activeCharacterId = null;

  function makeCharacterId() {
    const t = Date.now().toString(36);
    const r = Math.random().toString(36).slice(2, 8);
    return `char_${t}_${r}`;
  }

  function normalizeCharacter(raw) {
    if (!raw || typeof raw !== "object") return null;
    const id = String(raw.id || "").trim();
    const name = String(raw.name || "").trim().slice(0, 14);
    const cls = String(raw.class || "");
    if (!id || !name || !classDefs[cls]) return null;
    return {
      id,
      name,
      class: cls,
      color: classDefs[cls].color,
      updatedAt: Number.isFinite(raw.updatedAt) ? raw.updatedAt : 0
    };
  }

  function loadCharacterList() {
    let raw = null;
    try {
      raw = localStorage.getItem(charListKey);
    } catch {
      return [];
    }
    if (!raw) return [];

    let arr = null;
    try {
      arr = JSON.parse(raw);
    } catch {
      return [];
    }
    if (!Array.isArray(arr)) return [];

    const seen = new Set();
    const out = [];
    for (const row of arr) {
      const c = normalizeCharacter(row);
      if (!c) continue;
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      out.push(c);
    }
    return out;
  }

  function saveCharacterList(list) {
    const clean = [];
    const seen = new Set();
    for (const row of (Array.isArray(list) ? list : [])) {
      const c = normalizeCharacter(row);
      if (!c) continue;
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      clean.push(c);
    }
    try {
      localStorage.setItem(charListKey, JSON.stringify(clean));
    } catch {}
  }

  function getSaveKeyForCharId(charId) {
    return `${saveKey}::${charId}`;
  }

  function readSaveDataByCharId(charId) {
    if (!charId) return null;
    let raw = null;
    try {
      raw = localStorage.getItem(getSaveKeyForCharId(charId));
    } catch {
      return null;
    }
    if (!raw) return null;

    let data = null;
    try {
      data = JSON.parse(raw);
    } catch {
      return null;
    }
    return { raw, data };
  }

  function persistActiveCharacterId() {
    try {
      if (activeCharacterId) localStorage.setItem(activeCharIdKey, activeCharacterId);
      else localStorage.removeItem(activeCharIdKey);
    } catch {}
  }

  function getCharacterById(charId) {
    if (!charId) return null;
    return loadCharacterList().find((c) => c.id === charId) ?? null;
  }

  function getActiveCharacterId() {
    if (activeCharacterId && getCharacterById(activeCharacterId)) return activeCharacterId;

    const list = loadCharacterList();
    let savedId = null;
    try {
      savedId = localStorage.getItem(activeCharIdKey);
    } catch {}

    if (!savedId || !list.some((c) => c.id === savedId)) {
      savedId = list[0]?.id ?? null;
    }

    activeCharacterId = savedId || null;
    persistActiveCharacterId();
    return activeCharacterId;
  }

  function setActiveCharacterId(charId) {
    if (!charId || !getCharacterById(charId)) {
      activeCharacterId = null;
    } else {
      activeCharacterId = charId;
    }
    persistActiveCharacterId();
  }

  function ensureCharacterMigration() {
    const list = loadCharacterList();
    if (list.length) {
      getActiveCharacterId();
      return;
    }

    let legacy = null;
    try {
      const raw = localStorage.getItem(charKey);
      legacy = raw ? JSON.parse(raw) : null;
    } catch {}

    let fromLegacy = null;
    if (legacy?.name && legacy?.class && classDefs[legacy.class]) {
      fromLegacy = {
        id: makeCharacterId(),
        name: String(legacy.name).trim().slice(0, 14) || "Adventurer",
        class: legacy.class,
        color: classDefs[legacy.class].color,
        updatedAt: Date.now()
      };
    } else {
      let legacySave = null;
      try {
        legacySave = localStorage.getItem(saveKey);
      } catch {}
      if (legacySave) {
        try {
          const d = JSON.parse(legacySave);
          const nm = String(d?.player?.name || "").trim().slice(0, 14);
          const cls = String(d?.player?.class || "");
          if (nm && classDefs[cls]) {
            fromLegacy = {
              id: makeCharacterId(),
              name: nm,
              class: cls,
              color: classDefs[cls].color,
              updatedAt: Date.now()
            };
          }
        } catch {}
      }
    }

    if (!fromLegacy) return;

    saveCharacterList([fromLegacy]);
    setActiveCharacterId(fromLegacy.id);

    let oldSave = null;
    try {
      oldSave = localStorage.getItem(saveKey);
    } catch {}
    if (oldSave) {
      try {
        localStorage.setItem(getSaveKeyForCharId(fromLegacy.id), oldSave);
      } catch {}
    }
  }

  function loadCharacterPrefs() {
    const id = getActiveCharacterId();
    return id ? getCharacterById(id) : null;
  }

  function saveCharacterPrefs(options = {}) {
    const createNew = !!options.createNew;
    const list = loadCharacterList();
    const cls = classDefs[player.class] ? player.class : "Warrior";
    const color = classDefs[cls].color;
    const name = (String(player.name || "Adventurer").trim().slice(0, 14) || "Adventurer");
    const t = Date.now();

    if (createNew) {
      const created = {
        id: makeCharacterId(),
        name,
        class: cls,
        color,
        updatedAt: t
      };
      list.unshift(created);
      saveCharacterList(list);
      setActiveCharacterId(created.id);
      return created;
    }

    const id = getActiveCharacterId();
    const idx = list.findIndex((c) => c.id === id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], name, class: cls, color, updatedAt: t };
      saveCharacterList(list);
      setActiveCharacterId(list[idx].id);
      return list[idx];
    }

    const created = {
      id: makeCharacterId(),
      name,
      class: cls,
      color,
      updatedAt: t
    };
    list.unshift(created);
    saveCharacterList(list);
    setActiveCharacterId(created.id);
    return created;
  }

  function getCurrentSaveKey() {
    const id = getActiveCharacterId();
    return id ? getSaveKeyForCharId(id) : saveKey;
  }

  return {
    loadCharacterList,
    saveCharacterList,
    getSaveKeyForCharId,
    readSaveDataByCharId,
    getCharacterById,
    getActiveCharacterId,
    setActiveCharacterId,
    ensureCharacterMigration,
    loadCharacterPrefs,
    saveCharacterPrefs,
    getCurrentSaveKey
  };
}
