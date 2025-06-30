let mic, fft;
let circles = [];

function setup() {
  createCanvas(595, 842);
  background('#C3C49F');

  mic = new p5.AudioIn();
  mic.start();

  fft = new p5.FFT(0.8, 1024);
  fft.setInput(mic);

  // Kreise zufällig platzieren
  for (let i = 0; i < 20; i++) {
    let baseY = random(height * 0.3, height * 0.9);
    circles.push({
      x: random(width),
      y: baseY,
      baseY: baseY,
      baseSize: random(5, 20),
      vy: 0
    });
  }
}

function draw() {
  background('#C3C49F');

  // Linien im Hintergrund
  stroke('#535B2F');
  noFill();
  let lines = 60;
  let spacing = 5;
  let waveAmp = 80;
  let waveFreq = 0.015;

  for (let i = 0; i < lines; i++) {
    beginShape();
    for (let y = 0; y <= height; y += 5) {
      let x = width / 2 + sin(y * waveFreq + i * 0.2) * waveAmp * noise(y * 0.005, i * 0.1);
      vertex(x + (i - lines / 2) * spacing, y);
    }
    endShape();
  }

  // Frequenzdaten auslesen
  let treble = fft.getEnergy("treble");

  // Rosa Kreise
  noStroke();
  fill('#FFC3CC');

  for (let c of circles) {
    // Lockerere Sprungbedingung + Zufallsfaktor
    if (treble > 100 && c.y >= c.baseY - 5 && random() < 0.3) {
      c.vy = -map(treble, 100, 255, 3, 12);
    }

    // Gravitation
    c.vy += 0.5;
    c.y += c.vy;

    // Boden-Kollision
    if (c.y > c.baseY) {
      c.y = c.baseY;
      c.vy = 0;
    }

    ellipse(c.x, c.y, c.baseSize, c.baseSize);
  }

  // 🔍 Live-Treble-Wert anzeigen (debug)
  fill(0);
  textSize(16);
  text("Treble: " + nf(treble, 1, 2), 10, height - 10);

  // 🔊 Sound-Spektrum visualisieren (debug)
  let spectrum = fft.analyze();
  noStroke();
  for (let i = 0; i < spectrum.length; i++) {
    let amp = spectrum[i];
    let y = map(amp, 0, 255, height, 0);
    fill(255, 100);
    rect(i * (width / spectrum.length), y, width / spectrum.length, height - y);
  }
}
