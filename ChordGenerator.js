const QualityCount = 4;

const Quality = {
	Major: 0,
	Minor: 1,
	Diminished: 2,
	Augmented: 3
}

const QualityDecode = {
	0: "Major",
	1: "Minor",
	2: "Diminished",
	3: "Augmented"
}

const QualityWeight = {
	0: 1,
	1: 1,
	2: 0.5,
	3: 0.1,
}

const QualityChroma = {
	0: "10001001",
	1: "10010001",
	2: "1001001",
	3: "100010001",
}

const QualityScaleChroma = {
	0: "101011010101",
	1: "101101011010",
	2: "110101101010",
	3: "101010101010",
}

const QualitySoloScaleChroma = {
	0: "101010010100",
	1: "100101010010",
	2: "100101001010",
	3: "101010001010",
}

const QualitySymbol = {
	0: "",
	1: "m",
	2: "°",
	3: "+",
}

const NoteCount = 12;

const NoteName = {
	"Cb": 11,
	"C": 0,
	"C#": 1,
	"Db": 1,
	"D": 2,
	"D#": 3,
	"Eb": 3,
	"E": 4,
	"E#": 5,
	"Fb": 4,
	"F": 5,
	"F#": 6,
	"Gb": 6,
	"G": 7,
	"G#": 8,
	"Ab": 8,
	"A": 9,
	"A#": 10,
	"Bb": 10,
	"B": 11,
	"B#": 0
}

const NoteNumberSharps = {
	0: "C",
	1: "C#",
	2: "D",
	3: "D#",
	4: "E",
	5: "F",
	6: "F#",
	7: "G",
	8: "G#",
	9: "A",
	10: "A#",
	11: "B"
}

const NoteNumberFlats = {
	0: "C",
	1: "Db",
	2: "D",
	3: "Eb",
	4: "E",
	5: "F",
	6: "Gb",
	7: "G",
	8: "Ab",
	9: "A",
	10: "Bb",
	11: "B"
}

const NoteNumberCommon = {
	0: "C",
	1: "C#",
	2: "D",
	3: "Eb",
	4: "E",
	5: "F",
	6: "F#",
	7: "G",
	8: "Ab",
	9: "A",
	10: "Bb",
	11: "B"
}

var NoteNumber = NoteNumberCommon;

function Chord(root = 0, quality = Quality.Major) {
	this.root = validateRoot(root);
	this.quality = quality;
	this.weight = 1;

	validateRoot();

	this.getChroma = function() {
		var chordChroma = QualityChroma[quality];
		chordChroma = chordChroma.padEnd(NoteCount, "0");

		return chordChroma;
	}

	this.getChordMask = function() {
		var chordMask = this.getChroma();

		return rotateString(chordMask, this.root);
	}

	this.getSymbol = function() {
		var symbol = NoteNumber[this.root];
		symbol += QualitySymbol[quality];

		return symbol;
	}

	function validateRoot(value) {
		return (value + NoteCount*NoteCount) % NoteCount;
	}
}

function Rule(rootMotion = 0, startingQuality = Quality.Major, endingQuality = Quality.Major) {
	this.rootMotion = (rootMotion < 0 ? rootMotion + NoteCount : rootMotion) % NoteCount;
	this.startingQuality = startingQuality;
	this.endingQuality = endingQuality;
}


var testRules6 = [
	new Rule(0, Quality.Major, Quality.Minor),
	new Rule(0, Quality.Minor, Quality.Major),
	new Rule(-3, Quality.Major, Quality.Minor),
	new Rule(3, Quality.Minor, Quality.Major),
	new Rule(4, Quality.Major, Quality.Minor),
	new Rule(-4, Quality.Minor, Quality.Major),
	new Rule(4, Quality.Minor, Quality.Minor),
	new Rule(-4, Quality.Minor, Quality.Minor),
	new Rule(5, Quality.Major, Quality.Minor),
	new Rule(-5, Quality.Minor, Quality.Major),
	new Rule(5, Quality.Major, Quality.Major),
	new Rule(-5, Quality.Major, Quality.Major),
	new Rule(7, Quality.Major, Quality.Minor),
	new Rule(-7, Quality.Minor, Quality.Major),
];

//I V vi iii IV I IV V
var testRules5 = [
	new Rule(7, Quality.Major, Quality.Major),
	new Rule(2, Quality.Major, Quality.Minor),
	new Rule(7, Quality.Minor, Quality.Minor),
	new Rule(1, Quality.Minor, Quality.Major),
	new Rule(-5, Quality.Major, Quality.Major),
	new Rule(5, Quality.Major, Quality.Major),
	new Rule(2, Quality.Major, Quality.Major),
	new Rule(-7, Quality.Major, Quality.Major),
];

