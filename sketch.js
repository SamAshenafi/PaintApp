let colors = [
  'red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'magenta', 'brown', 'white', 'black'
];
let currentColor = 'black';
let paletteWidth = 40;
let lastX, lastY;

function setup() {
  createCanvas(1000, 1000);
  background(255);
}

function draw() {
  drawPalette();
  
  if (mouseIsPressed) {
    if (mouseX > paletteWidth) { 
      stroke(currentColor);
      strokeWeight(5);
      line(lastX, lastY, mouseX, mouseY);
    }
  }
  
  lastX = mouseX;
  lastY = mouseY;
}

function drawPalette() {
  for (let i = 0; i < colors.length; i++) {
    fill(colors[i]);
    stroke(255);
    rect(0, i * 40, paletteWidth, 40);
  }
}

function mousePressed() {
  if (mouseX < paletteWidth) {
    let index = floor(mouseY / 40);
    if (index >= 0 && index < colors.length) {
      currentColor = colors[index];
    }
  }
}
