var canvas, canvasContext;
var mainInterface;

var mouseX = -1;
var mouseY = -1;
var mouseIsDown = false;
var mouseJustPressed = false;
var mouseJustReleased = false;

var generatorSettings = {
	firstChord: new Chord(),
	lastChord: 0,
	looping: true,
	generator: new ChordGenerator(),
	musicEngine: new musicEngine2(),
}

var ruleWindow = null;
var chordmapWindow = null;
var keyscaleWindow = null;
var outputWindow = null;

function calculateMousePos(evt) {
	var rect = canvas.getBoundingClientRect(),
	root = document.documentElement;
	mouseX = evt.clientX - rect.left - root.scrollLeft;
	mouseY = evt.clientY - rect.top - root.scrollTop;

	//console.log(mouseX + " " + mouseY);
}

function mouseDown(evt) {
	calculateMousePos(evt);
	mouseIsDown = true;
	mouseJustPressed = true;

	//console.log("click");
}

function mouseUp(evt) {
	mouseIsDown = false;
	mouseJustReleased = true;
}

async function startTone() {
	await Tone.start();
	Tone.Transport.start();
	window.removeEventListener('click', startTone);
	//console.log('audio is ready');
}

window.onload = function() {
	canvas = document.getElementById('toolCanvas');
	canvasContext = canvas.getContext('2d');

	document.getElementById('toolCanvas').addEventListener('pointermove', calculateMousePos);
	document.getElementById('toolCanvas').addEventListener('pointerdown', mouseDown);
	document.getElementById('toolCanvas').addEventListener('pointerup', mouseUp);

	window.addEventListener('click', startTone);

	mainInterface = new UIMainInterface("ChordTool", canvas.width, canvas.height);

	ruleWindow = mainInterface.addPart(new RuleBoxPanel("The Box O Rules", 200, 10, 355, 580, generatorSettings), true);
	chordmapWindow = mainInterface.addPart(new ChordBoxPanel("Chord Display Box", 10, 10, 250, 580, generatorSettings, ruleWindow), true);
	keyscaleWindow = mainInterface.addPart(new KeyScalePanel("KeyScale", 10, 10, 400, 580, generatorSettings), false);
	outputWindow = mainInterface.addPart(new OutputPanel("Output Box", 390, 10, 400, 580, generatorSettings, ruleWindow), true);

	chordmapWindow.setChords([new Chord(0,0),new Chord(7,0),new Chord(9,1),new Chord(5,0)]);
	ruleWindow.setRules(chordmapWindow.getRules());

	// var testPanel = mainInterface.addPart(new UIElement("testpanel", 100, 100, 600, 300), false);
	// testPanel.addPart(new UIButton("testbutton1", 20, 20, 10, 10));
	// testPanel.addPart(new UIToggle("testtoggle1", 40, 20, 10, 10));
	// testPanel.addPart(new ChordDisplay("testchorddisplay", 60, 20, 200, 20));
	// testPanel.addPart(new ChordBox("testchordbox", 20, 60, 20, 20));
	// testPanel.addPart(new RuleBox("testruledisplay", 260, 60, 200, 20));
	// testPanel.addPart(new UIMoveBar("testmovebar", 0, 0, 600, 10));
	// testPanel.addPart(new UICloseButton("testclose", 590, 0, 10, 10));
	// var scrolltest = testPanel.addPart(new UIScrollBoxHV("testscrollbox", 100, 130, 150, 150));
	// scrolltest.addPart(new RuleBox("filltest", 0, 0, 0, 0));
	// scrolltest.addPart(new RuleBox("filltest", 0, 70, 0, 0));
	// scrolltest.addPart(new RuleBox("filltest", 0, 140, 0, 0));

	nextFrame();
}

function nextFrame() {
	colorRect(0, 0, canvas.width, canvas.height, 'lightcyan');
	mainInterface.update();
	mainInterface.draw();
	generatorSettings.musicEngine.update();
	mouseJustPressed = false;
	mouseJustReleased = false;

	window.requestAnimationFrame(nextFrame);
}





