chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    if (!details.requestHeaders) return;
    const authHeader = details.requestHeaders.find(
      (h) => h.name?.toLowerCase() === "authorization"
    );
    if (!authHeader?.value) return;
    const autho = authHeader.value;
    if (details.url.includes("api/practiceManager/GetItem")) {
      let rUrl = details.url;
      const tmp = rUrl.indexOf("?_=");
      if (tmp > 1)
        rUrl = rUrl.substring(0, tmp - 2) + "5" + rUrl.substring(tmp - 1);
      chrome.storage.local.set({ aRequest: rUrl, autho });
    } else if (details.url.includes("/api/Assessments/GetItem")) {
      const lastIndex = details.url.lastIndexOf("/");
      const secondLastIndex = details.url.lastIndexOf("/", lastIndex - 1);
      if (secondLastIndex > -1 && lastIndex > secondLastIndex) {
        const aRequest =
          details.url.substring(0, secondLastIndex + 1) +
          22 +
          details.url.substring(lastIndex);
        chrome.storage.local.set({ aRequest, autho });
      }
    }
  },
  { urls: ["https://*.engdis.com/*"] },
  ["requestHeaders", "extraHeaders"]
);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "ansUrl") {
    chrome.storage.local.get(["aRequest", "autho"], (result) => {
      sendResponse({ aRequest: result.aRequest, autho: result.autho });
    });
    return true;
  }
});

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: "https://github.com/nvbangg/EDAns" });
});
