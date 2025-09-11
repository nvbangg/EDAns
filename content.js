var x = document.cookie;
var f = x.indexOf('^Token*');
var e = x.indexOf('^UserName');
var token = x.substr(f + 7, e - f - 7);
let isTest = false;
document.addEventListener('keydown', addEv, false);

async function addEv(e)
{
  if (e.keyCode == 32) getAns(); //Space
  //Z

};

let itemList = [];

async function getAns()
{
  chrome.runtime.sendMessage({
    type: 'ansUrl',
    request: 'none',
  }, async function(datax)
  {
    console.clear();
    console.log(datax);
    let data = datax['aRequest'];
    let autho = datax['autho'];

    let res = await fetch(data, {
      'headers': {
        'Authorization': autho,
      },

    });
    await res.json().then(async function(dat)
    {
      let qs = dat['i']['q'];
      var sw = '';
      for (var i = 0; i < qs.length; i++)
      {
        let ch = qs[i]['al'];
        for (var j = 0; j < ch.length; j++)
        {
          aAns = ch[j]['a'];
          for (var k = 0; k < aAns.length; k++)
          {
            let op = aAns[k];

            if (!op['c'] || op['c'] == '1')
            {
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
document.body.addEventListener('mouseup', nextPage)

document.addEventListener('keydown', function(event)
{
  if (event.keyCode === 39)
  {
    document.getElementById('learning__nextItem').click();
  }
});

document.addEventListener('keydown', function(event)
{
  if (event.keyCode === 90)
  {
    if (!isTest)
    {
      completeCurrent();
      tryFinish();
    }
    setTimeout(function()
    {
      document.getElementById('learning__nextItem').click();

    }, 300);
  }
});

function nextPage(e)
{
  if (typeof e === 'object')
  {
    if (e.button == 4)
    {
      document.getElementById('learning__nextItem').click();
    }
  }
}

function completeCurrent()
{
  chrome.runtime.sendMessage({
    type: 'completeTask',
    request: 'none',
  }, function(passData)
  {
    courseId = passData['courseId'];
    itemId = passData['itemId'];
    autho = passData['autho'];
    url = 'https://eduiwebservices21.engdis.com/api/Progress/SetProgressPerTask';
    body = '{"CourseId":' + courseId + ',"ItemId": ' + itemId + '}';
    console.log(body + ' ' + autho);
    let res = fetch(url, {
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

function tryFinish()
{
  let e1 = document.getElementById('CTrackerPlayBtn');
  if (e1 !== null && e1 !== undefined)
  {
    e1.click();
    setTimeout(function()
    {
      e1.click();
    }, 200);
  }
  let e2 = document.getElementById('play-pause');
  if (e2 !== null && e2 !== undefined)
  {
    e2.click();
    setTimeout(function()
    {
      e2.click();
    }, 200);
  }
  r1 = document.getElementById('question-1_answer-1');
  if (r1 !== null && r1 !== undefined) r1.click();
  r2 = document.getElementsByClassName('multiRadio')[0];
  if (r2 !== null && r2 !== undefined) r2.click();

  s1 = document.getElementsByClassName('learning__selectTxt_st')[0];
  if (s1 !== null && s1 !== undefined) s1.click();

  s2 = document.getElementsByClassName('DDLOptions__selected')[0];
  if (s2 !== null && s2 !== undefined)
  {
    s2.click();
    setTimeout(function()
    {
      s2_1 = document.getElementsByClassName('DDLOptions__listItem')[0];
      if (s2_1 !== null && s2_1 !== undefined) s2_1.click();
    }, 100);

  }

}

var sumElement = document.createElement('div');
document.body.appendChild(sumElement);
sumElement.classList = 'carry';

var btn0 = document.createElement('button');
btn0.innerHTML = 'Ans';
btn0.classList = 'buttonX';
sumElement.appendChild(btn0);
btn0.onclick = function()
{
  getAns();
};

const checkbox = document.createElement('input');
checkbox.type = 'checkbox';
checkbox.style.width = '30px';
checkbox.style.height = '30px';
sumElement.appendChild(checkbox);
checkbox.addEventListener('change', function(event)
{
  isTest = event.target.checked;
});
var ansShow = document.createElement('div');
sumElement.appendChild(ansShow);
ansShow.classList = 'ansShow';