class RuleBox extends UIElement {
	constructor(name, x, y, w, h) {
		super(name, x, y, 325, 60);

		this.labels = [
			new UITextLabel("RootMotion Label", 57.5, 25, 0, 0),
			new UITextLabel("StartingQuality Label", 152.5, 25, 0, 0),
			new UITextLabel("EndingingQuality Label", 257.5, 25, 0, 0)
		]
		this.addPart(this.labels[0]);
		this.addPart(this.labels[1]);
		this.addPart(this.labels[2]);
		this.labels[0].label = "Root Motion";
		this.labels[0].textAlignment = "center";
		this.labels[1].label = "Starting Quality";
		this.labels[1].textAlignment = "center";
		this.labels[2].label = "Ending Quality";
		this.labels[2].textAlignment = "center";

		this.rootMotionUI = new UIDropdown("RootMotion Dropdown", 20, 30, 75, 20);
		this.addPart(this.rootMotionUI);
		this.rootMotionUI.list = ["+11", "+10", "+9", "+8", "+7", "+6", "+5", "+4", "+3", "+2", "+1", "0", "-1", "-2", "-3", "-4", "-5", "-6", "-7", "-8", "-9", "-10", "-11"];
		this.rootMotionUI.value = 11;
		this.rootMotionUI.center = true;
		this.rootMotionUI.updateListElement();

		this.startingQualityUI = new UIDropdown("StartingQuality Dropdown", 105, 30, 95, 20);
		this.addPart(this.startingQualityUI);
		this.startingQualityUI.list = ["Major", "Minor", "Diminished", "Augmented"];
		this.startingQualityUI.updateListElement();

		this.endingQualityUI = new UIDropdown("EndingingQuality Dropdown", 210, 30, 95, 20);
		this.addPart(this.endingQualityUI);
		this.endingQualityUI.list = ["Major", "Minor", "Diminished", "Augmented"];
		this.endingQualityUI.updateListElement();
	}

	getRule() {
		return new Rule((this.rootMotionUI.value - 11) * -1, this.startingQualityUI.value, this.endingQualityUI.value);
	}

	setRule(rule) {
		this.rootMotionUI.value = (rule.rootMotion - 11) * -1;
		this.startingQualityUI.value = rule.startingQuality;
		this.endingQualityUI.value = rule.endingQuality;
	}

	resetRule() {
		this.rootMotionUI.value = 11;
		this.startingQualityUI.value = 0;
		this.endingQualityUI.value = 0;
	}
}

class RuleBoxPanel extends UIElement {
	constructor(name, x, y, w, h, generatorSettingsRef) {
		super(name, x, y, 355, h);

		this.generatorRef = generatorSettingsRef.generator;

		this.scrollBox = this.addPart(new UIScrollBoxV("Rule Mask", 0, 0, this.w, this.h));

		this.ruleBoxes = [];

		var addButton = new UIButtonWToolTip("Add Rule", 0, 0, 10, 10);
		this.addPart(addButton);
		addButton.toolTip = "Add rule";
		addButton.onClick = function() {
			this.parent.addRule();
		}

		var rmButton = new UIButtonWToolTip("Remove Rule", 10, 0, 10, 10);
		this.addPart(rmButton);
		rmButton.toolTip = "Remove rule";
		rmButton.onClick = function() {
			this.parent.removeRule();
		}

		this.setRules(this.generatorRef.getRules());
	}

	onUpdate() {
		this.scrollBox.setLeastActive();
	}

	addRule(rule = null) {
		var newRule = new RuleBox("New Rule", 9, 9 - borderSize + this.ruleBoxes.length * 68);
		this.scrollBox.addPart(newRule);
		this.ruleBoxes.push(newRule);

		if (rule != null) newRule.setRule(rule);

		var closeUI = new UIButtonWToolTip("Close RuleBox", 315, 0, 10, 10);
		newRule.addPart(closeUI);
		closeUI.toolTip = "Remove rule";
		closeUI.textAlignment = "end";
		closeUI.ruleBox = newRule;
		closeUI.ruleBoxBox = this;
		closeUI.onClick = function() {
			this.ruleBoxBox.removeRule(this.ruleBox);
		}


		this.placeRules();
	}

	removeRule(rule = null) {
		if (rule == null) {
			rule = this.ruleBoxes[this.ruleBoxes.length-1];
		}

		this.removePart(rule);
		var ruleIndex = this.ruleBoxes.indexOf(rule);
		if (ruleIndex < 0) return;

		this.ruleBoxes[ruleIndex].setActive(false);
		this.ruleBoxes.splice(ruleIndex, 1);

		this.placeRules();
	}

	setRules(newRules) {
		this.clearRules();
		for (var i = 0; i < newRules.length; i++) {
			this.addRule(newRules[i]);
		}
	}

