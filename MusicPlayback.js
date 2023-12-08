musicEngine = function() {
	var playing = false;
	var bpm = 160;

	var progression = [];
	var chordIndex = -1;
	var nextChordTime = 0;


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
		if (playing && performance.now() >= nextChordTime) {
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
		playing = true;

		progression = chordProgression;
		chordIndex = 0;
		nextChordTime = performance.now();
		playNextChord();
	}

	this.stopPlayback = function() {
		piano.releaseAll();
		playing = false;
	}

	this.playChord = function(chord, duration = 1.5) {
		piano.releaseAll();
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
		}, noteList, 0.07);
		pianoSequence.loop = false;
		pianoSequence.start();

		console.log("~ " + chord.getSymbol());
		//console.log(noteList);
	}

	function playNextChord(duration = 2.5) {
		playChord(progression[chordIndex++], duration);
		nextChordTime += 60000 / bpm * 4;
	}
}

musicEngine2 = function() {
	var playing = false;
	var bpm = 160;

	var progression = [];
	var chordIndex = -1;
	var nextChordTime = 0;

	var beatGrid = generateBeatGrid()
	var noteRhythm = generateNoteRhythm(beatGrid);
	var noteAccIndex = 0;
	var nextAccTime = 0;
	var noteIndex = 0;
	var nextNoteTime = 0;
	var noteTimeStep = Math.random() * 2;
	var noteTimeStepSize = Math.random() * 0.03 + 0.03;
	var startingNote = Math.floor(Math.random() * 12) - 12;


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
		if (playing && performance.now() >= nextChordTime) {
			if (chordIndex < progression.length) {
				playNextChord();
			} else {
				chordIndex = 0;
				playNextChord(4);
				playNextNote(true);
				playNextAcc();
				playing = false;
			}
		}

		if (playing && performance.now() >= nextNoteTime) {
			playNextNote();
		}

		if (playing && performance.now() >= nextAccTime) {
			playNextAcc();
		}
	}

	this.playProgression = function(chordProgression) {
		playing = true;

		progression = chordProgression;
		chordIndex = 0;
		nextChordTime = performance.now();
		playNextChord();

		nextNoteTime = performance.now();
		noteIndex = 0;
		noteTimeStep = 0;
		playNextNote();

		nextAccTime = performance.now();
		noteAccIndex = 0;
		playNextAcc();
	}

	this.stopPlayback = function() {
		piano.releaseAll();
		playing = false;
	}

	this.playChord = function(chord, duration = 1.5) {
		piano.releaseAll();
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
		}, noteList, 0.07);
		pianoSequence.loop = false;
		pianoSequence.start();
	}

	function playNextChord(duration = 2.5) {
		chordIndex++;
		nextChordTime += 60000 / bpm * 4;
	}

	function playNextNote(chordTone = false) {
		var octave = 5;
		var noiseOct1 = triGen(noteTimeStep * 2) * 9;
		var noiseOct2 = sinGen(noteTimeStep * 6) * 3;
		var noiseOct3 = nosGen() * 1.5;
		noteTimeStep += noteTimeStepSize * noteRhythm[noteIndex]; 
		
		var offset = Math.round(noiseOct1 + noiseOct2 + noiseOct3) + startingNote;
		console.log(offset);
		while (offset > 12) {
			offset -= 12;
			octave += 1;
		}
		while (offset < 0) {
			offset += 12;
			octave -= 1;
		}

		var note = 1000;
		var chordSoloChroma = QualitySoloScaleChroma[progression[chordIndex-1].quality];
		chordSoloChroma = rotateString(chordSoloChroma, progression[chordIndex-1].root);
		if (chordTone) chordSoloChroma = progression[chordIndex-1].getChordMask();
		for (var i = 0; i < chordSoloChroma.length; i++) {
			if (chordSoloChroma[i] == "1") {
				if (Math.abs(offset - i) < Math.abs(offset - note)) {
					note = i;
				}
			}
		}
		note = NoteNumber[note];
		//console.log (note + octave)

		piano.triggerAttackRelease(note + octave, 60000 / bpm);
		piano.volume.value = -Math.random() * 3 - 3;

		nextNoteTime += 60000 / bpm /2 * noteRhythm[noteIndex++];
		if (noteIndex >= noteRhythm.length) noteIndex = 0;
	}

	function playNextAcc() {
		piano.triggerAttackRelease(NoteNumber[progression[chordIndex-1].root] + "3", 60000 / bpm);
		piano.triggerAttackRelease(NoteNumber[progression[chordIndex-1].root] + "4", 60000 / bpm);

		nextAccTime += 60000 / bpm /2 * beatGrid[noteAccIndex++];
		if (noteAccIndex >= beatGrid.length) noteAccIndex = 0;
	}
}

triGen = function(value) {
	return (value % 2 < 1) ? value % 1 : 1 - (value % 1);
}

sinGen = function(value) {
	return Math.sin(value * Math.PI);
}

nosGen = function() {
	return Math.random() * 2 - 1;
}