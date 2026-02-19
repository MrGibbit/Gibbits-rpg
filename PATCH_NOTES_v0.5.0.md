# Classic RPG v0.5.0 Patch Notes

Baseline: v0.4.7 -> v0.5.0

## Highlights
- Rivermoor renown system with quest grants, persistence, and retroactive updates.
- Town Projects donations: item + gold requirements, auto-completion, +10 renown per project.
- Project NPCs with dedicated visuals and Town Projects interactions.
- Town Projects UI updates, renown pill, and dynamic donation progress.
- Town onboarding modal to explain renown and project progression.

## Renown and Progression
- Quest renown: First Watch +25, Ashes Under the Keep +40.
- Warden renown: Skeleton Warden +0 (quest completion handles renown).
- Project completion grants +10 renown each.
- Gold donations no longer grant renown.
- Milestones updated: 10/25/50/60/70 (Flourishing at 70).
- Completed quests now reconcile to updated renown amounts on load.

## Town Projects and Donations
- New project donation system for dock, storage, and hearth.
- Item + gold progress tracked per project; prevents over-donations.
- Projects start building when requirements are met and then complete.
- Project completion spawns new interactables (dock, hearth, smithing bank).

## Project NPCs
- New/updated NPCs with unique visuals and interactions:
  - Foreman Garrick (dock)
  - Mara Emberward (hearth)
  - Mayor Alden Fairholt (all projects)
  - Blacksmith Torren (storage)
- Project NPCs open Town Projects with single or full views.

## UI and UX
- Town Projects window shows renown and project requirements.
- Quest rewards list now shows renown rewards when configured.
- Onboarding modal explains renown and where to start.

## Testing
- Smoke suite updated and passing.
- Renown grants and persistence tests added.

## Breaking/Notable Changes
- Mayor position updated for layout.
- Flourishing milestone is 70 renown.
- Gold-to-renown conversion removed.

## Known Limits (v0.5.0)
- Renown-based dialogue variants are not implemented yet.
- Character sheet renown display deferred.