	addRules(newRules) {
		for (var i = 0; i < newRules.length; i++) {
			this.addRule(newRules[i]);
		}
	}

	getRules() {
		var newRules = []
		for (var i = 0; i < this.ruleBoxes.length; i++) {
			newRules.push(this.ruleBoxes[i].getRule());
		}

		return newRules;
	}

	clearRules() {
		for (var i = this.ruleBoxes.length; i > 0; i--) {
			this.removeRule();
		}
	}

	placeRules() {
		for (var i = 0; i < this.ruleBoxes.length; i++) {
			this.ruleBoxes[i].name = "Rule " + i;
			this.ruleBoxes[i].updatePosition(9, 9 - borderSize + i * 68);
		}

		this.scrollBox.scrollBox.findMaxOffset();
		this.scrollBox.scrollBox.validateScrollPosition();
	}

	sendRulesToGenerator() {
		this.generatorRef.setRules(this.getRules());
	}
}

class ChordDisplay extends UIElement {
	constructor(name, x, y, w, h) {
		super(name, x, y, 100, 30);

		this.chord = new Chord();

		this.lable = new UITextLabel("Chord Name", 50, 20, 0, 0);
		this.addPart(this.lable);
		this.lable.label = NoteNumber[this.chord.root] + " " + QualityDecode[this.chord.quality];
		this.lable.textAlignment = "center";
	}

	getChord() {
		return this.chord;
	}

	setChord(chord) {
		this.lable.label = NoteNumber[chord.root] + " " + QualityDecode[chord.quality];
		this.chord = chord;
	}

	leftMouseClick() {
		musicEngine.playChord(this.chord);
	}
}

class OutputPanel extends UIElement {
	constructor(name, x, y, w, h, generatorSettingsRef, ruleWindowRef) {
		super(name, x, y, w, h);

		this.generatorSettingsRef = generatorSettingsRef;
		this.generatorRef = generatorSettingsRef.generator;
		this.ruleWindowRef = ruleWindowRef;

		this.chords = [];
		this.spacing = 40;

		this.genButton = new UIButton("Generate", this.w/2-100, this.h-86, 200, 30);
		this.addPart(this.genButton);
		this.genButton.ruleWindowRef = this.ruleWindowRef;
		this.genButton.onClick = function() {
			this.ruleWindowRef.sendRulesToGenerator();
			this.parent.listChords();
		}
		this.genButton.label = this.genButton.addPart(new UITextLabel("text", 100, 20, 0, 0));
		this.genButton.label.textAlignment = "center";
		this.genButton.label.label = "Generate";

		this.playbackButton = new UIButton("Playback", this.w/2-100, this.h-46, 95, 30);
		this.playbackButton.musicEngineRef = this.generatorSettingsRef.musicEngine;
		this.playbackButton.onClick = function() {
			this.musicEngineRef.playProgression(this.parent.chords);
		}
		this.playbackButton.label = this.playbackButton.addPart(new UITextLabel("text", 48.5, 20, 0, 0));
		this.playbackButton.label.textAlignment = "center";
		this.playbackButton.label.label = "Play";

		this.stopPlaybackButton = new UIButton("Stop Playback", this.w/2+5, this.h-46, 95, 30);
		this.stopPlaybackButton.musicEngineRef = this.generatorSettingsRef.musicEngine;
		this.stopPlaybackButton.onClick = function() {
			this.musicEngineRef.stopPlayback();
		}
		this.stopPlaybackButton.label = this.stopPlaybackButton.addPart(new UITextLabel("text", 48.5, 20, 0, 0));
		this.stopPlaybackButton.label.textAlignment = "center";
		this.stopPlaybackButton.label.label = "Stop";

		this.loopToggle = new UIToggle("Loop", this.w/2-100, this.h-116, 20, 20, this.generatorSettingsRef.looping);
		this.addPart(this.loopToggle);
		this.loopToggle.generatorSettingsRef = this.generatorSettingsRef;
		this.loopToggle.onClick = function() {
			this.generatorSettingsRef.looping = this.toggle;
		}
		this.loopToggle.label = this.loopToggle.addPart(new UITextLabel("text", 25, 15, 0, 0));
		this.loopToggle.label.textAlignment = "left";
		this.loopToggle.label.label = "Loop";
	}

	onUpdate() {
		this.loopToggle.toggle = this.generatorSettingsRef.looping;
	}

