let drawQueue = [];
let drawIndex = 0;

function setup() {
  // Пытаемся создать канвас с настройкой производительности
  // В p5js createCanvas создает контекст автоматически, поэтому мы применяем хак
  let cvs = createCanvas(resolutionX, resolutionY);
  
  // Попытка оптимизировать частые чтения пикселей (убирает warning в Chrome)
  const context = cvs.elt.getContext('2d', { willReadFrequently: true });
  
  cvs.parent("container");

  // Дефолты
  skyColor = color(57, 120, 168);
  skyColor2 = color(57, 49, 75);
  skyAccentColor = color(205, 96, 147);
  skyAccentColor2 = color(142, 71, 140);
  mountainColor =  color(57, 123, 68);
  mountainColor2 = color(182, 213, 60);
  starColor = color(244, 180, 27);
  starColor2 = color(138, 235, 241);
  cloudColor = color(223, 246, 245);

  cols = floor(width / particleScl);
  rows = floor(height / particleScl);
  drawQueue = [];
}

function drawFromSeed() {
  resizeCanvas(resolutionX, resolutionY);
  // Повторно получаем контекст после ресайза на всякий случай
  const context = document.querySelector('canvas').getContext('2d', { willReadFrequently: true });
  
  cols = floor(width / particleScl);
  rows = floor(height / particleScl);

  drawQueue = [];
  
  // Всегда очищаем фон
  drawQueue.push({ func: () => background(255), desc: "Очистка холста..." });

  // 1. Небо
  if (renderSky) {
    drawQueue.push({ func: doSkyStep, desc: "Генерация неба..." });
  } else {
    drawQueue.push({ func: () => background(skyColor2), desc: "Заливка фона..." });
  }

  // 2. Звезды
  if (renderStars) {
    drawQueue.push({ func: doStarStep, desc: "Создание туманностей..." });
    drawQueue.push({ func: drawStars, desc: "Звездное небо..." });
  }

  // 3. Облака
  if (renderClouds) {
     drawQueue.push({ func: doCloudStep, desc: "Рисуем облака..." });
  }

  // 4. Горы
  if (renderMountains) {
    drawQueue.push({ func: () => drawMountain(1), desc: "Дальние вершины..." });
    drawQueue.push({ func: () => drawMountain(2), desc: "Средний план..." });
    drawQueue.push({ func: () => drawMountain(3), desc: "Предгорья..." });
    drawQueue.push({ func: () => drawMountain(4), desc: "Детали ландшафта..." });
    drawQueue.push({ func: () => drawMountain(5), desc: "Финальные штрихи..." });
  }

  drawQueue.push({ func: finishDrawing, desc: "Готово!" });
  
  drawIndex = 0;
  loop(); 
}

function finishDrawing() {
    const statusDiv = document.getElementById("loadingStatus");
    if (statusDiv) {
        statusDiv.innerText = "Готово!";
        setTimeout(() => {
            statusDiv.classList.remove("active");
        }, 2000);
    }
    noLoop(); 
}

function updateStatus(text) {
    const statusDiv = document.getElementById("loadingStatus");
    if (statusDiv) statusDiv.innerText = text;
}

// --- ФУНКЦИИ ОТРИСОВКИ ---

function doCloudStep() {
  let clouds = makeCloudCircles();
  
  // Проверка на случай ошибки, чтобы не зависало
  if (!clouds || !Array.isArray(clouds)) {
      console.warn("makeCloudCircles вернул не массив");
      return; 
  }
  
  drawCloudCircles(clouds);
  let cloudParticles = [];

  for (cloud of clouds) {
      let p = new StarParticle();
      p.position = createVector(cloud.x, cloud.y )
      p.previousPosition = p.position.copy()
      p.targetColor = lerpColor(skyColor, skyColor2, random(0,1));

      p.spread = 10;
      cloudParticles.push(p);
  }

  let cloudField = makeCloudField();
  drawField(cloudField, cloudParticles, 20)
}

