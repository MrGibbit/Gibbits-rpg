export function seedMobs(deps) {
  const {
    mobs,
    resources,
    map,
    inBounds,
    isWalkable,
    nearTileTypeInMap,
    startCastle,
    vendorShop,
    southKeep,
    VENDOR_TILE,
    OVERWORLD_LADDER_DOWN,
    RIVER_Y,
    worldSeed,
    makeRng,
    randInt,
    keyXY,
    inRectMargin,
    W,
    H,
    player,
    clamp,
    placeMob
  } = deps;

  mobs.length = 0;

  const rng = makeRng(worldSeed ^ 0x51C3A2B9);
  const used = new Set();
  const reachable = new Set();

  function nearTileType(x, y, tileVal, radius) {
    return nearTileTypeInMap(map, inBounds, x, y, tileVal, radius);
  }

  (function buildReachable() {
    const q = [{ x: player.x, y: player.y }];
    reachable.add(keyXY(player.x, player.y));
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    while (q.length) {
      const cur = q.shift();
      for (const [dx, dy] of dirs) {
        const nx = cur.x + dx, ny = cur.y + dy;
        if (!isWalkable(nx, ny)) continue;
        const k = keyXY(nx, ny);
        if (reachable.has(k)) continue;
        reachable.add(k);
        q.push({ x: nx, y: ny });
      }
    }
  })();

  function tileOkForRat(x, y) {
    if (!inBounds(x, y)) return false;

    if (map[y][x] !== 0) return false;

    if (!reachable.has(keyXY(x, y))) return false;

    if (resources.some((r) => r.alive && r.x === x && r.y === y)) return false;

    if (
      (x === startCastle.x0 + 4 && y === startCastle.y0 + 3) ||
      (x === VENDOR_TILE.x && y === VENDOR_TILE.y) ||
      (x === 9 && y === 13) ||
      (x === OVERWORLD_LADDER_DOWN.x && y === OVERWORLD_LADDER_DOWN.y)
    ) return false;

    if (inRectMargin(x, y, startCastle, 6)) return false;
    if (inRectMargin(x, y, vendorShop, 4)) return false;
    if (inRectMargin(x, y, southKeep, 6)) return false;

    if (map[y][x] === 5) return false;
    if (nearTileType(x, y, 5, 0)) return false;

    if (used.has(keyXY(x, y))) return false;

    return true;
  }

  function treeDensity(x, y, radius) {
    let c = 0;
    for (const r of resources) {
      if (!r.alive || r.type !== "tree") continue;
      if (Math.hypot(r.x - x, r.y - y) <= radius) c++;
    }
    return c;
  }

  function tooCloseToExistingRat(x, y, minDist) {
    for (const m of mobs) {
      if (!m.alive) continue;
      if (Math.hypot(m.x - x, m.y - y) < minDist) return true;
    }
    return false;
  }

  function spawnRat(x, y) {
    used.add(keyXY(x, y));
    placeMob("rat", x, y);
  }

  function spawnGoblin(x, y) {
    used.add(keyXY(x, y));
    placeMob("goblin", x, y);
  }

  function findNestTile(kind, zoneFn = null) {
    for (let a = 0; a < 5000; a++) {
      const x = randInt(rng, 0, W - 1);
      const y = randInt(rng, 0, H - 1);
      if (!tileOkForRat(x, y)) continue;
      if (zoneFn && !zoneFn(x, y)) continue;

      if (kind === "river") {
        if (!nearTileType(x, y, 1, 1)) continue;
        if (nearTileType(x, y, 5, 1)) continue;
      } else if (kind === "woods") {
        if (treeDensity(x, y, 4.0) < 4) continue;
      }

      return { x, y };
    }
    return null;
  }

  function spawnAround(cx, cy, count, opts = {}) {
    const spread = Number.isFinite(opts.spread) ? Math.max(1, opts.spread | 0) : 3;
    const minDistBase = Number.isFinite(opts.minDist) ? Math.max(0.8, opts.minDist) : 2.1;
    const zoneFn = (typeof opts.zoneFn === "function") ? opts.zoneFn : null;
    const spawnFn = (typeof opts.spawnFn === "function") ? opts.spawnFn : spawnRat;

    let placed = 0;
    for (let a = 0; a < count * 90 && placed < count; a++) {
      const x = cx + randInt(rng, -spread, spread);
      const y = cy + randInt(rng, -spread, spread);
      if (!tileOkForRat(x, y)) continue;
      if (zoneFn && !zoneFn(x, y)) continue;

      const desiredDist = minDistBase + rng() * 0.65;
      if (tooCloseToExistingRat(x, y, desiredDist)) continue;

      spawnFn(x, y);
      placed++;
    }
    return placed;
  }

  function findClusterSeed(cx, cy, radius, zoneFn = null) {
    for (let a = 0; a < 2600; a++) {
      const x = cx + randInt(rng, -radius, radius);
      const y = cy + randInt(rng, -radius, radius);
      if (zoneFn && !zoneFn(x, y)) continue;
      if (!tileOkForRat(x, y)) continue;
      return { x, y };
    }
    return null;
  }

  const TRAINING_TARGET = 5;
  const TOTAL_TARGET = 7;
  const southOfRiver = (x, y) => y >= (RIVER_Y + 2);
  const trainingCenterX = clamp((startCastle.gateX ?? (startCastle.x0 + Math.floor(startCastle.w / 2))) + 1, 0, W - 1);
  const trainingCenterY = clamp(RIVER_Y + 4, 0, H - 1);
  const inTrainingZone = (x, y) => (
    southOfRiver(x, y) &&
    Math.abs(x - trainingCenterX) <= 9 &&
    Math.abs(y - trainingCenterY) <= 6
  );

  const trainingSeed = findClusterSeed(trainingCenterX, trainingCenterY, 8, inTrainingZone) || findNestTile("river", southOfRiver);
  if (trainingSeed) {
    const subSeed = findClusterSeed(
      trainingSeed.x + randInt(rng, -3, 3),
      trainingSeed.y + randInt(rng, -3, 3),
      4,
      inTrainingZone
    ) || trainingSeed;
    spawnAround(trainingSeed.x, trainingSeed.y, 3, { spread: 3, minDist: 1.7, zoneFn: inTrainingZone });
    spawnAround(subSeed.x, subSeed.y, 2, { spread: 3, minDist: 1.9, zoneFn: inTrainingZone });
  }

  for (let a = 0; a < 2400 && mobs.length < TRAINING_TARGET; a++) {
    const c = findClusterSeed(trainingCenterX, trainingCenterY, 9, inTrainingZone);
    if (!c) break;
    spawnAround(c.x, c.y, 1, { spread: 2, minDist: 1.8, zoneFn: inTrainingZone });
  }

  const outskirts = [
    { kind: "river", count: 1 },
    { kind: "woods", count: 1 }
  ];
  for (const n of outskirts) {
    if (mobs.length >= TOTAL_TARGET) break;
    const c = findNestTile(n.kind, southOfRiver);
    if (!c) continue;
    spawnAround(c.x, c.y, n.count, { spread: 4, minDist: 2.4, zoneFn: southOfRiver });
  }

  for (let a = 0; a < 9000 && mobs.length < TOTAL_TARGET; a++) {
    const x = randInt(rng, 0, W - 1);
    const y = randInt(rng, RIVER_Y + 2, H - 1);
    if (!tileOkForRat(x, y)) continue;
    if (!southOfRiver(x, y)) continue;
    if (tooCloseToExistingRat(x, y, 2.4 + rng() * 0.6)) continue;
    spawnRat(x, y);
  }

  const GOBLIN_TARGET = 4;
  const goblinAnchor = { x: 37, y: 13 };
  const inGoblinZone = (x, y) => (
    y <= (RIVER_Y - 5) &&
    Math.abs(x - goblinAnchor.x) <= 7 &&
    Math.abs(y - goblinAnchor.y) <= 5
  );
  const goblinCount = () => mobs.reduce((n, m) => n + ((m.alive && m.type === "goblin") ? 1 : 0), 0);

  const goblinSeed =
    findClusterSeed(goblinAnchor.x, goblinAnchor.y, 4, inGoblinZone) ||
    findClusterSeed(goblinAnchor.x, goblinAnchor.y, 8, inGoblinZone);
  if (goblinSeed) {
    spawnAround(goblinSeed.x, goblinSeed.y, GOBLIN_TARGET, {
      spread: 4,
      minDist: 2.2,
      zoneFn: inGoblinZone,
      spawnFn: spawnGoblin
    });
  }

  for (let a = 0; a < 3200 && goblinCount() < GOBLIN_TARGET; a++) {
    const x = goblinAnchor.x + randInt(rng, -7, 7);
    const y = goblinAnchor.y + randInt(rng, -5, 5);
    if (!inGoblinZone(x, y)) continue;
    if (!tileOkForRat(x, y)) continue;
    if (tooCloseToExistingRat(x, y, 2.2 + rng() * 0.6)) continue;
    spawnGoblin(x, y);
  }
}
