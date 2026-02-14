# Classic Browser RPG Prototype

Small old-school browser RPG built with plain HTML, CSS, JavaScript, and an HTML5 canvas.

No engines. No frameworks. Fast iteration.

## Project Goal
Build a classic-style RPG loop in the browser:
- Move around a tile world
- Fight enemies
- Gather resources
- Train skills
- Craft useful items
- Expand content over time

## Current Features

### Core Gameplay
- Top-down tile map rendered on canvas
- Click-to-move navigation
- Combat with enemy level context
- Loot drops and pickup

### UI and Systems
- Inventory with right-click actions (equip, use, drop)
- Equipment slots (weapon/offhand)
- Quiver system for arrows (separate from inventory slots)
- Bank storage
- Vendor buy/sell interface
- Draggable/resizable UI windows
- Skills panel with XP, levels, and combat level display

### Skills and Progression
- Accuracy, Power, Defense, Ranged, Sorcery, Health
- Gathering/crafting skills including Woodcutting, Mining, Fishing, Firemaking, Cooking, and Fletching
- Melee training selector (route melee XP to Accuracy/Power/Defense)
- XP gain messaging and level-up feedback

### Gathering and Crafting
- Woodcutting: trees -> logs -> XP
- Mining: rocks -> ore -> XP
- Firemaking: Flint & Steel + logs -> temporary campfire
- Cooking via campfire loop

### Visual Updates (v0.4.0)
- Emoji iconography replaced with handcrafted SVG icon art
- Skills icons are larger and easier to read
- Sorcery uses a wizard-hat icon
- Naming cleanup: `Woodcut` -> `Woodcutting`

## What Is Next
- More enemies and combat variety
- Expanded item/drop tables
- More resource tiers and crafting progression
- Additional world areas and interactions
- Vendor economy tuning and item expansion

## Run Locally
You can open `index.html` directly, but a local server is recommended.

### Python
```bash
python -m http.server 8000
```

Then open:
- `http://localhost:8000`
