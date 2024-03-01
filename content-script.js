console.log('注入content-script成功');
let addedList = '';
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        // sendResponse('我收到了你的消息！');

        // console.log(sender.tab ?
        //     "from a content script:" + sender.tab.url :
        //     "from the extension");

        if (request.type == "goodsList") {
            typeof(goodsList) == 'function' && goodsList(request, sender, sendResponse);
        }
        if (request.type == "query_promotion_event_list_by_goods") {
            typeof(query_promotion_event_list_by_goods) == 'function' && query_promotion_event_list_by_goods(request, sender, sendResponse);
        }
        if (request.type == "queryGoodsEvaluateVO") {
            typeof(queryGoodsEvaluateVO) == 'function' && queryGoodsEvaluateVO(request, sender, sendResponse);
        }
        if (request.type == "activitystats") {
            typeof(activitystats) == 'function' && activitystats(request, sender, sendResponse);
        }
        return true
    });

//商品管理-商品列表
function goodsList(request, sender, sendResponse) {
    if (addedList.indexOf('goodsList') > -1) {
        return
    }
    addedList += 'goodsList,'
    console.log('goodsList->' + request.ac)

    let es =document.getElementsByClassName('TAB_lineLabel_5-106-0 TAB_lineLabel_5-106-0 TAB_active_5-106-0 TAB_lineLabelActive_5-106-0 MmsUiPrimaryTab___lineLabelActive___aav3Y2-48-0')
    for (let i = 0; i <es .length; i++) {
        if (es[i].innerText.indexOf('全部') > -1) {
            const a = document.createElement('a')
            a.innerText = '下载'
            a.addEventListener("click", function () {
                // window.open('http://localhost:10000/yangyun/reqList?ck=' + request.ck + "&type=1" + "&activityId=" + request.activityId, "_blank")
            });
            es[i].firstChild.appendChild(a)
            break
        }
    }
}
//营销工具-新客立减
function query_promotion_event_list_by_goods(request, sender, sendResponse) {
    if (addedList.indexOf('query_promotion_event_list_by_goods') > -1) {
        return
    }
    addedList += 'query_promotion_event_list_by_goods,'

    for (let i = 0; i < document.getElementsByClassName('TAB_active_5-81-0 MmsUiSecondaryTab___active___3-4wO2-36-0').length; i++) {
        if (document.getElementsByClassName('TAB_active_5-81-0 MmsUiSecondaryTab___active___3-4wO2-36-0')[i].innerText.indexOf('活动商品') > -1) {
            const a = document.createElement('a')
            a.innerText = '下载'
            a.addEventListener("click", function () {
                // window.open('http://localhost:10000/yangyun/reqList?ck=' + request.ck + "&type=1" + "&activityId=" + request.activityId, "_blank")
            });
            document.getElementsByClassName('TAB_active_5-81-0 MmsUiSecondaryTab___active___3-4wO2-36-0')[i].appendChild(a)
            break
        }
    }
}
//营销工具-评价有礼
function activitystats(request, sender, sendResponse) {
    if (addedList.indexOf('activitystats') > -1) {
        return
    }
    addedList += 'activitystats,'
    // console.log('activitystats->' + request.activityId)
    // console.log('activitystats->' + JSON.stringify(request))
    // sendResponse({farewell: "receive activitystats"});

    for (let i = 0; i < document.getElementsByClassName('MmsUiBlockTitle___title___2C-H-2-36-0').length; i++) {
        if (document.getElementsByClassName('MmsUiBlockTitle___title___2C-H-2-36-0')[i].innerText.indexOf('活动明细') > -1) {
            const a = document.createElement('a')
            a.innerText = '下载'
            a.addEventListener("click", function () {
                // window.open('https://cn.bing.com/', "_blank")
                window.open('http://wol.dancecode.cn:10000/yangyun/reqList?ck=' + request.ck + "&type=1" + "&activityId=" + request.activityId, "_blank")
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
                // window.open('http://wol.dancecode.cn:10000/yangyun/reqList?ck=' + request.ck + "&ua=" + request.ua + "&type=0" + "&crawlerInfo=" + request.crawlerInfo, "_blank")
                window.open('http://wol.dancecode.cn:10000/yangyun/reqList?ck=' + request.ck + "&type=0" + "&crawlerInfo=" + request.crawlerInfo, "_blank")
            });
            document.getElementsByClassName('MmsUiBlockTitle___wrapper___3kcbt2-19-0 MmsUiBlockTitle___wide-screen___104AM2-19-0')[i].firstChild.appendChild(a)
        }
    }
}

console.log(document.querySelector('.s-top-img-wrapper img')?.src);