// Central place for naming-convention-driven visual defaults.
// Add new materials/keywords here so new items get automatic visuals.
const MATERIAL_KEYWORDS = {
  crude: ["crude"],
  iron: ["iron"]
};

const SLOT_HINTS = {
  head: ["helm", "hood", "hat", "head"],
  body: ["body", "chest", "plate", "armor"],
  legs: ["legs", "greaves", "pants", "leg"],
  hands: ["hands", "gloves", "gaunt", "hand"],
  feet: ["feet", "boots", "shoes", "boot", "foot"],
  offhand: ["shield", "wardens_brand"],
  weapon: ["sword", "dagger", "knife", "bow", "staff", "wand"]
};

function normalizeText(value) {
  return String(value || "").toLowerCase();
}

function containsAny(text, needles) {
  for (const needle of needles) {
    if (text.includes(needle)) return true;
  }
  return false;
}

export function inferEquipMaterial(itemId, item) {
  const id = normalizeText(itemId);
  const name = normalizeText(item?.name);
  const text = `${id} ${name}`;

  for (const [material, keywords] of Object.entries(MATERIAL_KEYWORDS)) {
    if (containsAny(text, keywords)) return material;
  }
  return "base";
}

function inferSlotFromText(itemId, item) {
  const id = normalizeText(itemId);
  const name = normalizeText(item?.name);
  const text = `${id} ${name}`;

  for (const [slotName, keywords] of Object.entries(SLOT_HINTS)) {
    if (containsAny(text, keywords)) return slotName;
  }
  return null;
}

export function inferEquipVisualKey(itemId, item, slotHint = null) {
  const id = normalizeText(itemId);
  const name = normalizeText(item?.name);
  const slot = slotHint || item?.equipSlot || inferSlotFromText(itemId, item);

  if (slot === "weapon") {
    if (id === "fire_staff") return "fire_staff";
    if (id.includes("bow") || name.includes("bow")) return "bow";
    if (id.includes("staff") || id.includes("wand") || name.includes("staff") || name.includes("wand")) return "staff";
    if (id.includes("dagger") || id.includes("knife") || name.includes("dagger") || name.includes("knife")) {
      return id.includes("crude") || name.includes("crude") ? "crude_dagger" : "dagger";
    }
    if (id.includes("sword") || name.includes("sword")) {
      return id.includes("crude") || name.includes("crude") ? "crude_sword" : "sword";
    }
    return "sword";
  }

  if (slot === "offhand") {
    if (id.includes("wardens_brand")) return "wardens_brand";
    if (id.includes("iron_shield")) return "iron_shield";
    if (id.includes("crude_shield")) return "crude_shield";
    if (id.includes("shield") || name.includes("shield")) return "shield";
    return "shield";
  }

  const material = inferEquipMaterial(itemId, item);
  const suffix = material === "base" ? "" : `_${material}`;

  if (slot === "head") return `helm${suffix}`;
  if (slot === "body") return `body${suffix}`;
  if (slot === "legs") return `legs${suffix}`;
  if (slot === "hands") return material === "base" ? "hands" : `hands${suffix}`;
  if (slot === "feet") return material === "base" ? "feet" : `feet${suffix}`;

  if (id.includes("shield") || name.includes("shield")) return "shield";
  if (id.includes("staff") || id.includes("wand") || name.includes("staff") || name.includes("wand")) return "staff";
  if (id.includes("dagger") || id.includes("knife") || name.includes("dagger") || name.includes("knife")) return "dagger";
  if (id.includes("bow") || name.includes("bow")) return "bow";
  return "sword";
}

export function applyEquipmentVisualDefaults(items) {
  if (!items || typeof items !== "object") return items;
  for (const [itemId, item] of Object.entries(items)) {
    if (!item || typeof item !== "object") continue;
    if (!item.equipSlot) continue;

    const existing = (item.equipVisual && typeof item.equipVisual === "object") ? item.equipVisual : {};
    const key = existing.key || inferEquipVisualKey(itemId, item, item.equipSlot);
    const layer = existing.layer || item.equipSlot;
    const material = existing.material || inferEquipMaterial(itemId, item);

    item.equipVisual = {
      ...existing,
      key,
      layer,
      material
    };
  }
  return items;
}
