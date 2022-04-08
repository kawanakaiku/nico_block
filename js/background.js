var caches = {}

const fetch_retry = async (url, options, n) => {
	try {
	  return await fetch(url, options)
	} catch (err) {
	  if (n === 1) throw err
	  return await fetch_retry(url, options, n - 1)
	}
}

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
			fetch_retry(url, {
				'method': 'GET'
			}).then(r => r.text()).then(t => {
				caches[url] = t
				sendResponse(t)
			})
		}
	}

	return
})

/*
var return_cancel = details => {
	return { cancel: true }
}

chrome.webRequest.onBeforeRequest.addListener(
	return_cancel,
	{urls: ['https://nvcomment.nicovideo.jp/legacy/api.json']},
	["blocking"]
)
*/