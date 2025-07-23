const pattern = /http[s]?[://]{1}[-A-Za-z0-9+&@#/%?=~_|!:,.;]*[-A-Za-z0-9+&@#/%=~_|]*.m3u8$/

// 设置徽章的背景颜色为灰色
chrome.action.setBadgeBackgroundColor({ color: "#aaaaaa" });

// 监听存储数据变化
chrome.storage.session.onChanged.addListener(() => {
    getCurrentTab().then((tab)=>{
        let tabId = "tab"+tab.id;
        //重置徽章
        resetBadgeForTab(tabId);
    })
});

// 监听tab切换
chrome.tabs.onActivated.addListener((activeInfo) => {
    let tabId = "tab"+activeInfo.tabId;
    //重置徽章
    resetBadgeForTab(tabId);
});

// 监听页面网络请求
chrome.webRequest.onBeforeRequest.addListener(details => {
    chrome.tabs.query({ active: true }, tabs => {
        let tabId = tabs[0].id;
        getM3u8Links(tabId).then(m3u8list => {
            var tmp;
            if (/\?/.test(details.url)) {
                tmp = details.url.slice(0, details.url.indexOf("?"));
            } else {
                tmp = details.url.trim();
            }
            if (pattern.test(tmp)) {
                if (m3u8list.indexOf(details.url)==-1) {
                    m3u8list.push(details.url);
                    chrome.storage.session.set({["tab"+tabId]:m3u8list});
                }
            }
        });   
    });
}, { urls: ["<all_urls>"] }, ["extraHeaders"]);

// 获取当前标签页
async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  }

// 获取session中存储的M3U8链接
async function getM3u8Links(tabId) {
  const key = `tab${tabId}`;
  const result = await chrome.storage.session.get(key);
  
  //先检查键是否存在
  if (!result || !result[key]) {
    //console.log(`标签页 ${tabId} 无存储的链接`);
    return []; // 返回空数组作为默认值
  }
  
  //检查数组是否为空（如果存储的是数组）
  if (Array.isArray(result[key]) && result[key].length === 0) {
    //console.log(`标签页 ${tabId} 的链接列表为空`);
    return [];
  }
  
  return result[key];
}

// 为当前标签重置徽章
function resetBadgeForTab(tabId) {
  chrome.storage.session.get([tabId]).then((value)=>{
        if(!isEmptyObject(value)&&value[tabId].length>0){
            // 设置图标上的数字
            chrome.action.setBadgeText({ text: value[tabId].length.toString() });
        }else{
            //移除徽章
            chrome.action.setBadgeText({ text: "" });
        }
    })
}

//对象判空函数
function isEmptyObject(obj) {
    return JSON.stringify(obj) === '{}';
}