m3u8list = []
var pattern = /http[s]?[://]{1}[-A-Za-z0-9+&@#/%?=~_|!:,.;]*[-A-Za-z0-9+&@#/%=~_|]*.m3u8$/
var url = ""
//chrome.storage.session.setAccessLevel({accessLevel:'TRUSTED_AND_UNTRUSTED_CONTEXTS'})

//监听页面网络请求
chrome.webRequest.onBeforeRequest.addListener(details => {
    chrome.tabs.query({ active: true }, tabs => {
        if (url != tabs[0].url) {
            m3u8list = []
        }
        url = tabs[0].url
        var tmp
        if (/\?/.test(details.url)) {
            tmp = details.url.slice(0, details.url.indexOf("?"))
        } else {
            tmp = details.url.trim()
        }
        if (pattern.test(tmp)) {
            if (m3u8list.indexOf(details.url)==-1) {
                m3u8list.push(details.url)
                getCurrentTab().then((tab)=>{
                    var tabId = ("tab"+tab.id).toString()
                    chrome.storage.session.set({[tabId]:m3u8list})
                })
                
            }
        }
    });
}, { urls: ["<all_urls>"] }, ["extraHeaders"]);

//获取当前标签页
async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  }