var borderSize = 3;
var borderBack = borderSize * 2;

function MainInterface(screenWidth, screenHeight) {
	this.name = "Main Interface";
	this.x = 0;
	this.y = 0;
	this.w = screenWidth;
	this.h = screenHeight;

	parts = [
		new UIElement("testpanel", 100, 100, 600, 300, this),
	]
	var activeParts = [
		parts[0],
	]
	this.active = activeParts;

	parts[0].addPart(new UIMoveBar("testmover", 0, 0, 600, 15, parts[0]))
	parts[0].addPart(new UIButton("testbutton", 20, 20, 20, 20, parts[0]))
	parts[0].addPart(new RuleBox("testrulebox1", 150, 20, 0, 0, parts[0]));
	parts[0].addPart(new RuleBox("testrulebox2", 150, 100, 0, 0, parts[0]));


	this.update = function() {
		if (mouseJustPressed && isInElement(this, mouseX, mouseY)) {
			leftMouseClick(mouseX, mouseY);
		}

		draw();
	}

	function leftMouseClick(x, y) {
		for (var i = activeParts.length -1; i >= 0; i--) {
			if (isInElement(activeParts[i], x, y)) {
				activeParts[i].leftMouseClick(x, y);
				break;
			}
		}
	}

	function draw() {
		colorRect(this.x, this.y, this.w, this.h, 'lightcyan');

		for (var i = 0; i < activeParts.length; i++) {
			activeParts[i].draw();
		}
	}
}

function isInElement(uiElement, x, y) {
    var topLeftX = uiElement.x;
    var topLeftY = uiElement.y;
    var bottomRightX = topLeftX + uiElement.w;
    var bottomRightY = topLeftY + uiElement.h;
    var boolResult = (x >= topLeftX && x <= bottomRightX &&
        y >= topLeftY && y <= bottomRightY);
    // console.log("topLeftX: " + topLeftX + " TopeLeftY: " + topLeftY + " bottomRightX: " + bottomRightX + " bottomRightY: " + bottomRightY);
    return boolResult;
}

class UIElement {
	constructor(name, x, y, w, h, parent) {
		this.name = name;
		this.parent = parent;
		this.xoff = x;
		this.yoff = y;
		this.x = this.xoff + this.parent.x;
		this.y = this.yoff + this.parent.y;
		this.w = w;
		this.h = h;

		this.parts = [];
		this.active = [];
	}

	addPart(part, isActive = true) {
		this.parts.push(part);
		if (isActive) this.active.push(part);
	}

	setMostActive() {
		this.parent.active.push(this.parent.active.splice(this.parent.active.indexOf(this), 1)[0]);
	}

	leftMouseClick(x, y) {
		this.setMostActive();

		for (var i = this.active.length -1; i >= 0; i--) {
			if (isInElement(this.active[i], x, y)) {
				this.active[i].leftMouseClick(x, y);
				break;
			}
		}
	}

	updatePosition(x = this.xoff, y = this.yoff, w = this.w, h = this.h, parent = this.parent) {
		this.parent = parent;
		this.xoff = x;
		this.yoff = y;
		this.x = this.xoff + this.parent.x;
		this.y = this.yoff + this.parent.y;
		this.w = w;
		this.h = h;

		for (var i = 0; i < this.parts.length; i++) {
			this.parts[i].updatePosition();
		}
	}

	draw() {
		colorRect(this.x, this.y, this.w, this.h, 'blue');
		colorRect(this.x + borderSize, this.y + borderSize, this.w - borderBack, this.h - borderBack, 'lightblue');

		for (var i = 0; i < this.active.length; i++) {
			this.active[i].draw();
		}
	}
}

class UIButton extends UIElement {
	constructor(name, x, y, w, h, parent) {
		super(name, x, y, w, h, parent);
	}

	leftMouseClick(x, y) {
		this.setMostActive();
		this.activate();
	}

	draw() {
		colorRect(this.x, this.y, this.w, this.h, 'blue');
		colorRect(this.x + borderSize, this.y + borderSize, this.w - borderBack, this.h - borderBack, 'lightblue');

		if (isInElement(this, mouseX, mouseY)) {
			colorRect(this.x + borderSize, this.y + borderSize, this.w - borderBack, this.h - borderBack, 'dodgerblue');
			//if (mouseJustPressed) colorCircle(this.x + this.w * 0.5, this.y + this.h * 0.5, (this.w + this.h) * 0.25 + 10, 'white');
		}
	}

	activate() {
		console.log("click");
	}
}

class UICloseButton extends UIButton {
	draw() {
		super.draw();

		colorLine(this.x, this.y, this.x + this.w, this.y + this.h, 3, 'blue');
		colorLine(this.x, this.y + this.h, this.x + this.w, this.y, 3, 'blue');
	}

	activate() {
		this.parent.parent.active.splice(this.parent.parent.active.indexOf(this.parent), 1);
	}
}

