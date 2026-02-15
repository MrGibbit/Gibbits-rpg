# Classic RPG v0.4.5
Release drop: February 15, 2026

## Highlights
- Added a full quest system with a dedicated Quest Journal UI.
- Added a new two-part questline anchored by Quartermaster Bryn.
- Expanded dungeon progression with a sealed boss wing and Skeleton Warden encounter.
- Added quest-state persistence to save/load.
- Included smithing balance tuning so smithing pace better tracks mining.

## Quests and Journal
- Added a Quests toolbar button and Quest Journal window.
- Quest Journal now groups quests into Active, New, Locked, and Completed.
- Quest cards now show objective progress, requirements, and rewards.
- Added runtime quest tracking for gather, cook, smelt, talk, kill, and manual objective triggers.
- Added auto-start/completion flow for supported quests.

## New Questline
- Added `first_watch`.
- Added `ashes_under_the_keep`.
- Added quest giver NPC `Quartermaster Bryn` in the starter castle.
- Added quest rewards `Warden Key Fragment` and `Warden's Brand`.

## Dungeon Boss-Wing Progression
- Expanded dungeon layout with a sealed wing corridor and chamber.
- Added new interactables `sealed_gate` and `brazier`.
- Added permanent gate unlock flow using `Warden Key Fragment`.
- Added brazier ritual progression tied to quest state.
- Added Skeleton Warden boss lifecycle with conditional spawn, quest-aware defeat handling/cleanup, and Warden-specific gold rewards.
- Defeated Skeleton Warden no longer respawns.

## Interaction and Systems
- Added entity lookup support for `quest_npc`, `sealed_gate`, and `brazier`.
- Added examine text support for the new quest/dungeon interaction targets.
- Added quest event emission from gameplay actions in `src/action-resolver.js`.
- Added resolver callbacks for quest NPC talk, sealed gate use, brazier use, and mob-defeat hooks.

## Persistence
- Save payload now includes quest snapshot data.
- Load path now restores quest progress and quest state.

## UI and Visuals
- Added custom world rendering for quest NPC, segment-aware sealed gate states, and lit/unlit dungeon braziers.
- Added quest window styling and sizing constraints.
- Added `quests` window-open state in runtime state management.

## Character UI Refactor
- Moved character overlay/load/delete orchestration out of `game.js` into `src/character-ui.js`.
- Wired `game.js` to use `createCharacterUI(...)` while preserving existing character flow.

## Balance
- Smelting XP changed from `45` to `20` per ore.
- This keeps smithing-per-ore progression closer to mining pace.

## Test Coverage
- Expanded smoke test coverage to include opening the Quests window, interacting with Quartermaster (`quest_npc`), and interacting with the dungeon sealed gate (`sealed_gate`).
