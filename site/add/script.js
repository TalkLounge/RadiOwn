var player, searchresults, videoData, searchtermPrevious, playerReady, callGenerateVideo, callGenerateEdit, videoLength, slider, sliderValue, sliderCheckPlayInterval;

function playerOnReady() {
	playerReady = true;
	if (callGenerateVideo) {
		callGenerateVideo = false;
		generateVideo();
	}
}

function playerOnError(err) {
	console.log("Error");
	console.log(err);
	if (err.data === 150 || err.data === 101) {
		alert("Not embeddable");
	}
}

function convertTime(time) {
	if (videoLength < 3600) {
		var minutes = Math.floor(time / 60);
		if (minutes < 10) {
			minutes = "0"+ minutes;
		}
		var seconds = Math.floor(time - minutes * 60);
		if (seconds < 10) {
			seconds = "0"+ seconds;
		}
		return minutes +":"+ seconds;
	} else {
		var hours = Math.floor(time / 3600);
		if (hours < 10) {
			hours = "0"+ hours;
		}
		var minutes = Math.floor((time - hours * 3600) / 60);
		if (minutes < 10) {
			minutes = "0"+ minutes;
		}
		var seconds = Math.floor(time - (hours * 3600 + minutes * 60));
		if (seconds < 10) {
			seconds = "0"+ seconds;
		}
		return hours +":"+ minutes +":"+ seconds;
	}
}

function sliderOnChange(event) {
	$("#startTime").text(convertTime(event.value.newValue[0]));
	$("#endTime").text(convertTime(event.value.newValue[1]));
	var changedValue = event.value.newValue[0];
	if (event.value.oldValue[1] !== event.value.newValue[1]) {
		changedValue = event.value.newValue[1];
	}
	player.seekTo(changedValue, false);
}

function sliderOnStart(event) {
	sliderValue = event.value;
	player.pauseVideo();
}

function sliderCheckPlay(endTime) {
	if (player.getCurrentTime() >= endTime) {
		player.pauseVideo();
		clearInterval(sliderCheckPlayInterval);
	}
}

function sliderOnStop(event) {
	if (sliderValue[0] !== event.value[0]) {
		player.seekTo(event.value[0]);
		player.playVideo();
		sliderCheckPlayInterval = setInterval(sliderCheckPlay, 1000, event.value[1]);
	} else {
		player.seekTo(event.value[1] - 5);
		player.playVideo();
		sliderCheckPlayInterval = setInterval(sliderCheckPlay, 1000, event.value[1]);
	}
	console.log(slider.slider("getValue"));
}

function generateSlider() {
	videoLength = Math.floor(player.getDuration());
	slider = $("#slider").slider({
		min: 0,
		max: videoLength,
		value: [0, videoLength]
	})
		.on("change", sliderOnChange)
		.on("slideStart", sliderOnStart)
		.on("slideStop", sliderOnStop);
	$("#startTime").text(convertTime(0));
	$("#endTime").text(convertTime(videoLength));
}

function playerOnStateChange(event) {
	if (event.data === YT.PlayerState.PLAYING && callGenerateEdit) {
		callGenerateEdit = false;
		generateEdit();
	} else if (event.data === YT.PlayerState.PAUSED) {
		clearInterval(sliderCheckPlayInterval);
	}
}

function onYouTubeIframeAPIReady() {
	player = new YT.Player("player", {
		videoId: "TW9d8vYrVFQ",
		events: {
			"onReady": playerOnReady,
			"onError": playerOnError,
			"onStateChange": playerOnStateChange
		}
	});
}

function isUrl(string) { // https://stackoverflow.com/a/43467144
	var url;
	
	try {
		url = new URL(string);
	} catch (_) {
		return false;
	}
	
	return url.protocol === "http:" || url.protocol === "https:";
}

function getYoutubeId(url) { // https://stackoverflow.com/a/54200105
	var url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
	return (url[2] !== undefined) ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
}

