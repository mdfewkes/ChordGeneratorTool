function MainInterface(screenWidth, screenHeight) {
	this.x = 0;
	this.y = 0;
	this.w = screenWidth;
	this.h = screenHeight;

	var parts = [
		new UIElement("testpanel", 100, 100, 400, 300, this),
	]
	var active = [
		parts[0],
	]

	parts[0].addPart(new UIButton("testbutton", 20, 20, 40, 40, parts[0]))
	parts[0].addPart(new UIMoveBar("testmover", 0, 0, 400, 15, parts[0]))

	this.update = function() {
		if (mouseJustPressed && isInElement(this, mouseX, mouseY)) {
			leftMouseClick(mouseX, mouseY);
		}

		draw();
	}

	function leftMouseClick(x, y) {
		for (var i = active.length -1; i >= 0; i--) {
			if (isInElement(active[i], x, y)) {
				active[i].leftMouseClick(x, y);
				break;
			}
		}
	}

	function draw() {
		colorRect(this.x, this.y, this.w, this.h, 'lightcyan');

		for (var i = 0; i < active.length; i++) {
			active[i].draw();
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

	leftMouseClick(x, y) {
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
		colorRect(this.x + 3, this.y + 3, this.w - 6, this.h - 6, 'lightblue');

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
		this.Acvtivate();
	}

	draw() {
		colorRect(this.x, this.y, this.w, this.h, 'blue');
		colorRect(this.x + 3, this.y + 3, this.w - 6, this.h - 6, 'lightblue');
		if (isInElement(this, mouseX, mouseY)) {
			colorRect(this.x + 5, this.y + 5, this.w - 10, this.h - 10, 'dodgerblue');
			if (mouseJustPressed) colorCircle(this.x + this.w * 0.5, this.y + this.h * 0.5, (this.w + this.h) * 0.25 + 10, 'white');
		}
	}

	Acvtivate() {
		console.log("click");
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
		this.grabbed = true;
		this.grabbedX = mouseX;
		this.grabbedY = mouseY;
		this.parentX = this.parent.x;
		this.parentY = this.parent.y;
	}

	draw() {
		if (!mouseIsDown) this.grabbed = false;

		if (this.grabbed) {
			var newX = this.parentX + mouseX - this.grabbedX;
			var newY = this.parentY + mouseY - this.grabbedY;
			this.parent.updatePosition(newX, newY);
		}

		colorRect(this.x, this.y, this.w, this.h, 'blue');
		colorRect(this.x + 3, this.y + 3, this.w - 6, this.h - 6, 'skyblue');
	}
}

class UIDropdown extends UIElement {
	constructor(name, x, y, w, h, parent) {
		super(name, x, y, w, h, parent);

		this.value = 0;
		this.list = [];

		this.open = false;
	}
}