class UIMoveBar extends UIElement {
	constructor(name, x, y, w, h, parent) {
		super(name, x, y, w, h, parent);

		this.grabbed = false;
		this.grabbedX = -1;
		this.grabbedY = -1;
		this.parentX = -1;
		this.parentY = -1;
	}

	leftMouseClick(x, y) {
		this.setMostActive();

		this.grabbed = true;
		this.grabbedX = mouseX;
		this.grabbedY = mouseY;
		this.parentX = this.parent.x;
		this.parentY = this.parent.y;
	}

	draw() {
		colorRect(this.x, this.y, this.w, this.h, 'blue');
		colorRect(this.x + borderSize, this.y + borderSize, this.w - borderBack, this.h - borderBack, 'skyblue');

		if (!mouseIsDown || mouseX < 0 || mouseX >= canvas.width || mouseY < 0 || mouseY >= canvas.height) {
			this.grabbed = false;
		}

		if (this.grabbed) {
			var newX = this.parentX + mouseX - this.grabbedX;
			var newY = this.parentY + mouseY - this.grabbedY;
			this.parent.updatePosition(newX, newY);
		}
	}
}

class UITextLabel extends UIElement {
	constructor(name, x, y, w, h, parent) {
		super(name, x, y, w, h, parent);

		this.size = 14;
		this.textAlignment = "left";
		this.label = "";
	}

	draw() {
		colorText(this.label, this.x, this.y, 'black', this.size + "px Arial", this.textAlignment)
	}
}

class UIDropdown extends UIElement {
	constructor(name, x, y, w, h, parent) {
		super(name, x, y, w, h, parent);

		this.value = 0;
		this.list = [];
		this.size = 14;
		this.center = false;
		this.textAlignment = "center";

		this.open = false;
		this.updateListElement();
		this.activeIndex = -1;
	}

	updateListElement() {
		this.parts.length = 0;
		this.active.length = 0;
		var height = this.list.length * (this.size + 3);
		var y = this.center ? -height * 0.5 : 0;
		if (this.y + y < 0) y -= this.y + y;
		if (this.y + height + y > canvas.height) y -= this.y + height + y - canvas.height
		this.addPart(new UIDropdownList(this.name + " dropdown list", 0, y, this.w, height, this), this.open);
	}

	closeList() {
		if (this.active.length > 0) this.active.length = 0;
		this.open = false;
	}

	leftMouseClick(x, y) {
		this.setMostActive();

		if (!this.open) {
			this.active.push(this.parts[0]);
			this.open = true;
			mouseJustPressed = false;
		}
	}

	draw() {
		colorRect(this.x, this.y, this.w, this.h, 'blue');
		colorRect(this.x + borderSize, this.y + borderSize, this.w - borderBack, this.h - borderBack, 'skyblue');
		colorText(this.list[this.value], this.x + this.w * 0.5, this.y + this.size, 'black', this.parent.size + "px Arial", this.textAlignment);

		for (var i = 0; i < this.active.length; i++) {
			this.active[i].draw();
		}
	}

	updatePosition(x = this.xoff, y = this.yoff, w = this.w, h = this.h, parent = this.parent) {
		super.updatePosition(x, y, w, h, parent);
		this.updateListElement();
	}
}

class UIDropdownList extends UIElement {
	draw() {
		if (mouseJustPressed) {
			if (isInElement(this, mouseX, mouseY)) {
				this.parent.value = this.quantizeMousePosition();
			}
			this.parent.closeList();
			return;
		}

		colorRect(this.x, this.y, this.w, this.h, 'blue');
		colorRect(this.x + borderSize, this.y + borderSize, this.w - borderBack, this.h - borderBack, 'skyblue');

		var value = this.parent.value;
		if (isInElement(this, mouseX, mouseY)) {
			value = this.quantizeMousePosition();

		}
		colorRect(this.x + borderSize, this.y + borderSize + value * (this.parent.size + 3), this.w - borderBack, (this.parent.size + 3) - borderBack, 'lightcyan');


		var list = this.parent.list;
		for (var i = 0; i < list.length; i++) {
			colorText(list[i], this.x + this.w * 0.5, this.y + (this.parent.size + 3) * i + this.parent.size - 1, 'black', this.parent.size - 1 + "px Arial", this.parent.textAlignment);
		}
	}

	quantizeMousePosition() {
		return Math.min(Math.floor((mouseY - this.y) / (this.parent.size + 3)), this.parent.list.length - 1);
	}
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

		this.closeUI = new UICloseButton("Close RuleBox", 310, 0, 15, 15, this)
		this.closeUI.activate = function() {
			this.parent.parent.active.splice(this.parent.parent.active.indexOf(this.parent), 1);
			this.parent.parent.parts.splice(this.parent.parent.parts.indexOf(this.parent), 1);
		}
		this.addPart(this.closeUI);
	}

	getRule() {
		return new Rule(this.rootMotionUI.value - 11, this.startingQualityUI.value, this.endingQualityUI.value);
	}

	resetRule() {
		this.rootMotionUI.value = 11;
		this.startingQualityUI.value = 0;
		this.endingQualityUI.value = 0;
	}
}