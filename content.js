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
