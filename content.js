let __ans = [];
function getAns() {
  return new Promise((resolve) => {
    if (!chrome.runtime?.sendMessage) return resolve(false);
    chrome.runtime.sendMessage({ type: "ansUrl" }, async (datax) => {
      try {
        const { aRequest: data, autho } = datax || {};
        if (!data || !autho) return resolve(false);
        const res = await fetch(data, { headers: { Authorization: autho } });
        const { i: { q: qs = [] } = {} } = await res.json();
        const arrC = [],
          arrS = [];
        qs.forEach((q) => {
          (q.al || []).forEach((ch) => {
            (ch.a || []).forEach((op) => {
              const txt = op.txt || "";
              if (op.c === 1 || op.c === "1" || op.c === true) {
                arrC.push(txt);
                arrS.push(txt);
              } else if (!op.c) {
                arrS.push(txt);
              }
            });
          });
        });
        __ans = arrC.filter(Boolean);
        ansShow.innerHTML = arrS.filter(Boolean).join("<br>");
        setTimeout(applyCorrectAnswers, 50);
        resolve(true);
      } catch (_) {
        resolve(false);
      }
    });
  });
}

const clickElement = (sel) => document.querySelector(sel)?.click();
const goToNextItem = () => clickElement("#learning__nextItem");

document.addEventListener(
  "keydown",
  (e) => {
    if (
      ![32, "Space", " ", "Spacebar"].includes(
        e.keyCode === 32 ? 32 : e.code || e.key
      )
    )
      return;
    if (inTypingContext(e)) return;
    e.preventDefault();

    const afterGoToNext = () => {
      setTimeout(() => {
        getAns().then(() =>
          setTimeout(() => {
            if (
              document.querySelector(
                ".prMCQ__answerLabel, .lessonMultipleCheck, .lessonMultipleAnswer"
              )
            ) {
              applyCorrectAnswers();
            } else {
              tryFinish();
            }
          }, 150)
        );
      }, 700);
    };

    const startBtn = findVisible(".btnStartTest");
    if (startBtn) {
      startBtn.click();
      afterGoToNext();
      return;
    }

    if (!findVisible("#learning__nextItem")) {
      const bottomSubmit = findVisible(
        ".learning__submitTestLink, #learning__submitTestItem"
      );
      if (bottomSubmit) {
        bottomSubmit.click();
        return;
      }
    }

    clickElement("#CTrackerPlayBtn");
    clickElement("#play-pause");
    setTimeout(() => {
      clickElement("#CTrackerPlayBtn");
      clickElement("#play-pause");
      setTimeout(() => {
        goToNextItem();
        afterGoToNext();
      }, 100);
    }, 200);
  },
  false
);

const isVisible = (el) =>
  !!(el && (el.offsetParent !== null || el.getClientRects().length));
const findVisible = (sel) =>
  [...document.querySelectorAll(sel)].find(isVisible) || null;

const isTextInput = (el) => {
  if (!el) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName?.toUpperCase();
  const type = el.type?.toLowerCase();
  if (tag === "TEXTAREA") return true;
  if (tag === "INPUT")
    return ![
      "checkbox",
      "radio",
      "button",
      "submit",
      "range",
      "color",
      "file",
      "image",
      "reset",
      "hidden",
    ].includes(type);
  return el.getAttribute?.("role") === "textbox";
};

const inTypingContext = (e) => {
  try {
    return isTextInput(document.activeElement) || isTextInput(e?.target);
  } catch (_) {
    return false;
  }
};

const norm = (s) => (s || "").toLowerCase().replace(/\s+/g, " ").trim();

