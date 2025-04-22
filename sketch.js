let port;
let reader;
let writer;
let connectBtn;
let xVal = 500, yVal = 500, btnPressed = false;
let colors = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'magenta', 'brown', 'white', 'black'];
let currentColor = 'black';
let lastX = 500, lastY = 500;
let painting = false;
let paintCount = 0;
let osc;
let soundFX;

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

  connectBtn = createButton("Connect to Arduino");
  connectBtn.position( 20, height - 10);
  connectBtn.mousePressed(initSerial);

  osc = new p5.Oscillator('sine');
  osc.amp(0);
  osc.freq(200);
  osc.start();
}

function draw() {
  drawPalette();

  fill(currentColor);
  noStroke();
  ellipse(xVal, yVal, 2, 2);

  if (btnPressed) {
    if (!painting) {
      painting = true;
      soundFX.brushStroke.loop();
      soundFX.brushStroke.setVolume(0.2);
      if (writer) writer.write(new TextEncoder().encode('B'));
    }

    stroke(currentColor);
    strokeWeight(5);

    let steps = int(dist(lastX, lastY, xVal, yVal) / 2);
    for (let i = 0; i <= steps; i++) {
      let interX = lerp(lastX, xVal, i / steps);
      let interY = lerp(lastY, yVal, i / steps);
      point(interX, interY);
    }

    paintCount++;
    updateSynthesis();
  } else if (painting) {
    painting = false;
    soundFX.brushStroke.stop();
    if (writer) writer.write(new TextEncoder().encode('S'));
  }

  lastX = xVal;
  lastY = yVal;
}

function drawPalette() {
  for (let i = 0; i < colors.length; i++) {
    fill(colors[i]);
    stroke(255);
    rect(0, i * 40, 40, 40);
  }
}

function updateSynthesis() {
  let freq = map(paintCount, 0, width * height / 1000, 200, 800);
  osc.freq(freq);
}

async function initSerial() {
  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });

    writer = port.writable.getWriter();

    const decoder = new TextDecoderStream();
    const inputDone = port.readable.pipeTo(decoder.writable);
    const inputStream = decoder.readable;
    const textReader = inputStream.getReader();

    let buffer = "";

    while (true) {
      const { value, done } = await textReader.read();
      if (done) break;

      buffer += value;
      let lines = buffer.split("\n");

      for (let i = 0; i < lines.length - 1; i++) {
        handleSerialData(lines[i].trim());
      }

      buffer = lines[lines.length - 1];
    }
  } catch (err) {
    console.error("Serial connection failed", err);
  }
}

function handleSerialData(data) {
  if (!data) return;

  // Check if it's the clear command
  if (data === "C") {
    background(255); // Clear canvas
    paintCount = 0;
    soundFX.clearCanvas.play();
    console.log("Canvas cleared by Arduino button");
    return;
  }

  // Otherwise, parse joystick movement and button
  let values = data.split(',');
  if (values.length === 3) {
    xVal = map(constrain(int(values[0]), 0, 1023), 0, 1023, 0, width);
    yVal = map(constrain(int(values[1]), 0, 1023), 0, 1023, 0, height);
    let btn = int(values[2]);

    if (btn === 1 && !btnPressed) {
      currentColor = colors[(colors.indexOf(currentColor) + 1) % colors.length];
      soundFX.colorChange.play();
    }

    btnPressed = btn === 1;
  } else {
    console.warn("Invalid data format:", data);
  }
}
