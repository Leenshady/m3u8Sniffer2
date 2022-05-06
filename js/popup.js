var m3u8list = [];
const bgPort = chrome.runtime.connect();

$(function(){
    render(m3u8list)
    //监听content-script的消息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if(request.from == 'content_script' && request.reload == 'done'){
            //刷新成功以后重新获取链接
            bgPort.postMessage({action:'getList'});
        }
        return true;
    });
    bgPort.onMessage.addListener(function(receivedPortMsg) {//监听background
        //console.log("popup:我收到消息了！");//这是background发来的内容
		//console.log(receivedPortMsg);//这是background发来的内容
        if(receivedPortMsg.action = 'm3u8List'){
            if(receivedPortMsg.data){
                m3u8list = receivedPortMsg.data
                render(m3u8list)
            }
        }
	});
    bgPort.postMessage({action:'getList'});//向background发送消息
})

$(document).ready(function() {
    //点击事件必须这么写，否则会报CSP错误
    document.getElementById("reload").addEventListener("click",reload);
  });

//刷新页面
function reload(){
    //console.log('function : reload');
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "reload"});
      });
}

//渲染
function render(list){
    if(list !== undefined){
        if(list.length==0){
            $(".alert-danger").addClass("show")
            $(".alert-danger").removeAttr("hidden")
        }else{
            $("#box").html()
            for (i = 0; i < list.length; i++) {
                $("#box").append('<div id="url' + i + '" style="mt-1 mb-1"><span style="max-width: 200px;white-space: nowrap;display: inline-block;overflow: hidden;text-overflow: ellipsis;line-height: 1.5;">' + (list[i].indexOf("?")!=-1?list[i].slice(0,list[i].indexOf("?")).slice(list[i].lastIndexOf("/")+1,list[i].length):list[i].slice(list[i].lastIndexOf("/")+1,list[i].length)) + '</span><a href="#" style="float: right;">复制</a></div>');
                $("#url" + i).click({ "url": list[i] }, copyUrl);
                //console.log("获取到m3u8链接了")
            }
            $(".alert-danger").removeClass("show")
            $(".alert-danger").attr("hidden","hidden")
        }
    }
}

//复制链接到剪切板
function copyUrl(obj) {
    navigator.clipboard.writeText(obj.data.url);
    $(".alert-success").addClass("show")
    $(".alert-success").removeAttr("hidden")
    window.setTimeout(function(){
        $(".alert-success").removeClass("show")
        $(".alert-success").attr("hidden","hidden")
    },2000);//2秒后消失
}



