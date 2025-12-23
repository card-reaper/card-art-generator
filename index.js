const grid = document.getElementById("grid");
const widthInput = document.getElementById("width");
const heightInput = document.getElementById("height");
const exportBtn = document.getElementById("export");
const clearBtn = document.getElementById("clear");

let drawing = false;

document.addEventListener("mousedown", () => drawing = true);
document.addEventListener("mouseup", () => drawing = false);

function createGrid(w, h) {
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = `repeat(${w}, 16px)`;
  grid.style.gridTemplateRows = `repeat(${h}, 16px)`;

  for (let i = 0; i < w * h; i++) {
    const pixel = document.createElement("div");
    pixel.className = "pixel";
    pixel.draggable = false

    pixel.addEventListener("mousedown", (e) => {
      e.preventDefault();
      pixel.classList.add("black");
    });

    pixel.addEventListener("mouseover", () => {
      if (drawing) {
        pixel.classList.add("black");
      }
    });

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
