musicEngine = function() {
	var progression = [];

	this.update = function() {

	}

	this.playProgression = function(chordProgression) {
		progression = chordProgression;
		playChord(progression[0]);
	}

	function playChord(chord) {
		var chordMask = chord.getChordMask();

		console.log(NoteNumber[chord.root]);
		for (var i = 0; i < chordMask.length; i++) {
			if (chordMask[i] == "1") console.log(NoteNumber[i]);
		}
	}
}