const grid = document.getElementById("grid");
const widthInput = document.getElementById("width");
const heightInput = document.getElementById("height");
const exportBtn = document.getElementById("export");
const clearBtn = document.getElementById("clear");
const toggleGridBtn = document.getElementById("toggleGrid");
const loadBtn = document.getElementById("loadJson");
const jsonInput = document.getElementById("jsonOutput");
const undoBtn = document.getElementById("undo");
const redoBtn = document.getElementById("redo");
const copyBtn = document.getElementById("copyOutput")

let drawing = false;
let erasing = false;

const undoStack = [];
const redoStack = [];
const MAX_UNDO = 50;
let isPerformingUndoRedo = false;

// -------------------- UTILS --------------------
function buildImageJson() {
  const cols = +widthInput.value;
  const rows = +heightInput.value;

  const imageString = Array.from(grid.children)
    .map(p => p.classList.contains("black") ? "0" : "1")
    .join("");

  return JSON.stringify({ imageWidth: cols, imageHeight: rows, image: imageString }, null, 2);
}

function applyImageJson(jsonText) {
  let data;
  try {
    data = JSON.parse(jsonText);
  } catch {
    alert("Invalid JSON");
    return;
  }

  const { imageWidth, imageHeight, image } = data;
  if (!imageWidth || !imageHeight || !image || image.length !== imageWidth * imageHeight) {
    alert("Invalid image data");
    return;
  }

  widthInput.value = imageWidth;
  heightInput.value = imageHeight;
  createGrid(imageWidth, imageHeight);

  const pixels = grid.children;
  for (let i = 0; i < pixels.length; i++) {
    pixels[i].classList.toggle("black", image[i] === "0");
  }

  exportJson();
}

// -------------------- UNDO / REDO --------------------
function saveState() {
  if (isPerformingUndoRedo) return; // skip when undo/redo
  const state = buildImageJson();
  if (undoStack[undoStack.length - 1] !== state) {
    undoStack.push(state);
    if (undoStack.length > MAX_UNDO) undoStack.shift();
    redoStack.length = 0; // clear redo on new action
  }
}

function undo() {
  if (!undoStack.length) return;
  isPerformingUndoRedo = true;

  const current = buildImageJson();
  redoStack.push(current);

  const prev = undoStack.pop();
  applyImageJson(prev);

  isPerformingUndoRedo = false;
}

function redo() {
  if (!redoStack.length) return;
  isPerformingUndoRedo = true;

  const current = buildImageJson();
  undoStack.push(current);

  const next = redoStack.pop();
  applyImageJson(next);

  isPerformingUndoRedo = false;
}

// -------------------- GRID --------------------
function getPixelValues(cols, rows) {
  return Array.from(grid.children).map(p => p.classList.contains("black") ? 1 : 0);
}

function createGrid(cols, rows, oldValues = []) {
  grid.innerHTML = "";

  const maxWidth = window.innerWidth * 0.9;
  const maxHeight = window.innerHeight * 0.9;
  const cellSize = Math.floor(Math.min(maxWidth / cols, maxHeight / rows));

  grid.style.width = `${cellSize * cols}px`;
  grid.style.height = `${cellSize * rows}px`;
  grid.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
  grid.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const pixel = document.createElement("div");
      pixel.className = "pixel";
      pixel.draggable = false;

      if (oldValues[r * cols + c]) pixel.classList.add("black");

      pixel.addEventListener("mousedown", e => {
        e.preventDefault();
        saveState();

        if (e.button === 0) pixel.classList.add("black");
        if (e.button === 2) pixel.classList.remove("black");
      });

      pixel.addEventListener("mouseover", () => {
        if (drawing) pixel.classList.add("black");
        if (erasing) pixel.classList.remove("black");
      });

      grid.appendChild(pixel);
    }
  }

  grid.dataset.cols = cols;
  grid.dataset.rows = rows;
}

// -------------------- EVENT LISTENERS --------------------
document.addEventListener("mousedown", e => {
  if (e.button === 0) drawing = true;
  if (e.button === 2) erasing = true;
});
document.addEventListener("mouseup", () => {
  drawing = false;
  erasing = false;
});

grid.addEventListener("contextmenu", e => e.preventDefault());

widthInput.addEventListener("change", () => resizeGrid());
heightInput.addEventListener("change", () => resizeGrid());

clearBtn.addEventListener("click", () => {
  grid.querySelectorAll(".pixel").forEach(p => p.classList.remove("black"));
  saveState();
});

toggleGridBtn.addEventListener("click", () => grid.classList.toggle("no-lines"));
exportBtn.addEventListener("click", exportJson);
copyBtn.addEventListener("click", () => {
  jsonInput.select();
  navigator.clipboard.writeText(jsonInput.value);
});
loadBtn.addEventListener("click", () => { applyImageJson(jsonInput.value); saveState(); });
undoBtn.addEventListener("click", undo);
redoBtn.addEventListener("click", redo);

// -------------------- GRID RESIZE --------------------
function resizeGrid() {
  const oldValues = Array.from(grid.children).map(p => p.classList.contains("black") ? 1 : 0);
  const cols = +widthInput.value;
  const rows = +heightInput.value;
  createGrid(cols, rows, oldValues);
}

// -------------------- EXPORT --------------------
function exportJson() {
  jsonInput.value = buildImageJson();
}

// -------------------- INIT --------------------
createGrid(+widthInput.value, +heightInput.value);
saveState();
exportJson();
