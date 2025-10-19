async function getAns() {
  if (!chrome.runtime || !chrome.runtime.sendMessage) return;
  chrome.runtime.sendMessage(
    { type: 'ansUrl', request: 'none' },
    async function (datax) {
      const data = datax && datax['aRequest'];
      const autho = datax && datax['autho'];
      if (!data || !autho) return;
      const res = await fetch(data, { headers: { Authorization: autho } });
      const dat = await res.json();
      const qs = dat && dat.i && dat.i.q ? dat.i.q : [];
      let sw = '';
      for (let i = 0; i < qs.length; i++) {
        const ch = qs[i]['al'] || [];
        for (let j = 0; j < ch.length; j++) {
          const aAns = ch[j]['a'] || [];
          for (let k = 0; k < aAns.length; k++) {
            const op = aAns[k];
            if (!op['c'] || op['c'] == '1') {
              sw += (op['txt'] || '') + '<br>';
            }
          }
        }
      }
      ansShow.innerHTML = sw;
    }
  );
}

function goToNextItem() {
  const el = document.getElementById('learning__nextItem');
  if (el) el.click();
}

document.addEventListener('keydown', function(e) {
  if (e.keyCode === 32) {
    clickElement('#CTrackerPlayBtn');
    clickElement('#play-pause');
    setTimeout(() => {
      clickElement('#CTrackerPlayBtn');
      clickElement('#play-pause');
      setTimeout(() => {
        goToNextItem();
        setTimeout(() => {
          getAns();
          setTimeout(tryFinish, 300);
        }, 700);
      }, 100);
    }, 200);
  }
}, false);


function clickElement(selector) {
  const el = document.querySelector(selector);
  if (el) el.click();
}

function tryFinish() {
  const hasDnd = document.querySelector(
    '.dndBank, [id^="bank_"], ed-la-dndcloze, ' +
    '[dg_name="TTpTablePlaceHolder"], ' +
    '#bankContainer .dndZone, .prCl__container--bank .dndZone, .prMT_T2T__wordsBankWrapper .dndZone'
  );
  if (hasDnd) {
    setTimeout(autoPlaceDndFirst, 200);
    return;
  }
  clickElement('#question-1_answer-1');
  clickElement('.multiRadio');
  clickElement('.learning__selectTxt_st');
  const dropdown = document.querySelector('.DDLOptions__selected');
  if (dropdown) {
    dropdown.click();
    setTimeout(() => clickElement('.DDLOptions__listItem'), 100);
  }
}

let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let dragModeEnabled = false;

const sumElement = document.createElement('div');
sumElement.className = 'carry';
document.body.appendChild(sumElement);

const btn0 = document.createElement('button');
btn0.innerHTML = 'Lấy lại đáp án';
btn0.className = 'buttonX';
sumElement.appendChild(btn0);

const ansShow = document.createElement('div');
ansShow.className = 'ansShow';
sumElement.appendChild(ansShow);

btn0.onclick = () => getAns();

btn0.addEventListener('dblclick', function(e) {
  dragModeEnabled = true;
  btn0.style.backgroundColor = 'orange';
  btn0.style.cursor = 'move';
  setTimeout(() => {
    dragModeEnabled = false;
    btn0.style.backgroundColor = 'lightgreen';
    btn0.style.cursor = 'pointer';
  }, 3000);
  e.preventDefault();
});

btn0.addEventListener('mousedown', function(e) {
  if (e.button === 0 && dragModeEnabled) {
    isDragging = true;
    const rect = sumElement.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    e.preventDefault();
  }
});

document.addEventListener('mousemove', function(e) {
  if (isDragging && dragModeEnabled) {
    sumElement.style.left = (e.clientX - dragOffsetX) + 'px';
    sumElement.style.top = (e.clientY - dragOffsetY) + 'px';
    e.preventDefault();
  }
});

document.addEventListener('mouseup', () => {
  if (isDragging) isDragging = false;
});

let __dndAutoPlaced = false;
let __dndContextKey = '';
let __dndObserver = null;
let __dndUserDrag = false;
let __dndMoTimer = null;

document.addEventListener('mousedown', (e) => {
  const n = e.target && (e.target.closest('.dnditem') || e.target.closest('ed-la-dnditem'));
  if (n) __dndUserDrag = true;
}, true);
document.addEventListener('mouseup', () => {
  if (__dndUserDrag) setTimeout(() => { __dndUserDrag = false; }, 120);
}, true);

document.addEventListener('click', (e) => {
  const t = e.target;
  if (!t) return;
  const nextBtn = (t.id === 'learning__nextItem') ? t : (t.closest && t.closest('#learning__nextItem'));
  const prevBtn = (t.id === 'learning__prevItem') ? t : (t.closest && t.closest('#learning__prevItem'));
  if (nextBtn || prevBtn) {
    __dndAutoPlaced = false;
    __dndContextKey = '';
    setTimeout(() => autoPlaceDndFirst(), 600);
  }
}, true);

