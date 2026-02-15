export function createItemUse(deps) {
  const {
    useState,
    invUseStateEl,
    Items,
    chatLine,
    levelFromXP,
    Skills,
    inv,
    addToQuiver,
    addXP,
    renderInv,
    removeItemsFromInventory,
    addToInventory,
    addGroundLoot,
    player,
    isIndoors,
    getEntityAt,
    syncPlayerPix,
    startTimedAction,
    now,
    interactables,
    isWalkable,
    setPathTo,
    onRubXpLamp
  } = deps;

  function showBoneMealPlaceholder() {
    chatLine(`<span class="muted">You spread the ${Items.bone_meal?.name ?? "Bone Meal"}, but nothing grows yet. Farming is coming soon.</span>`);
  }

  function setUseState(id) {
    useState.activeItemId = id;
    if (!id) {
      invUseStateEl.textContent = "Use: none";
      return;
    }
    const item = Items[id];
    invUseStateEl.textContent = `Use: ${item ? item.name : id}`;
  }

  function handleUseOnSelf(toolId) {
    if (toolId === "xp_lamp") {
      if (typeof onRubXpLamp === "function") {
        onRubXpLamp();
      } else {
        chatLine(`<span class="muted">Nothing interesting happens.</span>`);
      }
      return;
    }
    if (toolId === "bone_meal") {
      showBoneMealPlaceholder();
      return;
    }
    chatLine(`<span class="muted">Nothing interesting happens.</span>`);
  }

  function isStickyUseTool(toolId) {
    return toolId === "flint_steel" || toolId === "knife" || toolId === "hammer";
  }

  function tryItemOnItem(toolId, targetId, targetIndex) {
    if (toolId === "bone_meal") {
      showBoneMealPlaceholder();
      return true;
    }

    if (toolId === "knife" && targetId === "log") {
      const lvl = levelFromXP(Skills.fletching.xp);
      if (lvl < 1) {
        chatLine(`<span class="warn">Your Fletching level is too low.</span>`);
        return true;
      }

      inv[targetIndex] = null;

      addToQuiver("wooden_arrow", 25);
      chatLine(`You fletch 25 wooden arrows.`);
      addXP("fletching", 10);

      renderInv();
      return true;
    }

    if (toolId === "hammer" && targetId === "bone") {
      if (!removeItemsFromInventory("bone", 1)) {
        chatLine(`<span class="warn">You need a ${Items.bone?.name ?? "bone"}.</span>`);
        return true;
      }

      const crushXp = 8;
      const got = addToInventory("bone_meal", 1);
      addXP("smithing", crushXp);
      if (got === 1) {
        chatLine(`<span class="good">You crush a bone into ${Items.bone_meal?.name ?? "Bone Meal"}.</span> (+${crushXp} XP)`);
      } else {
        addGroundLoot(player.x, player.y, "bone_meal", 1);
        chatLine(`<span class="warn">Inventory full: ${Items.bone_meal?.name ?? "Bone Meal"}</span> (+${crushXp} XP)`);
      }
      return true;
    }

    if (toolId === "flint_steel" && targetId === "log") {
      if (player.action.type !== "idle") {
        chatLine(`<span class="warn">You're busy.</span>`);
        return true;
      }

      if (isIndoors(player.x, player.y)) {
        chatLine(`<span class="warn">You can't light a fire indoors.</span>`);
        return true;
      }

      if (getEntityAt(player.x, player.y)) {
        chatLine(`<span class="warn">That space is occupied.</span>`);
        return true;
      }

      player.path = [];
      syncPlayerPix();

      startTimedAction("firemake", 1.2, "Lighting fire...", () => {
        if (getEntityAt(player.x, player.y)) {
          chatLine(`<span class="warn">That space is occupied.</span>`);
          return;
        }
        if (isIndoors(player.x, player.y)) {
          chatLine(`<span class="warn">You can't light a fire indoors.</span>`);
          return;
        }

        if (!removeItemsFromInventory("log", 1)) {
          chatLine(`<span class="warn">You need a log.</span>`);
          return;
        }

        const born = now();
        interactables.push({
          type: "fire",
          x: player.x,
          y: player.y,
          createdAt: born,
          expiresAt: born + 60000
        });

        addXP("firemaking", 10);
        chatLine(`<span class="good">You light a fire.</span>`);

        const sx = player.x;
        const sy = player.y + 1;
        if (isWalkable(sx, sy) && !getEntityAt(sx, sy)) {
          setPathTo(sx, sy);
        }
      });

      return true;
    }

    chatLine(`<span class="muted">Nothing interesting happens.</span>`);
    return false;
  }

  return {
    setUseState,
    tryItemOnItem,
    isStickyUseTool,
    handleUseOnSelf
  };
}
