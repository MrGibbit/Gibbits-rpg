# Classic Browser RPG Prototype

This is a small, classic-style RPG I’m building in the browser with plain **HTML / CSS / JavaScript** and an **HTML5 canvas**.  
No engines, no frameworks — just a simple prototype I can iterate on fast.

The goal is to keep it “old-school”: click around, fight stuff, gather materials, train skills, craft things, and slowly expand the world.

---

## What the game has right now

### Core gameplay
- **Top-down tile map** rendered on a canvas
- **Click to move**
- **Basic combat** (rats) with damage messages in the chat
- **Loot drops** and item pickup

### UI / systems
- **Inventory** with right-click actions (equip / use / drop)
- **Quiver** for arrows (separate from inventory slots)
- **Bank chest** for storage
- **Vendor / shop UI** for buying and selling
- **Skills window** with XP + level ups (woodcutting, mining, combat skills, etc.)

### Gathering + crafting
- **Woodcutting** (trees → logs → XP)
- **Mining** (rocks → ore → XP)
- **Fletching** (basic tool interactions)

### Firemaking (recent)
- **Flint & Steel + Log** to light a campfire
- Campfire has a simple **animation** and burns out after a bit

---

## What we’re working on next

### Cooking
- Simple success/burn timing (later)

### Firemaking polish
- Better visuals + better placement rules
- Cleaner interaction flow and feedback

### Vendor polish
- More items + prices that make sense

### Content + progression
- More enemies
- More drops
- More resource types
- More items/tools that unlock new loops

---

## Running it locally

You can open `index.html` directly, but a local server is better.

**Python:**
```bash
python -m http.server 8000
