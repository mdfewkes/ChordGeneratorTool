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

	mainInterface = new MainInterface(canvas.width, canvas.height);

	nextFrame();
}

function nextFrame() {
	colorRect(0, 0, canvas.width, canvas.height, 'lightcyan');
	mainInterface.update();
	mouseJustPressed = false;
	mouseJustReleased = false;

	window.requestAnimationFrame(nextFrame);
}