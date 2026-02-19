export const TOWN_PROJECT_NPC = {
  blacksmith_torren: {
    name: "Blacksmith Torren",
    viewMode: "single",
    focusProjectId: "storage",
    variant: "torren"
  },
  dock_foreman: {
    name: "Foreman Garrick",
    viewMode: "single",
    focusProjectId: "dock",
    variant: "garrick"
  },
  hearth_keeper: {
    name: "Mara Emberward",
    viewMode: "single",
    focusProjectId: "hearth",
    variant: "mara"
  },
  mayor: {
    name: "Mayor Alden Fairholt",
    viewMode: "all",
    focusProjectId: null,
    variant: "mayor"
  }
};

export function createProjectNpcHandlers(deps) {
  const {
    chatLine,
    checkProjectUnlocks,
    openWindow,
    renderTownProjectsUI
  } = deps;

  function openTownProjectsFromNpc(npcId) {
    const config = TOWN_PROJECT_NPC[npcId];
    if (!config) {
      chatLine("<span class=\"muted\">They have nothing special to say.</span>");
      return;
    }

    if (npcId === "blacksmith_torren") {
      chatLine("<span class=\"muted\">Blacksmith Torren:</span> Let's see what we can build for Rivermoor. Here are the projects.");
    } else if (npcId === "dock_foreman") {
      chatLine("<span class=\"muted\">Foreman Garrick Tidewell:</span> The dock is crucial for Rivermoor. Let me show you our progress.");
    } else if (npcId === "hearth_keeper") {
      chatLine("<span class=\"muted\">Mara Emberward:</span> The hearth represents the heart of our community. See what we're building here.");
    } else if (npcId === "mayor") {
      chatLine("<span class=\"muted\">Mayor Alden Fairholt:</span> Let me show you all the improvements we're working on for Rivermoor.");
    }

    checkProjectUnlocks("rivermoor");
    openWindow("townProjects");
    renderTownProjectsUI({
      viewMode: config.viewMode,
      focusProjectId: config.focusProjectId,
      openedByNpcId: npcId
    });
  }

  function talkBlacksmithTorren() {
    openTownProjectsFromNpc("blacksmith_torren");
  }

  function handleProjectNpcTalk(npcId) {
    const id = String(npcId || "");
    openTownProjectsFromNpc(id);
  }

  return {
    openTownProjectsFromNpc,
    talkBlacksmithTorren,
    handleProjectNpcTalk
  };
}
