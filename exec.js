console.log('exec js');
//https://blog.csdn.net/dfc_dfc/article/details/132261116   前端请求大比拼：Fetch、Axios、Ajax、XHR
/*
(function () {
	const { fetch: originalFetch } = window;

	window.fetch = async (...args) => {
		let [resource, config ] = args;
			console.log('resource:', resource);
			console.log('config:', config);
			console.log('args:', args);
		// request interceptor here
		const response = await originalFetch(resource, config);
		// response interceptor here
		return response;
	};

})();*/

(function () {

    console.log('a');
    let origFetch = window.fetch;
    window.fetch = async function (...args) {
        console.log('b');
        const response = await origFetch(...args);
        console.log('fetch request:', args);

        /*
        response
            .clone()
            .blob() // 此处需要根据不同数据调用不同方法，这里演示的是二进制大文件，比如音频
            .then(data => {
                // 对于二进制大文件可以创建为URL(blob:开头)，供其它脚本访问
                //sessionStorage['wave'] = URL.createObjectURL(data); // 插件需要添加'storage'权限
                //window.postMessage({ type: 'fetch', data: URL.createObjectURL(data) }, '*'); // send to content script
            })
            .catch(err => console.error(err));
            */
        return response;
    }

})();

/*
(function () {
	console.log('a');
	const { fetch: originalFetch } = window;
	window.fetch = async (...args) => {
		console.log('c');
		let [resource, config ] = args;
			console.log('resource:', resource);
			console.log('config:', config);
			console.log('args:', args);

		// request interceptor starts
		resource = 'https://jsonplaceholder.typicode.com/todos/2';
		// request interceptor ends

		const response = await originalFetch(resource, config);

		console.log('d');
		// response interceptor here
		return response;
	};

	console.log('b');
	
	fetch('https://jsonplaceholder.typicode.com/todos/1')
	.then((response) => response.json())
	.then((json) => console.log(json));
	console.log('d');
})();
*/


//xhr start
(function () {
    console.log('function setRequestHeader');
    var originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
    XMLHttpRequest.prototype.setRequestHeader = function (k, v) {
        var args = Array.prototype.slice.call(arguments)
        //console.log('args1='+args);
        //console.log('myargs='+this.myargs);
        //console.log('myurl='+this.myurl);

        //console.log('Original k=', k);
        //console.log('Original v=', v);

        // 修改请求头信息
        //this.setRequestHeader('X-My-Header', 'My value');

        // 返回原始的open方法，以便发起请求
        return originalSetRequestHeader.apply(this, arguments);
    };
})();


(function () {
    console.log('function open');
    var originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, async, user, pass) {
        var args = Array.prototype.slice.call(arguments)
        this.myargs = args;
        this.myurl = url
        //console.log('args2='+args);
        // 打印原始请求头信息  无效
        //console.log('Original request headers:', this.requestHeaders);

        // 修改请求头信息
        //this.setRequestHeader('X-My-Header', 'My value');

        // 返回原始的open方法，以便发起请求
        return originalOpen.apply(this, arguments);
    };
})();
//xhr end

//console.log('domain='+document.cookie);
//let test = 'test tun';
//console.log(document.querySelector('#su')?.value);

/*
const myJSONStringify = JSON.stringify;
JSON.stringify = (obj) => {
	console.log('you are using JSON.stringify');
	return myJSONStringify(obj);
}*/

// console:
// 	console.log(JSON.stringify({aaa: 1}))
// log: (world: 'MAIN')
//	you use JSON.stringify
// 	{"aaa":1}

