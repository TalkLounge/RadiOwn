var player, searchresults, videoData, lastSearchterm, updateSlider, videoLength, playerReady, loadEditYtid, slider, sliderValue, sliderCheckPlayInterval;
var apiKey = "AIzaSyCQHHBtF7USK9B4PGSVw2EXq3OfNVNs3fY";

function playerOnReady() {
	playerReady = true;
	if (loadEditYtid) {
		loadEdit(loadEditYtid);
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

function loadSlider() {
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
	if (event.data === YT.PlayerState.PLAYING && updateSlider) {
		updateSlider = false;
		loadSlider();
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

function loadEdit(ytid) {
	if (! playerReady) {
		loadEditYtid = ytid;
		return;
	}
	updateSlider = true;
	player.loadVideoById(ytid || videoData.id.videoId);
	$("#edit").css("display", "block");
	$("#searchresultsBorder").css("display", "none");
	$("html, body").animate({scrollTop: $("#edit").offset().top}, 500);
}

function loadVideoData(data) {
	console.log(data);
	videoData = data.items[0];
}

function loadVideo(url) {
	var ytid = getYoutubeId(url);
	$.getJSON("https://www.googleapis.com/youtube/v3/videos?part=snippet&key="+ apiKey +"&id="+ ytid, loadVideoData);
	loadEdit(ytid);
}

function newElement(tagName, attributes, content) {
	var tag = document.createElement(tagName);
	for (var key in attributes || {}) {
		tag.setAttribute(key, attributes[key]);
	}
	tag.innerHTML = content || "";
	return tag.outerHTML;
}

function clickedSearchresult() {
	var id = $(this).data("id");
	videoData = searchresults[id];
	loadEdit();
}

function loadSearchresults(data) {
	console.log(data);
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
	$(".searchresult").click(clickedSearchresult);
}

function searchVideo(searchterm) {
	if (searchterm === lastSearchterm) {
		$("#searchresultsBorder").css("display", "block");
	} else {
		lastSearchterm = searchterm;
		$.getJSON("https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=24&type=video&videoEmbeddable=true&videoSyndicated=true&key="+ apiKey +"&q="+ searchterm, loadSearchresults);
	}
}

function searchOrLoad() {
	var url = $("#url").val();
	if (isUrl(url)) {
		loadVideo(url);
	} else {
		searchVideo(url);
	}
}

$("#search").click(searchOrLoad);

$("#url").keypress(function(e) {
	if (e.which === 13 || e.keyCode === 13) {
		searchOrLoad();
	}
});