function generateArtistTitle() {
	var videoTitle = videoData.snippet.title;
	var replacePattern = ["Official Audio",
						  "Audio",
						  "Official Music Video",
						  "Official Video",
						  "Video",
						  "Official Lyric Video",
						  "Official Lyrics",
						  "Lyrics",
						  "Official Version"];
	replacePattern.push(videoData.snippet.channelTitle +" Release");
	var channelAbbreviation = "";
	var channelTitle = videoData.snippet.channelTitle.split(" ");
	for (var i = 0; i < channelTitle.length; i++) {
		channelAbbreviation += channelTitle[i].charAt(0);
	}
	replacePattern.push(channelAbbreviation +" Release");
	replacePattern.push(videoData.snippet.channelTitle);
	for (var i = 0; i < replacePattern.length; i++) {
		videoTitle = videoTitle.replace("["+ replacePattern[i] +"]", "");
		videoTitle = videoTitle.replace("("+ replacePattern[i] +")", "");
		videoTitle = videoTitle.replace("["+ replacePattern[i].toLowerCase() +"]", "");
		videoTitle = videoTitle.replace("("+ replacePattern[i].toLowerCase() +")", "");
	}
	videoTitle = videoTitle.replace(/&amp;/g, "&").trim();
	var artists = [];
	var titles = [];
	for (var i = 1; i < videoTitle.split("-").length; i++) {
		artists.push(videoTitle.split("-").splice(0, i).join("-").replace("feat.", "ft.").trim());
		titles.push(videoTitle.split("-").splice(i).join("-").replace("feat.", "ft.").trim());
	}
	for (var i = 0; i < titles.length; i++) {
		var index = titles[i].indexOf("ft.");
		if (index !== -1) {
			var sub = titles[i].substring(index);
			artists[i] += " "+ sub;
			titles[i] = titles[i].replace(sub, "").trim();
		}
	}
	// TODO: Remix with pattern search back to title : Timbaland ft. OneRepublic (Besomorph, Anthony Keyrouz, Lunis Remix)
	$("#artist").val("");
	$("#title").val("");
	$("#artists").empty();
	$("#titles").empty();
	for (var i = 0; i < artists.length; i++) {
		$("#artists").append(newElement("option", {"value": artists[i]}));
		$("#titles").append(newElement("option", {"value": titles[i]}));
	}
}

function generateEdit() {
	generateSlider();
	generateArtistTitle();
	$("#searchresultsBorder").css("display", "none");
	$("#edit").css("display", "block");
	$("html, body").animate({scrollTop: $("#edit").offset().top}, 500);
}

function generateVideo() {
	if (! playerReady) {
		callGenerateVideo = true;
		return;
	}
	callGenerateEdit = true;
	player.loadVideoById(videoData.id.videoId || videoData.id);
}

function loadedVideoData(data) {
	console.log(data);
	if (data.errorCode) {
		alert(data.errorText);
		return;
	}
	if (! data.items.length) {
		alert("Invalid YouTube Link");
		return;
	}
	videoData = data.items[0];
	generateVideo();
}

function loadVideoData(url) {
	var ytid = getYoutubeId(url);
	$.getJSON("https://talklounge.ddns.net:34475/?type=video&q="+ ytid, loadedVideoData);
}

function newElement(tagName, attributes, content) {
	var tag = document.createElement(tagName);
	for (var key in attributes || {}) {
		tag.setAttribute(key, attributes[key]);
	}
	tag.innerHTML = content || "";
	return tag.outerHTML;
}

function searchresultClicked() {
	var id = $(this).data("id");
	videoData = searchresults[id];
	generateVideo();
}

function generateSearchresults(data) {
	console.log(data);
	if (data.errorCode) {
		alert(data.errorText);
		return;
	}
	if (! data.items.length) {
		alert("No Searchresults found");
		return;
	}
	searchresults = data.items;
	$("#searchresults").empty();
	for (var i = 0; i < searchresults.length; i++) {
		$("#searchresults").append(
			newElement("div", {"class": "searchresultBorder d-inline-block"},
					   newElement("div", {"class": "searchresult", "data-id": i},
								  newElement("img", {"class": "searchresultThumbnail", "src": searchresults[i].snippet.thumbnails.medium.url}) +
								  newElement("span", {"class": "searchresultTitle font-weight-bold text-center"}, searchresults[i].snippet.title) +
								  newElement("span", {"class": "searchresultChannel"}, searchresults[i].snippet.channelTitle))));
	}
	$("#searchresultsBorder").css("display", "block");
	$(".searchresult").click(searchresultClicked);
}

function loadVideoSearch(searchterm) {
	if (searchterm === searchtermPrevious) {
		$("#searchresultsBorder").css("display", "block");
	} else {
		searchtermPrevious = searchterm;
		$.getJSON("https://talklounge.ddns.net:34475/?type=search&q="+ searchterm, generateSearchresults);
	}
}

function searchOrLoad() {
	var url = $("#url").val();
	if (isUrl(url)) {
		loadVideoData(url);
	} else {
		loadVideoSearch(url);
	}
}

$("#search").click(searchOrLoad);

$("#url").keypress(function(e) {
	if (e.which === 13 || e.keyCode === 13) {
		searchOrLoad();
	}
});