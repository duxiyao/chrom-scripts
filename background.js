chrome.tabs.onActivated.addListener(function (activeInfo) {

    console.log('onActivated->' + JSON.stringify(activeInfo));
    chrome.tabs.get(
        activeInfo.tabId,
        function (tab) {

            console.log('onActivated get->' + tab.url);
        }
    )

});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

    //if( changeInfo.url == undefined){return false;}

    if (changeInfo.status == 'complete' && tab.active) {
        // do your things
        console.log('onUpdated->' + tab.url);
        /*
        chrome.tabs.sendMessage(tabId,{type:'tabUpdate', tab:tab}, function(response)
        {
            console.log('来自content的回复：'+response);
        });*/

    }

    // 检查是否是wish页面的tab
    if (tab.url.startsWith('https://mms.pinduoduo.com/')) {
        // 通知对应的tab页面url变化了,需要优化为离开立即移除，进入则加载完毕再添加
        if (tab.status === 'loading') {
        }
    }
});


let registered = false

chrome.action.onClicked.addListener(async (tab) => {
    console.log(tab);
    if (tab.url.startsWith('https://mms.pinduoduo.com/')) {
        if (registered) {
            return
        }
        console.log('this is target page');
        registered = true

        let aid = tab.id
        console.log('aid=' + aid);

        setInterval(function () {
            chrome.tabs.sendMessage(
                aid,
                {greeting: "hello"},
                function (response) {
                    console.log(response.farewell);
                });
        }, 3000);

        chrome.scripting.executeScript({
            target: {
                tabId: tab.id,
            },
            files: ['exec.js'],
            // func: function
            world: 'MAIN'
        },)


        chrome.cookies.getAll({url: 'https://mms.pinduoduo.com/'}, function (cookies) {
            let cookiesText = '';
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i];
                cookiesText += cookie.name + '=' + cookie.value + (i < cookies.length - 1 ? '; ' : '');
            }
            console.log('cookiesText=' + cookiesText);

            // 将获取到的 cookie 复制到剪切板
            // navigator.clipboard.writeText(cookiesText).then(function () {
            //     showToast('Cookies copied to clipboard.');
            // }, function (err) {
            //     console.error('Could not copy cookies to clipboard: ', err);
            //     showToast('Failed to copy cookies to clipboard.');
            // });
        });

        /*
          chrome.cookies.get({
           url: 'https://mms.pinduoduo.com/',
           name: 'cookie'
          },
          function(cookie) {
                  console.log('cookie='+cookie);
                  /*
           chrome.runtime.sendMessage({
             method: 'GET',
             url: 'http://example.com/api/data',
             headers: { 'Cookie': 'cookie_name=' + cookie.value } },
             function(response) {
              console.log(response);
             });
          });*/


        //////////////////////////////////////////


        var currentTab = tab;
        var version = "1.3";
        var requestMethod = '';


        //当前浏览器活跃的tab
        chrome.tabs.onActivated.addListener(activeTab => {
            console.log('activeTab->' + activeTab.tabId)
            console.log('activeTab->' + activeTab)
        });

        //if(currentTab?.url?.startsWith("chrome://")) return ;
        //·相当于移除监听，不移除直接监听可能会重复监听同一个tabId导致报错

        /*
        try{
            chrome.debugger.detach({
                tabId: tab.id
            });
        }catch(e){}*/
        chrome.debugger.attach({ //debug·at·current ·tab
            tabId: tab.id
        }, version, onAttach.bind(null, tab.id));


        function onAttach(tabId) {

            //，发送命令，向指定tab开启网络功能
            chrome.debugger.sendCommand({ //first enable ·the·Network
                tabId: tabId
            }, "Network.enable");
            //chrome调试器监听事件，捕获网络请求核响应相关事件
            chrome.debugger.onEvent.addListener(allEventHandler);
        }

        async function allEventHandler(debuggeeId, message, params) {
            if (currentTab.id !== debuggeeId.tabId) {
                return;
            }


            //·功能我只做了一个fetch类型请求的拦截
            if (params.type === 'Fetch') {
                //console.log('message='+message);
                //·message里面的信息我理解为一个完整网络请求的生命周期
                if (message === 'Network.requestWillBeSent') {
                    requestMethod = params?.request?.method;
                    if (params?.request?.url.indexOf('goodsList') > -1)
                        console.log('params?.request?=' + JSON.stringify(params?.request));
                }
                if (message === "Network.responseReceived") { //response ·return
                    const response = await new Promise(resolve => {
                        chrome.debugger.sendCommand({
                            tabId: debuggeeId.tabId
                        }, "Network.getResponseBody", {
                            "requestId": params.requestId
                        }, resolve);
                    });
                    if (response?.body) {
                        //console.log(`${requestMethod} - ${params.response.url} :  `, response.body);
                        requestMethod = ''
                    }
                }
            }
        }

    } else {
        console.log('this is not target page');
    }


});
