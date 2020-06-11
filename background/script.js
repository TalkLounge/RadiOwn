var playersInitialized = false;
var player1, player2, playerCurrent, playerFuture, playerSong, playerInterval, playerCurrentNumber;
var mixTime = 10000;
var playerVolume = 100;

function randomSong() {
	var songs = [{"videoId": "kSmMOsJmkfs", "artist": "Arc North feat. Krista Marina", "title": "Meant To Be"},
				 {"videoId": "z_0u00b1iEQ", "artist": "Arc North", "title": "Never Gonna"},
				 {"videoId": "7wYu7pTBM5A", "artist": "Daniel Rosty & Sash_S", "title": "See The Stars"},
				 {"videoId": "veywfzDGfuU", "artist": "Rival & Cadmium feat. Jon Becker", "title": "Daily"},
				 {"videoId": "9MiFRbymQXQ", "artist": "Cadmium feat. Jon Becker", "title": "Melody"},
				 {"videoId": "hVa_4Yn3aOc", "artist": "Miza", "title": "Dark World"},
				 {"videoId": "wRmkrxgIZvo", "artist": "Arc North", "title": "Heroic"},
				 {"videoId": "9ytHCimgUos", "artist": "SunnYz", "title": "Senso"},
				 {"videoId": "qKLRv7vL7Rk", "artist": "Fluex", "title": "Wings To Fly"},
				 {"videoId": "EU0obl__qEU", "artist": "Nerow", "title": "Titan"},
				 {"videoId": "SbYl37cNSoY", "artist": "Miza", "title": "Remember"},
				 {"videoId": "tmj4MxMiScg", "artist": "Rolipso", "title": "Jumble"},
				 {"videoId": "QQR9coZOx8g", "artist": "FyMex", "title": "Skyfall"},
				 {"videoId": "-Rw8zR9wmTY", "artist": "Jimmy Hardwind feat. Mike Archangelo", "title": "Want Me"},
				 {"videoId": "cVA-9JHwbFY", "artist": "Ikson", "title": "New Day"},
				 {"videoId": "yhOYPGGTnIo", "artist": "Danell Arma", "title": "Oligarch"},
				 {"videoId": "73kNfkhinaY", "artist": "Robin Hustin", "title": "Phobos"},
				 {"videoId": "E338aF6QHu8", "artist": "Erik Lund", "title": "Summertime"},
				 {"videoId": "KzQiRABVARk", "artist": "Fredji", "title": "Happy Life"},
				 {"videoId": "wIDKJeLXO5Q", "artist": "MBB", "title": "Feel Good"},
				 {"videoId": "WlqmtiHygGM", "artist": "Ikson", "title": "Blue Sky"},
				 {"videoId": "glMhD3EU46k", "artist": "Ikson", "title": "Paradise"},
				 {"videoId": "bqk80OOCxOQ", "artist": "Ikson", "title": "Lights"},
				 {"videoId": "bfjxyOtpvlA", "artist": "MBB", "title": "Beach"},
				 {"videoId": "ueOi5slIU2E", "artist": "Fredji", "title": "Flying High"},
				 {"videoId": "-jpnNRB5eTU", "artist": "Erik Lund", "title": "Tokyo Sunset"},
				 {"videoId": "vtHGESuQ22s", "artist": "LAKEY INSPIRED", "title": "Chill Day"},
				 {"videoId": "UY08PUqArZI", "artist": "Ikson", "title": "Anywhere"},
				 {"videoId": "CZbq2c4p0cs", "artist": "Chris Lehman", "title": "Flash"},
				 {"videoId": "NvZ3CN-vvsw", "artist": "Markvard", "title": "Time"},
				 {"videoId": "0fLMSubepkY", "artist": "MBB", "title": "Island"},
				 {"videoId": "YdOVfRQ0MLQ", "artist": "High Rule", "title": "Control (Instrumental)"}];
	
	return songs[Math.round(Math.random() * (songs.length - 1))];
}

