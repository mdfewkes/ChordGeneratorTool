var eigthsPerMeasure = 8;
var numberOfMeasuresPerGroove = 2;
var numberOfMeasuresPerPhrase = 4;
var oddsOfThree = 0.3;
var oddsOfLongNote = 0.6;
var rhythmTable = {
	0: [[0]],
	1: [[1]],
	2: [[2],[1,1]],
	3: [[3],[2,1],[1,1,1]],
	4: [[4],[2,2],[3,1]],
	5: [[5],[3,2]],
	6: [[6],[3,3]],
	7: [[7],[4,3],[3,2,2]],
	8: [[8],[4,4],[3,3,2]],
}

//Generate beat grid
function generateBeatGrid() {
	var list = [];
	var goal = eigthsPerMeasure * numberOfMeasuresPerGroove;
	var total = 0;
	while (total < goal) {
		var number = Math.random() < oddsOfThree ? 3 : 2;
		list.push(number);
		total += number;
	}
	while (total > goal) {
		list[Math.floor(Math.random()*list.length)] -= 1;
		total -= 1;
	}
	for (var i = list.length - 1; list >= 0; list--) {
		if (list[i] == 0) list.splice(i, 1);
	}
	return list;
}

//Generate note rhythm
function generateNoteRhythm(list) {
	var chart = [];
	var step = 0;
	var steps = list.length * numberOfMeasuresPerPhrase/numberOfMeasuresPerGroove;
	while (step < steps) {
		var thisRhythmOptions = [[0]];
		var stepMOD = step % list.length;
		if (Math.random() < oddsOfLongNote) {
			for (var targetDuration = Math.floor(Math.random() * 5) + 4; targetDuration >= 0; targetDuration--) {
				var subtotal = 0;
				var nextStep = 0;
				while (subtotal < targetDuration && step + nextStep < steps) {
					subtotal += list[(step + nextStep) % list.length];
					nextStep++;
				}
				if (subtotal == targetDuration) {
					thisRhythmOptions = rhythmTable[targetDuration];
					targetDuration = -1;
					step += nextStep-1;
				}
			}
		} else {
			thisRhythmOptions = rhythmTable[list[stepMOD]];
		}

		var thisRhythm = thisRhythmOptions[Math.floor(Math.random()*thisRhythmOptions.length)];

		console.log(thisRhythm)

		for (var nextStep = 0; nextStep < thisRhythm.length; nextStep++) {
			chart.push(thisRhythm[nextStep]);
		}

		step++;
		//console.log(step + "/" + steps)
	}

	var listTotal = 0;
	var chartTotal = 0;
	for (var i = 0; i < list.length; i++) {
		listTotal += list[i];
	}
	for (var i = 0; i < chart.length; i++) {
		chartTotal += chart[i];
	}
	//console.log(listTotal + " " + chartTotal)

	return chart;
}