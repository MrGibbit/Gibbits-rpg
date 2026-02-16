# Classic RPG v0.4.7
Release draft: February 16, 2026

Comparison baseline: `v0.4.4..HEAD` (last full GitHub release -> current `main`)

## Highlights
- Added full questline progression with Quest Journal tracking and persistence.
- Expanded dungeon progression with sealed wing interactions and Skeleton Warden boss flow.
- Refactored equipment visuals into shared, data-driven render rules and improved equipped readability.
- Added Blacksmith Torren and forge bank upgrade progression.
- Updated combat progression with armor mitigation, level-99 skill cap, and RuneScape-style combat level scaling.
- Expanded fishing into an 8-tier progression with corresponding cooking outputs.
- Hardened stability through save migrations, stack/economy fixes, and broader smoke/quest coverage.

## Quests and Dungeon Progression
- Added quest journal UX and objective tracking for gather/cook/smelt/talk/kill/manual events.
- Added questline support for `first_watch` and `ashes_under_the_keep`.
- Added dungeon progression interactions:
  - `sealed_gate` unlock path
  - `brazier` ritual path
  - Skeleton Warden conditional lifecycle hooks
- Improved Skeleton Warden behavior with full-room aggro minimum and better room-door coverage.
- Fixed dungeon mob respawn-home and roaming recovery behavior.
- Fixed dungeon death respawn path to return players to the overworld castle.

## Blacksmith, Gear, and Character Visuals
- Added Blacksmith Torren at the south keep forge.
- Added forge bank chest unlock (`10,000` gold) with persistence and upgrade UI flow.
- Refactored equip visuals into shared rules (`src/equipment-visuals.js`) and unified renderer usage.
- Improved integrated player appearance from armor slots while preserving weapon/offhand prop rendering.
- Updated Warden's Brand:
  - improved combat profile
  - undead-target passives
  - dedicated equipped visual treatment

## Combat and Progression
- Added armor mitigation on landed hits (in addition to defense-driven miss chance).
- Rebalanced early melee gear progression.
- Added melee multi-train XP split flow.
- Capped skills at `99`.
- Adopted RuneScape-style combat level scaling for better alignment with class/skill growth.
- Tuned combat pacing and encounter reliability across dungeon combat loops.

## Fishing and Cooking Progression
- Added tiered fishing catch table by Fishing level:
  - `Lv 1` `goldfish` (+18 XP)
  - `Lv 10` `clownfish` (+26 XP)
  - `Lv 20` `pufferfish` (+34 XP)
  - `Lv 30` `catfish` (+42 XP)
  - `Lv 40` `swordfish` (+50 XP)
  - `Lv 55` `anglerfish` (+60 XP)
  - `Lv 70` `moonfish` (+72 XP)
  - `Lv 85` `chaos_koi` (+86 XP)
- Added matching cooked outputs and cooking XP entries:
  - `cooked_clownfish`, `cooked_pufferfish`, `cooked_catfish`, `cooked_swordfish`,
    `cooked_anglerfish`, `cooked_moonfish`, `cooked_chaos_koi`
- Updated auto-cook fallback to choose the highest-priority available cookable item.

## Economy, Inventory, and Bank
- Added scalable bank capacity upgrade system with fixed-size slot grids.
- Fixed identical-item stacking consistency in bank/inventory flows.
- Fixed crude weapon stack behavior in bank.
- Allowed vendor buyback of smithing-crafted items.

## Stability, Persistence, and Tooling
- Added stale-client/resource-layout migration safeguards.
- Corrected wall-clock timestamp persistence behavior.
- Fixed tooltip bullet encoding/rendering edge cases.
- Expanded smoke and quest regression coverage (`tests/smoke.spec.js`, `tests/quests.spec.js`).
- Extended debug API hooks used by automation.
- Added import validation script/workflow and improved repo hygiene (`.gitignore` updates).

## Commit Summary (v0.4.4..HEAD)
- Total commits: `26`
- Range start: `fed8fb0` (release sync for v0.4.4)
- Range end: `d86a6a8` (fishing tier progression and cooking outputs)
