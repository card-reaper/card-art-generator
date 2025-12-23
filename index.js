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

exportBtn.addEventListener("click", () => {
  const pixels = Array.from(grid.children).map(p =>
    p.classList.contains("black") ? 1 : 0
  );

  console.log(pixels);
  alert("Exported to console");
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

// Initial grid
createGrid(32, 32);
