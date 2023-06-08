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

	var newParts = [
		new UIElement("testpanel", 100, 100, 600, 300, mainInterface),
		new RuleBoxBox("The Box O Rules", 0, 0, 345, 600, mainInterface),
		new ChordDisplayBox("Chord Display Box", 400, 0, 400, 600, mainInterface),
	]
	var activeParts = [
		newParts[1],
		newParts[2],
	]
	mainInterface.active = activeParts;

	newParts[0].addPart(new UIButton("testbutton", 20, 20, 20, 20, newParts[0]));
	newParts[0].addPart(new ChordBox("testchord", 40, 40, 20, 20, newParts[0]));
	newParts[0].addPart(new ChordDisplay("testchord", 60, 20, 200, 20, newParts[0]));

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
	constructor(name, x, y, w, h, parent) {
		super(name, x, y, 325, 60, parent);

		this.labels = [
			new UITextLabel("RootMotion Label", 20, 25, 0, 0, this),
			new UITextLabel("StartingQuality Label", 105, 25, 0, 0, this),
			new UITextLabel("EndingingQuality Label", 210, 25, 0, 0, this)
		]
		this.labels[0].label = "Root Motion";
		this.labels[1].label = "Starting Quality";
		this.labels[2].label = "Ending Quality";
		this.addPart(this.labels[0]);
		this.addPart(this.labels[1]);
		this.addPart(this.labels[2]);

		this.rootMotionUI = new UIDropdown("RootMotion Dropdown", 20, 30, 75, 20, this);
		this.rootMotionUI.list = ["+11", "+10", "+9", "+8", "+7", "+6", "+5", "+4", "+3", "+2", "+1", "0", "-1", "-2", "-3", "-4", "-5", "-6", "-7", "-8", "-9", "-10", "-11"];
		this.rootMotionUI.value = 11;
		this.rootMotionUI.center = true;
		this.rootMotionUI.updateListElement();
		this.addPart(this.rootMotionUI);

		this.startingQualityUI = new UIDropdown("StartingQuality Dropdown", 105, 30, 95, 20, this);
		this.startingQualityUI.list = ["Major", "Minor", "Diminished", "Augmented"];
		this.startingQualityUI.updateListElement();
		this.addPart(this.startingQualityUI);

		this.endingQualityUI = new UIDropdown("EndingingQuality Dropdown", 210, 30, 95, 20, this);
		this.endingQualityUI.list = ["Major", "Minor", "Diminished", "Augmented"];
		this.endingQualityUI.updateListElement();
		this.addPart(this.endingQualityUI);

		this.closeUI = new UIButtonWToolTip("Close RuleBox", 315, 0, 10, 10, this)
		this.closeUI.toolTip = "Remove rule";
		this.closeUI.textAlignment = "end";
		this.closeUI.onClick = function() {
			this.parent.parent.removeRule(this.parent);
		}
		this.addPart(this.closeUI);
	}

	getRule() {
		return new Rule((this.rootMotionUI.value - 11) * -1, this.startingQualityUI.value, this.endingQualityUI.value);
	}

	resetRule() {
		this.rootMotionUI.value = 11;
		this.startingQualityUI.value = 0;
		this.endingQualityUI.value = 0;
	}
}

class RuleBoxBox extends UIMaskBox {
	constructor(name, x, y, w, h, parent) {
		super(name, x, y, w, h, parent);

		this.ruleBoxes = [];

		for (var i = 0; i < 4; i++) {
			this.addRule();
		}

		var genButton = new UIButtonWToolTip("Generate", 0, 0, 10, 10, this);
		genButton.toolTip = "Generate sequence";
		genButton.onClick = function() {
			this.parent.setRules();
		}
		this.addPart(genButton);

		var addButton = new UIButtonWToolTip("Add Rule", this.x+this.w - 10, 0, 10, 10, this);
		addButton.toolTip = "Add rule";
		addButton.textAlignment = "end";
		addButton.onClick = function() {
			this.parent.addRule();
		}
		this.addPart(addButton);

		var rmButton = new UIButtonWToolTip("Remove Rule", this.x+this.w - 10, 10, 10, 10, this);
		rmButton.toolTip = "Remove rule";
		rmButton.textAlignment = "end";
		rmButton.onClick = function() {
			this.parent.removeRule();
		}
		this.addPart(rmButton);		
	}

