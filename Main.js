var canvas, canvasContext;
var mainInterface;

var mouseX = -1;
var mouseY = -1;
var mouseIsDown = false;
var mouseJustPressed = false;
var mouseJustReleased = false;

var generator = new ChordGenerator();

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



window.onload = function() {
	canvas = document.getElementById('toolCanvas');
	canvasContext = canvas.getContext('2d');

	document.getElementById('toolCanvas').addEventListener('pointermove', calculateMousePos);
	document.getElementById('toolCanvas').addEventListener('pointerdown', mouseDown);
	document.getElementById('toolCanvas').addEventListener('pointerup', mouseUp);

	mainInterface = new UIMainInterface("ChordTool", canvas.width, canvas.height);

	mainInterface.addPart(new RuleBoxBox("The Box O Rules", 0, 0, 345, 600), true);
	mainInterface.addPart(new ChordDisplayBox("Chord Display Box", 400, 0, 400, 600), true);

	var testPanel = mainInterface.addPart(new UIElement("testpanel", 100, 100, 600, 300), true);
	testPanel.addPart(new UIButton("testbutton1", 20, 20, 20, 20));
	testPanel.addPart(new ChordDisplay("testchorddisplay", 60, 20, 200, 20));
	testPanel.addPart(new ChordBox("testchordbox", 20, 60, 20, 20));
	testPanel.addPart(new RuleBox("testruledisplay", 260, 60, 200, 20));

	nextFrame();
}

function nextFrame() {
	colorRect(0, 0, canvas.width, canvas.height, 'lightcyan');
	mainInterface.update();
	mainInterface.draw();
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
		console.log(rule);
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

class RuleBoxBox extends UIElement {
	constructor(name, x, y, w, h) {
		super(name, x, y, w, h);

		this.ruleMask = new UIMaskBox("Rule Mask", x + 10, y + borderSize, w - 20, h - borderBack);
		this.addPart(this.ruleMask);

		this.ruleBoxes = [];
		for (var i = 0; i < 4; i++) {
			this.addRule();
		}

		var genButton = new UIButtonWToolTip("Generate", 0, 0, 10, 10);
		this.addPart(genButton);
		genButton.toolTip = "Generate sequence";
		genButton.onClick = function() {
			this.parent.sendRulesToGenerator();
		}

		var addButton = new UIButtonWToolTip("Add Rule", this.x+this.w - 10, 0, 10, 10);
		this.addPart(addButton);
		addButton.toolTip = "Add rule";
		addButton.textAlignment = "end";
		addButton.onClick = function() {
			this.parent.addRule();
		}

		var rmButton = new UIButtonWToolTip("Remove Rule", this.x+this.w - 10, 10, 10, 10);
		this.addPart(rmButton);
		rmButton.toolTip = "Remove rule";
		rmButton.textAlignment = "end";
		rmButton.onClick = function() {
			this.parent.removeRule();
		}

		var suButton = new UIButtonWToolTip("Scroll up", this.x+this.w - 10, this.y+this.h - 20, 10, 10);
		this.addPart(suButton);	
		suButton.toolTip = "Scroll up";
		suButton.textAlignment = "end";
		suButton.onClick = function() {
			this.parent.scrollUp();
		}

		var sdButton = new UIButtonWToolTip("Scroll down", this.x+this.w - 10, this.y+this.h - 10, 10, 10);
		this.addPart(sdButton);	
		sdButton.toolTip = "Scroll down";
		sdButton.textAlignment = "end";
		sdButton.onClick = function() {
			this.parent.scrollDown();
		}	
	}

	onUpdate() {
		this.ruleMask.setLeastActive();
	}

	sendRulesToGenerator() {
		generator.setRules(this.getRules());
	}

	setRules(newRules) {
		this.clearRules();
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

	addRule(rule = null) {
		var newRule = new RuleBox("New Rule", 0, 0, 0, 0);
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

		this.ruleMask.addPart(newRule);
		this.ruleBoxes.push(newRule);

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

	clearRules() {
		for (var i = this.ruleBoxes.length; i > 0; i--) {
			this.removeRule();
		}
	}

	placeRules() {
		for (var i = 0; i < this.ruleBoxes.length; i++) {
			this.ruleBoxes[i].name = "Rule " + i;
			this.ruleBoxes[i].updatePosition(0, 10 - borderSize + i * 70);
		}
	}

	scrollUp() {
		this.ruleMask.addOffsetY(40);
		this.validateScrollPosition();
	}


	scrollDown() {
		this.ruleMask.addOffsetY(-40);
		this.validateScrollPosition();
	}

	validateScrollPosition() {
		var maxOffset = this.ruleBoxes.length * -70 + this.ruleMask.h;

		// Not enough content to scroll
		if (maxOffset >= 0) {
			this.ruleMask.setOffsetY(0);
			return;
		}

		// Reached top
		if (this.ruleMask.yoffset > 0) {
			this.ruleMask.setOffsetY(0);
			return;
		}

		// Reached Bottom
		if (this.ruleMask.yoffset < maxOffset) {
			this.ruleMask.setOffsetY(maxOffset);
			return;
		}
	}
}

class ChordDisplay extends UIElement {
	constructor(name, x, y, w, h) {
		super(name, x, y, 100, 30);

		this.chord = new Chord();

		this.lable = new UITextLabel("Chord Name", 50, 20, 0, 0, this);
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
}

const rootUIListSharps = ["C", "B", "A#", "A", "G#", "G", "F#", "F", "E", "D#", "D", "C#", "C"];
const rootUIListFlats =  ["C", "B", "Bb", "A", "Ab", "G", "Gb", "F", "E", "Eb", "D", "Db", "C"];
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
		this.rootUI.list = rootUIListFlats;
		this.rootUI.value = 12;
		this.rootUI.center = true;
		this.rootUI.updateListElement();

		this.qualityUI = new UIDropdown("Quality Dropdown", 105, 30, 95, 20);
		this.addPart(this.qualityUI);
		this.qualityUI.list = ["Major", "Minor", "Diminished", "Augmented"];
		this.qualityUI.updateListElement();
	}

	getChord() {
		return new Chord(NoteName[this.rootUI.list[this.rootUI.value]], this.qualityUI.value);
	}

	resetChord() {
		this.rootUI.value = 0;
		this.qualityUI.value = 0;
	}
}

class ChordDisplayBox extends UIElement {
	constructor(name, x, y, w, h) {
		super(name, x, y, w, h);

		this.chords = [];
		this.spacing = 40;

		this.genButton = new UIButton("Generate", 0, 0, 10, 10);
		this.addPart(this.genButton);
		this.genButton.onClick = function() {
			this.parent.listChords();
		}
	}

	listChords() {
		this.parts.length = 0;
		this.active.length = 0;
		this.chords = generator.generateProgressionOfLength(8, true, new Chord());

		for (var i = 0; i < this.chords.length; i++) {
			var x = 6 + (i%4) * 96; //20
			var y = 16 + this.spacing * Math.floor(i/4); //20 + this.spacing * i
			var newChord = new ChordDisplay("Chord", x, y, 100, 30, this);
			newChord.setChord(this.chords[i]);
			this.addPart(newChord);
		}
		this.addPart(this.genButton);
	}
}