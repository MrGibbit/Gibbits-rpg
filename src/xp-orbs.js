export function createXPOrbs(deps) {
  const {
    ctx,
    now,
    clamp,
    xpToNext,
    skills,
    skillIcons,
    fallbackSkillIcon,
    getViewWidth,
    getViewHeight
  } = deps;

  const XP_ORB_META = Object.freeze({
    accuracy: { color: "#60a5fa" },
    power: { color: "#ef4444" },
    defense: { color: "#34d399" },
    ranged: { color: "#f59e0b" },
    sorcery: { color: "#a78bfa" },
    health: { color: "#fb7185" },
    fletching: { color: "#fbbf24" },
    woodcutting: { color: "#22c55e" },
    mining: { color: "#94a3b8" },
    smithing: { color: "#d6a96a" },
    fishing: { color: "#38bdf8" },
    firemaking: { color: "#fb923c" },
    cooking: { color: "#fde68a" }
  });
  const XP_ORB_KEEP_MS = 12000;
  const XP_ORB_PULSE_MS = 1250;
  const XP_ORB_MAX_VISIBLE = 6;
  const XP_DROP_FLOAT_MS = 360;
  const XP_DROP_TRAVEL_MS = 620;
  const XP_DROP_LIFE_MS = XP_DROP_FLOAT_MS + XP_DROP_TRAVEL_MS + 220;
  const XP_DROP_MAX = 48;
  const xpOrbState = Object.create(null); // skillKey -> { lastGainAt, pulseUntil }
  const xpDropFx = []; // { skillKey, amount, born, startX, startY }
  const xpOrbTargets = Object.create(null); // skillKey -> { x, y }
  const xpSkillIconCache = Object.create(null); // skillKey -> { src, img }

  function getXPOrbLayout(activeKeys) {
    const spacing = 42;
    const totalW = Math.max(0, (activeKeys.length - 1) * spacing);
    const baseX = Math.floor((getViewWidth() * 0.5) - (totalW * 0.5));
    const baseY = 54;
    return { spacing, baseX, baseY };
  }

  function drawSkillOrbIcon(skillKey, x, y, size) {
    const iconMarkup = skillIcons[skillKey] ?? fallbackSkillIcon;
    const cached = xpSkillIconCache[skillKey];
    let img = cached?.img ?? null;
    if (!cached || cached.src !== iconMarkup) {
      img = new Image();
      img.decoding = "async";
      img.src = `data:image/svg+xml;utf8,${encodeURIComponent(iconMarkup)}`;
      xpSkillIconCache[skillKey] = { src: iconMarkup, img };
    }
    if (img && img.complete && img.naturalWidth > 0) {
      const d = size * 2.2;
      ctx.save();
      const smoothPrev = ctx.imageSmoothingEnabled;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, Math.round(x - d * 0.5), Math.round(y - d * 0.5), d, d);
      ctx.imageSmoothingEnabled = smoothPrev;
      ctx.restore();
      return;
    }
    ctx.fillStyle = "rgba(241,245,249,.95)";
    ctx.beginPath();
    ctx.arc(x, y, Math.max(2, size * 0.28), 0, Math.PI * 2);
    ctx.fill();
  }

  function onGain(skillKey, amount) {
    if (!skills[skillKey]) return;
    const gain = Math.max(1, Math.floor(amount));
    const t = now();
    const state = xpOrbState[skillKey] ?? (xpOrbState[skillKey] = { lastGainAt: t, pulseUntil: 0 });
    state.lastGainAt = t;
    state.pulseUntil = t + XP_ORB_PULSE_MS;

    // Spawn under the orb row so XP appears to stack up from beneath each orb.
    const activeKeys = Object.keys(xpOrbState)
      .filter((k) => skills[k])
      .sort((a, b) => xpOrbState[b].lastGainAt - xpOrbState[a].lastGainAt)
      .slice(0, XP_ORB_MAX_VISIBLE);
    const { spacing, baseX, baseY } = getXPOrbLayout(activeKeys);
    const orbIndex = activeKeys.indexOf(skillKey);
    const orbX = (orbIndex >= 0) ? (baseX + orbIndex * spacing) : Math.floor(getViewWidth() * 0.5);
    const orbY = baseY;
    const startX = clamp(orbX + (Math.random() * 10 - 5), 44, getViewWidth() - 44);
    const startY = clamp(orbY + 28 + (Math.random() * 7 - 3.5), 44, getViewHeight() - 30);

    let merged = false;
    for (let i = xpDropFx.length - 1; i >= 0; i--) {
      const d = xpDropFx[i];
      if (d.skillKey !== skillKey) continue;
      if ((t - d.born) > 170) continue;
      d.amount += gain;
      d.born = t;
      d.startX = (d.startX + startX) * 0.5;
      d.startY = (d.startY + startY) * 0.5;
      merged = true;
      break;
    }
    if (!merged) {
      xpDropFx.push({ skillKey, amount: gain, born: t, startX, startY });
      if (xpDropFx.length > XP_DROP_MAX) {
        xpDropFx.splice(0, xpDropFx.length - XP_DROP_MAX);
      }
    }
  }

  function draw() {
    const t = now();
    const activeDropSkills = new Set();
    for (const d of xpDropFx) {
      if ((t - d.born) <= XP_DROP_LIFE_MS) activeDropSkills.add(d.skillKey);
    }

    for (const k of Object.keys(xpOrbState)) {
      const state = xpOrbState[k];
      if (!state) continue;
      if ((t - state.lastGainAt) > XP_ORB_KEEP_MS && !activeDropSkills.has(k)) {
        delete xpOrbState[k];
      }
    }

    const activeKeys = Object.keys(xpOrbState)
      .filter((k) => skills[k] && (((t - xpOrbState[k].lastGainAt) <= XP_ORB_KEEP_MS) || activeDropSkills.has(k)))
      .sort((a, b) => xpOrbState[b].lastGainAt - xpOrbState[a].lastGainAt)
      .slice(0, XP_ORB_MAX_VISIBLE);

    const keep = new Set(activeKeys);
    for (const k of Object.keys(xpOrbTargets)) {
      if (!keep.has(k)) delete xpOrbTargets[k];
    }

    const { spacing, baseX, baseY } = getXPOrbLayout(activeKeys);

    for (let i = 0; i < activeKeys.length; i++) {
      const skillKey = activeKeys[i];
      const skill = skills[skillKey];
      if (!skill) continue;
      const meta = XP_ORB_META[skillKey] ?? { color: "#f8fafc" };
      const state = xpOrbState[skillKey];
      const age = t - state.lastGainAt;
      const fade = clamp(1 - Math.max(0, age - (XP_ORB_KEEP_MS - 2200)) / 2200, 0, 1);
      const pulse = clamp((state.pulseUntil - t) / XP_ORB_PULSE_MS, 0, 1);
      const ringR = 17 + pulse * 0.9;
      const orbR = 12 + pulse * 0.45;
      const orbX = baseX + i * spacing;
      const orbY = baseY;
      const prog = clamp(xpToNext(skill.xp).pct, 0, 1);

      xpOrbTargets[skillKey] = { x: orbX, y: orbY };

      ctx.save();
      ctx.globalAlpha = fade;

      ctx.fillStyle = "rgba(2,6,13,.36)";
      ctx.beginPath();
      ctx.ellipse(orbX, orbY + 13.4, ringR - 2, 4.1, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(15,23,42,.85)";
      ctx.lineWidth = 3.8;
      ctx.beginPath();
      ctx.arc(orbX, orbY, ringR, -Math.PI * 0.5, Math.PI * 1.5);
      ctx.stroke();

      if (pulse > 0) {
        ctx.strokeStyle = "rgba(255,255,255,.26)";
        ctx.lineWidth = 1.8 + pulse * 1.1;
        ctx.beginPath();
        ctx.arc(orbX, orbY, ringR + 1.9 + pulse, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.strokeStyle = meta.color;
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.arc(orbX, orbY, ringR, -Math.PI * 0.5, -Math.PI * 0.5 + Math.PI * 2 * prog);
      ctx.stroke();

      const grad = ctx.createRadialGradient(orbX - 3.6, orbY - 4.8, 2, orbX, orbY, orbR + 4);
      grad.addColorStop(0, "rgba(241,245,249,.22)");
      grad.addColorStop(1, "rgba(7,12,20,.93)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(orbX, orbY, orbR, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(148,163,184,.72)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(orbX, orbY, orbR, 0, Math.PI * 2);
      ctx.stroke();

      drawSkillOrbIcon(skillKey, orbX, orbY, 6.9);
      ctx.restore();
    }

    for (let i = xpDropFx.length - 1; i >= 0; i--) {
      const d = xpDropFx[i];
      const age = t - d.born;
      if (age > XP_DROP_LIFE_MS) {
        xpDropFx.splice(i, 1);
        continue;
      }

      const target = xpOrbTargets[d.skillKey];
      const meta = XP_ORB_META[d.skillKey] ?? { color: "#e2e8f0" };
      let x = d.startX;
      let y = d.startY;
      let alpha = 1;
      let scale = 1;

      if (age <= XP_DROP_FLOAT_MS || !target) {
        const p = clamp(age / XP_DROP_FLOAT_MS, 0, 1);
        x = d.startX + Math.sin(p * Math.PI) * 2.2;
        y = d.startY - 20 * p;
        scale = 1.1 - p * 0.1;
      } else {
        const p = clamp((age - XP_DROP_FLOAT_MS) / XP_DROP_TRAVEL_MS, 0, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const fromY = d.startY - 20;
        x = d.startX + (target.x - d.startX) * eased;
        y = fromY + (target.y - fromY) * eased;
        alpha = 1 - p * 0.68;
        scale = 1 - p * 0.08;
      }

      if (alpha <= 0.02) continue;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `800 ${Math.max(11, Math.round(14 * scale))}px system-ui,-apple-system,Segoe UI,Roboto,Arial`;
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(0,0,0,.72)";
      ctx.strokeText(`+${d.amount}`, x, y);
      ctx.fillStyle = meta.color;
      ctx.fillText(`+${d.amount}`, x, y);
      ctx.restore();
    }
  }

  return { onGain, draw };
}
