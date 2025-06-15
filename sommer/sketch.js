let mic, fft;
let yellowCircles = []; // speichert Position und Größe der 10 Kreise

function setup() {
  createCanvas(595, 842); // A4
  background('#FFC3CC'); // Hintergrund Rosa

  randomSeed (123); //Kreise bleiben wo sind (123 kann aucch zu 456 oder so geändert werden, dann sind kreise an andere Position)

  for (let i = 0; i < 10; i++) {
    let r = random(20, 80);
    let x = random(r, width - r);
    let y = random(r, height - r);
    yellowCircles.push({ x: x, y: y, r: r });
  }
 
  mic = new p5.AudioIn();
  mic.start();

  fft = new p5.FFT(0.8, 1024);
  fft.setInput(mic);

  //noLoop(); // Nur ein Frame für statisches Poster
}

function draw() {
  background('#FFC3CC'); // rosa Hintergrund
  drawFlowLines();
  drawYellowCircles();
}

// Linienmuster
function drawFlowLines() {
  noFill();
  stroke('#022c98'); // Blaue Farbe
  strokeWeight(1.2);

  let lineCount = 60;
  let spacing = 8;

  for (let i = 0; i < lineCount; i++) {
    beginShape();
    for (let x = 0; x < width; x += 5) {
      let t = frameCount * 0.10;
      let y = height / 10
              + sin(x * 0.01 + i * 0.15 + t) * 40
              + sin(x * 0.009 + i * 0.05 + t * 1.2) * 60;
      vertex(x, y + i * spacing);
    }
    endShape();
  }
  noLoop();
}

// Gelbe Kreise
function drawYellowCircles() {
  noStroke();
  fill(255, 215, 0, 165); // 65 % Deckkraft

  let energy = fft.getEnergy(100, 1000); // Frequenzbereich

  let scale = map(energy, 0, 255, 0.9, 1.4); // Größe

  // Bewegung je nach Energie
  let moveAmount = map(energy, 0, 255, 0, 5);

  for (let c of yellowCircles) {
    // zufällige kleine Bewegung
    let offsetX = random(-moveAmount, moveAmount);
    let offsetY = random(-moveAmount, moveAmount);

    ellipse(c.x + offsetX, c.y + offsetY, c.r * 2 * scale);
  }
}