//I vi IV V
var testRules4 = [
	new Rule(-3, Quality.Major, Quality.Minor),
	new Rule(-4, Quality.Minor, Quality.Major),
	new Rule(2, Quality.Major, Quality.Major),
	new Rule(5, Quality.Major, Quality.Major),
];

//I IV V IV
var testRules3 = [
	new Rule(5, Quality.Major, Quality.Major),
	new Rule(2, Quality.Major, Quality.Major),
	new Rule(-2, Quality.Major, Quality.Major),
	new Rule(-5, Quality.Major, Quality.Major),
];

//I V vi IV
var testRules2 = [
	new Rule(7, Quality.Major, Quality.Major),
	new Rule(2, Quality.Major, Quality.Minor),
	new Rule(-4, Quality.Minor, Quality.Major),
	new Rule(-5, Quality.Major, Quality.Major),
];

//I IV V I
var testRules1 = [
	new Rule(5, Quality.Major, Quality.Major),
	new Rule(2, Quality.Major, Quality.Major),
];

var testRules = [
	new Rule( 7, Quality.Major, Quality.Major),
	new Rule(-7, Quality.Major, Quality.Major),
	new Rule( 7, Quality.Minor, Quality.Minor),
	new Rule(-7, Quality.Minor, Quality.Minor),
	new Rule(-7, Quality.Major, Quality.Minor),
	new Rule( 2, Quality.Major, Quality.Major),
	new Rule(-2, Quality.Major, Quality.Major),
	new Rule( 2, Quality.Minor, Quality.Minor),
	new Rule(-2, Quality.Minor, Quality.Minor),
	new Rule( 2, Quality.Major, Quality.Minor),
	new Rule(-2, Quality.Minor, Quality.Major),
	new Rule(-3, Quality.Major, Quality.Minor),
	new Rule( 3, Quality.Minor, Quality.Major),
	new Rule( 4, Quality.Minor, Quality.Minor),
	new Rule(-4, Quality.Minor, Quality.Minor),
	new Rule( 0, Quality.Major, Quality.Minor),
	new Rule( 0, Quality.Minor, Quality.Major),//
	new Rule( 0, Quality.Major, Quality.Augmented),
	new Rule( 0, Quality.Augmented, Quality.Major),//
	new Rule( 0, Quality.Minor, Quality.Diminished),
	new Rule( 0, Quality.Diminished, Quality.Minor),//
	new Rule( 0, Quality.Major, Quality.Diminished),
	new Rule( 0, Quality.Diminished, Quality.Major),//
	new Rule( 1, Quality.Diminished, Quality.Major),
	new Rule( 4, Quality.Major, Quality.Diminished),
	new Rule( 6, Quality.Major, Quality.Diminished),
	new Rule( 5, Quality.Augmented, Quality.Major),
	new Rule( 1, Quality.Augmented, Quality.Major),
	new Rule(-3, Quality.Augmented, Quality.Major),
];

