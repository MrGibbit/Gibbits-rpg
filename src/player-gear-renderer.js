import { inferEquipMaterial, inferEquipVisualKey } from "./equipment-visuals.js";

export function createPlayerGearRenderer(deps) {
  const { ctx, equipment, Items } = deps;
  const ARMOR_PALETTES = {
    base: { light: "#d1d5db", mid: "#9ca3af", dark: "#4b5563" },
    crude: { light: "#b7a894", mid: "#8f7f6a", dark: "#4e453a" },
    iron: { light: "#e5e7eb", mid: "#9ca3af", dark: "#4b5563" }
  };

  function armorPaletteForItem(itemId, item) {
    const material = item?.equipVisual?.material || inferEquipMaterial(itemId, item);
    return ARMOR_PALETTES[material] || ARMOR_PALETTES.base;
  }

  function drawHeadHelm(cx, cy, palette) {
    const hx = cx;
    const hy = cy - 9.2;
    ctx.fillStyle = palette.mid;
    ctx.beginPath();
    ctx.arc(hx, hy - 1.0, 6.5, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(hx - 4.8, hy - 1.9, 9.6, 1.6);
    ctx.fillStyle = palette.dark;
    ctx.fillRect(hx - 5.2, hy - 0.8, 10.4, 1.1);
    ctx.fillRect(hx - 0.8, hy - 0.8, 1.6, 2.0);
    ctx.fillStyle = palette.light;
    ctx.fillRect(hx - 3.3, hy - 1.5, 6.6, 0.7);
  }

  function drawBodyArmor(cx, cy, palette) {
    const top = cy - 3.0;
    const bottom = cy + 8.5;
    ctx.fillStyle = palette.mid;
    ctx.beginPath();
    ctx.moveTo(cx - 5.8, top + 0.8);
    ctx.lineTo(cx + 5.8, top + 0.8);
    ctx.lineTo(cx + 4.2, bottom);
    ctx.lineTo(cx - 4.2, bottom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = palette.dark;
    ctx.fillRect(cx - 6.2, top + 0.2, 12.4, 1.1);
    ctx.fillRect(cx - 1.0, top + 1.4, 2.0, bottom - top - 1.6);
    ctx.fillRect(cx - 4.2, bottom - 0.9, 8.4, 0.9);
    ctx.fillStyle = palette.light;
    ctx.fillRect(cx - 3.4, top + 1.7, 0.9, 5.2);
    ctx.fillRect(cx + 2.5, top + 1.7, 0.9, 5.2);
    ctx.fillRect(cx - 0.45, top + 2.0, 0.9, 4.6);
  }

  function drawLegsArmor(cx, cy, palette) {
    ctx.fillStyle = palette.mid;
    ctx.fillRect(cx - 5.8, cy + 8.9, 3.6, 4.4);
    ctx.fillRect(cx + 2.2, cy + 8.9, 3.6, 4.4);
    ctx.fillStyle = palette.dark;
    ctx.fillRect(cx - 5.8, cy + 11.1, 3.6, 1.0);
    ctx.fillRect(cx + 2.2, cy + 11.1, 3.6, 1.0);
    ctx.fillStyle = palette.light;
    ctx.fillRect(cx - 5.0, cy + 9.3, 0.7, 2.0);
    ctx.fillRect(cx + 4.3, cy + 9.3, 0.7, 2.0);
  }

  function drawHandsArmor(cx, cy, palette) {
    ctx.fillStyle = palette.dark;
    ctx.fillRect(cx - 8.4, cy + 5.1, 2.0, 3.4);
    ctx.fillRect(cx + 6.4, cy + 5.1, 2.0, 3.4);
    ctx.fillStyle = palette.mid;
    ctx.fillRect(cx - 8.0, cy + 5.4, 1.2, 2.6);
    ctx.fillRect(cx + 6.8, cy + 5.4, 1.2, 2.6);
  }

  function drawFeetArmor(cx, cy, palette) {
    ctx.fillStyle = palette.mid;
    ctx.fillRect(cx - 7.6, cy + 12.0, 5.2, 1.0);
    ctx.fillRect(cx + 2.4, cy + 12.0, 5.2, 1.0);
    ctx.fillStyle = palette.dark;
    ctx.fillRect(cx - 7.6, cy + 12.9, 5.2, 0.8);
    ctx.fillRect(cx + 2.4, cy + 12.9, 5.2, 0.8);
  }

  function drawWeaponSword(cx, cy, fx, palette) {
    const side = (fx !== 0) ? fx : 1;
    const wx = cx + side * 10;
    const wy = cy + 2;
    ctx.fillStyle = palette.blade;
    ctx.fillRect(wx - 1, wy - 10, 2, 12);
    ctx.fillStyle = palette.guard;
    ctx.fillRect(wx - 3, wy + 1, 6, 2);
    ctx.fillStyle = palette.hilt;
    ctx.fillRect(wx - 1, wy + 3, 2, 5);
  }

  function drawWeaponDagger(cx, cy, fx, palette) {
    const side = (fx !== 0) ? fx : 1;
    const wx = cx + side * 10;
    const wy = cy + 2;
    ctx.fillStyle = palette.blade;
    ctx.fillRect(wx - 1, wy - 7, 2, 8);
    ctx.fillStyle = palette.guard;
    ctx.fillRect(wx - 2, wy + 1, 4, 1);
    ctx.fillStyle = palette.hilt;
    ctx.fillRect(wx - 1, wy + 2, 2, 3);
  }

  function drawWeaponBow(cx, cy, fx, palette) {
    const side = (fx !== 0) ? fx : 1;
    const wx = cx + side * 10;
    const wy = cy + 2;
    ctx.save();
    ctx.translate(wx, wy);
    ctx.scale(side, 1);
    ctx.strokeStyle = palette.bow;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-2, -2, 8, -0.9, 0.9);
    ctx.stroke();
    ctx.strokeStyle = palette.string;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(4, -10);
    ctx.lineTo(4, 6);
    ctx.stroke();
    ctx.restore();
  }

  function drawWeaponStaff(cx, cy, fx, palette) {
    const side = (fx !== 0) ? fx : 1;
    const wx = cx + side * 10;
    const wy = cy + 2;
    ctx.fillStyle = palette.orb;
    ctx.beginPath();
    ctx.arc(wx, wy - 10, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = palette.shaft;
    ctx.fillRect(wx - 1, wy - 8, 2, 16);
  }

  function drawWeaponFireStaff(cx, cy, fx) {
    const side = (fx !== 0) ? fx : 1;
    const wx = cx + side * 10;
    const wy = cy + 2;
    ctx.fillStyle = "#5b1b0f";
    ctx.fillRect(wx - 1, wy - 8, 2, 16);
    ctx.fillStyle = "#d97706";
    ctx.fillRect(wx - 2, wy - 9, 4, 2);
    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.arc(wx, wy - 11, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fde68a";
    ctx.beginPath();
    ctx.arc(wx, wy - 11, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawOffhandShield(cx, cy, fx, palette) {
    const side = (fx !== 0) ? -fx : -1;
    const sx = cx + side * 9;
    const sy = cy + 6;
    ctx.fillStyle = palette.rim;
    ctx.beginPath();
    ctx.ellipse(sx, sy, 5.6, 6.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = palette.face;
    ctx.beginPath();
    ctx.ellipse(sx, sy, 4.4, 5.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = palette.strap;
    ctx.fillRect(sx - 0.75, sy - 4.7, 1.5, 9.4);
    ctx.fillStyle = palette.boss;
    ctx.beginPath();
    ctx.arc(sx + side * 0.25, sy - 0.1, 1.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.15)";
    ctx.fillRect(sx - side * 2.0, sy - 3.7, 1.1, 2.6);
  }

  function drawOffhandCrudeShield(cx, cy, fx, palette) {
    const side = (fx !== 0) ? -fx : -1;
    const sx = cx + side * 9;
    const sy = cy + 6;
    ctx.fillStyle = palette.trim;
    ctx.beginPath();
    ctx.moveTo(sx, sy - 6.2);
    ctx.lineTo(sx + 5.0, sy - 3.2);
    ctx.lineTo(sx + 4.2, sy + 4.2);
    ctx.lineTo(sx, sy + 6.2);
    ctx.lineTo(sx - 4.2, sy + 4.2);
    ctx.lineTo(sx - 5.0, sy - 3.2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = palette.wood;
    ctx.beginPath();
    ctx.moveTo(sx, sy - 5.0);
    ctx.lineTo(sx + 3.8, sy - 2.7);
    ctx.lineTo(sx + 3.2, sy + 3.5);
    ctx.lineTo(sx, sy + 5.0);
    ctx.lineTo(sx - 3.2, sy + 3.5);
    ctx.lineTo(sx - 3.8, sy - 2.7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = palette.strap;
    ctx.fillRect(sx - 0.7, sy - 4.2, 1.4, 8.4);
    ctx.fillRect(sx - side * 2.0, sy - 3.8, 1.2, 7.6);
    ctx.fillStyle = "rgba(255,255,255,.13)";
    ctx.fillRect(sx - side * 1.6, sy - 3.6, 1.0, 2.3);
  }

  function drawOffhandWardensBrand(cx, cy, fx, palette) {
    const side = (fx !== 0) ? -fx : -1;
    const sx = cx + side * 9;
    const sy = cy + 6;
    ctx.fillStyle = palette.rim;
    ctx.beginPath();
    ctx.moveTo(sx, sy - 7.4);
    ctx.lineTo(sx + 6.2, sy - 4.2);
    ctx.lineTo(sx + 5.1, sy + 4.2);
    ctx.lineTo(sx, sy + 7.4);
    ctx.lineTo(sx - 5.1, sy + 4.2);
    ctx.lineTo(sx - 6.2, sy - 4.2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = palette.face;
    ctx.beginPath();
    ctx.moveTo(sx, sy - 6.0);
    ctx.lineTo(sx + 4.8, sy - 3.1);
    ctx.lineTo(sx + 3.9, sy + 3.7);
    ctx.lineTo(sx, sy + 6.0);
    ctx.lineTo(sx - 3.9, sy + 3.7);
    ctx.lineTo(sx - 4.8, sy - 3.1);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = palette.strap;
    ctx.fillRect(sx - 0.9, sy - 5.2, 1.8, 10.4);
    ctx.fillStyle = palette.sigil;
    ctx.fillRect(sx - 0.8, sy - 4.2, 1.6, 8.6);
    ctx.fillRect(sx - 2.6, sy - 0.8, 5.2, 1.6);
    ctx.fillStyle = "rgba(251,191,36,.72)";
    ctx.fillRect(sx - side * 3.0, sy - 4.9, 1.3, 3.0);
  }

  const weaponRenderers = {
    sword: (cx, cy, fx) => drawWeaponSword(cx, cy, fx, { blade: "#cbd5e1", guard: "#a16207", hilt: "#854d0e" }),
    crude_sword: (cx, cy, fx) => drawWeaponSword(cx, cy, fx, { blade: "#a8a29e", guard: "#6b4f2a", hilt: "#3f2d16" }),
    dagger: (cx, cy, fx) => drawWeaponDagger(cx, cy, fx, { blade: "#cbd5e1", guard: "#a16207", hilt: "#854d0e" }),
    crude_dagger: (cx, cy, fx) => drawWeaponDagger(cx, cy, fx, { blade: "#b7a894", guard: "#6b4f2a", hilt: "#3f2d16" }),
    bow: (cx, cy, fx) => drawWeaponBow(cx, cy, fx, { bow: "#a16207", string: "rgba(255,255,255,.65)" }),
    staff: (cx, cy, fx) => drawWeaponStaff(cx, cy, fx, { orb: "#7c3aed", shaft: "#a16207" }),
    fire_staff: (cx, cy, fx) => drawWeaponFireStaff(cx, cy, fx)
  };

  const offhandRenderers = {
    shield: (cx, cy, fx) => drawOffhandShield(cx, cy, fx, { rim: "#22423b", face: "#3f7267", boss: "#d1d5db", strap: "#11221e" }),
    crude_shield: (cx, cy, fx) => drawOffhandCrudeShield(cx, cy, fx, { wood: "#8f7f6a", trim: "#4e453a", strap: "#231f18" }),
    iron_shield: (cx, cy, fx) => drawOffhandShield(cx, cy, fx, { rim: "#374151", face: "#9ca3af", boss: "#e5e7eb", strap: "#1f2937" }),
    wardens_brand: (cx, cy, fx) => drawOffhandWardensBrand(cx, cy, fx, { rim: "#111827", face: "#475569", sigil: "#f59e0b", strap: "#1f2937" })
  };

  const headRenderers = {
    helm: (cx, cy, fx, itemId, item) => drawHeadHelm(cx, cy, armorPaletteForItem(itemId, item)),
    helm_crude: (cx, cy) => drawHeadHelm(cx, cy, ARMOR_PALETTES.crude),
    helm_iron: (cx, cy) => drawHeadHelm(cx, cy, ARMOR_PALETTES.iron),
    crude_helm: (cx, cy) => drawHeadHelm(cx, cy, ARMOR_PALETTES.crude),
    iron_helm: (cx, cy) => drawHeadHelm(cx, cy, ARMOR_PALETTES.iron)
  };

  const bodyRenderers = {
    body: (cx, cy, fx, itemId, item) => drawBodyArmor(cx, cy, armorPaletteForItem(itemId, item)),
    body_crude: (cx, cy) => drawBodyArmor(cx, cy, ARMOR_PALETTES.crude),
    body_iron: (cx, cy) => drawBodyArmor(cx, cy, ARMOR_PALETTES.iron),
    crude_body: (cx, cy) => drawBodyArmor(cx, cy, ARMOR_PALETTES.crude),
    iron_body: (cx, cy) => drawBodyArmor(cx, cy, ARMOR_PALETTES.iron)
  };

  const legsRenderers = {
    legs: (cx, cy, fx, itemId, item) => drawLegsArmor(cx, cy, armorPaletteForItem(itemId, item)),
    legs_crude: (cx, cy) => drawLegsArmor(cx, cy, ARMOR_PALETTES.crude),
    legs_iron: (cx, cy) => drawLegsArmor(cx, cy, ARMOR_PALETTES.iron),
    crude_legs: (cx, cy) => drawLegsArmor(cx, cy, ARMOR_PALETTES.crude),
    iron_legs: (cx, cy) => drawLegsArmor(cx, cy, ARMOR_PALETTES.iron)
  };

  const handsRenderers = {
    hands: (cx, cy, fx, itemId, item) => drawHandsArmor(cx, cy, armorPaletteForItem(itemId, item)),
    gloves: (cx, cy, fx, itemId, item) => drawHandsArmor(cx, cy, armorPaletteForItem(itemId, item)),
    hands_crude: (cx, cy) => drawHandsArmor(cx, cy, ARMOR_PALETTES.crude),
    hands_iron: (cx, cy) => drawHandsArmor(cx, cy, ARMOR_PALETTES.iron)
  };

  const feetRenderers = {
    feet: (cx, cy, fx, itemId, item) => drawFeetArmor(cx, cy, armorPaletteForItem(itemId, item)),
    boots: (cx, cy, fx, itemId, item) => drawFeetArmor(cx, cy, armorPaletteForItem(itemId, item)),
    feet_crude: (cx, cy) => drawFeetArmor(cx, cy, ARMOR_PALETTES.crude),
    feet_iron: (cx, cy) => drawFeetArmor(cx, cy, ARMOR_PALETTES.iron)
  };

  const slotRegistries = {
    weapon: weaponRenderers,
    offhand: offhandRenderers,
    head: headRenderers,
    body: bodyRenderers,
    legs: legsRenderers,
    hands: handsRenderers,
    feet: feetRenderers
  };

  function inferSlotVisualKey(slotName, itemId, item) {
    return inferEquipVisualKey(itemId, item, slotName);
  }

  function resolveSlotRenderer(slotName, itemId, item) {
    const registry = slotRegistries[slotName];
    if (!registry) return null;

    const configured = item?.equipVisual?.key;
    if (configured && registry[configured]) return registry[configured];
    if (registry[itemId]) return registry[itemId];

    const inferred = inferSlotVisualKey(slotName, itemId, item);
    if (inferred && registry[inferred]) return registry[inferred];
    return null;
  }

  function getAppearanceSlot(slotName) {
    const itemId = equipment[slotName];
    if (!itemId) return null;
    const item = Items[itemId];
    return {
      itemId,
      item,
      key: String(item?.equipVisual?.key || inferSlotVisualKey(slotName, itemId, item) || itemId),
      material: item?.equipVisual?.material || inferEquipMaterial(itemId, item),
      palette: armorPaletteForItem(itemId, item)
    };
  }

  function getAppearance() {
    return {
      head: getAppearanceSlot("head"),
      body: getAppearanceSlot("body"),
      legs: getAppearanceSlot("legs"),
      hands: getAppearanceSlot("hands"),
      feet: getAppearanceSlot("feet")
    };
  }

  function drawEquippedGear(cx, cy, fx) {
    const propSlots = ["offhand", "weapon"];
    for (const slotName of propSlots) {
      const itemId = equipment[slotName];
      if (!itemId) continue;
      const item = Items[itemId];
      const drawFn = resolveSlotRenderer(slotName, itemId, item);
      if (!drawFn) continue;
      drawFn(cx, cy, fx, itemId, item);
    }
  }

  // Extension hook: register custom renderers without editing this module.
  function registerRenderer(slotName, key, drawFn) {
    if (!slotRegistries[slotName]) slotRegistries[slotName] = {};
    if (typeof key !== "string" || !key) return false;
    if (typeof drawFn !== "function") return false;
    slotRegistries[slotName][key] = drawFn;
    return true;
  }

  return { drawEquippedGear, getAppearance, registerRenderer };
}
