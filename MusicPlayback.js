

musicEngine = function() {
	var progression = [];
	var chordIndex = 0;
	var playing = false;
	var nextTime = 0;

	const piano = new Tone.Sampler({
		urls: {
			"C4" : "C4.mp3",
			"D#4": "Ds4.mp3",
			"F#4": "Fs4.mp3",
			"A4" : "A4.mp3",
		},
		release: 0.5,
		baseUrl: "https://tonejs.github.io/audio/salamander/",
	}).toDestination();

	this.update = function() {
		if (playing && performance.now() >= nextTime) {
			if (chordIndex < progression.length) {
				playNextChord();
			} else {
				chordIndex = 0;
				playNextChord(4);
				playing = false;
			}
		}
	}

	this.playProgression = function(chordProgression) {
		progression = chordProgression;
		chordIndex = 0;
		playing = true;
		playNextChord();
	}

	this.stopPlayback = function() {
		piano.releaseAll();
		playing = false;
	}

	this.playChord = function(chord, duration = 4) {
		playChord(chord, duration);
	}

	function playChord(chord, duration = 1.5) {
		var noteList = []

		var chordChroma = chord.getChroma();
		for (var i = 0; i < chordChroma.length; i++) {
			var noteNumber = (i + chord.root) % 12;
			if (chordChroma[i] == "1") { 
				if (noteNumber <= 1 && noteList.length >= 2) {
					noteList.push(NoteNumber[noteNumber] + "5");
				} else if (noteNumber <= 9) {
					noteList.push(NoteNumber[noteNumber] + "4");
				} else {
					noteList.unshift(NoteNumber[noteNumber] + "3");
				}
			}
		}

		noteList.unshift(NoteNumber[chord.root] + (chord.root <= 9 ? "3" : "2"));

		var pianoSequence = new Tone.Sequence(function(time, note) {
			piano.triggerAttackRelease(note, duration);
		}, noteList, 0.05);
		pianoSequence.loop = false;
		pianoSequence.start();

		//console.log(chord.getSymbol());
		//console.log(noteList);
	}

	function playNextChord(duration = 1.5) {
		playChord(progression[chordIndex], duration);
		chordIndex++;
		nextTime = performance.now() + 1500;
	}
}