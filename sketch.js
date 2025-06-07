let amp;
let mic;
let ripples = [];
let lastDropTime = 0;
let dropInterval = 300;

function setup() {
  createCanvas(600, 600);
  background(255, 253, 208); // Cremefarbener Hintergrund
  noStroke();

  mic = new p5.AudioIn();
  mic.start();

  amp = new p5.Amplitude();
  amp.setInput(mic);
}

function draw() {
  let level = amp.getLevel();

  drawCentralSineLines(level); // Begrenzte Wellenlinien

  // Halbtransparentes Overlay für Ausklang
  fill(255, 253, 208, 40);
  rect(0, 0, width, height);

  if (level > 0.08 && millis() - lastDropTime > dropInterval) {
    let newRipple = new Ripple(random(width), random(height), level);
    ripples.push(newRipple);
    lastDropTime = millis();
  }

  for (let i = ripples.length - 1; i >= 0; i--) {
    ripples[i].update();
    ripples[i].display();
    if (ripples[i].isDone()) {
      ripples.splice(i, 1);
    }
  }
}

function drawCentralSineLines(level) {
  let spacing = 8;
  let waveAmplitude = map(level, 0, 0.3, 2, 10);
  let waveSpeed = frameCount * 0.02;

  stroke(255, 100, 150, 127); // Rosa
  noFill();

  // Begrenzter Bereich der Linien
  for (let x = 80; x < width - 80; x += spacing) {
    beginShape();
    for (let y = 0; y < height; y += 4) {
      let offsetX = sin(y * 0.05 + waveSpeed + x * 0.02) * waveAmplitude;
      vertex(x + offsetX, y);
    }
    endShape();
  }
}

class Ripple {
  constructor(x, y, level) {
    this.x = x;
    this.y = y;
    this.r = 0;
    this.maxRadius = map(level, 0.08, 0.3, 30, 80);
    this.alpha = 180;
    this.level = level;
    this.strokeCol = color(50, 180, 200, this.alpha); // Türkis
  }

  update() {
    this.r += 1.2;
    this.alpha -= 1.5;
  }

  display() {
    push();

    // Grauer Schleier um den Tropfen
    noStroke();
    fill(120, 120, 120, this.alpha * 0.3);
    ellipse(this.x, this.y, this.r * 2.8);

    // Maximal 3 Ringe mit mehr Abstand
    noFill();
    stroke(this.strokeCol);
    strokeWeight(1.5);
    let ringSpacing = 10;
    for (let i = 0; i < 3; i++) {
      let currentR = this.r - i * ringSpacing;
      if (currentR > 0) {
        ellipse(this.x, this.y, currentR * 2);
      }
    }

    pop();
  }

  isDone() {
    return this.alpha <= 0;
  }
}
