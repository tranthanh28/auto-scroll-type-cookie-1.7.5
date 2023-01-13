// Cannot use console.log in chrome extension
// So, you need to print the log by sending a request to the background script.
const req = (type, ...args) => chrome.extension.sendRequest({
	tabId: chrome.devtools.inspectedWindow.tabId,
	type: type,
	args: args
});

localStorage.setItem("IDs", '')

chrome.runtime.onConnect.addListener(function (portFrom) {
	req('log', "chrome.runtime.onConnect.addListener")
	if (portFrom.name === 'devtools-content') {
		//This is how you add listener to a port.
		portFrom.onMessage.addListener(function (message) {

			// store db
			let ids = localStorage.getItem("IDs")
			let count = ids.split(";").filter(id => id).length
			let data = JSON.parse(message.data)
			data['list_post_id'] = ids
			data['count_post_id'] = count
			if(!count) {
				req('log', 'NO IDS')
				return req('countNoRes')
			}
			req('clearNoRes')
			data['message'] = "Lấy data post facebook thành công: " + count + " bài viết"
			data['use_extension'] = 1
			data['status'] = 1
			req('log', "STORE DATABASE", data)

			storeIds(data, ids)

			function storeIds(dt, ids) {
				$.ajax({
					url: "https://qlhd.monitaz.com/api/insert",
					type: 'POST',
					dataType: 'json',
					crossDomain: true,
					data: dt,
					success: function (result) {
						req('log', "POSTED", result)
					},
					error: function (err) {
						telegramAlert(`Api "qlhd.monitaz.com" : ${JSON.stringify(err)}`)
						req('log', JSON.stringify(err))
					}
				});

				$.ajax({
					url: "https://api.monitaz.asia/response/postidfb.php",
					type: 'POST',
					dataType: 'json',
					crossDomain: true,               
					data: {
						'fb_id': ids,
						'source': 1
					},
					success: function (data) {
						console.log("Lấy data post facebook thành công: " + count + " bài viết");
					},
					error: function(err){
						telegramAlert(`Api "monitaz.com" : ${JSON.stringify(err)}`)
						req('log', JSON.stringify(err))
					}
				});
			}
			localStorage.setItem("IDs", '')
		});
	}
});

// Register the callback, which is triggered after every http request response
chrome.devtools.network.onRequestFinished.addListener(async (...args) => {
	try {
		const [{
			// request type, query parameters, and url
			request: { method, queryString, url },

			// This method can be used to get the response body
			getContent,
		}] = args;
		if (!url.includes('?q=')) return
		req('log', method, queryString, url);
		// Convert callback to await promise
		// warn: content in the getContent callback function, not the return value of getContent
		const content = await new Promise((res, rej) => getContent(res));
		req('log', content.split("graphql_id="))
		if (!content) return req('log', 'no content response')
		let IDs = []

		if (url.includes("/top")) {
			req('log','TOP')
			IDs = content.split("S:_I").slice(1).map(t => t.split("&")[0].split(":").pop())
		}
		
		if(!IDs.length) {
			try {
				IDs = content.split("graphql_id=").slice(1).map(t => atob(t.split("\\")[0].split('"')[0].replace('%3D', '')).split(":").pop())
			} catch { }
		}
		
		if (!IDs.length) return req('log', 'err')
		let arrStr = localStorage.getItem('IDs')
		IDs.forEach(id => {
			if (!arrStr.includes(id)) {
				arrStr += id + ";"
			}
		})
		localStorage.setItem("IDs", arrStr)
		req('log', localStorage.getItem("IDs"));
	} catch (err) {
		req('log', err.stack || err.toString());
	}
});

function telegramAlert(msg = 'Monitaz Auto Scroll ') {

	var token = "bot1215313321:AAEH5bfYJ17FZklWzIzx353Cb9pi0qctUJk"
	var chatID = "-425966865"

	var url = `https://api.telegram.org/${token}/sendMessage?parse_mode=html&chat_id=${chatID}&text=${encodeURIComponent(msg)}`;
	var options = { method : 'GET'};
	fetch(url, options);
}