function doSkyStep() {
  drawBackground();
  let skyField = makeSkyField();
  let skyParticles = [];
  for (var x = -40; x < width; x += particleScl) {
    for (var y = -40; y < height; y += particleScl) {
      let p = new Particle();
      p.pos = createVector(x, y)
      p.previousPosition = createVector(x, y)
      skyParticles.push(p);
    }
  }
 drawField(skyField, skyParticles, 40);
}

function doStarStep() {
  let circles = makeStarCircles();
  let starParticles = [];
  for (c of circles) {
    let rScl = c.r* 0.5;
		for(let j = 0; j < floor(c.r * 0.35);j++) {
			let p = new StarParticle();
			p.position = createVector(random(c.x - rScl, c.x + rScl), random(c.y - rScl, c.y + rScl))
            p.previousPosition = p.position.copy();
            p.targetColor = lerpColor(starColor, starColor2, random(0,1));
			starParticles.push(p);  
		}
  }
  let starField = makeStarField(circles);
  drawField(starField, starParticles, 20)
}

function draw() {
  if (drawIndex < drawQueue.length) {
    let step = drawQueue[drawIndex];
    updateStatus(step.desc);
    
    // Выполняем шаг
    if (typeof step.func === 'function') {
        step.func();
    }
    
    drawIndex++;
  }
}

function drawStars() {
  for(let i = 0; i < 500; i++) {
    strokeWeight(random(0.3, 5.0));
    stroke(255, 255, 255, random(0, 255));
    var h = random(0, 30) * random(4, 30);
    point(random(0, width), h);
  }
}

function drawCloudCircles(clouds) {
  noStroke();
  // Дополнительная защита
  if(!clouds) return;
  
  for (cloud of clouds) {
    let c = lerpColor(cloud.c, skyColor, random(0.0, 1.0))
    fill(c)
    circle(cloud.x, cloud.y, cloud.r)
  }
}

function drawBackground() {
  strokeWeight(mountainDetail*1.5);
  for(let y = 0; y < height; y+= mountainDetail) {
    stroke(lerpColor(skyColor2, skyColor, y/height * random(0.7, 1.3)));
    line(0, y, width, y)
  }
  noStroke();
  for(let y = 0; y < height; y+= 5) {
    if (random(0, 100) > 95) {
      let c = lerpColor(skyColor, skyAccentColor, random(0, 1))
      fill(c)
      circle(random(0, width), y, random(100, 200))
    }
    if (random(0, 100) > 95) {
      let c = lerpColor(skyColor, skyAccentColor2, random(0, 1))
      fill(c)
      circle(random(0, width), y, random(100, 200))
    }
  }
}

function drawMountain(distance) {
  let mountainHeight = height - mountainStart;
  let particles = [];
  let renderer = createGraphics(width, height);
  let iters = 30 - distance * 2 - random(0, 10);
  
  let noiseScale = distance / 0.7; 
  let heightOffset = (distance/10.0)*mountainHeight + mountainStart;

  for(let x = 0; x < width + mountainDetail; x+=mountainDetail) {
    let n = noise(x*0.001 * noiseScale, distance*50);
    let heighestPoint = (mountainHeight * 0.85) + heightOffset;
    let altitude = n*(mountainHeight * 0.85) + heightOffset;

    renderer.strokeWeight(mountainDetail*2);
    for (let y = altitude; y < height + mountainDetail; y+=mountainDetail) {
      let c = lerpColor(mountainColor, mountainColor2, pow(y/(heighestPoint-150), 7));
      c = lerpColor(skyColor, c, pow(distance/5.0, 2.0))
      renderer.stroke(c);
      renderer.point(x,y);
    }
    
    if (random(0, 100) > 20 * (5 - mountainDetail)) {
      let yy = random(0, 50)
      let p = new StarParticle();
      p.position = createVector(x, altitude + yy)
      p.previousPosition = p.position.copy();
      p.maxSteps = iters + floor(random(-10, 5));
      p.targetColor = skyColor2;
      p.spread = 9.0;
      p.colorMerge = 0.98;
      particles.push(p);
    }
  }

  let cloudField = makeCloudField();
  drawField(cloudField, particles, iters + 5, skyColor)
  image(renderer, 0, 0);
}