	setRules() {
		var newRules = []
		for (var i = 0; i < this.ruleBoxes.length; i++) {
			newRules.push(this.ruleBoxes[i].getRule());
		}

		generator.setRules(newRules);
	}

	addRule() {
		var newRule = new RuleBox("New Rule", 10, 10 + 70, 0, 0, this)
		this.addPart(newRule);
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

	placeRules() {
		for (var i = 0; i < this.ruleBoxes.length; i++) {
			this.ruleBoxes[i].name = "Rule " + i;
			this.ruleBoxes[i].updatePosition(10, 10 + i * 70);
		}
	}
}

class ChordDisplay extends UIElement {
	constructor(name, x, y, w, h, parent) {
		super(name, x, y, 100, 30, parent);

		this.lable = new UITextLabel("Chord Name", 50, 20, 0, 0, this);
		this.lable.label = "C Major";
		this.lable.textAlignment = "center";
		this.addPart(this.lable);

	}

	setChord(chord) {
		this.lable.label = NoteNumber[chord.root] + " " + QualityDecode[chord.quality];
	}
}

class ChordBox extends UIElement {
	constructor(name, x, y, w, h, parent) {
		super(name, x, y, 325, 60, parent);

		this.labels = [
			new UITextLabel("RootM Label", 20, 25, 0, 0, this),
			new UITextLabel("Quality Label", 105, 25, 0, 0, this),
		]
		this.labels[0].label = "Root";
		this.labels[1].label = "Quality";
		this.addPart(this.labels[0]);
		this.addPart(this.labels[1]);

		this.rootUI = new UIDropdown("RootMotion Dropdown", 20, 30, 75, 20, this);
		this.rootUI.list = ["C", "B", "A#", "A", "G#", "G", "F#", "F", "E", "D#", "D", "C#", "C"];
		this.rootUI.value = 12;
		this.rootUI.center = true;
		this.rootUI.updateListElement();
		this.addPart(this.rootUI);

		this.qualityUI = new UIDropdown("Quality Dropdown", 105, 30, 95, 20, this);
		this.qualityUI.list = ["Major", "Minor", "Diminished", "Augmented"];
		this.qualityUI.updateListElement();
		this.addPart(this.qualityUI);

		this.closeUI = new UICloseButton("Close RuleBox", 310, 0, 15, 15, this)
		this.closeUI.activate = function() {
			this.parent.parent.active.splice(this.parent.parent.active.indexOf(this.parent), 1);
			this.parent.parent.parts.splice(this.parent.parent.parts.indexOf(this.parent), 1);
		}
		this.addPart(this.closeUI, false);
	}

	getChord() {
		return new Chord(12 - this.rootUI.value, this.qualityUI.value);
	}

	resetChord() {
		this.rootUI.value = 0;
		this.qualityUI.value = 0;
	}
}

class ChordDisplayBox extends UIElement {
	constructor(name, x, y, w, h, parent) {
		super(name, x, y, w, h, parent);

		this.chords = [];
		this.spacing = 60;

		this.genButton = new UIButton("Generate", 0, 0, 10, 10, this);
		this.genButton.onClick = function() {
			this.parent.listChords();
		}
		this.addPart(this.genButton);
	}

	listChords() {
		this.parts.length = 0;
		this.active.length = 0;
		this.chords = generator.generateProgressionOfLength(8, true, new Chord());

		for (var i = 0; i < this.chords.length; i++) {
			var newChord = new ChordDisplay("Chord", 20, 20 + this.spacing * i, 80, 40, this);
			newChord.setChord(this.chords[i]);
			this.addPart(newChord);
		}
		this.addPart(this.genButton);
	}
}