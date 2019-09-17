maxspeed = 5;
maxforce = 0.5;


function Player(x, y, dna) {
	this.position = createVector(x, y);
	this.velocity = createVector(random(-1, 1), random(-1, 1));
	this.acceleration = createVector(0, 0);

	this.health = 1;
	this.dna = [];

	if (dna === undefined){
		this.dna = [random(-2, 2), random(-2, 2), random(0, 100), random(0, 100)];
	}
	else{
		// Mutation
		this.dna[0] = dna[0] + random(-0.1, 0.1);
		this.dna[1] = dna[1] + random(-0.1, 0.1);
		this.dna[2] = dna[2] + random(-10, 10);
		this.dna[3] = dna[3] + random(-10, 10);
	}

	// 0.1% of the time, completely change the weights
	if (random(1) < 0.001){
		this.dna = [random(-2, 2), random(-2, 2), random(0, 100), random(0, 100)];
	}


	this.update = function(){
		this.health -= 0.005;

		this.velocity.add(this.acceleration);
		this.velocity.limit(maxspeed);
		this.position.add(this.velocity)
		this.acceleration = createVector(0, 0);
	}

	this.applyForce = function(force){
		this.acceleration.add(force);
		this.acceleration.limit(maxforce)
	}

	this.die = function(){
		return this.health <= 0;
	}

	this.reproduce = function(){
		if (random(1) < 0.001){
			return new Player(this.position.x, this.position.y, this.dna);
		}
		else return null;
	}

	this.show = function(){
		var angle = this.velocity.heading() + PI / 2;

		var green = color(0, 255, 0);
		var red = color(255, 0, 0)

		push();
		translate(this.position.x, this.position.y);
		rotate(angle);

		if (debug){
			strokeWeight(3)
			stroke(green);
			noFill();
			line(0, 0, 0, -this.dna[0] * 20);
			ellipse(0, 0, 2 * this.dna[2]);
			stroke(red);
			line(0, 0, this.dna[1] * 20);
			ellipse(0, 0, 2 * this.dna[3]);
		}

		// Find a color for the player based on the remaining health
		var clr = lerpColor(red, green, this.health)

		strokeWeight(1);
		stroke(clr);
		fill(clr);
		// Draw the player.
		beginShape()
		vertex(0, -10);
		vertex(-5, 10);
		vertex(5, 10);
		endShape(CLOSE);
		pop();
	}

	this.distSq = function(point){
		// Returns the square of the distance between two points.
		return (this.position.x - point.x)*(this.position.x - point.x) +
			   (this.position.y - point.y)*(this.position.y - point.y);
	}

	this.eatFood = function(points, delta, radius){
		var closestDist = 5000;
		var closestPoint = null;

		for(var i = points.length - 1; i >= 0; i--){
			// Get the square of the distance. 
			// p5.js has a function to get the distance between two points
			// But, it finds a square root and square root is an expensive operation. 
			// So, we get the distance square, and every thing compared to this value is squared

			var d = this.distSq(points[i]);

			if (d < maxspeed*maxspeed){
				points.splice(i, 1);
				this.health += delta
			} 
			else {
				if (d < closestDist && d < radius*radius){
					closestDist = d;
					closestPoint = points[i];
				}
			}
		}

		if (closestPoint != null){
			var desired = p5.Vector.sub(closestPoint, this.position);
			// desired.normalize();
			// desired.mult(maxspeed);
			desired.setMag(maxspeed);
			var steer = p5.Vector.sub(desired, this.velocity);
			steer.limit(maxforce)
			return steer;
		}
		else return createVector(0, 0);
	}

	this.edges = function(){
		// Steer the player towards the center of the canvas, when it gets close to the edge of the canvas
		var gap = 25
		var desired = null;

		if (this.position.x < gap) desired = createVector(maxspeed, this.velocity.y);
		else if (this.position.x > width - gap) desired = createVector(-maxspeed, this.velocity.y);
		else if (this.position.y < gap) desired = createVector(this.velocity.x, maxspeed);
		else if (this.position.y > width - gap) desired = createVector(this.velocity.y, -maxspeed);

		if (desired !== null){
			desired.setMag(maxspeed);
			var steeringForce = p5.Vector.sub(desired, this.velocity);
			this.applyForce(steeringForce);
		}
	}


	this.movement = function(green, red){
		var gForce = this.eatFood(green, 0.2, this.dna[2])
		var rForce = this.eatFood(red, -1, this.dna[3])

		gForce.mult(this.dna[0])
		rForce.mult(this.dna[1])

		this.applyForce(gForce)
		this.applyForce(rForce)
	}

}