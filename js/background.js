var msg = {}
msg.m3u8list = []
var pattern = /http[s]?[://]{1}[-A-Za-z0-9+&@#/%?=~_|!:,.;]*[-A-Za-z0-9+&@#/%=~_|]*.m3u8$/
var url = ""

//监听页面网络请求
chrome.webRequest.onBeforeRequest.addListener(details => {
    chrome.tabs.query({ active: true }, tabs => {
        if (url != tabs[0].url) {
            msg.m3u8list = []
        }
        url = tabs[0].url
        var tmp
        if (/\?/.test(details.url)) {
            tmp = details.url.slice(0, details.url.indexOf("?"))
        } else {
            tmp = details.url.trim()
        }
        if (pattern.test(tmp)) {
            if (msg.m3u8list.indexOf(details.url)==-1) {
                msg.m3u8list.push(details.url)
                chrome.storage.session.set({'data':msg.m3u8list})
            }
        }
    });
}, { urls: ["<all_urls>"] }, ["extraHeaders"]);