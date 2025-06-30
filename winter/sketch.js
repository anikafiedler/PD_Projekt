let mic, fft;
let lines = [];

const DPI_SCALE = 300 / 72;
const A4_WIDTH = 595;
const A4_HEIGHT = 842;
const WIDTH = Math.round(A4_WIDTH * DPI_SCALE * 2);  // A2 @ 300 DPI
const HEIGHT = Math.round(A4_HEIGHT * DPI_SCALE * 2);

function setup() {
  createCanvas(WIDTH, HEIGHT);
  angleMode(DEGREES);
  background('#788176');

  mic = new p5.AudioIn();
  mic.start();

  fft = new p5.FFT(0.8, 1024);
  fft.setInput(mic);

  // Linien basierend auf A4-Koordinaten erzeugen, dann skalieren
  generateLines(WIDTH / 2, HEIGHT / 2, 300 * (WIDTH / A4_WIDTH), 400 * (WIDTH / A4_WIDTH));
}

function draw() {
  background('#788176');

  let spectrum = fft.analyze();
  let highEnergy = fft.getEnergy("treble");
  let amplitude = map(highEnergy, 0, 255, 0, 40 * (WIDTH / A4_WIDTH)); // skaliert

  for (let l of lines) {
    stroke('#33251b');
    strokeWeight(0.5 * (WIDTH / A4_WIDTH));
    noFill();

    beginShape();
    let steps = 200;
    for (let i = 0; i <= steps; i++) {
      let t = i / steps;
      let baseLen = l.len * t;

      let x = l.cx + cos(l.angle) * baseLen;
      let y = l.cy + sin(l.angle) * baseLen;

      let wave = sin(t * 10 * TWO_PI + frameCount * 0.2 + l.offset) * amplitude;

      let offsetX = cos(l.angle + 90) * wave;
      let offsetY = sin(l.angle + 90) * wave;

      vertex(x + offsetX, y + offsetY);
    }
    endShape();

    // Rosa Punkt am Ende
    let endLen = l.len;
    let endX = l.cx + cos(l.angle) * endLen;
    let endY = l.cy + sin(l.angle) * endLen;
    let endOffset = sin(10 * TWO_PI + frameCount * 0.2 + l.offset) * amplitude;

    let pointX = endX + cos(l.angle + 90) * endOffset;
    let pointY = endY + sin(l.angle + 90) * endOffset;

    noStroke();
    fill('#FFC3CC');
    ellipse(pointX, pointY, 3 * (WIDTH / A4_WIDTH), 3 * (WIDTH / A4_WIDTH));
  }

  // 🖼️ Automatisch speichern & stoppen
  save("wavePoster_A2_300DPI.png");
  noLoop();
}

function generateLines(cx, cy, minLength, maxLength) {
  for (let angle = 0; angle < 360; angle += random(1, 3)) {
    let len = random(minLength, maxLength);
    lines.push({
      cx: cx,
      cy: cy,
      len: len,
      angle: angle,
      offset: random(1000)
    });
  }
}
