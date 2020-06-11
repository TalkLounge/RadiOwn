$("#play").click(function() {
	console.log("Play/Pause button clicked");
	$(this).toggleClass("play pause");
	if ($(this).hasClass("pause")) {
		console.log("Plays now");
		$(this).text("Pause");
		chrome.runtime.sendMessage({"action": 1});
	} else {
		console.log("Paused now");
		$(this).text("Play");
		chrome.runtime.sendMessage({"action": 2});
	}
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 4) {
        console.log("Called 4");
		console.log(request);
        if (request.status === 1) {
			$("#play").toggleClass("play pause");
			$("#play").text("Pause");
		}
    } else if (request.action === 5) {
		console.log("Called 5");
		$("#songLink").attr("href", "https://www.youtube.com/watch?v="+ request.song.videoId);
		$("#artist").text(request.song.artist);
		$("#title").text(request.song.title);
	}
});

chrome.runtime.sendMessage({"action": 3});
chrome.runtime.sendMessage({"action": 6});