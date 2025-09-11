let aRequest = '';
let courseId = '';
let req = '';
let autho = '';

let itemId = '';
chrome.webRequest.onBeforeSendHeaders.addListener(
    details =>
    {
      if (details.requestHeaders == null) return;
      if (details.requestHeaders.find(dat => dat.name == 'Authorization') ==
          null) return;
      if (details.url.includes('api/practiceManager/GetItem'))
      {
        var rUrl = details.url;
        var tmp = rUrl.indexOf('?_=');
        rUrl = rUrl.substring(0, tmp - 2) + '5' +
            rUrl.substring(tmp - 1, rUrl.length);
        aRequest = rUrl;
        autho = details.requestHeaders.find(
            dat => dat.name == 'Authorization')['value'];

        itemId = details.url.match(/GetItem\/(\d+)/)[1];
        console.log(itemId + ' ' + courseId);
      }
      if (details.url.includes('engdis.com/api/CourseTree/GetUserNodeProgress'))
      {
        courseId = details.url.match(/\d+$/)[0];
      }
      //Exam
      if (details.url.includes('/api/Assessments/GetItem'))
      {
        let url = details.url;

        let lastIndex = url.lastIndexOf('/');
        let secondLastIndex = url.lastIndexOf('/', lastIndex - 1);
        let numberStr = url.substring(secondLastIndex + 1, lastIndex);
        let number = parseInt(numberStr);
        aRequest = url.substring(0, secondLastIndex + 1) + 22 +
            url.substring(lastIndex);
        autho = details.requestHeaders.find(
            dat => dat.name == 'Authorization')['value'];

        console.log('Exam: ' + aRequest);
      }

    }, {urls: ['*://*.engdis.com/*']}, ['blocking', 'requestHeaders'],
);

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse)
{
  if (message && message.type == 'ansUrl')
  {
    sendResponse({aRequest, autho});

  }
  if (message && message.type == 'completeTask')
  {
    let passData = {'itemId': itemId, 'courseId': courseId, 'autho': autho};
    sendResponse(passData);
  }
});