function onYouTubeIframeAPIReady() {
	playerSong = randomSong();
	
	player1 = new YT.Player("player1", {
		height: "720",
		width: "1080",
		videoId: playerSong["videoId"],
		playerVars: {"start": playerSong["start"] || 0},
		events: {
			"onReady": playerPlay
		}
	});
	
	player2 = new YT.Player("player2", {
		height: "720",
		width: "1080",
		videoId: "TW9d8vYrVFQ"
	});
	
	playerCurrent = player1;
	playerFuture = player2;
	playerCurrentNumber = 1;
}

function playersInit() {
	jQuery("<script/>", {
		src: "https://www.youtube.com/iframe_api"
	}).appendTo("body");
}

function playerToggle() {
	if (playerCurrentNumber === 1) {
		playerCurrent = player2;
		playerFuture = player1;
		playerCurrentNumber = 2;
	} else {
		playerCurrent = player1;
		playerFuture = player2;
		playerCurrentNumber = 1;
	}
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function playerMix() {
	console.log("playerMix");
	var nextSong = randomSong();
	playerFuture.cueVideoById(nextSong["videoId"], nextSong["start"] || 0);
	playerFuture.setVolume(Math.round(playerVolume / 2));
	
	var volCurrent = playerVolume;
	var volFuture = playerVolume / 2;
	var volStep = playerVolume / 20;
	var sleepCounter = 0;
	var playing = false;
	var firstStep = true;
	
	while (true) {
		volCurrent -= volStep;
		console.log("Current Decrease "+ volCurrent);
		playerCurrent.setVolume(Math.round(volCurrent));
		if (sleepCounter >= mixTime / 2 - 2500 && ! playing) {
			console.log("Player Play");
			playerFuture.playVideo();
			playing = true;
		}
		if (volCurrent <= playerVolume / 2) {
			if (firstStep) {
				console.log("First Step");
				firstStep = false;
			} else {
				volFuture += volStep;
				console.log("Future Increae "+ volFuture);
				playerFuture.setVolume(Math.round(volFuture));
			}
		}
		if (volCurrent <= 0) {
			console.log("Under 0");
			break;
		}
		sleepCounter += mixTime / 20;
		await sleep(mixTime / 20);
	}
	playerPause();
	playerSong = nextSong;
}

async function playerCheck() {
	if (playerCurrent.getCurrentTime() < (playerSong["end"] || playerCurrent.getDuration()) - (mixTime / 1000)) {
		return;
	}
	clearInterval(playerInterval);
	await playerMix();
	playerToggle();
	playerInterval = setInterval(playerCheck, 1000);
	chrome.runtime.sendMessage({"action": 5, "song": playerSong});
}

function playerPlay() {
	if (! playersInitialized) {
		playersInitialized = true;
		playersInit();
		return;
	}
	playerCurrent.setVolume(playerVolume);
	playerCurrent.playVideo();
	playerInterval = setInterval(playerCheck, 1000);
}

function playerPause() {
	playerCurrent.pauseVideo();
	clearInterval(playerInterval);
}

function playerStatus() {
	var status = playerCurrent.getPlayerState();
	if (status === 1 || status === 3) {
		chrome.runtime.sendMessage({"action": 4, "status": 1});
	} else {
		chrome.runtime.sendMessage({"action": 4, "status": 0});
	}
}

function playerGetSong() {
	return chrome.runtime.sendMessage({"action": 5, "song": playerSong});
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 1) {
        console.log("Called 1");
        playerPlay();
    } else if (request.action === 2) {
		console.log("Called 2");
		playerPause();
	} else if (request.action === 3) {
		console.log("Called 3");
		playerStatus();
	} else if (request.action === 6) {
		console.log("Called 6");
		playerGetSong();
	}
});

// 1: Play - popup
// 2: Pause - popup
// 3: Play status request - popup
// 4: Play status response - popup
// 5: Update song artist & title - background
// 6: Get song artist & title - popup