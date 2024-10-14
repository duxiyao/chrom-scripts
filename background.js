let cookiesText = '';
var interceptReq = '';

function attachCurTab(tab) {
    // console.log('attachCurTab->' + tab.url);
    var currentTab = tab;
    var version = "1.3";
    var requestMethod = '';

/*
    try {
        chrome.debugger.detach({
            tabId: tab.id
        });
    } catch (e) {
    }*/
	try{
		chrome.debugger.attach({ //debug·at·current ·tab
			tabId: tab.id
		}, version, onAttach.bind(null, tab.id));
	}catch (e) {
    }


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
        if (currentTab?.url?.startsWith("chrome://")) return;

        // console.log('params.type-》' + params.type)
        //·功能我只做了一个fetch类型请求的拦截
        if (params.type === 'Fetch') {
            //console.log('message='+message);
            //·message里面的信息我理解为一个完整网络请求的生命周期
            if (message === 'Network.requestWillBeSent') {
                requestMethod = params?.request?.method;
				interceptMyReq(params)
                // if (params?.request?.url.indexOf('queryGoodsEvaluateVO') > -1)
				//interceptReq = 	JSON.stringify(params?.request)
                //console.log('params?.request?=' + JSON.stringify(params?.request));
                let ck = ''
                chrome.cookies.getAll({url: params?.request?.url}, function (cookies) {
                    for (var i = 0; i < cookies.length; i++) {
                        var cookie = cookies[i];
                        ck += cookie.name + '=' + cookie.value + (i < cookies.length - 1 ? '; ' : '');
                    }
                    //console.log('ck=' + ck);

                    //deal(encodeURIComponent(ck), currentTab, params)
                })
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
					
					let interceptResp = response.body
                    //console.log(`${requestMethod} - ${params.response.url} :  `, response.body);
					
					dealIntercept(currentTab,interceptResp,params);
                    requestMethod = ''
                }
            }
        }
    }
}

function isTargetUrl(url){
	return url.indexOf('/vodka/v2/mms/query/display/mall/goodsList')>-1
}

function interceptMyReq(params){
	if (isTargetUrl(params?.request?.url)){
		//console.log('interceptMyReq------------ url='+params?.request?.url)
		interceptReq = 	JSON.stringify(params?.request)
		//console.log('interceptMyReq------------ interceptReq='+interceptReq)
	}
}

function dealIntercept(tab,interceptResp,params){
	//console.log('dealIntercept------------')
	if(isTargetUrl(params.response.url)){
		console.log('dealIntercept--- url='+params.response.url)
		console.log('dealIntercept--- interceptReq='+interceptReq)
		console.log('dealIntercept--- interceptResp='+interceptResp)
		
		let tabId = tab.id
        chrome.tabs.sendMessage(
            tabId,
            {
                type: "saveTextToFile",
				data:interceptResp
                //ua: params?.request?.headers['User-Agent'],
                //ac: params?.request?.headers['Anti-Content'],
                //ck: ck
            },
            function (response) {
                // console.log(response.farewell);
            });
	}
}

function deal(ck, tab, params) {
    if (params?.request?.url.indexOf('goodsList') > -1) { //商品管理-商品列表
        // console.log('params?.request?=' + JSON.stringify(params?.request));
        let tabId = tab.id
        chrome.tabs.sendMessage(
            tabId,
            {
                type: "goodsList",
                ua: params?.request?.headers['User-Agent'],
                ac: params?.request?.headers['Anti-Content'],
                ck: ck
            },
            function (response) {
                // console.log(response.farewell);
            });
    }
    if (params?.request?.url.indexOf('query_promotion_event_list_by_goods') > -1) { //营销工具-新客立减
        // console.log('params?.request?=' + JSON.stringify(params?.request));
        let tabId = tab.id
        chrome.tabs.sendMessage(
            tabId,
            {
                type: "query_promotion_event_list_by_goods",
                ck: ck
            },
            function (response) {
                // console.log(response.farewell);
            });
    }
    if (params?.request?.url.indexOf('activity/stats') > -1) { //营销工具-评价有礼
        // console.log('params?.request?=' + JSON.stringify(params?.request));
        let tabId = tab.id
        chrome.tabs.sendMessage(
            tabId,
            {
                type: "activitystats",
                activityId: JSON.parse(params?.request?.postData)?.activityId,
                // ua: params?.request?.headers?.User-Agent,
                ck: ck
            },
            function (response) {
                // console.log(response.farewell);
            });
    }
    if (params?.request?.url.indexOf('queryGoodsEvaluateVO') > -1) {//评价数据-商品评价
        // console.log('params?.request?=' + JSON.stringify(params?.request));
        // console.log('params?.request?.postData=' + JSON.stringify(params?.request?.postData));
        // console.log('params?.request?.postData?.crawlerInfo=' + JSON.parse(params?.request?.postData)?.crawlerInfo);
        // chrome.storage.local.set({ crawlerInfo: params?.request?.postData?.crawlerInfo }).then(() => {
        //     console.log("Value is set");
        // });
        let tabId = tab.id
        chrome.tabs.sendMessage(
            tabId,
            {
                type: "queryGoodsEvaluateVO",
                crawlerInfo: JSON.parse(params?.request?.postData)?.crawlerInfo,
                // ua: params?.request?.headers?.User-Agent,
                ck: ck
            },
            function (response) {
                // console.log(response.farewell);
            });
    }
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

    if (tab.active) {
        console.log('onUpdated-> changeInfo.status =' + changeInfo.status)
		if (tab.url.startsWith('https://mms.pinduoduo.com/')) {
			if (registered) {
				console.log('already registered');
				return
			}
			attachCurTab(tab)
			
			console.log('this is target page registered');
			registered = true
		}
    }
    if (changeInfo.status == 'complete' && tab.active) {
        console.log('onUpdated->' + tab.url);
        /*
        chrome.tabs.sendMessage(tabId,{type:'tabUpdate', tab:tab}, function(response)
        {
            console.log('来自content的回复：'+response);
        });*/
		
		if (tab.url.startsWith('https://mms.pinduoduo.com/')) {
			if (registered) {
				console.log('already registered');
				return
			}
			attachCurTab(tab)
			
			console.log('this is target page registered');
			registered = true
		}
    }
/*
    // 检查是否是wish页面的tab
    if (tab.url.startsWith('https://mms.pinduoduo.com/')) {
        if (tab.status === 'loading') {
        }
    }*/
});

let registered = false

chrome.action.onClicked.addListener(async (tab) => {
    if (true) return
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


//const timeoutDuration = 500; // 超时时间，单位为毫秒
//const { targetLanguage, triggerFlag } = response.simpleMode;
//const text = request.content.replace(triggerFlag, '');
//const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;
const apiUrl = `http://resume.dancecode.cn:10000/yangyun/getcds`;
const fetchPromise = fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.log(error);
    });
	
	
let formData = new FormData();
formData.append('code', '345852');

fetch('http://resume.dancecode.cn:10000/yangyun/getck', {
    method: 'POST',
    body: formData
})
.then(response => response.json())
.then(data => console.log(data))
.catch((error) => {
    console.error('Error:', error);
});	