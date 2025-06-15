let mic, fft;
let circles = [];
let pinkOverlay;
let t = 0;
let threshold = 0.05; // minimale Lautstärke für Bewegung

function setup() {
  createCanvas(595, 842); // A4
  background('#D2DB76');

  mic = new p5.AudioIn();
  mic.start();

  fft = new p5.FFT(0.8, 1024);
  fft.setInput(mic);

  circles.push(new RadialWave(150, 200, 60, [20, 100]));
  circles.push(new RadialWave(300, 130, 80, [100, 300]));
  circles.push(new RadialWave(450, 250, 70, [300, 1000]));
  circles.push(new RadialWave(350, 400, 90, [1000, 2000]));
  circles.push(new RadialWave(180, 550, 50, [2000, 5000]));
  circles.push(new RadialWave(400, 700, 75, [5000, 10000]));

  pinkOverlay = createGraphics(width, height);
  pinkOverlay.clear();
}

function draw() {
  background('#D2DB76');

  let spectrum = fft.analyze();
  let volume = mic.getLevel(); // Lautstärke von 0.0 bis 1.0

  // 🎚 Bewege den Schleier nur bei Ton
  if (volume > threshold) {
    let speed = map(volume, threshold, 1.0, 0.001, 0.05, true);
    t += speed;
  }

  // 🎀 ROSA SCHLEIER – immer sichtbar
  pinkOverlay.clear();
  pinkOverlay.noStroke();
  pinkOverlay.fill(255, 195, 204, 80); // Rosa mit Transparenz

  let step = 10;
  for (let x = 0; x <= width; x += step) {
    let y = height - x + sin(x * 0.02 + t) * 100;
    pinkOverlay.ellipse(x, y, 320, 120); // Schleierform
  }

  // ⭕️ KREISE – nur wenn Ton vorhanden
  if (volume > threshold) {
    for (let c of circles) {
      c.update(spectrum, volume);
      c.move(volume);
      c.display();
    }

    // Schleier um Kreise herum ausradieren
    for (let c of circles) {
      pinkOverlay.erase();
      pinkOverlay.ellipse(c.x, c.y, c.dynamicRadius * 2.2);
      pinkOverlay.noErase();
    }
  }

  // ➕ Schleier immer anzeigen
  image(pinkOverlay, 0, 0);
}

// 🔁 KLASSE: RadialWave
class RadialWave {
  constructor(x, y, baseRadius, freqRange) {
    this.x = x;
    this.y = y;
    this.baseRadius = baseRadius;
    this.freqRange = freqRange;
    this.dynamicRadius = baseRadius;
    this.numLines = 200;

    this.baseDx = random(-0.2, 0.2);
    this.baseDy = random(-0.2, 0.2);
    this.dx = this.baseDx;
    this.dy = this.baseDy;
  }

  update(spectrum, volume) {
    let [lowFreq, highFreq] = this.freqRange;
    let energy = fft.getEnergy(lowFreq, highFreq);
    let target = this.baseRadius + map(energy, 0, 255, 0, 180);
    this.dynamicRadius = lerp(this.dynamicRadius, target, 0.2);
  }

  move(volume) {
    // Bewegung stärker bei mehr Lautstärke
    this.dx = this.baseDx * map(volume, threshold, 1.0, 0, 10, true);
    this.dy = this.baseDy * map(volume, threshold, 1.0, 0, 10, true);

    this.x += this.dx;
    this.y += this.dy;

    if (this.x < 0 || this.x > width) this.baseDx *= -1;
    if (this.y < 0 || this.y > height) this.baseDy *= -1;
  }

  display() {
    push();
    translate(this.x, this.y);

    stroke(0, 70, 200, 100);
    strokeWeight(0.6);
    noFill();

    for (let i = 0; i < this.numLines; i++) {
      let angle = TWO_PI * i / this.numLines;
      let r1 = 5;
      let r2 = this.dynamicRadius;
      let x1 = cos(angle) * r1;
      let y1 = sin(angle) * r1;
      let x2 = cos(angle) * r2;
      let y2 = sin(angle) * r2;
      line(x1, y1, x2, y2);
    }

    noStroke();
    for (let r = 20; r > 0; r -= 1) {
      fill(0, 70, 200, map(r, 20, 0, 80, 0));
      ellipse(0, 0, r * 2);
    }

    pop();
  }
}
