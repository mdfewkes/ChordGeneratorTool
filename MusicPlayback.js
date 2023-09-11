musicEngine = function() {
	var progression = [];
	var chordIndex = 0;
	var playing = false;
	var nextTime = 0;

	this.update = function() {
		if (playing) {
			if (performance.now() > nextTime) {
				if (chordIndex < progression.length) {
					playNextChord();
				} else {
					chordIndex = 0;
					playNextChord();
					playing = false;
				}
			}
		}
	}

	this.playProgression = function(chordProgression) {
		progression = chordProgression;
		chordIndex = 0;
		playing = true;
		playNextChord();
	}

	function playNextChord() {
		playChord(progression[chordIndex]);
		chordIndex++;
		nextTime = performance.now() + 2000;
	}

	function playChord(chord) {
		var chordMask = chord.getChordMask();

		console.log(chord.getSymbol());
		/*for (var i = 0; i < chordMask.length; i++) {
			if (chordMask[i] == "1") console.log(NoteNumber[i]);
		}*/
	}
}