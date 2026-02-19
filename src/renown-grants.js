export function createRenownGrants(deps) {
  const {
    now,
    chatLine,
    grantTownRenown,
    questRenownRewards,
    wardenRenownConfig
  } = deps;

  const renownGrants = {
    quests: {},
    questAmounts: {},
    wardens: {}
  };
  let questRenownSnapshotMissing = false;
  let questRenownNeedsReconcile = false;

  function resetRenownGrants() {
    renownGrants.quests = {};
    renownGrants.questAmounts = {};
    renownGrants.wardens = {};
  }

  function getRenownGrantsSnapshot() {
    return {
      quests: { ...renownGrants.quests },
      questAmounts: { ...renownGrants.questAmounts },
      wardens: { ...renownGrants.wardens }
    };
  }

  function applyRenownGrantsSnapshot(data) {
    if (!data || typeof data !== "object") {
      resetRenownGrants();
      return;
    }
    renownGrants.quests = (data.quests && typeof data.quests === "object")
      ? { ...data.quests }
      : {};
    renownGrants.questAmounts = (data.questAmounts && typeof data.questAmounts === "object")
      ? { ...data.questAmounts }
      : {};
    renownGrants.wardens = (data.wardens && typeof data.wardens === "object")
      ? { ...data.wardens }
      : {};
  }

  function getQuestRenownSnapshot() {
    return getRenownGrantsSnapshot();
  }

  function applyQuestRenownSnapshot(data) {
    applyRenownGrantsSnapshot(data);
    const questBag = renownGrants.quests && typeof renownGrants.quests === "object" ? renownGrants.quests : null;
    const questAmountsBag = renownGrants.questAmounts && typeof renownGrants.questAmounts === "object"
      ? renownGrants.questAmounts
      : null;
    questRenownSnapshotMissing = !questBag || Object.keys(questBag).length === 0
      || !questAmountsBag || Object.keys(questAmountsBag).length === 0;
    questRenownNeedsReconcile = Object.entries(questRenownRewards || {}).some(([questId, rewardCfg]) => {
      const targetAmount = rewardCfg?.amount | 0;
      const grantedAmount = questAmountsBag?.[questId] | 0;
      return grantedAmount < targetAmount;
    });
  }

  function grantQuestRenown(questId) {
    const questIdStr = String(questId || "");
    if (!questIdStr) return false;

    const rewardCfg = questRenownRewards[questIdStr];
    if (!rewardCfg) return false;

    const priorAmount = (renownGrants.questAmounts?.[questIdStr] | 0);
    const targetAmount = rewardCfg.amount | 0;
    const delta = Math.max(0, targetAmount - priorAmount);

    if (renownGrants.quests[questIdStr] && delta <= 0) {
      return false;
    }

    renownGrants.quests[questIdStr] = true;
    renownGrants.questAmounts[questIdStr] = Math.max(targetAmount, priorAmount);

    if (delta <= 0) return false;

    const message = priorAmount > 0
      ? `Quest "${questIdStr.replace(/_/g, " ")}" renown updated.`
      : `Quest "${questIdStr.replace(/_/g, " ")}" completed.`;
    return grantTownRenown(rewardCfg.townId, delta, message);
  }

  function grantWardenDefeatRenown(wardenKey = "skeleton_warden") {
    const keyStr = String(wardenKey || "skeleton_warden");
    const cfg = wardenRenownConfig[keyStr];
    if (!cfg) return false;

    const nowMs = now();
    const wardenState = renownGrants.wardens[keyStr] || {};
    const lastGrantedAt = wardenState.lastGrantedAt || 0;
    const msSinceLastGrant = nowMs - lastGrantedAt;

    if (cfg.firstKillOnly && renownGrants.wardens[keyStr]?.granted) {
      const remainingMs = cfg.cooldownMs - msSinceLastGrant;
      const remainingSec = Math.ceil(remainingMs / 1000);
      if (remainingMs > 0) {
        chatLine(`<span class=\"muted\">Rivermoor renown can be earned from the ${keyStr.replace(/_/g, " ")} again in ~${remainingSec}s.</span>`);
      }
      return false;
    }

    if (!cfg.firstKillOnly && msSinceLastGrant < cfg.cooldownMs) {
      const remainingMs = cfg.cooldownMs - msSinceLastGrant;
      const remainingSec = Math.ceil(remainingMs / 1000);
      chatLine(`<span class=\"muted\">Rivermoor renown can be earned from the ${keyStr.replace(/_/g, " ")} again in ~${remainingSec}s.</span>`);
      return false;
    }

    renownGrants.wardens[keyStr] = {
      lastGrantedAt: nowMs,
      granted: cfg.firstKillOnly
    };

    const message = `${keyStr.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())} defeated.`;
    return grantTownRenown(cfg.townId, cfg.amount, message);
  }

  function getQuestGrantFlags() {
    return { ...renownGrants.quests };
  }

  function clearQuestGrantFlags() {
    renownGrants.quests = {};
    renownGrants.questAmounts = {};
  }

  function getWardenGrantFlags() {
    return { ...renownGrants.wardens };
  }

  function clearWardenGrantFlags() {
    renownGrants.wardens = {};
  }

  const questRenownState = {
    getMissing: () => questRenownSnapshotMissing,
    setMissing: (value) => { questRenownSnapshotMissing = value; },
    getNeedsReconcile: () => questRenownNeedsReconcile,
    setNeedsReconcile: (value) => { questRenownNeedsReconcile = value; }
  };

  return {
    resetRenownGrants,
    getRenownGrantsSnapshot,
    applyRenownGrantsSnapshot,
    getQuestRenownSnapshot,
    applyQuestRenownSnapshot,
    grantQuestRenown,
    grantWardenDefeatRenown,
    getQuestGrantFlags,
    clearQuestGrantFlags,
    getWardenGrantFlags,
    clearWardenGrantFlags,
    questRenownState
  };
}
