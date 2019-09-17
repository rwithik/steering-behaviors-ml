
var players = [];
var greens = [];
var reds = [];

var debug = false;

function setup() {
  createCanvas(640, 360);
  for (var i = 0; i < 50; i++) {
    players[i] = new Player(random(width), random(height));
  }

  for (var i = 0; i < 40; i++) {
    greens.push(createVector(random(width), random(height)));
  }

  for (var i = 0; i < 20; i++) {
    reds.push(createVector(random(width), random(height)));
  }


}

function draw() {
  background(50);

  if (random(1) < 0.25) {
    greens.push(createVector(random(width), random(height)));
  }

  if (random(1) < 0.01) {
    reds.push(createVector(random(width), random(height)));
  }

  noStroke();

  fill(0, 255, 0);
  for (var i = 0; i < greens.length; i++) {
    ellipse(greens[i].x, greens[i].y, 4);
  }

  fill(255, 0, 0);
  for (var i = 0; i < reds.length; i++) {
    ellipse(reds[i].x, reds[i].y, 4);
  }

  for (var i = players.length - 1; i >= 0; i--) {
    players[i].edges();
    players[i].movement(greens, reds);
    players[i].update();
    players[i].show();

    var newPlayer = players[i].reproduce();
    if (newPlayer != null) {
      players.push(newPlayer);
    }

    if (players[i].die()) {
      var x = players[i].position.x;
      var y = players[i].position.y;
      greens.push(createVector(x, y));
      players.splice(i, 1);
    }

  }
}