	listChords() {
		this.parts.length = 0;
		this.active.length = 0;
		this.chords = this.generatorRef.generateProgressionOfLength(8, this.generatorSettingsRef.looping, this.generatorSettingsRef.firstChord, this.generatorSettingsRef.lastChord);

		for (var i = 0; i < this.chords.length; i++) {
			var x = 6 + (i%4) * 96; //20
			var y = 16 + this.spacing * Math.floor(i/4); //20 + this.spacing * i
			var newChord = new ChordDisplay("Chord", x, y, 100, 30, this);
			newChord.setChord(this.chords[i]);
			this.addPart(newChord);
		}

		this.addPart(this.genButton);
		this.addPart(this.playbackButton);
		this.addPart(this.stopPlaybackButton);
		this.addPart(this.loopToggle);
	}
}

const rootUIListSharps =  ["C", "B", "A#", "A", "G#", "G", "F#", "F", "E", "D#", "D", "C#", "C"];
const rootUIListFlats =   ["C", "B", "Bb", "A", "Ab", "G", "Gb", "F", "E", "Eb", "D", "Db", "C"];
const rootUIListCommon =  ["C", "B", "Bb", "A", "Ab", "G", "F#", "F", "E", "Eb", "D", "C#", "C"];
class ChordBox extends UIElement {
	constructor(name, x, y, w, h) {
		super(name, x, y, 220, 60);

		this.labels = [
			new UITextLabel("RootM Label", 57.5, 25, 0, 0),
			new UITextLabel("Quality Label", 152.5, 25, 0, 0)
		]
		this.addPart(this.labels[0]);
		this.addPart(this.labels[1]);
		this.labels[0].label = "Root";
		this.labels[0].textAlignment = "center";
		this.labels[1].label = "Quality";
		this.labels[1].textAlignment = "center";

		this.rootUI = new UIDropdown("RootMotion Dropdown", 20, 30, 75, 20);
		this.addPart(this.rootUI);
		this.rootUI.onValueChange = function() {
			this.parent.onChordChange();
		};
		this.rootUI.list = rootUIListCommon;
		this.rootUI.value = 12;
		this.rootUI.center = true;
		this.rootUI.updateListElement();

		this.qualityUI = new UIDropdown("Quality Dropdown", 105, 30, 95, 20);
		this.addPart(this.qualityUI);
		this.qualityUI.onValueChange = function() {
			this.parent.onChordChange();
		};
		this.qualityUI.list = ["Major", "Minor", "Diminished", "Augmented"];
		this.qualityUI.updateListElement();
	}

	getChord() {
		return new Chord(NoteName[this.rootUI.list[this.rootUI.value]], this.qualityUI.value);
	}

	setChord(chord) {
		this.rootUI.value = (chord.root - 12) *-1;
		this.qualityUI.value = chord.quality;
	}

	resetChord() {
		this.rootUI.value = 0;
		this.qualityUI.value = 0;
	}

	onChordChange() {};
}

class ChordBoxPanel extends UIElement {
	constructor(name, x, y, w, h, generatorSettingsRef, ruleWindowRef) {
		super(name, x, y, 250, h);

		this.generatorSettingsRef = generatorSettingsRef;
		this.ruleWindowRef = ruleWindowRef;

		this.scrollBox = this.addPart(new UIScrollBoxV("Chord Mask", 0, 0, this.w, this.h));

		this.chordBoxes = [];

		var addButton = new UIButtonWToolTip("Add Chord", 0, 0, 10, 10);
		this.addPart(addButton);
		addButton.toolTip = "Add chord";
		addButton.onClick = function() {
			this.parent.addChord();
		}

		var rmButton = new UIButtonWToolTip("Remove Chord", 10, 0, 10, 10);
		this.addPart(rmButton);
		rmButton.toolTip = "Remove chord";
		rmButton.onClick = function() {
			this.parent.removeChord();
		}

		var ppButton = new UIButtonWToolTip("Process Progression", 20, 0, 10, 10);
		this.addPart(ppButton);
		ppButton.toolTip = "Process Progression";
		ppButton.ruleWindowRef = this.ruleWindowRef;
		ppButton.onClick = function() {
			var rules = this.parent.getRules();
			this.ruleWindowRef.setRules(rules);
		}

		this.lpButton = new UIToggleWToolTip("Loop Toggle", 30, 0, 10, 10, this.generatorSettingsRef.looping);
		this.addPart(this.lpButton);
		this.lpButton.toolTip = "Loop?";
		this.lpButton.generatorSettingsRef = this.generatorSettingsRef;
		this.lpButton.onClick = function() {
			this.generatorSettingsRef.looping = this.toggle;
		}
	}