function autoPlaceDndFirst() {
  try {
    if (__dndUserDrag) return;
    if (document.querySelector('.gu-mirror, .gu-transit')) return;
    const firstZone =
      document.querySelector('.prCLZ__regContainer .dndZone') ||
      document.querySelector('ed-la-dndcloze .dndZone[id^="0_"]') ||
      document.querySelector('.prMT_T2T__regContainer .dndZone') ||
      document.querySelector('.prCl__container.regContainer .dndZone');
    const bank =
      document.querySelector('.dndBank') ||
      document.querySelector('[id^="bank_"]') ||
      document.querySelector('[dg_name="TTpTablePlaceHolder"]') ||
      document.querySelector('#bankContainer .dndZone') ||
      document.querySelector('.prCl__container--bank .dndZone') ||
      document.querySelector('.prMT_T2T__wordsBankWrapper .dndZone');
    if (!firstZone || !bank) return;
    const bankKey = bank.id || bank.getAttribute('dg_name') || bank.getAttribute('ng-reflect-container-id') || '';
    const zoneKey = firstZone.id || firstZone.getAttribute('dg_name') || firstZone.getAttribute('ng-reflect-container-id') || '';
    const ctxKey = bankKey + '|' + zoneKey;
    if (ctxKey !== __dndContextKey) {
      __dndContextKey = ctxKey;
      __dndAutoPlaced = false;
    }
    if (__dndAutoPlaced) return;
    let draggable = bank.querySelector('ed-la-dnditem .dnditem.draggable') || bank.querySelector('.dnditem.draggable');
    if (!draggable) {
      const inner = bank.querySelector('ed-la-dnditem');
      if (inner) draggable = inner.querySelector('.dnditem') || null;
    }
    if (draggable && !firstZone.querySelector('.dnditem')) {
      const before = firstZone.querySelectorAll('.dnditem').length;
      simulateDragDrop(draggable, firstZone).then((ok) => {
        setTimeout(() => {
          const after = firstZone.querySelectorAll('.dnditem').length;
          if (ok && after > before) {
            __dndAutoPlaced = true;
          }
        }, 160);
      });
    }
  } catch (_) {}
}

function dispatchMouse(node, type, x, y) {
  const o = { bubbles: true, cancelable: true, clientX: x, clientY: y, screenX: x, screenY: y, button: 0, buttons: 1, view: window };
  node.dispatchEvent(new MouseEvent(type, o));
}

function dispatchPointer(node, type, x, y) {
  if (!window.PointerEvent) return;
  const o = { bubbles: true, cancelable: true, clientX: x, clientY: y, screenX: x, screenY: y, button: 0, buttons: 1, pointerId: 1, pointerType: 'mouse', view: window };
  node.dispatchEvent(new PointerEvent(type, o));
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function simulateDragDrop(draggable, target) {
  try {
    if (!draggable || !target) return false;
    draggable.scrollIntoView({ block: 'center', inline: 'center' });
    target.scrollIntoView({ block: 'center', inline: 'center' });
    const s = draggable.getBoundingClientRect();
    const t = target.getBoundingClientRect();
    const sx = s.left + Math.min(s.width - 2, Math.max(2, s.width / 2));
    const sy = s.top + Math.min(s.height - 2, Math.max(2, s.height / 2));
    const tx = t.left + Math.min(t.width - 4, Math.max(4, t.width / 2));
    const ty = t.top + Math.min(t.height - 4, Math.max(4, t.height / 2));
    dispatchPointer(draggable, 'pointerover', sx, sy);
    dispatchMouse(draggable, 'mouseover', sx, sy);
    dispatchPointer(draggable, 'pointerdown', sx, sy);
    dispatchMouse(draggable, 'mousedown', sx, sy);
    await delay(30);
    const steps = 10;
    const kickX = sx + Math.sign(tx - sx) * 5;
    const kickY = sy + Math.sign(ty - sy) * 5;
    dispatchPointer(document, 'pointermove', kickX, kickY);
    dispatchMouse(document, 'mousemove', kickX, kickY);
    await delay(16);
    for (let i = 1; i <= steps; i++) {
      const x = sx + (tx - sx) * i / steps;
      const y = sy + (ty - sy) * i / steps;
      dispatchPointer(document, 'pointermove', x, y);
      dispatchMouse(document, 'mousemove', x, y);
      dispatchPointer(window, 'pointermove', x, y);
      dispatchMouse(window, 'mousemove', x, y);
      if (i === steps) {
        dispatchPointer(target, 'pointermove', x, y);
        dispatchMouse(target, 'mousemove', x, y);
      }
      await delay(16);
    }
    dispatchPointer(target, 'pointerup', tx, ty);
    dispatchMouse(target, 'mouseup', tx, ty);
    for (let w = 0; w < 12; w++) {
      if (!document.querySelector('.gu-mirror')) break;
      await delay(16);
    }
    await delay(30);
    return true;
  } catch (e) { return false; }
}

setTimeout(() => {
  const hasDnd = document.querySelector(
    '.dndBank, [id^="bank_"], [dg_name="TTpTablePlaceHolder"], #bankContainer .dndZone, .prCl__container--bank .dndZone, .prMT_T2T__wordsBankWrapper .dndZone'
  );
  if (hasDnd) autoPlaceDndFirst();
}, 800);

try {
  __dndObserver = new MutationObserver(() => {
    if (__dndUserDrag) return;
    if (__dndMoTimer) clearTimeout(__dndMoTimer);
    __dndMoTimer = setTimeout(() => {
      __dndMoTimer = null;
      const hasDnd =
        document.querySelector('.dndBank, [id^="bank_"]') ||
        document.querySelector('ed-la-dndcloze .dndZone') ||
        document.querySelector('[dg_name="TTpTablePlaceHolder"], #bankContainer .dndZone, .prCl__container--bank .dndZone, .prMT_T2T__wordsBankWrapper .dndZone');
      if (hasDnd) autoPlaceDndFirst();
    }, 300);
  });
  __dndObserver.observe(document.documentElement || document.body, {
    childList: true,
    subtree: true
  });
} catch (_) {}
