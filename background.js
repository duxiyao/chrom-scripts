chrome.action.onClicked.addListener(async (tab) => {
	console.log(tab);
	if (tab.url.startsWith('http://gerrit.mitvos.com/')) {
		console.log('this is target page');
		chrome.scripting.executeScript({
      target: {
				tabId: tab.id,
			},
      files: ['exec.js'],
			// func: function
			world: 'MAIN'
    },)
	
	} else {
		console.log('this is not target page');
	}
});
