const grid = document.getElementById("grid");
const widthInput = document.getElementById("width");
const heightInput = document.getElementById("height");
const exportBtn = document.getElementById("export");
const clearBtn = document.getElementById("clear");

let drawing = false;

document.addEventListener("mousedown", () => drawing = true);
document.addEventListener("mouseup", () => drawing = false);
function createGrid(cols, rows) {
  grid.innerHTML = "";

  // calculate cell size to fit screen and maintain aspect ratio
  const maxWidth = window.innerWidth * 0.9;
  const maxHeight = window.innerHeight * 0.9;
  const cellSize = Math.floor(Math.min(maxWidth / cols, maxHeight / rows));

  grid.style.width = `${cellSize * cols}px`;
  grid.style.height = `${cellSize * rows}px`;
  grid.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
  grid.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;

  for (let i = 0; i < cols * rows; i++) {
    const pixel = document.createElement("div");
    pixel.className = "pixel";
    pixel.draggable = false;

    pixel.addEventListener("mousedown", e => { e.preventDefault(); pixel.classList.add("black"); });
    pixel.addEventListener("mouseover", () => { if(drawing) pixel.classList.add("black"); });

    grid.appendChild(pixel);
  }
}

function exportJson() {
  const cols = +widthInput.value;
  const rows = +heightInput.value;

  // 1 = white, 0 = black
  const imageString = Array.from(grid.children)
    .map(p => p.classList.contains("black") ? "0" : "1")
    .join("");

  const json = {
    imageWidth: cols,
    imageHeight: rows,
    image: imageString
  };

  const jsonText = JSON.stringify(json, null, 2); // pretty print

  // put JSON in textarea
  const output = document.getElementById("jsonOutput");
  output.value = jsonText;
}

exportBtn.addEventListener("click", exportJson);


const copyBtn = document.getElementById("copyOutput");

copyBtn.addEventListener("click", () => {
  const output = document.getElementById("jsonOutput");
  output.select();
  output.setSelectionRange(0, 99999); // for mobile devices
  navigator.clipboard.writeText(output.value)
    .then(() => alert("Copied to clipboard!"))
    .catch(err => alert("Failed to copy: " + err));
});


clearBtn.addEventListener("click", () => {
  for (const pixel of grid.children) {
    pixel.classList.remove("black");
  }
});


// Regenerate grid when width/height change
widthInput.addEventListener("change", () =>
  createGrid(+widthInput.value, +heightInput.value)
);
heightInput.addEventListener("change", () =>
  createGrid(+widthInput.value, +heightInput.value)
);

// initial grid matches input values
createGrid(+widthInput.value, +heightInput.value);
exportJson()

