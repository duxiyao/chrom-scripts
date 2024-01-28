console.log('注入content-script成功');

/**
* 接收后台发给content-script的消息
* 
*/
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	  
    if(request.type == 'tabUpdate'){
    	// GhandleInject_tabUpdate 自定义的一个函数，如果有定义这个函数则执行该函数，如果没有则不处理
        typeof(GhandleInject_tabUpdate) == 'function' && GhandleInject_tabUpdate();
    }
    // sendResponse('我收到了你的消息！');
	  
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting == "hello")//判断是否为要处理的消息
      sendResponse({farewell: "goodbye"});
});



let cTest = 'cs Test tun';

console.log(document.querySelector('.s-top-img-wrapper img')?.src);