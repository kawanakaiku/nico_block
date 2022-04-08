function apply() {
	apply_button.disabled = true
	all_disabled(true)
	filter_enabled_stored = filter_enabled.checked
	video_userids_stored = video_userids.value
	video_usernames_stored = video_usernames.value
	video_blacktags_stored = video_blacktags.value
	rpg_games_stored = rpg_games.value
	rpg_userids_stored = rpg_userids.value
	rpg_usernames_stored = rpg_usernames.value

	chrome.storage.local.set(
		to_json(), () => {
			all_disabled(false)
		})
}

function apply_json(json) {
	apply_button.disabled = true
	all_disabled(true)
	chrome.storage.local.set({
		json
	}, () => {
		init()
	})
}

function change() {
	apply_button.disabled = !changed()
}

function changed() {
	return filter_enabled.checked !== filter_enabled_stored ||
		video_userids.value !== video_userids_stored ||
		video_usernames.value !== video_usernames_stored ||
		video_blacktags.value !== video_blacktags_stored ||
		rpg_games.value !== rpg_games_stored ||
		rpg_userids.value !== rpg_userids_stored ||
		rpg_usernames.value !== rpg_usernames_stored
}

function all_disabled(b) {
	video_userids.disabled = b
	video_usernames.disabled = b
	video_blacktags.disabled = b
	rpg_games.disabled = b
	rpg_userids.disabled = b
	rpg_usernames.disabled = b
}

function init() {
	chrome.storage.local.get({
		filter_enabled: true,
		video_userids: '',
		video_usernames: '',
		video_blacktags: '',
		rpg_games: '',
		rpg_userids: '',
		rpg_usernames: ''
	}, items => {
		filter_enabled_stored = items.filter_enabled
		video_userids_stored = items.video_userids
		video_usernames_stored = items.video_usernames
		video_blacktags_stored = items.video_blacktags
		rpg_games_stored = items.rpg_games
		rpg_userids_stored = items.rpg_userids
		rpg_usernames_stored = items.rpg_usernames

		filter_enabled.checked = filter_enabled_stored
		video_userids.value = video_userids_stored
		video_usernames.value = video_usernames_stored
		video_blacktags.value = video_blacktags_stored
		rpg_games.value = rpg_games_stored
		rpg_userids.value = rpg_userids_stored
		rpg_usernames.value = rpg_usernames_stored
	})
}

function to_json() {
	return {
		filter_enabled: filter_enabled_stored,
		video_userids: video_userids_stored,
		video_usernames: video_usernames_stored,
		video_blacktags: video_blacktags_stored,
		rpg_games: rpg_games_stored,
		rpg_userids: rpg_userids_stored,
		rpg_usernames: rpg_usernames_stored
	}
}

function export_json() {
	var json = to_json()
	var content = JSON.stringify(json)
	var blob = new Blob([content], {
		"type": "text/plain"
	})
	var a = document.createElement("a")
	a.download = `niconicofilter_export_${current_time()}.txt`
	a.href = URL.createObjectURL(blob)
	a.target = '_blank'
	a.click()
	URL.revokeObjectURL(a.href)
}

function import_json() {
	var file = filepick_input.files[0]
	try {
		reader.readAsText(file)
	} catch (e) {
		return
	}
	reader.onload = () => import_txt(reader.result)
}

function import_txt(txt) {
	try {
		var obj = JSON.parse(txt)
	} catch (e) {
		return
	}
	filter_enabled.checked = obj.filter_enabled
	video_userids.value = obj.video_userids
	video_usernames.value = obj.video_usernames
	video_blacktags.value = obj.video_blacktags
	rpg_games.value = obj.rpg_games
	rpg_userids.value = obj.rpg_userids
	rpg_usernames.value = obj.rpg_usernames
	change()
}

var current_time = () => {
	var date = new Date()
	return `${keta(4, date.getFullYear())}-${keta(2, date.getMonth()+1)}-${keta(2, date.getDate())}_${keta(2, date.getHours())}.${keta(2, date.getMinutes())}.${keta(2, date.getSeconds())}`
}

var keta = (LEN, NUM) => {
	return (Array(LEN).join('0') + NUM).slice(-LEN);
}

var apply_button = document.querySelector('button#apply'),
	export_button = document.querySelector('button#export'),
	import_button = document.querySelector('button#import'),
	filepick_input = document.querySelector('input#filepick'),
	filter_enabled = document.querySelector('input#filter_enabled'),
	video_userids = document.querySelector('textarea#video_userids'),
	video_usernames = document.querySelector('textarea#video_usernames'),
	video_blacktags = document.querySelector('textarea#video_blacktags'),
	rpg_games = document.querySelector('textarea#rpg_games'),
	rpg_userids = document.querySelector('textarea#rpg_userids'),
	rpg_usernames = document.querySelector('textarea#rpg_usernames'),
	filter_enabled_stored,
	video_userids_stored,
	video_usernames_stored,
	video_blacktags_stored,
	rpg_games_stored,
	rpg_userids_stored,
	rpg_usernames_stored

apply_button.addEventListener('click', apply)
export_button.addEventListener('click', export_json)
import_button.addEventListener('click', () => filepick_input.click())
filepick_input.addEventListener('change', import_json)
filter_enabled.addEventListener('input', change)
video_userids.addEventListener('input', change)
video_usernames.addEventListener('input', change)
video_blacktags.addEventListener('input', change)
rpg_games.addEventListener('input', change)
rpg_userids.addEventListener('input', change)
rpg_usernames.addEventListener('input', change)

//ctrl+s to save
document.addEventListener('keydown', e => {
	if (e.ctrlKey && e.key === 's') {
		// Prevent the Save dialog to open
		e.preventDefault()
		// Place your code here
		apply_button.click()
	}
})

//drag and drop file to import
document.documentElement.addEventListener('dragover', e => {
	e.stopPropagation()
	e.preventDefault()
})
document.documentElement.addEventListener('dragleave', e => {
	e.stopPropagation()
	e.preventDefault()
})
document.documentElement.addEventListener('drop', e => {
	e.stopPropagation()
	e.preventDefault()
	var files = e.dataTransfer.files
	filepick_input.files = files
	import_json()
})

var reader = new FileReader()

init()