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
const copyBtn = document.getElementById("copyOutput");

let drawing = false, erasing = false;
const undoStack = [], redoStack = [], MAX_UNDO = 50;
let isPerformingUndoRedo = false;

// -------------------- UTILS --------------------
function buildImageJson() {
  const cols = +widthInput.value;
  const rows = +heightInput.value;
  const image = Array.from(grid.children).map(p => p.classList.contains("black") ? "0" : "1").join("");
  return JSON.stringify({ imageWidth: cols, imageHeight: rows, image }, null, 2);
}

function applyImageJson(jsonText) {
  let data;
  try { data = JSON.parse(jsonText); } 
  catch { alert("Invalid JSON"); return; }

  const { imageWidth, imageHeight, image } = data;
  if (!imageWidth || !imageHeight || !image || image.length !== imageWidth*imageHeight) {
    alert("Invalid image data"); return;
  }

  widthInput.value = imageWidth;
  heightInput.value = imageHeight;

  const oldValues = Array.from(image).map(ch => ch === "0" ? 1 : 0);
  createGrid(imageWidth, imageHeight, oldValues);
  exportJson();
}

// -------------------- UNDO / REDO --------------------
function saveState() {
  if (isPerformingUndoRedo) return;
  const state = buildImageJson();
  if (undoStack[undoStack.length-1] !== state) {
    undoStack.push(state);
    if (undoStack.length > MAX_UNDO) undoStack.shift();
    redoStack.length = 0;
  }
}

function undo() {
  if (!undoStack.length) return;
  isPerformingUndoRedo = true;
  redoStack.push(buildImageJson());
  const prev = undoStack.pop();
  applyImageJson(prev);
  isPerformingUndoRedo = false;
}

function redo() {
  if (!redoStack.length) return;
  isPerformingUndoRedo = true;
  undoStack.push(buildImageJson());
  const next = redoStack.pop();
  applyImageJson(next);
  isPerformingUndoRedo = false;
}

// -------------------- GRID --------------------
function createGrid(cols, rows, oldValues = []) {
  grid.innerHTML = "";
  const maxWidth = window.innerWidth * 0.9;
  const maxHeight = window.innerHeight * 0.9;
  const cellSize = Math.floor(Math.min(maxWidth / cols, maxHeight / rows));

  for (let r=0; r<rows; r++) {
    for (let c=0; c<cols; c++) {
      const pixel = document.createElement("div");
      pixel.className = "pixel";
      pixel.draggable = false;

      const idx = r*cols + c;
      if (oldValues[idx]) pixel.classList.add("black");

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

  grid.style.width = `${cellSize * cols}px`;
  grid.style.height = `${cellSize * rows}px`;
  grid.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
  grid.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;

  grid.dataset.cols = cols;
  grid.dataset.rows = rows;
}

// -------------------- EVENT LISTENERS --------------------
document.addEventListener("mousedown", e => { if(e.button===0)drawing=true; if(e.button===2)erasing=true; });
document.addEventListener("mouseup", () => { drawing=false; erasing=false; });

grid.addEventListener("contextmenu", e=>e.preventDefault());

widthInput.addEventListener("change", resizeGrid);
heightInput.addEventListener("change", resizeGrid);
clearBtn.addEventListener("click", ()=>{ grid.querySelectorAll(".pixel").forEach(p=>p.classList.remove("black")); saveState(); });
toggleGridBtn.addEventListener("click", ()=>grid.classList.toggle("no-lines"));
exportBtn.addEventListener("click", exportJson);
copyBtn.addEventListener("click", ()=>{ jsonInput.select(); navigator.clipboard.writeText(jsonInput.value); });
loadBtn.addEventListener("click", ()=>{ applyImageJson(jsonInput.value); saveState(); });
undoBtn.addEventListener("click", undo);
redoBtn.addEventListener("click", redo);

// -------------------- GRID RESIZE --------------------
function resizeGrid() {
  const oldCols = +grid.dataset.cols;
  const oldRows = +grid.dataset.rows;

  const newCols = +widthInput.value;
  const newRows = +heightInput.value;

  // get 2D array of old pixels
  const oldPixels = [];
  const children = Array.from(grid.children);
  for (let r = 0; r < oldRows; r++) {
    const row = [];
    for (let c = 0; c < oldCols; c++) {
      row.push(children[r * oldCols + c].classList.contains("black") ? 1 : 0);
    }
    oldPixels.push(row);
  }

  // map old pixels to new grid without shifting positions
  const newValues = [];
  for (let r = 0; r < newRows; r++) {
    for (let c = 0; c < newCols; c++) {
      if (r < oldRows && c < oldCols) {
        newValues.push(oldPixels[r][c]);
      } else {
        newValues.push(0); // new pixel
      }
    }
  }

  createGrid(newCols, newRows, newValues);
  saveState();
}


// -------------------- EXPORT --------------------
function exportJson() { jsonInput.value = buildImageJson(); }

// -------------------- INIT --------------------
createGrid(+widthInput.value, +heightInput.value);
saveState();
exportJson();