/*
// xhr中的方法拦截，eg: open、send etc.
function hookFunction(funcName, config) {
  return function () {
    var args = Array.prototype.slice.call(arguments)
    // 将open参数存入xhr, 在其它事件回调中可以获取到。
    if (funcName === 'open') {
      this.xhr.open_args = args
    }
    if (config[funcName]) {
      console.log(this, 'this')
      // 配置的函数执行结果返回为true时终止调用
      var result = config[funcName].call(this, args, this.xhr)
      if (result) return result;
    }
    return this.xhr[funcName].apply(this.xhr, arguments);
  }
}

// xhr中的属性和事件的拦截
function getterFactory(attr, config) {
  return function () {
    var value = this.hasOwnProperty(attr + "_") ? this[attr + "_"] : this.xhr[attr];
    var getterHook = (config[attr] || {})["getter"]
    return getterHook && getterHook(value, this) || value
  }
}
// 在赋值时触发该工厂函数（如onload等事件）
function setterFactory(attr, config) {
  return function (value) {
    var _this = this;
    var xhr = this.xhr;
    var hook = config[attr]; // 方法或对象
    this[attr + "_"] = value;
    if (/^on/.test(attr)) {
      // note：间接的在真实的xhr上给事件绑定函数
      xhr[attr] = function (e) {
        // e = configEvent(e, _this)
        var result = hook && config[attr].call(_this, xhr, e)
        result || value.call(_this, e);
      }
    } else {
      var attrSetterHook = (hook || {})["setter"]
      value = attrSetterHook && attrSetterHook(value, _this) || value
      try {
        // 并非xhr的所有属性都是可写的
        xhr[attr] = value;
      } catch (e) {
        console.warn('xhr的' + attr + '属性不可写')
      }
    }
  }
}

// 核心拦截的handler
function xhrHook(config) {
  // 存储真实的xhr构造器, 在取消hook时，可恢复
  window.realXhr = window.realXhr || XMLHttpRequest
  // 重写XMLHttpRequest构造函数
  XMLHttpRequest = function () {
    var xhr = new window.realXhr()
    // 真实的xhr实例存储到自定义的xhr属性中
    this.xhr = xhr
    // note: 遍历实例及其原型上的属性（实例和原型链上有相同属性时，取实例属性）
    for (var attr in xhr) {
      if (Object.prototype.toString.call(xhr[attr]) === '[object Function]') {
        this[attr] = hookFunction(attr, config); // 接管xhr function
      } else {
        // attention: 如果重写XMLHttpRequest，必须要全部重写，否则在ajax中不会触发success、error（原因是3.x版本是在load事件中执行success）
        Object.defineProperty(this, attr, { // 接管xhr attr、event
          get: getterFactory(attr, config),
          set: setterFactory(attr, config),
          enumerable: true
        })
      }
    }
  }
  return window.realXhr
}

// 解除xhr拦截，归还xhr管理权
function unXhrHook() {
  if (window[realXhr]) XMLHttpRequest = window[realXhr];
  window[realXhr] = undefined;
}


xhrHook({
  open: function (args, xhr) {
    console.log("open called!", args, xhr)
     // return true // 返回true将终止请求，这个就是常规拦截的精髓了
  },
  setRequestHeader: function (args, xhr) {
    console.log("setRequestHeader called!", args, xhr)
         },
  onload: function (xhr) {
    // 对响应结果做处理
    this.responseText += ' tager'
    console.log("onload called!", this.responseText)
  }
})
*/

/*
//页面接口请求监控 
function recordHttpLog() {
  // 监听ajax的状态
  function ajaxEventTrigger(event) {
    var ajaxEvent = new CustomEvent(event, {
      detail: this
    })
    console.log('ajaxEvent', ajaxEvent)
    window.dispatchEvent(ajaxEvent)
  }
  var OldXHR = window.XMLHttpRequest
  function newXHR() {
    var realXHR = new OldXHR()
    realXHR.addEventListener('abort', function() { ajaxEventTrigger.call(this, 'ajaxAbort') }, false)
    realXHR.addEventListener('error', function() { ajaxEventTrigger.call(this, 'ajaxError') }, false)
    realXHR.addEventListener('load', function() { ajaxEventTrigger.call(this, 'ajaxLoad') }, false)
    realXHR.addEventListener('loadstart', function() { ajaxEventTrigger.call(this, 'ajaxLoadStart') }, false)
    realXHR.addEventListener('progress', function() { ajaxEventTrigger.call(this, 'ajaxProgress') }, false)
    realXHR.addEventListener('timeout', function() { ajaxEventTrigger.call(this, 'ajaxTimeout') }, false)
    realXHR.addEventListener('loadend', function() { ajaxEventTrigger.call(this, 'ajaxLoadEnd') }, false)
    realXHR.addEventListener('readystatechange', function() { ajaxEventTrigger.call(this, 'ajaxReadyStateChange') }, false)
    return realXHR
  }

  window.XMLHttpRequest = newXHR
  // window.addEventListener('ajaxReadyStateChange', function(e) {
  //   var currentTime = new Date().getTime()
  //   setTimeout(function() {
  //     var url = e.detail.responseURL
  //     var status = e.detail.status
  //     var statusText = e.detail.statusText
  //     console.log('ajaxReadyStateChange', e, url, status, statusText, currentTime)
  //   }, 2000)
  // })

  // window.addEventListener('ajaxLoadStart', function(e) {
  //   var currentTime = new Date().getTime()
  //   setTimeout(function() {
  //     var url = e.detail.responseURL
  //     var status = e.detail.status
  //     var statusText = e.detail.statusText
  //     console.log('ajaxLoadStart', e, url, status, statusText, currentTime)
  //   }, 2000)
  // })
  // window.addEventListener('ajaxLoadEnd', function(e) {
  //   var currentTime = new Date().getTime()
  //   var url = e.detail.responseURL
  //   var status = e.detail.status
  //   var statusText = e.detail.statusText
  //   console.log('ajaxLoadEnd', url, status, statusText, currentTime)
  // })
  // window.addEventListener('ajaxError', function(e) {
  //   var currentTime = new Date().getTime()
  //   var url = e.detail.responseURL
  //   var status = e.detail.status
  //   var statusText = e.detail.statusText
  //   console.log('ajaxError', url, status, statusText, currentTime)
  // })
}
recordHttpLog()

*/

