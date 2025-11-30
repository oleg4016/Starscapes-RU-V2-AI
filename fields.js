function makeSkyField() {
	let f = new Array(cols * rows);
	var yoff = 0;
	for (var y = 0; y < rows; y++) {
		var xoff = 0;
		for (var x = 0; x < cols; x++) {
			var index = x + y * cols;
			let n = noise(xoff, yoff) * TWO_PI;
			let vec = createVector(0,1);
	
			vec.rotate(n);
			f[index] = vec;
			xoff += inc;
		}
	  	yoff += inc;
	}
	return f;
}

// ИСПРАВЛЕННАЯ ФУНКЦИЯ
function makeCloudCircles() {
	let circles = [];
    
    // Проходим по высоте с шагом, чтобы найти места для облаков
	for(let y = 0; y < height; y+= 50) {
        // С вероятностью 10% на этой высоте будет облако
		if (random(0, 100) > 90) {
            let clusterX = random(0, width);
            // Количество "пушистых" шариков в одном облаке
			let count = floor(random(10, 30)); 
			
			for (let i = 0; i < count; i ++) {
                // Разброс шариков вокруг центра облака
                let xOff = random(-80, 80); 
                let yOff = random(-20, 20);
                
                // Цвет немного варьируется для объема
                // Используем глобальные cloudColor и skyColor, если они доступны, иначе белый
                let cBase = (typeof cloudColor !== 'undefined') ? cloudColor : color(255);
                let cSky = (typeof skyColor !== 'undefined') ? skyColor : color(100);
                
				let c = lerpColor(cSky, cBase, random(0.6, 1.0));

				circles.push({
					"x": clusterX + xOff,
					"y": y + yOff,
					"r": random(20, 60),
					"c": c
				})
			}
		}
	}
	return circles; // <-- ВАЖНО: Возвращаем массив, чтобы не было ошибки
}

function makeCloudField() {
	let f = new Array(cols * rows);
	var yoff = 0;
	for (var y = 0; y < rows; y++) {
		var xoff = 0;
		for (var x = 0; x < cols; x++) {
			var index = x + y * cols;
			let n = noise(xoff, yoff) * TWO_PI;
			let vec = createVector(0,1);

			vec.rotate(n);
			f[index] = vec;
			xoff += inc * 2.0;
		}
	  	yoff += inc * 2.0;
	}
	return f;
}

function makeStarCircles() {
	let circles = []
	for(let i = 0; i < 35; i++) {
		let x = random(0, width)
		let y = random(0, height)
		let r = random(40, 200)
		let fits = true

		for (c of circles) {
			let from = createVector(x, y)
			let to = createVector(c.x, c.y)

			if (from.dist(to) < r + c.r) {
				fits = false
			}
		}

		if (fits) {
			circles.push({
				"x": x,
				"y": y,
				"r": r,
				"d": Math.sign(random(-1, 1))
			})
		}
	}
	return circles;
}

function makeStarField(circles) {
	let f = new Array(cols * rows);

	for (var y = 0; y < rows; y++) {
		for (var x = 0; x < cols; x++) {
			var index = x + y * cols;
			let v = createVector(5, 0);
			let pos = createVector(x * particleScl, y * particleScl);
			
			for (const c of circles ) {
				let cPos = createVector(c.x, c.y);
				if (cPos.dist(pos) < c.r) {
				let a = atan2(c.y - pos.y, c.x - pos.x);				
				v.rotate(a-HALF_PI+ (0.4 *c.d))

				f[index] = v;
				} 
			}
		}
	}
	return f;
}