chrome.webRequest.onBeforeSendHeaders.addListener(
  details => {
    if (!details.requestHeaders) return;
    const authHeader = details.requestHeaders.find(h => h.name && h.name.toLowerCase() === 'authorization');
    if (!authHeader || !authHeader.value) return;
    const autho = authHeader.value;

    if (details.url.includes('api/practiceManager/GetItem')) {
      let rUrl = details.url;
      const tmp = rUrl.indexOf('?_=');
      if (tmp > 1) rUrl = rUrl.substring(0, tmp - 2) + '5' + rUrl.substring(tmp - 1);
      chrome.storage.local.set({ aRequest: rUrl, autho });
    }
    if (details.url.includes('/api/Assessments/GetItem')) {
      const url = details.url;
      const lastIndex = url.lastIndexOf('/');
      const secondLastIndex = url.lastIndexOf('/', lastIndex - 1);
      if (secondLastIndex !== -1 && lastIndex !== -1 && secondLastIndex < lastIndex) {
        const aRequest = url.substring(0, secondLastIndex + 1) + 22 + url.substring(lastIndex);
        chrome.storage.local.set({ aRequest, autho });
      }
    }
  },
  { urls: ['https://*.engdis.com/*'] },
  ['requestHeaders', 'extraHeaders']
);

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message && message.type == 'ansUrl') {
    chrome.storage.local.get(['aRequest', 'autho'], function(result) {
      sendResponse({aRequest: result.aRequest, autho: result.autho});
    });
    return true;
  }
});

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({
    url: 'https://github.com/nvbangg/EDAns'
  });
});