	onUpdate() {
		this.scrollBox.setLeastActive();
		this.lpButton.toggle = this.generatorSettingsRef.looping;
	}

	addChord(chord = null) {
		var newChord = new ChordBox("New Chord", 9, 9 - borderSize + this.chordBoxes.length * 68);
		this.scrollBox.addPart(newChord);
		this.chordBoxes.push(newChord);

		if (chord != null) newChord.setChord(chord);

		var closeUI = new UIButtonWToolTip("Close ChordBox", 315, 0, 10, 10);
		newChord.addPart(closeUI);
		closeUI.toolTip = "Remove chord";
		closeUI.textAlignment = "end";
		closeUI.chordBox = newChord;
		closeUI.chordBoxBox = this;
		closeUI.onClick = function() {
			this.chordBoxBox.removeChord(this.chordBox);
		}

		this.placeChords();
	}

	removeChord(chord = null) {
		if (chord == null) {
			chord = this.chordBoxes[this.chordBoxes.length-1];
		}

		this.removePart(chord);
		var chordIndex = this.chordBoxes.indexOf(chord);
		if (chordIndex < 0) return;

		this.chordBoxes[chordIndex].setActive(false);
		this.chordBoxes.splice(chordIndex, 1);

		this.placeChords();
	}

	setChords(newChords) {
		this.clearChords();
		for (var i = 0; i < newChords.length; i++) {
			this.addChord(newChords[i]);
		}
	}

	addChords(newChords) {
		for (var i = 0; i < newChords.length; i++) {
			this.addChord(newChords[i]);
		}
	}

	getChords() {
		var newChords = []
		for (var i = 0; i < this.chordBoxes.length; i++) {
			newChords.push(this.chordBoxes[i].getChord());
		}

		return newChords;
	}

	clearChords() {
		for (var i = this.chordBoxes.length; i > 0; i--) {
			this.removeChord();
		}
	}

	placeChords() {
		for (var i = 0; i < this.chordBoxes.length; i++) {
			this.chordBoxes[i].name = "Chord " + i;
			this.chordBoxes[i].updatePosition(9, 9 - borderSize + i * 68);
		}

		this.scrollBox.scrollBox.findMaxOffset();
		this.scrollBox.scrollBox.validateScrollPosition();
	}

	getRules() {
		if(this.chordBoxes.length <= 1) return [];

		var rules = [];
		for (var i = 1; i < this.chordBoxes.length; i++) {
			var chord1 = this.chordBoxes[i-1].getChord();
			var chord2 = this.chordBoxes[i].getChord();
			rules.push(this.interpolateRule(chord1, chord2));
		}
		if (this.generatorSettingsRef.looping) {
			var chord1 = this.chordBoxes[this.chordBoxes.length-1].getChord();
			var chord2 = this.chordBoxes[0].getChord();
			rules.push(this.interpolateRule(chord1, chord2));
		}

		return rules;
	}

	interpolateRule(chord1, chord2) {
		var rootMotion = chord2.root - chord1.root;
		var startingQuality = chord1.quality;
		var endingQuality = chord2.quality;

		return new Rule(rootMotion, startingQuality, endingQuality);
	}
}