function ChordGenerator() {
	var openDomain = [];
	for (var i = 0; i < NoteCount; i++) {
		for (var j = 0; j < QualityCount; j++) {
			openDomain.push(new Chord(i, j));
			openDomain[openDomain.length-1].weight = QualityWeight[j];
		}
	}
	//console.log(openDomain);
	var loopProgression = false;
	var forgivingOutput = false;
	var progression = [];
	var rules = testRules;

	var failsafeRules = []
	for (var i = 0; i < QualityCount; i++) {
		failsafeRules.push(new Rule(0, i, i));
	}

	this.generateProgressionOfLength = function(numberOfChords, loop = false, firstChord = 0, lastChord = 0) {
		var passCell = [];
		for (var i = 0; i < numberOfChords; i++) {
			if (i == 0) {
				passCell.push(firstChord);
			} else if (i == numberOfChords - 1) {
				passCell.push(lastChord);
			} else {
				passCell.push(0);
			}
		}
		//console.log("generateProgressionOfLength");
		//console.log(passCell);

		return this.generateProgressionFromTemplate(passCell, loop);
	}

	this.generateProgressionFromTemplate = function(chordProgression, loop = false) {
		loopProgression = loop;

		var cells = [];
		for (var i = 0; i < chordProgression.length; i++) {
			if (chordProgression[i] instanceof Chord) {
				cells.push([chordProgression[i]]);
			} else if (chordProgression[i].length != undefined) {
				cells.push(chordProgression[i]);
			} else {
				cells.push(JSON.parse(JSON.stringify(openDomain)));
			}
		}
		//console.log("generateProgressionFromTemplate");
		//console.log(cells);

		runGenerator(cells);
		renderProgression();
		return progression;
	}

	this.getRules = function() {
		return rules;
	}

	this.setRules = function(newRules)  {
		rules = newRules;;
	}

	this.addRules = function(newRules)  {
		if (newRules.length != undefined) {
			for (var i = 0; i < newRules.length; i++) {
				rules.push(newRules[i]);
			}
		} else {
			rules.push(newRules);
		}
	}

	this.addRules = function(newRules)  {
		for (var i = 0; i < newRules.length; i++) {
			rules.push(newRules[i]);
		}
	}

	this.setScaleMask = function(scaleMask, divergence = 0) {
		openDomain = [];
		for (var i = 0; i < NoteCount; i++) {
			for (var j = 0; j < QualityCount; j++) {
				openDomain.push(new Chord(i, Quality[QualityDecode[j]]));
			}
		}

		for (var i = openDomain.length-1; i >= 0; i--) {
			//console.log(openDomain[i].getSymbol() + " " + bitwiseAnd(openDomain[i].getChordMask(),scaleMask) + " " + openDomain[i].getChordMask() + " " + scaleMask);

			var testMask = bitwiseAnd(openDomain[i].getChordMask(),scaleMask);
			var difference = 3;
			for (var j = 0; j < testMask.length; j++) {
				if (testMask[j] == "1") difference--;
				//console.log(testMask[j]);
			}
			//console.log(difference);
			if (difference > divergence) {
				openDomain.splice(i, 1);
			}
		}
		//console.log(JSON.parse(JSON.stringify(openDomain)));
	}

	this.setChroma = function(chroma, root = 0, divergence = 0) {
		var scaleMask = rotateString(chroma, root);

		this.setScaleMask(scaleMask, divergence);
	}

	function addRules(newRules)  {
		for (var i = 0; i < newRules.length; i++) {
			rules.push(newRules[i]);
		}
	}

	function runGenerator(cells) {
		//console.log("runGenerator");


		progression = JSON.parse(JSON.stringify(cells));
		for (var i = 0; i < progression.length; i++) {
			propagate(i);
		}
		if (isBroken()) {
			console.log("Output gridlocked, trying failsafe")
			addRules(failsafeRules);
			progression = JSON.parse(JSON.stringify(cells));
			for (var i = 0; i < progression.length; i++) {
				propagate(i);
			}

			if (isBroken()) {
				console.log("Output still gridlocked, loosening restrictions")
				forgivingOutput = true;
				progression = JSON.parse(JSON.stringify(cells));
			}
		}

		//console.log(JSON.parse(JSON.stringify(progression)));
		while (!isCollapsed()) {
			iterate();
		}

		forgivingOutput = false;
	}

	function iterate() {
		//console.log("iterate");
		var coordIndex = getMinEntripy();
		collaspeAt(coordIndex);
		//console.log(JSON.parse(JSON.stringify(progression)));
		propagate(coordIndex);
	}

	function propagate(index) {
		var stack = [];
		stack.push(index);

		while (stack.length > 0) {
			//console.log(stack);
			var currentIndex = stack.pop();
			//console.log("propagate " + index + " " + currentIndex);

			//Forward
			var forwardIndex = currentIndex + 1;
			if (loopProgression) forwardIndex = forwardIndex % progression.length;
			if (forwardIndex < progression.length) { //no loop
				if (forgivingOutput && progression[forwardIndex].length <= 1) continue;
				var changed = false;

				//Loop over second chord
				for (var i = progression[forwardIndex].length-1; i >= 0; i--) {
					if (forgivingOutput && progression[forwardIndex].length <= 1) continue;

					var matches = 0;
					//Loop over first chord
					for (var j = progression[currentIndex].length-1; j >= 0; j--) {
						//Loop over rules
						for (var r = 0; r < rules.length; r++) {
							if (rulePossible(progression[currentIndex][j], progression[forwardIndex][i], rules[r])) {
								matches++;
							}
						}
					}
					if (matches <= 0) {//console.log("Cutting " + progression[currentIndex+1][i].root + ":" + progression[currentIndex+1][i].quality + " at " + matches + " matches");
						progression[forwardIndex].splice(i, 1);
						changed = true;
					}
				}
				if (changed) {
					stack.push(forwardIndex);
				}
			}

			//Backward
			var backwardIndex = currentIndex - 1;
			if (loopProgression && currentIndex-1 < 0) backwardIndex = progression.length - 1;
			if (backwardIndex >= 0) { //no loop
				if (forgivingOutput && progression[backwardIndex].length <= 1) continue;
				var changed = false;

				//Loop over first chord
				for (var i = progression[backwardIndex].length-1; i >= 0; i--) {
					if (forgivingOutput && progression[backwardIndex].length <= 1) continue;

					var matches = 0;
					//Loop over second chord
					for (var j = progression[currentIndex].length-1; j >= 0; j--) {
						//Loop over rules
						for (var r = 0; r < rules.length; r++) {
							if (rulePossible(progression[backwardIndex][i], progression[currentIndex][j], rules[r])) {
								matches++;
							}
						}
					}
					if (matches <= 0) {
						progression[backwardIndex].splice(i, 1);
						changed = true;
					}
				}
				if (changed) {
					stack.push(backwardIndex);
				}
			}
		}
	}

	function renderProgression() {
		for (var i = 0; i < progression.length; i++) {
			progression[i] = progression[i][getRandomChord(i)];
			progression[i] = new Chord(progression[i].root, progression[i].quality);
		}
	}

	function collaspeAt(index) {
		//console.log(index);
		progression[index] = [progression[index][getRandomChord(index)]];
	}

	function getRandomChord(index) {
		var sumTotal = 0;
		for (var i = 0; i < progression[index].length; i++) {
			sumTotal += progression[index][i].weight;
		}
		var randomNum = Math.random() * sumTotal;
		var currentTotal = 0;
		for (var i = 0; i < progression[index].length; i++) {
			currentTotal += progression[index][i].weight;
			if (randomNum <= currentTotal) return i;
		}
		return 0;
	}

	function rulePossible(chord1, chord2, rule) {
		var newRoot = (chord1.root + rule.rootMotion < 0 ? chord1.root + rule.rootMotion + NoteCount : chord1.root + rule.rootMotion) % NoteCount;
		//console.log(chord1.root + ":" + chord1.quality + " " + chord2.root + ":" + chord2.quality + " " + rule.startingQuality + ":" + rule.endingQuality + ":" + rule.rootMotion)
		return (chord1.quality == rule.startingQuality) 
		  && (chord2.quality == rule.endingQuality) 
		  && (newRoot == chord2.root);
	}

	function isCollapsedAt(index) {
		if (progression[index].length > 1) return false;
		else return true;
	}

	function isCollapsed() {
		//console.log("Testing collapse")
		for (var i = 0; i < progression.length; i++) {
			if (progression[i].length > 1) return false;
		}
		return true;
	}

	function isBroken() {
		for (var i = 0; i < progression.length; i++) {
			if (progression[i].length == 0) return true;
		}
		return false;
	}

	function getMinEntripy() {
		var minis = [0];
		var miniEnt = 10000000;

		for (var i = 0; i < progression.length; i++) {
			if (progression[i].length == miniEnt) {
				minis.push(i);
			} else if (progression[i].length < miniEnt && progression[i].length > 1) {
				miniEnt = progression[i].length;
				minis = [];
				minis.push(i);
			}
		}

		//console.log(minis);
		return minis[Math.floor(Math.random() * minis.length)];
	}

}

rotateString = function(string, rotationAmount) {
	if (rotationAmount < 0) {
		rotationAmount = string.length + rotationAmount;
	}

	var rotate = string.length - (rotationAmount % string.length);
	string = string.slice(rotate) + string.slice(0, rotate);

	return string;
}

bitwiseAnd = function(s1, s2) {
	let length = 0;
	let len_a = s1.length;
	let len_b = s2.length;
	let num_zeros = Math.abs(len_a - len_b);

	if (len_a < len_b) {
		for(let i = 0; i < num_zeros; i++) {
			s1 = '0' + s1;
		}
	 
		length = len_b;
	} else {
		for (let i = 0; i < num_zeros; i++) {
			s2 = '0' + s2;
		}
		length = len_a;
	}
 
	let res = ""; 
	for(let i = 0 ; i<length; i++) {
		res = res + String.fromCharCode(
			(s1[i].charCodeAt() - '0'.charCodeAt() 
		  &  s2[i].charCodeAt() - '0'.charCodeAt()) 
		  +    '0'.charCodeAt()
		);
	}
	
	return res;
}
