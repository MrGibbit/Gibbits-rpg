export function attachInventoryContextMenus(deps) {
  const {
    invGrid,
    bankGrid,
    eqWeaponSlot,
    eqOffhandSlot,
    eqHeadSlot,
    eqBodySlot,
    eqLegsSlot,
    eqHandsSlot,
    eqFeetSlot,
    eqQuiverSlot,
    inv,
    bank,
    equipment,
    Items,
    player,
    windowsOpen,
    openCtxMenu,
    countInvQtyById,
    depositByIdFromInv,
    consumeFoodFromInv,
    canEquip,
    equipAmmoFromInv,
    equipFromInv,
    setUseState,
    chatLine,
    lockManualDropAt,
    addGroundLoot,
    renderInv,
    withdrawFromBank,
    unequipSlot,
    getQuiverCount,
    moveAmmoFromQuiverToInventory,
    onRubXpLamp,
    openNumberPrompt
  } = deps;

  invGrid.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    const slot = e.target.closest(".slot");
    if (!slot) return;
    const idx = parseInt(slot.dataset.index, 10);
    const s = inv[idx];
    if (!s) return;

    const item = Items[s.id];

    if (windowsOpen.bank) {
      const have = countInvQtyById(s.id, { includeNoted: true });
      const opts = [];
      opts.push({ label: "Deposit 1", onClick: () => depositByIdFromInv(idx, 1) });
      opts.push({ label: "Deposit 5", onClick: () => depositByIdFromInv(idx, 5) });
      opts.push({ label: "Deposit 10", onClick: () => depositByIdFromInv(idx, 10) });
      opts.push({
        label: "Deposit X...",
        onClick: () => {
          openNumberPrompt({
            title: "Deposit Items",
            sub: `How many ${item?.name ?? s.id}?`,
            label: "Amount",
            defaultValue: 10,
            min: 1,
            max: have,
            onConfirm: (n) => depositByIdFromInv(idx, n)
          });
        }
      });
      opts.push({ label: "Deposit All", onClick: () => depositByIdFromInv(idx, have) });
      openCtxMenu(e.clientX, e.clientY, opts);
      return;
    }

    if (s.noted) {
      const opts = [
        {
          label: "Notes can only be sold or banked",
          onClick: () => {
            chatLine(`<span class="muted">Notes can only be sold or banked.</span>`);
          }
        }
      ];
      openCtxMenu(e.clientX, e.clientY, opts);
      return;
    }

    const opts = [];
    if (item?.heal > 0) {
      opts.push({ label: "Eat", onClick: () => consumeFoodFromInv(idx) });
    }

    const slotName = canEquip(s.id);
    if (item?.ammo) {
      opts.push({ label: "Equip", onClick: () => equipAmmoFromInv(idx) });
    } else if (slotName) {
      opts.push({ label: "Equip", onClick: () => equipFromInv(idx) });
    }

    if (s.id === "xp_lamp") {
      opts.push({
        label: "Rub",
        onClick: () => {
          if (typeof onRubXpLamp === "function") {
            onRubXpLamp();
          } else {
            setUseState(s.id);
            chatLine(`<span class="muted">You select the ${item?.name ?? s.id}.</span>`);
          }
        }
      });
    } else {
      opts.push({
        label: "Use",
        onClick: () => {
          setUseState(s.id);
          chatLine(`<span class="muted">You select the ${item?.name ?? s.id}.</span>`);
        }
      });
    }

    opts.push({ type: "sep" });
    opts.push({ type: "sep" });

    opts.push({
      label: "Drop",
      onClick: () => {
        if (item?.stack && (s.qty | 0) > 1) {
          inv[idx] = { id: s.id, qty: (s.qty | 0) - 1 };
        } else {
          inv[idx] = null;
        }
        lockManualDropAt(player.x, player.y);
        addGroundLoot(player.x, player.y, s.id, 1);
        renderInv();
        chatLine(`<span class="muted">You drop the ${item?.name ?? s.id}.</span>`);
      }
    });

    opts.push({
      label: "Drop X...",
      onClick: () => {
        const have = countInvQtyById(s.id);
        openNumberPrompt({
          title: "Drop Items",
          sub: `How many ${item?.name ?? s.id}?`,
          label: "Amount",
          defaultValue: 10,
          min: 1,
          max: have,
          onConfirm: (n) => {
            lockManualDropAt(player.x, player.y);
            let dropped = 0;
            if (item?.stack) {
              const stackHave = Math.max(1, s.qty | 0);
              dropped = Math.min(n, stackHave);
              const left = stackHave - dropped;
              inv[idx] = left > 0 ? { id: s.id, qty: left } : null;
              if (dropped > 0) addGroundLoot(player.x, player.y, s.id, dropped);
            } else {
              let remaining = n;
              for (let i = 0; i < inv.length && remaining > 0; i++) {
                if (inv[i] && inv[i].id === s.id) {
                  inv[i] = null;
                  addGroundLoot(player.x, player.y, s.id, 1);
                  remaining--;
                }
              }
              dropped = n - remaining;
            }
            renderInv();
            chatLine(`<span class="muted">You drop ${dropped}x ${item?.name ?? s.id}.</span>`);
          }
        });
      }
    });

    openCtxMenu(e.clientX, e.clientY, opts);
  });

  bankGrid.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    const slot = e.target.closest(".slot");
    if (!slot) return;
    const idx = parseInt(slot.dataset.index, 10);
    const s = bank[idx];
    if (!s) return;
    const item = Items[s.id];

    const opts = [];
    const suffix = item?.ammo ? " to Quiver" : "";
    const have = Math.max(1, s.qty | 0);
    opts.push({ label: `Withdraw 1${suffix}`, onClick: () => withdrawFromBank(idx, 1) });
    opts.push({ label: `Withdraw 5${suffix}`, onClick: () => withdrawFromBank(idx, 5) });
    opts.push({ label: `Withdraw 10${suffix}`, onClick: () => withdrawFromBank(idx, 10) });
    opts.push({
      label: `Withdraw X...${suffix}`,
      onClick: () => {
        openNumberPrompt({
          title: "Withdraw Items",
          sub: `How many ${item?.name ?? s.id}?`,
          label: "Amount",
          defaultValue: 10,
          min: 1,
          max: have,
          onConfirm: (n) => withdrawFromBank(idx, n)
        });
      }
    });
    opts.push({ label: `Withdraw All${suffix}`, onClick: () => withdrawFromBank(idx, have) });
    openCtxMenu(e.clientX, e.clientY, opts);
  });

  function equipSlotContextMenu(e, slotName) {
    e.preventDefault();
    const id = equipment[slotName];
    if (!id) return;
    const opts = [{ label: "Unequip", onClick: () => unequipSlot(slotName) }];
    openCtxMenu(e.clientX, e.clientY, opts);
  }

  function moveArrowsToInventory(qty = null) {
    const before = getQuiverCount();
    if (before <= 0) {
      chatLine(`<span class="warn">No arrows in quiver.</span>`);
      return;
    }

    const moved = moveAmmoFromQuiverToInventory("wooden_arrow", qty);
    if (moved <= 0) {
      chatLine(`<span class="warn">Inventory full.</span>`);
      return;
    }

    chatLine(`<span class="muted">You move ${moved}x ${Items.wooden_arrow.name} to your inventory.</span>`);
  }

  function quiverSlotContextMenu(e) {
    e.preventDefault();
    if (getQuiverCount() <= 0) return;

    const opts = [
      { label: "Move 1 to Inventory", onClick: () => moveArrowsToInventory(1) },
      { label: "Move 10 to Inventory", onClick: () => moveArrowsToInventory(10) },
      {
        label: "Move X...",
        onClick: () => {
          const have = getQuiverCount();
          openNumberPrompt({
            title: "Move Arrows",
            sub: "How many arrows to inventory?",
            label: "Amount",
            defaultValue: 10,
            min: 1,
            max: have,
            onConfirm: (n) => moveArrowsToInventory(n)
          });
        }
      },
      { label: "Move All to Inventory", onClick: () => moveArrowsToInventory(null) }
    ];
    openCtxMenu(e.clientX, e.clientY, opts);
  }

  if (eqWeaponSlot) eqWeaponSlot.addEventListener("contextmenu", (e) => equipSlotContextMenu(e, "weapon"));
  if (eqOffhandSlot) eqOffhandSlot.addEventListener("contextmenu", (e) => equipSlotContextMenu(e, "offhand"));
  if (eqHeadSlot) eqHeadSlot.addEventListener("contextmenu", (e) => equipSlotContextMenu(e, "head"));
  if (eqBodySlot) eqBodySlot.addEventListener("contextmenu", (e) => equipSlotContextMenu(e, "body"));
  if (eqLegsSlot) eqLegsSlot.addEventListener("contextmenu", (e) => equipSlotContextMenu(e, "legs"));
  if (eqHandsSlot) eqHandsSlot.addEventListener("contextmenu", (e) => equipSlotContextMenu(e, "hands"));
  if (eqFeetSlot) eqFeetSlot.addEventListener("contextmenu", (e) => equipSlotContextMenu(e, "feet"));
  if (eqQuiverSlot) eqQuiverSlot.addEventListener("contextmenu", quiverSlotContextMenu);
}
