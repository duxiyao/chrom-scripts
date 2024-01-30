console.log('注入content-script成功');
let addedList = '';
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        // sendResponse('我收到了你的消息！');

        // console.log(sender.tab ?
        //     "from a content script:" + sender.tab.url :
        //     "from the extension");

        if (request.type == "queryGoodsEvaluateVO") {
            typeof(queryGoodsEvaluateVO) == 'function' && queryGoodsEvaluateVO(request, sender, sendResponse);
        }
        if (request.type == "activitystats") {
            typeof(activitystats) == 'function' && activitystats(request, sender, sendResponse);
        }
        return true
    });

//营销工具-评价有礼
function activitystats(request, sender, sendResponse) {
    if (addedList.indexOf('activitystats') > -1) {
        return
    }
    addedList += 'activitystats,'
    console.log('activitystats->' + request.activityId)
    // console.log('activitystats->' + JSON.stringify(request))
    // sendResponse({farewell: "receive activitystats"});

    for (let i = 0; i < document.getElementsByClassName('MmsUiBlockTitle___title___2C-H-2-36-0').length; i++) {
        if (document.getElementsByClassName('MmsUiBlockTitle___title___2C-H-2-36-0')[i].innerText.indexOf('活动明细') > -1) {
            const a = document.createElement('a')
            a.innerText = '下载'
            a.addEventListener("click", function () {
                // window.open('https://cn.bing.com/', "_blank")
                window.open('http://localhost:10000/yangyun/reqList?ck=' + encodeURI(request.ck) + "&type=1" + "&activityId=" + request.activityId, "_blank")
            });
            document.getElementsByClassName('MmsUiBlockTitle___title___2C-H-2-36-0')[i].appendChild(a)
        }
    }
}

//评价数据-商品评价
function queryGoodsEvaluateVO(request, sender, sendResponse) {
    if (addedList.indexOf('queryGoodsEvaluateVO') > -1) {
        return
    }
    addedList += 'queryGoodsEvaluateVO,'
    // console.log('queryGoodsEvaluateVO->' + chrome.storage.local.get(["key"]).then((result) => {
    //     console.log("Value currently is " + result.key);
    // }))
    // console.log('queryGoodsEvaluateVO crawlerInfo ->' + JSON.stringify(request.crawlerInfo))
    console.log('queryGoodsEvaluateVO ck ->' + JSON.stringify(request.ck))
    // console.log('queryGoodsEvaluateVO->' + JSON.stringify(request))
    // sendResponse({farewell: "receive queryGoodsEvaluateVO"});
    for (let i = 0; i < document.getElementsByClassName('MmsUiBlockTitle___wrapper___3kcbt2-19-0 MmsUiBlockTitle___wide-screen___104AM2-19-0').length; i++) {
        if (document.getElementsByClassName('MmsUiBlockTitle___wrapper___3kcbt2-19-0 MmsUiBlockTitle___wide-screen___104AM2-19-0')[i].innerText.indexOf('商品评价(近') > -1) {
            const a = document.createElement('a')
            a.innerText = '下载'
            a.addEventListener("click", function () {
                // window.open('https://cn.bing.com/', "_blank")
                // window.open('http://localhost:10000/yangyun/reqList?ck=' + request.ck + "&ua=" + request.ua + "&type=0" + "&crawlerInfo=" + request.crawlerInfo, "_blank")
                window.open('http://localhost:10000/yangyun/reqList?ck=' + encodeURI(request.ck) + "&type=0" + "&crawlerInfo=" + encodeURI(request.crawlerInfo), "_blank")
            });
            document.getElementsByClassName('MmsUiBlockTitle___wrapper___3kcbt2-19-0 MmsUiBlockTitle___wide-screen___104AM2-19-0')[i].firstChild.appendChild(a)
        }
    }
}

console.log(document.querySelector('.s-top-img-wrapper img')?.src);