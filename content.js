let isTest = false;

async function getAns() {
  chrome.runtime.sendMessage({
    type: 'ansUrl',
    request: 'none',
  }, async function(datax) {
    console.clear();
    console.log(datax);
    let data = datax['aRequest'];
    let autho = datax['autho'];

    let res = await fetch(data, {
      'headers': {
        'Authorization': autho,
      },
    });
    
    await res.json().then(async function(dat) {
      let qs = dat['i']['q'];
      var sw = '';
      for (var i = 0; i < qs.length; i++) {
        let ch = qs[i]['al'];
        for (var j = 0; j < ch.length; j++) {
          aAns = ch[j]['a'];
          for (var k = 0; k < aAns.length; k++) {
            let op = aAns[k];
            if (!op['c'] || op['c'] == '1') {
              console.log(j + 1 + ' ' + op['txt']);
              sw += op['txt'] + '<br>';
            }
          }
        }
      }
      ansShow.innerHTML = sw;
    });
  });
}

function goToNextItem() {
  document.getElementById('learning__nextItem').click();
  setTimeout(getAns, 500);
}

function addEv(e) {
  if (e.keyCode == 32) {
    goToNextItem();
  }
}

document.addEventListener('keydown', addEv, false);

document.addEventListener('keydown', function(event) {
  if (event.keyCode === 90) {
    if (!isTest) {
      completeCurrent();
      tryFinish();
    }
    setTimeout(goToNextItem, 500);
  }
});


function completeCurrent() {
  chrome.runtime.sendMessage({
    type: 'completeTask',
    request: 'none',
  }, function(passData) {
    const courseId = passData['courseId'];
    const itemId = passData['itemId'];
    const autho = passData['autho'];
    const url = 'https://eduiwebservices21.engdis.com/api/Progress/SetProgressPerTask';
    const body = '{"CourseId":' + courseId + ',"ItemId": ' + itemId + '}';
    console.log(body + ' ' + autho);
    
    fetch(url, {
      'headers': {
        'Authorization': autho,
        'content-type': 'application/json',
      },
      'body': body,
      'method': 'POST',
      'accept': 'application/json, text/plain, */*',
    });
  });
}

function clickElement(selector, delay = 0) {
  const element = typeof selector === 'string' ? 
    document.querySelector(selector) : selector;
  if (element) {
    setTimeout(() => element.click(), delay);
    return true;
  }
  return false;
}

function tryFinish() {
  clickElement('#CTrackerPlayBtn');
  setTimeout(() => clickElement('#CTrackerPlayBtn'), 200);
  
  clickElement('#play-pause');
  setTimeout(() => clickElement('#play-pause'), 200);
  
  clickElement('#question-1_answer-1');
  clickElement('.multiRadio');
  clickElement('.learning__selectTxt_st');
  
  if (clickElement('.DDLOptions__selected')) {
    setTimeout(() => clickElement('.DDLOptions__listItem'), 100);
  }
}

let clickTimer = null;
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let dragModeEnabled = false;

const sumElement = document.createElement('div');
sumElement.classList = 'carry';
document.body.appendChild(sumElement);

const btn0 = document.createElement('button');
btn0.innerHTML = 'Get answer';
btn0.classList = 'buttonX';
sumElement.appendChild(btn0);

const ansShow = document.createElement('div');
ansShow.classList = 'ansShow';
sumElement.appendChild(ansShow);

btn0.onclick = function(e) {
  if (clickTimer) {
    clearTimeout(clickTimer);
    clickTimer = null;
    return;
  }
  
  clickTimer = setTimeout(() => {
    getAns();
    clickTimer = null;
  }, 300);
};

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

document.addEventListener('mouseup', function(e) {
  if (isDragging) {
    isDragging = false;
  }
});
