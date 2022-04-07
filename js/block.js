const parser = new DOMParser();
const url = window.location.href

function main() {
	if (url.startsWith('https://www.nicovideo.jp/search/')) {
		var videos = document.querySelectorAll('li.item[data-video-item]')
	} else if (url.startsWith('https://www.nicovideo.jp/video_top')) {
		var videos = document.querySelectorAll('div.VideoCard[data-video-item], div.NicoadVideoItem[data-nicoad-item]')
	} else {
		var videos = []
	}

	videos.forEach(
		video => {
			const sm = video.getAttribute('data-video-id')
			if (sm === null) { return true; }
			if (!sm.startsWith('sm')) { return true; }

			chrome.runtime.sendMessage({
					contentScriptQuery: 'post',
					endpoint: `https://ext.nicovideo.jp/api/getthumbinfo/${sm}`
				},
				(response) => {
					const text = response;
					// console.log(text)
					const dom = parser.parseFromString(text, 'text/xml')
					const userid = dom.querySelector('user_id').textContent
					const username = dom.querySelector('user_nickname').textContent
					//console.log(userid, username);
					if (['45261915', '92490088', '123420362', '123523139', '123530845', '23408687', '118851573'].includes(userid)) {
						console.log(`removing ${sm} userid:${userid} username:${username}`)
						video.remove()
					}
				}
			)


		})
}
setInterval(main, 1000)