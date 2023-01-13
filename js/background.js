// Register callback, triggered when a request is received
chrome.extension.onRequest.addListener(({ tabId, type, args }) => {

	// execute the script in the tab page given the tabId
	// let type = args.pop()
	if (type == 'log') {
		chrome.tabs.executeScript(tabId, {
			code: `console.log(...${JSON.stringify([tabId, type, args])});`,
		});
	} else if (['countNoRes', 'clearNoRes'].includes(type)) {
		chrome.tabs.executeScript(tabId, {
			code: `console.log(...${JSON.stringify([tabId, type, args])});`,
		});
		chrome.tabs.sendMessage(tabId, {
			action: type
		})
	}

});


function handleMessage(request, sender, sendResponse) {

	// chrome.tabs.executeScript(request.tabId, {
	//     code: request.script
	// });

	//start connection in devtool script
	let devtoolPort = chrome.runtime.connect({
		name: "devtools-content"
	});

	devtoolPort.postMessage({
		tabId: request.tabId,
		data: request.data
	})
}

chrome.runtime.onMessage.addListener(handleMessage);

