let mic, fft;
let circles = [];
let pinkOverlay;
let t = 0;

function setup() {
  createCanvas(595, 842); // A4
  background('#D2DB76'); // Hintergrund grün

  mic = new p5.AudioIn();
  mic.start();

  fft = new p5.FFT(0.8, 1024);
  fft.setInput(mic);

  // Kreise (größer fürs A4-Format)
  circles.push(new RadialWave(150, 200, 60, [20, 100]));
  circles.push(new RadialWave(300, 130, 80, [100, 300]));
  circles.push(new RadialWave(450, 250, 70, [300, 1000]));
  circles.push(new RadialWave(350, 400, 90, [1000, 2000]));
  circles.push(new RadialWave(180, 550, 50, [2000, 5000]));
  circles.push(new RadialWave(400, 700, 75, [5000, 10000]));

  // Extra-Canvas für Schleier
  pinkOverlay = createGraphics(width, height);
  pinkOverlay.clear(); // Transparent starten
}

function draw() {
  background('#D2DB76');

  let spectrum = fft.analyze();

  // Bewegung und Darstellung der Kreise
  for (let c of circles) {
    c.update(spectrum);
    c.move();
    c.display();
  }

  // Schleier zeichnen
  pinkOverlay.clear();
  pinkOverlay.noStroke();
  pinkOverlay.fill(255, 195, 204, 80); // Rosa mit Transparenz

  // Sinuskurve von unten links nach oben rechts
  let step = 10;
  for (let x = 0; x <= width; x += step) {
    let y = height - x + sin(x * 0.02 + t) * 100;
    pinkOverlay.ellipse(x, y, 320, 120); // breite des Schleiers
  }

  // Freistellen der Kreise aus dem Schleier
  for (let c of circles) {
    pinkOverlay.erase(); // Ab hier löschen statt zeichnen
    pinkOverlay.ellipse(c.x, c.y, c.dynamicRadius * 2.2);
    pinkOverlay.noErase(); // Danach wieder zeichnen
  }

  // Schleier anzeigen
  image(pinkOverlay, 0, 0);

  t += 0.01; // Zeit für Sinusbewegung
}

class RadialWave {
  constructor(x, y, baseRadius, freqRange) {
    this.x = x;
    this.y = y;
    this.baseRadius = baseRadius;
    this.freqRange = freqRange;
    this.dynamicRadius = baseRadius;
    this.numLines = 200;

    this.dx = random(-0.2, 0.2);
    this.dy = random(-0.2, 0.2);
  }

  update(spectrum) {
    let [lowFreq, highFreq] = this.freqRange;
    let energy = fft.getEnergy(lowFreq, highFreq);
    let target = this.baseRadius + map(energy, 0, 255, 0, 180);
    this.dynamicRadius = lerp(this.dynamicRadius, target, 0.2);
  }

  move() {
    this.x += this.dx;
    this.y += this.dy;

    if (this.x < 0 || this.x > width) this.dx *= -1;
    if (this.y < 0 || this.y > height) this.dy *= -1;
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
