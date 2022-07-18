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

chrome.runtime.onInstalled.addListener(function(details){
	chrome.storage.local.set({
		"filter_enabled":true,
		"video_userids":"45261915\n92490088\n123420362\n123523139\n123530845\n23408687\n118851573\n118622294\n940035\n1594318\n940035",
		"video_usernames":"",
		"video_blacktags":"",
		"seiga_userids":"123811507\n79841657",
		"seiga_usernames":"",
		"rpg_games":"gm8549",
		"rpg_userids":"",
		"rpg_usernames":""
	}, ()=>{})
});

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