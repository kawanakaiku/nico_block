var caches = {}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (!message) {
		sendResponse({
			'status': false,
			'reason': 'message is missing'
		});
	} else if (message.contentScriptQuery === 'post') {
		const url = message.endpoint;
		if (caches[url] !== undefined) {
			sendResponse(caches[url])
		} else {
			fetch(url, {
				'method': 'GET'
			}).then(r => r.text()).then(t => {
				caches[url] = t;
				sendResponse(t)
			})
		}
	}

	return true;
});