export function initQuestSystem(deps) {
  const {
    createQuestSystem,
    questDefs,
    now,
    chatLine,
    renderQuests,
    syncDungeonQuestState,
    hasItem,
    addToInventory,
    addGroundLoot,
    player,
    addGold,
    grantQuestRenown,
    questRenownRewards,
    questRenownState
  } = deps;

  const {
    questList: QUESTS,
    getQuestDefById,
    resetQuestProgress,
    getQuestProgress,
    isQuestCompleted,
    isQuestStarted,
    isQuestUnlocked,
    getQuestObjectiveTarget,
    getQuestObjectiveProgress,
    isQuestObjectiveComplete,
    hasQuestObjectiveToken,
    isQuestReadyToComplete,
    completeQuest: _completeQuest_original,
    trackQuestEvent: _trackQuestEvent_original,
    getQuestSnapshot,
    applyQuestSnapshot: _applyQuestSnapshot_original,
    handleQuartermasterTalk,
    npcHasPendingQuestMarker
  } = createQuestSystem({
    questDefs,
    now,
    chatLine,
    renderQuests,
    syncDungeonQuestState,
    hasItem,
    addToInventory,
    addGroundLoot,
    player,
    addGold,
    onQuestCompleted: (questId) => {
      grantQuestRenown(questId);
      if (String(questId) === "first_watch") {
        chatLine("<span class=\"muted\">The people of Rivermoor seem to trust you more. Perhaps the Mayor could use your help rebuilding the town.</span>");
      }
    }
  });

  function grantRetroactiveQuestRenown() {
    const rewardKeys = Object.keys(questRenownRewards || {});
    if (!rewardKeys.length) return;
    let applied = false;
    for (const questId of rewardKeys) {
      if (isQuestCompleted(questId)) {
        applied = grantQuestRenown(questId) || applied;
      }
    }
    if (applied) {
      chatLine("<span class=\"muted\">Rivermoor recognizes your past deeds. Renown has been updated.</span>");
    }
  }

  const applyQuestSnapshot = (data) => {
    _applyQuestSnapshot_original(data);
    if (questRenownState.getMissing() || questRenownState.getNeedsReconcile()) {
      questRenownState.setMissing(false);
      questRenownState.setNeedsReconcile(false);
      grantRetroactiveQuestRenown();
    }
  };

  // Create wrapped versions for PASS 2 & PASS 3
  const completeQuest = (questId) => {
    const result = _completeQuest_original(questId);
    if (result) {
      grantQuestRenown(questId);
      if (String(questId) === "first_watch") {
        chatLine("<span class=\"muted\">The people of Rivermoor seem to trust you more. Perhaps the Mayor could use your help rebuilding the town.</span>");
      }
    }
    return result;
  };

  const trackQuestEvent = (ev) => {
    const result = _trackQuestEvent_original(ev);
    return result;
  };

  return {
    QUESTS,
    getQuestDefById,
    resetQuestProgress,
    getQuestProgress,
    isQuestCompleted,
    isQuestStarted,
    isQuestUnlocked,
    getQuestObjectiveTarget,
    getQuestObjectiveProgress,
    isQuestObjectiveComplete,
    hasQuestObjectiveToken,
    isQuestReadyToComplete,
    completeQuest,
    trackQuestEvent,
    getQuestSnapshot,
    applyQuestSnapshot,
    handleQuartermasterTalk,
    npcHasPendingQuestMarker
  };
}