function applyCorrectAnswers() {
  try {
    if (!__ans?.length) return false;
    const set = new Set(__ans.map(norm));

    const mcqLabels = document.querySelectorAll(".prMCQ__answerLabel");
    if (mcqLabels.length) {
      let n1 = 0;
      mcqLabels.forEach((l) => {
        if (set.has(norm(l.innerText || l.textContent || ""))) {
          l.click();
          n1++;
        }
      });
      if (n1 > 0) return true;
    }

    const conts = document.querySelectorAll(".lessonMultipleAnswer");
    if (conts.length) {
      let toggled = 0;
      conts.forEach((c) => {
        const txtEl =
          c.querySelector(".multiTextInline") ||
          c.querySelector(".multiText") ||
          c.querySelector(".radioTextWrapper") ||
          c;
        const t = norm(txtEl?.innerText || txtEl?.textContent || "");
        const shouldSelect = set.has(t);
        const inp = c.querySelector("input.lessonMultipleCheck");
        const isSelected = !!(
          inp?.checked ||
          inp?.classList.contains("selected") ||
          c.classList.contains("check")
        );
        const clickTarget = c.querySelector("label.overlayCheckbox") || c;
        if (shouldSelect !== isSelected) {
          clickTarget.click();
          toggled++;
        }
      });
      if (toggled > 0) return true;
    }

    const ddls = document.querySelectorAll(".prFITB__DDLOptionsW");
    if (ddls.length) {
      const cnt = {};
      __ans.forEach((ans) => {
        const s = norm(ans);
        if (s) cnt[s] = (cnt[s] || 0) + 1;
      });
      let changed = 0;
      ddls.forEach((w) => {
        const sel = w.querySelector(".DDLOptions__selected");
        if (!sel) return;
        const cur = norm(sel.innerText || sel.textContent || "");
        if (cnt[cur] > 0) {
          cnt[cur]--;
          return;
        }
        sel.click();
        const list = (w.parentElement || w).querySelector(".DDLOptions__list");
        if (!list) {
          setTimeout(() => applyCorrectAnswers(), 60);
          return;
        }
        for (const it of list.querySelectorAll(".DDLOptions__listItem")) {
          const t = norm(it.innerText || it.textContent || "");
          if (cnt[t] > 0 || (!Object.keys(cnt).length && set.has(t))) {
            it.click();
            cnt[t] = (cnt[t] || 0) - 1;
            changed++;
            break;
          }
        }
      });
      return changed > 0 || ddls.length > 0;
    }
    return false;
  } catch (_) {
    return false;
  }
}
const dndSelector =
  '.dndBank, [id^="bank_"], ed-la-dndcloze, [dg_name="TTpTablePlaceHolder"], #bankContainer .dndZone, .prCl__container--bank .dndZone, .prMT_T2T__wordsBankWrapper .dndZone';

function tryFinish() {
  if (document.querySelector(dndSelector)) {
    setTimeout(autoPlaceDndFirst, 200);
    return;
  }
  if (
    document.querySelector(
      ".prMCQ__answerLabel, .lessonMultipleCheck, .lessonMultipleAnswer, .prFITB__DDLOptionsW, .DDLOptions__selected"
    )
  ) {
    applyCorrectAnswers();
    return;
  }
  if (!applyCorrectAnswers()) {
    clickElement("#question-1_answer-1");
    clickElement(".multiRadio");
    clickElement(".learning__selectTxt_st");
  }
}

let isDragging = false,
  dragModeEnabled = false,
  dragOffsetX = 0,
  dragOffsetY = 0;

const sumElement = document.createElement("div");
sumElement.className = "carry";
document.body.appendChild(sumElement);

const btn0 = document.createElement("button");
btn0.innerHTML = "Lấy lại đáp án";
btn0.className = "buttonX";
btn0.onclick = () => getAns();
sumElement.appendChild(btn0);

const ansShow = document.createElement("div");
ansShow.className = "ansShow";
sumElement.appendChild(ansShow);

btn0.addEventListener("dblclick", (e) => {
  dragModeEnabled = true;
  btn0.style.backgroundColor = "orange";
  btn0.style.cursor = "move";
  setTimeout(() => {
    dragModeEnabled = false;
    btn0.style.backgroundColor = "lightgreen";
    btn0.style.cursor = "pointer";
  }, 3000);
  e.preventDefault();
});

btn0.addEventListener("mousedown", (e) => {
  if (e.button === 0 && dragModeEnabled) {
    isDragging = true;
    const rect = sumElement.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    e.preventDefault();
  }
});

