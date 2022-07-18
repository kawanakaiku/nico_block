"use strict"

function video() {
	"use strict"
	//console.log('running video')
	chrome.storage.local.get({
		video_userids: '',
		video_usernames: '',
		video_blacktags: ''
	}, function(items) {
		video_remove(split_to_array(items.video_userids), split_to_array(items.video_usernames), split_to_array(items.video_blacktags))
	})
}

function video_remove(userids, usernames, blacktags) {
	// https://www.nicovideo.jp/video_top
	// https://www.nicovideo.jp/ranking
	// https://www.nicovideo.jp/search/voiceroid

	"use strict"
	// console.log(blacktags)
	var elms = document.querySelectorAll('li.item[data-video-item][data-video-id], div.VideoCard[data-video-item][data-video-id], div.NicoadVideoItem[data-nicoad-item][data-video-id], div.NicoadVideoItem[data-nicoad-item][data-content-id], div.NC-VideoCard[data-video-thumbnail-comment-hover], li.nicoadVideoItem[data-nicoad-video-item], div.NC-MediaObject')
	elms = Array.from(elms).filter(x => !x.hasAttribute('notremoving'))

	elms.forEach(
		elm => {
			var sm = elm.getAttribute('data-video-id') ||
				elm.getAttribute('data-content-id')
			
			if (sm === null) {
				try {
					sm = basename(elm.querySelector('a.NC-Link[href]').getAttribute('href'))
				} catch (e) {}
			}

			if (sm === null) {
				try {
				'sm' + elm.querySelector('img.thumb[src]').getAttribute('src').split('/')[4]
				} catch (e) { return }
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

function seiga() {
	"use strict"
	//console.log('running video')
	chrome.storage.local.get({
		seiga_userids: '',
		seiga_usernames: ''
	}, function(items) {
		seiga_remove(split_to_array(items.seiga_userids), split_to_array(items.seiga_usernames))
	})
}

function seiga_remove(userids, usernames) {
	"use strict"
	// console.log(blacktags)
	var elms = document.querySelectorAll('div.illust_list_img')
	elms = Array.from(elms).filter(x => !x.hasAttribute('nico_block_processed'))

	elms.forEach(
		elm => {
			var im = elm.querySelector('a[href]').getAttribute('href').split(/\/+/).pop().split('?', 1)[0]

			chrome.runtime.sendMessage({
					contentScriptQuery: 'post',
					endpoint: `https://seiga.nicovideo.jp/api/illust/info?id=${im}`
				},
				(response) => {
					var text = response
					// console.log(text)
					var dom = parser.parseFromString(text, 'text/xml')
					try {
						var userid = dom.querySelector('response > image > user_id').textContent
						// var username = ( dom.querySelector('user_nickname') || dom.querySelector('ch_name') ).textContent
					} catch (e) {
						// console.error( `error parsing https://ext.nicovideo.jp/api/getthumbinfo/${sm} テキスト:${text} エラー内容:${e}`)
						return
					}
					//console.log(userid, username)
					// console.log(tags)
					//console.log(`${sm} userid:${userid} username:${username} tags:${tags}`)
					if (userids.includes(userid)) {
						console.log(`removing ${im} userid:${userid}`)
						// elm.remove()
						elm.style.visibility = 'hidden';
					}
					elm.setAttribute("nico_block_processed", "")
				}
			)


		}
	)
}

function rpg() {
	"use strict"
	//console.log('running rpg')
	chrome.storage.local.get({
		rpg_games: '',
		rpg_userids: '',
		rpg_usernames: ''
	}, function(items) {
		rpg_remove(split_to_array(items.rpg_games), split_to_array(items.rpg_userids), split_to_array(items.rpg_usernames))
	})
}

function rpg_remove(games, userids, usernames) {
	// https://game.nicovideo.jp/atsumaru/
	// https://game.nicovideo.jp/atsumaru/ranking

	"use strict"
	var elms = document.querySelectorAll('section.MatrixRankingMatrix__MatrixRankingGame, div.GameCard__Card, section.GenreRanking__GameSheet')
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

function split_to_array(string) {
	"use strict"
	return string.split('\n').filter( x => ( x !== '') )
}

const parser = new DOMParser()
const url = window.location.href
const basename = (url) => url.split(/[\\/]/).pop()

function main() {
	if (wildcard('https://www.nicovideo.jp/*', url)) {
		setInterval(video, 100)
	} else if (wildcard('https://game.nicovideo.jp/*', url)) {
		setInterval(rpg, 100)
	} else if (wildcard('https://seiga.nicovideo.jp/*', url)) {
		setInterval(seiga, 100)
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