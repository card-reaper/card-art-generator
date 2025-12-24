const grid = document.getElementById("grid");
const widthInput = document.getElementById("width");
const heightInput = document.getElementById("height");
const exportBtn = document.getElementById("export");
const clearBtn = document.getElementById("clear");
const toggleGridBtn = document.getElementById("toggleGrid");
const loadBtn = document.getElementById("loadJson");
// note: input and output share an element
const jsonInput = document.getElementById("jsonOutput");
const undoBtn = document.getElementById("undo")

let drawing = false;
let erasing = false;

const undoStack = []
const redoStack = []
const MAX_UNDO = 50


function buildImageJson() {
  const cols = +widthInput.value;
  const rows = +heightInput.value;

  const imageString = Array.from(grid.children)
    .map(p => p.classList.contains("black") ? "0" : "1")
    .join("");

  const json = {
    imageWidth: cols,
    imageHeight: rows,
    image: imageString
  };

  const jsonText = JSON.stringify(json, null, 2);
  return jsonText
}


// load from json
function loadFromJson(inputString){
  let data;

  try {
    data = JSON.parse(inputString);
  } catch {
    alert("Invalid JSON");
    return;
  }


  const { imageWidth, imageHeight, image } = data;

  if (
    typeof imageWidth !== "number" ||
    typeof imageHeight !== "number" ||
    typeof image !== "string" ||
    image.length !== imageWidth * imageHeight
  ) {
    alert("Invalid image data");
    console.log(data)
    console.log(typeof imageWidth)
    console.log(typeof imageHeight)
    console.log(typeof image)
    return;
  }

  // update inputs
  widthInput.value = imageWidth;
  heightInput.value = imageHeight;

  // rebuild grid
  createGrid(imageWidth, imageHeight);

  // apply pixels
  const pixels = grid.children;
  for (let i = 0; i < image.length; i++) {
    if (image[i] === "0") {
      pixels[i].classList.add("black");
    } else {
      pixels[i].classList.remove("black");
    }
  }

  // update export preview
  exportJson();
}

function saveState() {
  const state = buildImageJson();
  if (undoStack.length === 0) undoStack.push(state)
  if (undoStack[undoStack.length - 1] !== state) {
    console.log("Saving...")
    undoStack.push(state);
    if (undoStack.length > MAX_UNDO) undoStack.shift();
    redoStack.length = 0; // clear redo
  }
}

function undo() {
  if (!undoStack.length) return;

  const current = buildImageJson();
  redoStack.push(current);

  const prev = undoStack.pop();
  loadFromJson(prev, false); // false: don't save state again
}

function redo() {
  if (!redoStack.length) return;

  const current = buildImageJson();
  undoStack.push(current);

  const next = redoStack.pop();
  loadFromJson(next, false);
}


undoBtn.addEventListener("click", undo)


// track mouse buttons globally
document.addEventListener("mousedown", (e) => {
  if (e.button === 0) drawing = true;
  if (e.button === 2) erasing = true;
});
document.addEventListener("mouseup", () => {
  drawing = false;
  erasing = false;
  saveState()
});

// prevent right-click menu on grid
grid.addEventListener("contextmenu", e => e.preventDefault());

// store current grid dimensions for resizing
grid.dataset.cols = widthInput.value;
grid.dataset.rows = heightInput.value;

// get current pixel values as 2D array
function getPixelValues(cols, rows) {
  const pixels = Array.from(grid.children);
  const values = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const pixel = pixels[i];
      row.push(pixel && pixel.classList.contains("black") ? 1 : 0);
    }
    values.push(row);
  }
  return values;
}

// create grid with optional old values to preserve
function createGrid(newCols, newRows, oldValues = [], oldCols = 0, oldRows = 0) {
  grid.innerHTML = "";

  const maxWidth = window.innerWidth * 0.9;
  const maxHeight = window.innerHeight * 0.9;
  const cellSize = Math.floor(Math.min(maxWidth / newCols, maxHeight / newRows));

  grid.style.width = `${cellSize * newCols}px`;
  grid.style.height = `${cellSize * newRows}px`;
  grid.style.gridTemplateColumns = `repeat(${newCols}, ${cellSize}px)`;
  grid.style.gridTemplateRows = `repeat(${newRows}, ${cellSize}px)`;

  for (let r = 0; r < newRows; r++) {
    for (let c = 0; c < newCols; c++) {
      const pixel = document.createElement("div");
      pixel.className = "pixel";
      pixel.draggable = false;

      // restore old value if within bounds
      if (oldValues[r] && oldValues[r][c] === 1) {
        pixel.classList.add("black");
      }

      // left/right click painting
      pixel.addEventListener("mousedown", e => {
        e.preventDefault();
        if (e.button === 0) pixel.classList.add("black");
        if (e.button === 2) pixel.classList.remove("black");
      });

      // drag painting
      pixel.addEventListener("mouseover", () => {
        if (drawing) pixel.classList.add("black");
        if (erasing) pixel.classList.remove("black");
      });

      grid.appendChild(pixel);
    }
  }

  // save new dimensions for future resize
  grid.dataset.cols = newCols;
  grid.dataset.rows = newRows;
}

// handle resizing grid while preserving old pixels
function resizeGrid() {
  const oldCols = +grid.dataset.cols;
  const oldRows = +grid.dataset.rows;
  const oldValues = getPixelValues(oldCols, oldRows);

  const newCols = +widthInput.value;
  const newRows = +heightInput.value;

  createGrid(newCols, newRows, oldValues, oldCols, oldRows);
}


// export grid as JSON string
function exportJson() {
  jsonText = buildImageJson()
  document.getElementById("jsonOutput").value = jsonText;
}

// copy JSON output to clipboard
const copyBtn = document.getElementById("copyOutput");
copyBtn.addEventListener("click", () => {
  const output = document.getElementById("jsonOutput");
  output.select();
  output.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(output.value)
    .then(() => alert("Copied to clipboard!"))
    .catch(err => alert("Failed to copy: " + err));
});

// clear all pixels
clearBtn.addEventListener("click", () => {
  for (const pixel of grid.children) {
    pixel.classList.remove("black");
  }
});

// Grid on or off
toggleGridBtn.addEventListener("click", () => {
  grid.classList.toggle("no-lines");
});

loadBtn.addEventListener("click", () => {
  loadFromJson(jsonInput.value)

});



// attach listeners
exportBtn.addEventListener("click", exportJson);
widthInput.addEventListener("change", resizeGrid);
heightInput.addEventListener("change", resizeGrid);

// initial grid
createGrid(+widthInput.value, +heightInput.value);
saveState();
exportJson();
