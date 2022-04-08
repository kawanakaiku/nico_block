"use strict"

function video() {
	"use strict"
	//console.log('running video')
	chrome.storage.local.get({
		video_userids: '45261915\n92490088\n123420362\n123523139\n123530845\n23408687\n118851573\n118622294\n940035',
		video_usernames: '',
		video_blacktags: ''
	}, function(items) {
		video_remove(items.video_userids.split('\n'), items.video_usernames.split('\n'), items.video_blacktags.split('\n'))
	})
}

function video_remove(userids, usernames, blacktags) {
	// https://www.nicovideo.jp/video_top
	// https://www.nicovideo.jp/ranking
	// https://www.nicovideo.jp/search/voiceroid

	"use strict"
	// console.log(blacktags)
	var elms = document.querySelectorAll('li.item[data-video-item][data-video-id], div.VideoCard[data-video-item][data-video-id], div.NicoadVideoItem[data-nicoad-item][data-video-id], div.NicoadVideoItem[data-nicoad-item][data-content-id], div.NC-VideoCard[data-video-thumbnail-comment-hover], li.nicoadVideoItem[data-nicoad-video-item]')
	elms = Array.from(elms).filter(x => !x.hasAttribute('notremoving'))

	elms.forEach(
		elm => {
			var sm = elm.getAttribute('data-video-id')
			if (sm === null) {
				sm = elm.getAttribute('data-content-id')
			}
			if (sm === null) {
				sm = 'sm' + elm.querySelector('img.thumb[src]').getAttribute('src').split('/')[4]
			}
			if (sm === null) {
				sm = basename(elm.querySelector('a[href]').getAttribute('href'))
			}
			//console.log(sm)

			chrome.runtime.sendMessage({
					contentScriptQuery: 'post',
					endpoint: `https://ext.nicovideo.jp/api/getthumbinfo/${sm}`
				},
				(response) => {
					var text = response
					// console.log(text)
					var dom = parser.parseFromString(text, 'text/xml')
					try {
						var userid = ( dom.querySelector('user_id') || dom.querySelector('ch_id') ).textContent
						var username = ( dom.querySelector('user_nickname') || dom.querySelector('ch_name') ).textContent
						var tags = Array.from(dom.querySelector('tags').querySelectorAll('tag'), x => x.textContent)
					} catch (e) {
						// console.error( `error parsing https://ext.nicovideo.jp/api/getthumbinfo/${sm} テキスト:${text} エラー内容:${e}`)
						return
					}
					//console.log(userid, username)
					// console.log(tags)
					//console.log(`${sm} userid:${userid} username:${username} tags:${tags}`)
					if (userids.includes(userid) || wildcards(usernames, username) || (tags.find(tag => blacktags.includes(tag)) !== undefined)) {
						console.log(`removing ${sm} userid:${userid} username:${username} tags:${tags}`)
						elm.remove()
					} else {
						elm.setAttribute("notremoving", "")
					}
				}
			)


		}
	)
}

function rpg() {
	"use strict"
	//console.log('running rpg')
	chrome.storage.local.get({
		rpg_games: 'gm8549',
		rpg_userids: '',
		rpg_usernames: ''
	}, function(items) {
		rpg_remove(items.rpg_games.split('\n'), items.rpg_userids.split('\n'), items.rpg_usernames.split('\n'))
	})
}

function rpg_remove(games, userids, usernames) {
	// https://game.nicovideo.jp/atsumaru/
	// https://game.nicovideo.jp/atsumaru/ranking

	"use strict"
	var elms = document.querySelectorAll('section.MatrixRankingMatrix__MatrixRankingGame, div.GameCard__Card')
	elms = Array.from(elms).filter(x => !x.hasAttribute('notremoving'))

	elms.forEach(
		elm => {
			var gm = basename(elm.querySelector('a[href^="/atsumaru/games/gm"]').getAttribute('href'))
			var userid = basename(elm.querySelector('a[href^="/atsumaru/users/"]').getAttribute('href'))
			var username = elm.querySelector('a[href^="/atsumaru/users/"]').textContent

			// console.log(gm , userid, username)
			if (games.includes(gm) || userids.includes(userid) || wildcards(usernames, username)) {
				console.log(`removing ${gm} userid:${userid} username:${username}`)
				elm.remove()
			} else {
				elm.setAttribute("notremoving", "")
			}
		}

	)
}

function wildcard(pattern, string) {
	// *, ? , \ に対応
	// \　はエスケープ

	"use strict"
	var i = 0
	var any = false
	var index, w
	while (i < pattern.length) {
		w = pattern[i]
		switch (w) {
			case '*':
				any = true
				break
			case '?':
				if (string[0] !== undefined) {
					string = string.slice(1)
				} else {
					return false
				}
				any = false
				break
			case '\\':
				w = pattern[++i]
			default:
				while (i + 1 < pattern.length && !['*', '?'].includes(pattern[i + 1])) {
					w += pattern[++i]
				}
				index = string.indexOf(w)
				if (index === -1 || (!any && index !== 0)) {
					return false
				}
				string = string.slice(index + w.length)
				any = false
		}
		i++
	}
	if (!any && string !== '') {
		return false
	}
	return true
}

function wildcards(patterns, string) {
	"use strict"
	return (patterns.find(pattern => wildcard(pattern, string)) !== undefined)
}

const parser = new DOMParser()
const url = window.location.href
const basename = (url) => url.split(/[\\/]/).pop()

function main() {
	if (wildcard('https://www.nicovideo.jp/*', url)) {
		setInterval(video, 400)
	} else if (wildcard('https://game.nicovideo.jp/*', url)) {
		setInterval(rpg, 400)
	}
}

// check if filtering enabled
chrome.storage.local.get({
	filter_enabled: true
}, function(items) {
	if (items.filter_enabled) {
		main()
	} else {
		console.log('Niconico filter has been disabled.')
	}
})