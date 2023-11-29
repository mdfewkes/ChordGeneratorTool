

musicEngine = function() {
	var playing = false;
	var bpm = 160;

	var progression = [];
	var chordIndex = -1;
	var nextChordTime = 0;

	var beatGrid = generateBeatGrid()
	var noteRhythm = generateNoteRhythm(beatGrid);
	var noteIndex = 0;
	var nextNoteTime = 0;
	var noteTimeStep = Math.random() * Math.PI * 2;
	var noteTimeStepSize = Math.random() * 0.2 + 0.2;
	var startingNote = Math.floor(Math.random() * 12) - 3;


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
				playing = false;
			}
		}

		if (playing && performance.now() >= nextNoteTime) {
			playNextNote();
		}
	}

	this.playProgression = function(chordProgression) {
		playing = true;

		progression = chordProgression;
		chordIndex = 0;
		nextChordTime = performance.now();
		playNextChord();

		nextNoteTime = performance.now() + 0.4;
		noteIndex = 0;
		noteTimeStep = 0;
		playNextNote();
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
		}, noteList, 0.03);
		pianoSequence.loop = false;
		pianoSequence.start();

		console.log("~ " + chord.getSymbol());
		//console.log(noteList);
	}

	function playNextChord(duration = 2.5) {
		playChord(progression[chordIndex++], duration);
		nextChordTime += 60000 / bpm * 4;
	}

	function playNextNote(chordTone = false) {
		var octave = 5;
		var noiseOct1 = Math.sin(noteTimeStep * 0.7) * 6;
		var noiseOct2 = Math.sin(noteTimeStep * 1) * 3;
		var noiseOct3 = Math.random() * 2 - 1;
		noteTimeStep += noteTimeStepSize * noteRhythm[noteIndex]; 
		
		var offset = Math.round(noiseOct1 + noiseOct2 + noiseOct3) + startingNote;
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
		console.log (note + octave)

		piano.triggerAttackRelease(note + octave, 60000 / bpm);

		nextNoteTime += 60000 / bpm /2 * noteRhythm[noteIndex++];
		if (noteIndex >= noteRhythm.length) noteIndex = 0;
	}
}