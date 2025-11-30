function Particle() {
	this.position = createVector(random(width), random(height));
	this.previousPosition = this.position.copy();
	this.motion = createVector(0, 0);
	this.acceleration = createVector(0, 0);
	this.maxMotion = 6;
	this.steps = 0;
	this.maxSteps = 40;
	this.color = getPixel(this.position.x, this.position.y);

	this.update = function() {
		this.motion.add(this.acceleration);
		this.motion.limit(this.maxMotion);
		this.position.add(this.motion);
		this.acceleration.mult(0);
		this.steps += 1;
	}

	this.applyField = function(vectors) {
		var x = floor(this.position.x / particleScl);
		var y = floor(this.position.y / particleScl);
		var index = x + y * cols;
		var force = vectors[index];

		if (force) {
			if (this.position.x < width && this.position.x > 0) {
				if (this.position.y < height && this.position.y > 0) {
					let c = getPixel(this.position.x, this.position.y);					
					this.color = c;
				}
			}
		}

		this.applyForce(force);
	}

	this.applyForce = function(force) {
		this.acceleration.add(force);
	}

	this.draw = function() {
		if (this.color != null ) {
			let sclFactor = (1.0-(this.steps/this.maxSteps));
            let s = particleScl * sclFactor; 

			stroke(this.color);
			fill(this.color)
			strokeWeight(s);

            // Логика отрисовки разных стилей
			if (currentMode === 'lines') {
				line(this.position.x, this.position.y, this.previousPosition.x, this.previousPosition.y);
			} 
            else if (currentMode === 'squares') {
                noStroke(); 
                rectMode(CENTER);
                for (let i = 0; i < 3; i++) {
                    rect(this.position.x + random(-5, 5), this.position.y + random(-5, 5), s * random(0.5, 2.0), s * random(0.5, 2.0));
                }
            }
            else if (currentMode === 'crosses') {
                strokeWeight(s * 0.6); 
                let r = s * random(0.5, 1.5);
                push();
                translate(this.position.x + random(-5, 5), this.position.y + random(-5, 5));
                rotate(random(PI)); 
                line(-r, -r, r, r);
                line(r, -r, -r, r);
                pop();
            }
            else { // Circles (Default)
				for (let i = 0; i < 3; i++) {
					circle(this.position.x + random(-10, 10), this.position.y  + random(-10, 10), s * random(0.2, 2.5))
				}
			}
		}
		this.updatePrev();
	}

	this.updatePrev = function() {
		this.previousPosition.x = this.position.x;
		this.previousPosition.y = this.position.y;
	}
}