document.addEventListener("mousemove", (e) => {
  if (isDragging && dragModeEnabled) {
    sumElement.style.left = e.clientX - dragOffsetX + "px";
    sumElement.style.top = e.clientY - dragOffsetY + "px";
    e.preventDefault();
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

let __dndAutoPlaced = false,
  __dndContextKey = "",
  __dndObserver = null,
  __dndUserDrag = false,
  __dndMoTimer = null;

document.addEventListener(
  "mousedown",
  (e) => {
    if (e.target?.closest(".dnditem") || e.target?.closest("ed-la-dnditem"))
      __dndUserDrag = true;
  },
  true
);

document.addEventListener(
  "mouseup",
  () => {
    if (__dndUserDrag)
      setTimeout(() => {
        __dndUserDrag = false;
      }, 120);
  },
  true
);

document.addEventListener(
  "click",
  (e) => {
    const t = e.target;
    if (!t) return;
    const isNavBtn =
      t.id === "learning__nextItem" ||
      t.id === "learning__prevItem" ||
      t.closest?.("#learning__nextItem") ||
      t.closest?.("#learning__prevItem");
    if (isNavBtn) {
      __dndAutoPlaced = false;
      __dndContextKey = "";
      setTimeout(() => autoPlaceDndFirst(), 600);
    }
  },
  true
);

const zoneSelector =
  ".prCLZ__regContainer .dndZone, ed-la-dndcloze .dndZone[id^='0_'], .prMT_T2T__regContainer .dndZone, .prCl__container.regContainer .dndZone";
const bankSelector =
  ".dndBank, [id^='bank_'], [dg_name='TTpTablePlaceHolder'], #bankContainer .dndZone, .prCl__container--bank .dndZone, .prMT_T2T__wordsBankWrapper .dndZone";

function autoPlaceDndFirst() {
  try {
    if (__dndUserDrag || document.querySelector(".gu-mirror, .gu-transit"))
      return;
    const firstZone = document.querySelector(zoneSelector);
    const bank = document.querySelector(bankSelector);
    if (!firstZone || !bank) return;

    const getKey = (el) =>
      el.id ||
      el.getAttribute("dg_name") ||
      el.getAttribute("ng-reflect-container-id") ||
      "";
    const ctxKey = getKey(bank) + "|" + getKey(firstZone);
    if (ctxKey !== __dndContextKey) {
      __dndContextKey = ctxKey;
      __dndAutoPlaced = false;
    }
    if (__dndAutoPlaced) return;

    let draggable =
      bank.querySelector("ed-la-dnditem .dnditem.draggable") ||
      bank.querySelector(".dnditem.draggable");
    if (!draggable)
      draggable =
        bank.querySelector("ed-la-dnditem")?.querySelector(".dnditem") || null;

    if (draggable && !firstZone.querySelector(".dnditem")) {
      const before = firstZone.querySelectorAll(".dnditem").length;
      simulateDragDrop(draggable, firstZone).then((ok) => {
        setTimeout(() => {
          if (ok && firstZone.querySelectorAll(".dnditem").length > before) {
            __dndAutoPlaced = true;
          }
        }, 160);
      });
    }
  } catch (_) {}
}

const eventOpts = (x, y) => ({
  bubbles: true,
  cancelable: true,
  clientX: x,
  clientY: y,
  screenX: x,
  screenY: y,
  button: 0,
  buttons: 1,
  view: window,
});
const dispatchMouse = (node, type, x, y) =>
  node.dispatchEvent(new MouseEvent(type, eventOpts(x, y)));
const dispatchPointer = (node, type, x, y) => {
  if (!window.PointerEvent) return;
  const opts = { ...eventOpts(x, y), pointerId: 1, pointerType: "mouse" };
  node.dispatchEvent(new PointerEvent(type, opts));
};
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function simulateDragDrop(draggable, target) {
  try {
    if (!draggable || !target) return false;
    draggable.scrollIntoView({ block: "center", inline: "center" });
    target.scrollIntoView({ block: "center", inline: "center" });
    const s = draggable.getBoundingClientRect(),
      t = target.getBoundingClientRect();
    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
    const sx = s.left + clamp(s.width / 2, 2, s.width - 2);
    const sy = s.top + clamp(s.height / 2, 2, s.height - 2);
    const tx = t.left + clamp(t.width / 2, 4, t.width - 4);
    const ty = t.top + clamp(t.height / 2, 4, t.height - 4);

    dispatchPointer(draggable, "pointerover", sx, sy);
    dispatchMouse(draggable, "mouseover", sx, sy);
    dispatchPointer(draggable, "pointerdown", sx, sy);
    dispatchMouse(draggable, "mousedown", sx, sy);
    await delay(30);

    const steps = 10,
      kickX = sx + Math.sign(tx - sx) * 5,
      kickY = sy + Math.sign(ty - sy) * 5;
    dispatchPointer(document, "pointermove", kickX, kickY);
    dispatchMouse(document, "mousemove", kickX, kickY);
    await delay(16);

    for (let i = 1; i <= steps; i++) {
      const x = sx + ((tx - sx) * i) / steps,
        y = sy + ((ty - sy) * i) / steps;
      dispatchPointer(document, "pointermove", x, y);
      dispatchMouse(document, "mousemove", x, y);
      dispatchPointer(window, "pointermove", x, y);
      dispatchMouse(window, "mousemove", x, y);
      if (i === steps) {
        dispatchPointer(target, "pointermove", x, y);
        dispatchMouse(target, "mousemove", x, y);
      }
      await delay(16);
    }

    dispatchPointer(target, "pointerup", tx, ty);
    dispatchMouse(target, "mouseup", tx, ty);
    for (let w = 0; w < 12 && document.querySelector(".gu-mirror"); w++)
      await delay(16);
    await delay(30);
    return true;
  } catch (_) {
    return false;
  }
}

setTimeout(() => {
  if (document.querySelector(bankSelector)) autoPlaceDndFirst();
}, 800);

try {
  __dndObserver = new MutationObserver(() => {
    if (__dndUserDrag) return;
    if (__dndMoTimer) clearTimeout(__dndMoTimer);
    __dndMoTimer = setTimeout(() => {
      __dndMoTimer = null;
      if (document.querySelector(bankSelector)) autoPlaceDndFirst();
    }, 300);
  });
  __dndObserver.observe(document.documentElement || document.body, {
    childList: true,
    subtree: true,
  });
} catch (_) {}