class KeyScalePanel extends UIElement {
	constructor(name, x, y, w, h, generatorSettingsRef) {
		super(name, x, y, 240, 580);

		this.generatorSettingsRef = generatorSettingsRef;
		this.generatorRef = generatorSettingsRef.generator;

		this.interval0Toggle = new UIToggle("interval 0 toggle", 15, 20, 10, 10, true);
		this.addPart(this.interval0Toggle);
		this.interval0Toggle.onClick = function() {
			this.parent.applyKeyScale();
		};
		this.interval0Toggle.label = this.interval0Toggle.addPart(new UITextLabel("text", 10, 10, 0, 0));
		this.interval0Toggle.label.textAlignment = "left";
		this.interval0Toggle.label.label = "U";

		this.interval1Toggle = new UIToggle("interval 1 toggle", 50, 20, 10, 10, false);
		this.addPart(this.interval1Toggle);
		this.interval1Toggle.onClick = function() {
			this.parent.applyKeyScale();
		};
		this.interval1Toggle.label = this.interval1Toggle.addPart(new UITextLabel("text", 10, 10, 0, 0));
		this.interval1Toggle.label.textAlignment = "left";
		this.interval1Toggle.label.label = "m2";

		this.interval2Toggle = new UIToggle("interval 2 toggle", 85, 20, 10, 10, true);
		this.addPart(this.interval2Toggle);
		this.interval2Toggle.onClick = function() {
			this.parent.applyKeyScale();
		};
		this.interval2Toggle.label = this.interval2Toggle.addPart(new UITextLabel("text", 10, 10, 0, 0));
		this.interval2Toggle.label.textAlignment = "left";
		this.interval2Toggle.label.label = "M2";

		this.interval3Toggle = new UIToggle("interval 3 toggle", 120, 20, 10, 10, false);
		this.addPart(this.interval3Toggle);
		this.interval3Toggle.onClick = function() {
			this.parent.applyKeyScale();
		};
		this.interval3Toggle.label = this.interval3Toggle.addPart(new UITextLabel("text", 10, 10, 0, 0));
		this.interval3Toggle.label.textAlignment = "left";
		this.interval3Toggle.label.label = "m3";

		this.interval4Toggle = new UIToggle("interval 4 toggle", 155, 20, 10, 10, true);
		this.addPart(this.interval4Toggle);
		this.interval4Toggle.onClick = function() {
			this.parent.applyKeyScale();
		};
		this.interval4Toggle.label = this.interval4Toggle.addPart(new UITextLabel("text", 10, 10, 0, 0));
		this.interval4Toggle.label.textAlignment = "left";
		this.interval4Toggle.label.label = "M3";

		this.interval5Toggle = new UIToggle("interval 5 toggle", 190, 20, 10, 10, true);
		this.addPart(this.interval5Toggle);
		this.interval5Toggle.onClick = function() {
			this.parent.applyKeyScale();
		};
		this.interval5Toggle.label = this.interval5Toggle.addPart(new UITextLabel("text", 10, 10, 0, 0));
		this.interval5Toggle.label.textAlignment = "left";
		this.interval5Toggle.label.label = "P4";

		this.interval6Toggle = new UIToggle("interval 6 toggle", 15, 40, 10, 10, false);
		this.addPart(this.interval6Toggle);
		this.interval6Toggle.onClick = function() {
			this.parent.applyKeyScale();
		};
		this.interval6Toggle.label = this.interval6Toggle.addPart(new UITextLabel("text", 10, 10, 0, 0));
		this.interval6Toggle.label.textAlignment = "left";
		this.interval6Toggle.label.label = "T";

		this.interval7Toggle = new UIToggle("interval 7 toggle", 50, 40, 10, 10, true);
		this.addPart(this.interval7Toggle);
		this.interval7Toggle.onClick = function() {
			this.parent.applyKeyScale();
		};
		this.interval7Toggle.label = this.interval7Toggle.addPart(new UITextLabel("text", 10, 10, 0, 0));
		this.interval7Toggle.label.textAlignment = "left";
		this.interval7Toggle.label.label = "P5";

		this.interval8Toggle = new UIToggle("interval 8 toggle", 85, 40, 10, 10, false);
		this.addPart(this.interval8Toggle);
		this.interval8Toggle.onClick = function() {
			this.parent.applyKeyScale();
		};
		this.interval8Toggle.label = this.interval8Toggle.addPart(new UITextLabel("text", 10, 10, 0, 0));
		this.interval8Toggle.label.textAlignment = "left";
		this.interval8Toggle.label.label = "m6";

		this.interval9Toggle = new UIToggle("interval 9 toggle", 120, 40, 10, 10, true);
		this.addPart(this.interval9Toggle);
		this.interval9Toggle.onClick = function() {
			this.parent.applyKeyScale();
		};
		this.interval9Toggle.label = this.interval9Toggle.addPart(new UITextLabel("text", 10, 10, 0, 0));
		this.interval9Toggle.label.textAlignment = "left";
		this.interval9Toggle.label.label = "M6";

		this.interval10Toggle = new UIToggle("interval 10 toggle", 155, 40, 10, 10, false);
		this.addPart(this.interval10Toggle);
		this.interval10Toggle.onClick = function() {
			this.parent.applyKeyScale();
		};
		this.interval10Toggle.label = this.interval10Toggle.addPart(new UITextLabel("text", 10, 10, 0, 0));
		this.interval10Toggle.label.textAlignment = "left";
		this.interval10Toggle.label.label = "m7";

		this.interval11Toggle = new UIToggle("interval 11 toggle", 190, 40, 10, 10, true);
		this.addPart(this.interval11Toggle);
		this.interval11Toggle.onClick = function() {
			this.parent.applyKeyScale();
		};
		this.interval11Toggle.label = this.interval11Toggle.addPart(new UITextLabel("text", 10, 10, 0, 0));
		this.interval11Toggle.label.textAlignment = "left";
		this.interval11Toggle.label.label = "M7";


		this.divergenceDropdown = new UIDropdown("divergence", 15, 60, 30, 20, [0,1,2,3]);
		this.divergenceDropdown.value = 1;
		this.addPart(this.divergenceDropdown);
		this.divergenceDropdown.onValueChange = function() {
			this.parent.applyKeyScale();
		};
		var divergenceDropdownlabel = this.addPart(new UITextLabel("text", 55, 75, 0, 0));
		divergenceDropdownlabel.textAlignment = "left";
		divergenceDropdownlabel.label = "Divergence";

		this.rootDropdown = new UIDropdown("divergence", 15, 90, 30, 20, rootUIListCommon);
		this.addPart(this.rootDropdown);
		this.rootDropdown.onValueChange = function() {
			this.parent.applyKeyScale();
		};
		var rootDropdownlabel = this.addPart(new UITextLabel("text", 55, 105, 0, 0));
		rootDropdownlabel.textAlignment = "left";
		rootDropdownlabel.label = "Root";


		this.startingChord = new ChordBox("starting chord", 10, 410, 0, 0);
		this.addPart(this.startingChord);
		this.startingChord.onChordChange = function() {
			this.parent.applyKeyScale();
		};
		this.startingChordToggle = new UIToggle("stating chord toggle", 15, 395, 10, 10, true);
		this.addPart(this.startingChordToggle);
		this.startingChordToggle.onClick = function() {
			this.parent.applyKeyScale();
		};
		this.startingChordToggle.label = this.startingChordToggle.addPart(new UITextLabel("text", 20, 10, 0, 0));
		this.startingChordToggle.label.textAlignment = "left";
		this.startingChordToggle.label.label = "First Chord";

		this.endingChord = new ChordBox("ending chord", 10, 510, 0, 0);
		this.addPart(this.endingChord);
		this.endingChord.onChordChange = function() {
			this.parent.applyKeyScale();
		};
		this.endingChordToggle = new UIToggle("ending chord toggle", 15, 495, 10, 10, false);
		this.addPart(this.endingChordToggle);
		this.endingChordToggle.onClick = function() {
			this.parent.applyKeyScale();
		};
		this.endingChordToggle.label = this.endingChordToggle.addPart(new UITextLabel("text", 20, 10, 0, 0));
		this.endingChordToggle.label.textAlignment = "left";
		this.endingChordToggle.label.label = "Last Chord";
	}

