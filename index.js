let currentMode = 'circles'; 
let mountainStart = 300;

let skyColor, skyColor2, skyAccentColor, skyAccentColor2, mountainColor,
mountainColor2, starColor, starColor2, cloudColor;

// Флаги отрисовки слоев
let renderSky = true;
let renderStars = true;
let renderMountains = true;
let renderClouds = true;

var cols, rows;
var flowfield;
var particles = [];
var inc = 0.1;
let mountainDetail = 10;
var particleScl = 15;
let resolutionX = 600;
let resolutionY = 900;
let seed = 1;

// --- ПРЕСЕТЫ ЦВЕТОВ ---
const presets = {
    // === ПРИРОДА ===
    "default":   ["#3978a8", "#39314b", "#cd6093", "#8e478c", "#f4b41b", "#8aebf1", "#397b44", "#b6d53c", "#dff6f5"],
    "sunset":    ["#361247", "#ff4e50", "#fc913a", "#f9d423", "#ffffcc", "#ffcccc", "#2b0a3d", "#4a1963", "#ffafbd"],
    "midnight":  ["#0a0a1a", "#1a1a3d", "#2d2d55", "#4a4a8a", "#ffffff", "#aaaaff", "#050510", "#151525", "#333344"],
    "arctic":    ["#87CEEB", "#E0FFFF", "#FFFFFF", "#B0E0E6", "#F0FFFF", "#FFFFFF", "#F8F8FF", "#DEB887", "#FFFFFF"],
    "desert":    ["#87CEEB", "#ffcc33", "#ff6600", "#cc3300", "#ffffcc", "#ffdb4d", "#cc6600", "#993300", "#ffe6b3"],
    "swamp":     ["#2f4f4f", "#556b2f", "#8fbc8f", "#20b2aa", "#f0fff0", "#98fb98", "#1a2f1a", "#2e4b2e", "#cce6cc"],

    // === КОСМОС ===
    "cyberpunk": ["#0b0c15", "#180c2e", "#00f0ff", "#ff0099", "#ffffff", "#00ff99", "#260e36", "#4e2a63", "#cc00ff"],
    "mars":      ["#421313", "#a3362a", "#ff9d00", "#c45c16", "#fff700", "#ffcf87", "#591c0b", "#8c3b23", "#ffcc00"],
    "alien":     ["#1a0b2e", "#4b0082", "#ba55d3", "#9400d3", "#e6e6fa", "#d8bfd8", "#2e0854", "#800080", "#dda0dd"],
    "toxic":     ["#1a2421", "#2e8b57", "#00ff00", "#adff2f", "#f0fff0", "#98fb98", "#006400", "#32cd32", "#ccffcc"],
    "void":      ["#000000", "#050505", "#111111", "#222222", "#ffffff", "#aaaaaa", "#000000", "#0a0a0a", "#1a1a1a"],

    // === СТИЛИЗАЦИЯ ===
    "bw":        ["#000000", "#2b2b2b", "#888888", "#555555", "#ffffff", "#cccccc", "#111111", "#333333", "#dddddd"],
    "sepia":     ["#704214", "#8b4513", "#d2691e", "#cd853f", "#ffe4b5", "#f5deb3", "#3e2723", "#5d4037", "#deb887"],
    "blueprint": ["#00008b", "#0000cd", "#4169e1", "#1e90ff", "#ffffff", "#f0f8ff", "#000080", "#0000ff", "#add8e6"],
    "vaporwave": ["#ff71ce", "#01cdfe", "#05ffa1", "#b967ff", "#fffb96", "#ffffff", "#2c2c54", "#4b4b8f", "#ff9ff3"],
    "pastel":    ["#ffb7b2", "#ffdac1", "#e2f0cb", "#b5ead7", "#c7ceea", "#ffffff", "#ff9aa2", "#ffb7b2", "#ffffff"],
    "gold":      ["#332200", "#664400", "#cc8800", "#ffaa00", "#ffff00", "#fffacd", "#4d3300", "#805500", "#ffd700"],
    "blood":     ["#2b0000", "#800000", "#ff0000", "#ff4500", "#ffdab9", "#ff6347", "#1a0000", "#4d0000", "#ffaaaa"],
    "matrix":    ["#000000", "#001100", "#003300", "#005500", "#00ff00", "#33ff33", "#002200", "#004400", "#00aa00"]
};

const colorIds = [
    "skyColor1", "skyColor2", "skyAccentColor1", "skyAccentColor2", 
    "starColor1", "starColor2", "mountainColor1", "mountainColor2", "cloudColor1"
];

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

document.addEventListener("DOMContentLoaded", function() {
    const seedInput = document.getElementById("seedText");
    if(seedInput) {
        seedInput.value = getRandomInt(Number.MAX_SAFE_INTEGER);
    }
});

function applyPreset(name) {
    if(presets[name]) {
        const colors = presets[name];
        colors.forEach((col, index) => {
            if(colorIds[index]) {
                const el = document.getElementById(colorIds[index]);
                if(el) el.value = col;
            }
        });
    }
}

function setRatio(w, h) {
    document.getElementById("resolutionX").value = w;
    document.getElementById("resolutionY").value = h;
}

function getRandomHex() {
    return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
}

function randomizeColors() {
    document.getElementById("presetSelect").value = ""; 
    colorIds.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.value = getRandomHex();
    });
}

function generate() {
    resolutionX = Math.max(1.0, Number(document.getElementById("resolutionX").value));
    resolutionY = Math.max(1.0, Number(document.getElementById("resolutionY").value));

    mountainDetail = Math.max(1.0, Number(document.getElementById("mountainDetail").value));
    particleScl = Math.max(1.0, Number(document.getElementById("particleDetail").value));

    // Считываем режим
    const selectedMode = document.querySelector('input[name="mode"]:checked');
    currentMode = selectedMode ? selectedMode.value : 'circles';

    // Считываем галочки (чекбоксы)
    renderSky = document.getElementById("doSky").checked;
    renderStars = document.getElementById("doStars").checked;
    renderMountains = document.getElementById("doMountains").checked;
    renderClouds = document.getElementById("doClouds").checked;

    skyColor = color(document.getElementById("skyColor1").value);
    skyColor2 = color(document.getElementById("skyColor2").value);
    skyAccentColor = color(document.getElementById("skyAccentColor1").value);
    skyAccentColor2 = color(document.getElementById("skyAccentColor2").value);
    
    mountainColor = color(document.getElementById("mountainColor1").value);
    mountainColor2 = color(document.getElementById("mountainColor2").value);

    starColor = color(document.getElementById("starColor1").value);
    starColor2 = color(document.getElementById("starColor2").value);

    cloudColor = color(document.getElementById("cloudColor1").value);
    
    seed = Number(document.getElementById("seedText").value);
    randomSeed(seed);
    noiseSeed(seed);
    
    // Статус
    const statusDiv = document.getElementById("loadingStatus");
    if(statusDiv) {
        statusDiv.innerText = "Подготовка...";
        statusDiv.classList.add("active");
    }

    drawFromSeed();
}

function generateRandom() {
    seed = getRandomInt(Number.MAX_SAFE_INTEGER);
    document.getElementById("seedText").value = seed;
    mountainStart = resolutionY / 2.5;
    generate();
}

function saveArt() {
    saveCanvas('starscape_' + seed, 'png');
}