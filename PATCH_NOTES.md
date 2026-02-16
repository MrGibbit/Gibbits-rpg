# Patch Notes Draft

Use this file as the live notes while building.

## Current (Unreleased)
- Version: `v0.4.7`
- Date: `February 16, 2026`
- Base comparison: `v0.4.4..HEAD` (`26 commits`)

```md
# Classic RPG - v0.4.7 (Draft)

Compared to the last full GitHub release (`v0.4.4`), this release bundles all content and fixes currently on `main`.

## Major Additions Since v0.4.4
- Full quest/journal system with progression tracking, rewards, and persistence.
- New dungeon wing progression: sealed gate, brazier ritual flow, and Skeleton Warden boss lifecycle.
- Equipment visual overhaul: shared visual rules, integrated armor rendering, and cleaner slot/prop behavior.
- Blacksmith Torren + forge upgrade flow (including unlockable forge bank chest).
- Warden's Brand upgrade (stat bump, undead passives, and dedicated equipped visuals).
- Scalable bank capacity upgrades and fixed-size slot grids.
- Fishing progression expansion with tiered catches and matching cooked outputs through late-game tiers.

## Combat and Progression
- Added damage mitigation from armor on landed hits (not just miss chance).
- Rebalanced early melee gear progression.
- Added melee multi-train selection with split XP distribution.
- Capped all skills at level `99`.
- Switched combat level math to RuneScape-style scaling for clearer account power progression.
- Tuned combat cadence and multiple encounter/aggro behaviors for dungeon reliability.

## Skills and Gathering
- Fishing now scales by level thresholds:
  - `Lv 1` `goldfish`
  - `Lv 10` `clownfish`
  - `Lv 20` `pufferfish`
  - `Lv 30` `catfish`
  - `Lv 40` `swordfish`
  - `Lv 55` `anglerfish`
  - `Lv 70` `moonfish`
  - `Lv 85` `chaos_koi`
- Added cooking outputs/XP entries for all new fish tiers.
- Added smarter auto-cook fallback to prefer the highest available cookable fish/meat in inventory.

## Quests, Dungeon, and World Stability
- Added `first_watch` and `ashes_under_the_keep` questline support and objective hooks.
- Improved Skeleton Warden encounter behavior (aggro floor, room coverage, and cleanup behavior).
- Fixed dungeon mob respawn-home and roam recovery issues.
- Fixed dungeon death respawn routing back to the overworld castle.
- Added migration for older world/resource layouts and stale-client compatibility safeguards.

## UI, UX, and Technical
- Expanded test coverage with smoke and quest regression suites.
- Extended debug API quest/item helpers used by automated tests.
- Added import-target validation scripts/workflow hardening.
- Added repo hygiene updates (`.gitignore` cleanup and local log/test artifact ignores).
- Applied broad refactors to split monolithic gameplay/UI logic into dedicated modules under `src/`.

## Economy and Inventory Fixes
- Fixed inventory/bank stacking consistency for identical items.
- Fixed crude weapon stack handling in bank.
- Allowed vendors to buy smithing-crafted items.
- Corrected wall-clock timestamp save behavior.
- Cleaned tooltip bullet rendering issues.
```

## Posted
- Latest full GitHub release: `v0.4.4`.
- Pending release-notes files in repo: `v0.4.5`, `v0.4.6`, `v0.4.7`.

### Internal Notes
- Keep this section updated as work happens.
- Final release notes for this draft are in `RELEASE_NOTES_v0.4.7.md`.