	applyKeyScale() {
		var chroma = "";
		chroma += this.interval0Toggle.toggle  ? "1" : "0";
		chroma += this.interval1Toggle.toggle  ? "1" : "0";
		chroma += this.interval2Toggle.toggle  ? "1" : "0";
		chroma += this.interval3Toggle.toggle  ? "1" : "0";
		chroma += this.interval4Toggle.toggle  ? "1" : "0";
		chroma += this.interval5Toggle.toggle  ? "1" : "0";
		chroma += this.interval6Toggle.toggle  ? "1" : "0";
		chroma += this.interval7Toggle.toggle  ? "1" : "0";
		chroma += this.interval8Toggle.toggle  ? "1" : "0";
		chroma += this.interval9Toggle.toggle  ? "1" : "0";
		chroma += this.interval10Toggle.toggle ? "1" : "0";
		chroma += this.interval11Toggle.toggle ? "1" : "0";

		this.generatorRef.setChroma(chroma, NoteName[this.rootDropdown.getItem()], this.divergenceDropdown.value);

		if (this.startingChordToggle.toggle) {
			this.generatorSettingsRef.firstChord = this.startingChord.getChord();
		} else {
			this.generatorSettingsRef.firstChord = 0;
		}

		if (this.endingChordToggle.toggle) {
			this.generatorSettingsRef.lastChord = this.endingChord.getChord();
		} else {
			this.generatorSettingsRef.lastChord = 0;
		}
	}
}