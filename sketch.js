let colors = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'magenta', 'brown', 'white', 'black'];
let currentColor = 'black';
let paletteWidth = 40;
let lastX, lastY;
let synth, soundFX;
let painting = false;
let paintCount = 0;
let osc;
let oscStarted = false; 

function preload() {
  soundFormats('mp3', 'wav');
  soundFX = {
    colorChange: loadSound('media/color.mp3'),
    clearCanvas: loadSound('media/clearcanvas.mp3'),
    brushStroke: loadSound('media/painting.mp3')
  };
}

function setup() {
  createCanvas(1000, 1000);
  background(255);
  synth = new p5.MonoSynth();
  

  osc = new p5.Oscillator('sine');
  osc.amp(0); 
  osc.freq(200);
}

function draw() {
  drawPalette();
  
  if (mouseIsPressed && mouseX > paletteWidth) {
    if (!painting) {
      painting = true;
      soundFX.brushStroke.loop(); 
      soundFX.brushStroke.setVolume(0.2); 
      
      if (!oscStarted) {
        osc.start(); 
        oscStarted = true;
      }
      osc.amp(0.1, 0.3); 
    }
    stroke(currentColor);
    strokeWeight(5);
    line(lastX, lastY, mouseX, mouseY);
    paintCount++;
    updateSynthesis();
  } else if (painting) {
    painting = false;
    soundFX.brushStroke.stop(); 
    osc.amp(0, 0.5); 
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

  fill(200);
  rect(10, colors.length * 40 + 10, 80, 30);
  fill(0);
  textSize(14);
  textAlign(CENTER, CENTER);
  text('Clear', 50, colors.length * 40 + 25);
}

function mousePressed() {
  if (mouseX < paletteWidth) {
    let index = floor(mouseY / 40);
    if (index >= 0 && index < colors.length) {
      currentColor = colors[index];
      soundFX.colorChange.play();
    }
  }

  if (mouseX > 10 && mouseX < 90 && mouseY > colors.length * 40 + 10 && mouseY < colors.length * 40 + 40) {
    background(255);
    paintCount = 0;
    soundFX.clearCanvas.play();
    updateSynthesis();
  }
}

function updateSynthesis() {
  let freq = map(paintCount, 0, width * height / 1000, 200, 800);
  osc.freq(freq);
}
