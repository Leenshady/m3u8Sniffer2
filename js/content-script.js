//监听popup的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
    //不响应会报错
    sendResponse('y')
	if(request.action  == 'reload'){
        location.reload()
    }
});

//刷新页面
function reload(){
    location.reload()
}

//给popup发送消息
function send(){
    chrome.runtime.sendMessage({from:'content_script',reload: 'done'});
}

//网页加载完成后给popup发送消息
window.onload = send()