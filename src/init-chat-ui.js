export function initChatUi(deps) {
  const {
    document,
    window,
    chatUI,
    clamp,
    chatLine,
    CHAT_UI_KEY,
    readStoredJSON,
    writeStoredJSON
  } = deps;

  const hudChatEl = document.getElementById("hudChat");
  const hudChatTabEl = document.getElementById("hudChatTab");
  const hudChatHeaderEl = document.getElementById("hudChatHeader");
  const hudChatMinEl = document.getElementById("hudChatMin");
  const hudChatResizeEl = document.getElementById("hudChatResize");
  const chatInputEl = document.getElementById("chatInput");
  const chatSendEl = document.getElementById("chatSend");

  function saveChatUI() {
    writeStoredJSON(CHAT_UI_KEY, {
      left: chatUI.left | 0,
      top: Number.isFinite(chatUI.top) ? (chatUI.top | 0) : null,
      width: chatUI.width | 0,
      height: chatUI.height | 0,
      collapsed: !!chatUI.collapsed
    });
  }

  function loadChatUI() {
    const d = readStoredJSON(CHAT_UI_KEY, null);
    if (!d) return;
    chatUI.left = Number.isFinite(d?.left) ? (d.left | 0) : chatUI.left;
    chatUI.top = Number.isFinite(d?.top) ? (d.top | 0) : null;
    chatUI.width = Number.isFinite(d?.width) ? (d.width | 0) : chatUI.width;
    chatUI.height = Number.isFinite(d?.height) ? (d.height | 0) : chatUI.height;
    chatUI.collapsed = !!d?.collapsed;
  }

  function applyChatUI() {
    if (!hudChatEl) return;
    chatUI.left = clamp(chatUI.left | 0, 6, Math.max(6, window.innerWidth - 110));
    chatUI.width = clamp(chatUI.width | 0, 300, Math.max(300, window.innerWidth - 20));
    chatUI.height = clamp(chatUI.height | 0, 190, Math.max(190, window.innerHeight - 20));

    hudChatEl.classList.toggle("collapsed", !!chatUI.collapsed);
    hudChatEl.style.left = `${chatUI.left}px`;
    if (Number.isFinite(chatUI.top)) {
      chatUI.top = clamp(chatUI.top | 0, 6, Math.max(6, window.innerHeight - 60));
      hudChatEl.style.top = `${chatUI.top}px`;
      hudChatEl.style.bottom = "auto";
    } else {
      hudChatEl.style.top = "auto";
      hudChatEl.style.bottom = "12px";
    }
    hudChatEl.style.width = `${chatUI.width}px`;
    hudChatEl.style.height = `${chatUI.height}px`;
  }

  (function initChatUIControls() {
    if (!hudChatEl) return;

    let drag = null;
    let resize = null;

    if (hudChatHeaderEl) {
      hudChatHeaderEl.addEventListener("mousedown", (e) => {
        if (e.button !== 0 || chatUI.collapsed) return;
        const rect = hudChatEl.getBoundingClientRect();
        drag = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
        chatUI.top = rect.top | 0;
      });
    }

    if (hudChatResizeEl) {
      hudChatResizeEl.addEventListener("mousedown", (e) => {
        if (e.button !== 0 || chatUI.collapsed) return;
        e.preventDefault();
        resize = {
          sx: e.clientX,
          sy: e.clientY,
          sw: chatUI.width | 0,
          sh: chatUI.height | 0
        };
      });
    }

    if (hudChatMinEl) {
      hudChatMinEl.addEventListener("click", () => {
        chatUI.collapsed = true;
        applyChatUI();
        saveChatUI();
      });
    }

    if (hudChatTabEl) {
      hudChatTabEl.addEventListener("click", () => {
        chatUI.collapsed = false;
        applyChatUI();
        saveChatUI();
      });
    }

    const sendChatText = () => {
      if (!chatInputEl) return;
      const msg = String(chatInputEl.value || "").trim();
      if (!msg) return;
      chatLine(`<span class="muted">You:</span> ${msg}`);
      chatInputEl.value = "";
    };

    if (chatSendEl) chatSendEl.addEventListener("click", sendChatText);
    if (chatInputEl) {
      chatInputEl.addEventListener("keydown", (e) => {
        if (e.key !== "Enter") return;
        e.preventDefault();
        sendChatText();
      });
    }

    window.addEventListener("mousemove", (e) => {
      if (drag) {
        chatUI.left = (e.clientX - drag.dx) | 0;
        chatUI.top = (e.clientY - drag.dy) | 0;
        applyChatUI();
      }
      if (resize) {
        chatUI.width = (resize.sw + (e.clientX - resize.sx)) | 0;
        chatUI.height = (resize.sh + (e.clientY - resize.sy)) | 0;
        applyChatUI();
      }
    });

    window.addEventListener("mouseup", () => {
      if (drag || resize) saveChatUI();
      drag = null;
      resize = null;
    });

    window.addEventListener("resize", () => {
      applyChatUI();
      saveChatUI();
    });
  })();

  return { saveChatUI, loadChatUI, applyChatUI };
}
