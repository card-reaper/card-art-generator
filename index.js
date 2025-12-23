const grid = document.getElementById("grid");
const widthInput = document.getElementById("width");
const heightInput = document.getElementById("height");
const exportBtn = document.getElementById("export");
const clearBtn = document.getElementById("clear");

let drawing = false;
let erasing = false;

// track mouse buttons globally
document.addEventListener("mousedown", (e) => {
  if (e.button === 0) drawing = true;
  if (e.button === 2) erasing = true;
});
document.addEventListener("mouseup", () => {
  drawing = false;
  erasing = false;
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

// attach listeners
exportBtn.addEventListener("click", exportJson);
widthInput.addEventListener("change", resizeGrid);
heightInput.addEventListener("change", resizeGrid);

// initial grid
createGrid(+widthInput.value, +heightInput.value);
exportJson();
