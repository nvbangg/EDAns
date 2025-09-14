chrome.webRequest.onBeforeSendHeaders.addListener(
    details =>
    {
      if (details.requestHeaders == null) return;
      if (details.requestHeaders.find(dat => dat.name == 'Authorization') ==
          null) return;
      
      const authHeader = details.requestHeaders.find(dat => dat.name == 'Authorization');
      const autho = authHeader ? authHeader.value : '';
      
      if (details.url.includes('api/practiceManager/GetItem'))
      {
        var rUrl = details.url;
        var tmp = rUrl.indexOf('?_=');
        rUrl = rUrl.substring(0, tmp - 2) + '5' +
            rUrl.substring(tmp - 1, rUrl.length);
        
        const itemId = details.url.match(/GetItem\/(\d+)/)[1];
        
        chrome.storage.local.set({
          aRequest: rUrl,
          autho: autho,
          itemId: itemId
        });
        
        console.log(itemId);
      }
      if (details.url.includes('engdis.com/api/CourseTree/GetUserNodeProgress'))
      {
        const courseId = details.url.match(/\d+$/)[0];
        chrome.storage.local.set({courseId: courseId});
      }
      if (details.url.includes('/api/Assessments/GetItem'))
      {
        let url = details.url;

        let lastIndex = url.lastIndexOf('/');
        let secondLastIndex = url.lastIndexOf('/', lastIndex - 1);
        let numberStr = url.substring(secondLastIndex + 1, lastIndex);
        let number = parseInt(numberStr);
        const aRequest = url.substring(0, secondLastIndex + 1) + 22 +
            url.substring(lastIndex);

        chrome.storage.local.set({
          aRequest: aRequest,
          autho: autho
        });

        console.log('Exam: ' + aRequest);
      }

    }, {urls: ['*://*.engdis.com/*']}, ['requestHeaders'],
);

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse)
{
  if (message && message.type == 'ansUrl')
  {
    chrome.storage.local.get(['aRequest', 'autho'], function(result) {
      sendResponse({aRequest: result.aRequest, autho: result.autho});
    });
    return true;
  }
  if (message && message.type == 'completeTask')
  {
    chrome.storage.local.get(['itemId', 'courseId', 'autho'], function(result) {
      let passData = {'itemId': result.itemId, 'courseId': result.courseId, 'autho': result.autho};
      sendResponse(passData);
    });
    return true;
  }
});

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({
    url: 'https://github.com/nvbangg/EDAns'
  });
});