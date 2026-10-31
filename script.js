document.querySelectorAll("[data-print]").forEach((button) => {
  button.addEventListener("click", () => window.print());
});

const habitatHotspots = [...document.querySelectorAll(".habitat-hotspot")];
const habitatTitle = document.querySelector("[data-habitat-title]");
const habitatCopy = document.querySelector("[data-habitat-copy]");
const habitatNumber = document.querySelector("[data-habitat-number]");
let selectedHabitatHotspot = habitatHotspots.find((hotspot) => hotspot.getAttribute("aria-pressed") === "true");

function showHabitatDetail(hotspot) {
  habitatTitle.textContent = hotspot.dataset.title;
  habitatCopy.textContent = hotspot.dataset.copy;
  habitatNumber.textContent = hotspot.querySelector("span").textContent;
}

function restoreHabitatDetail() {
  if (selectedHabitatHotspot) showHabitatDetail(selectedHabitatHotspot);
}

habitatHotspots.forEach((hotspot) => {
  hotspot.addEventListener("pointerenter", () => showHabitatDetail(hotspot));
  hotspot.addEventListener("pointerleave", restoreHabitatDetail);
  hotspot.addEventListener("focus", () => showHabitatDetail(hotspot));
  hotspot.addEventListener("blur", restoreHabitatDetail);
  hotspot.addEventListener("click", () => {
    selectedHabitatHotspot = hotspot;
    habitatHotspots.forEach((item) => item.setAttribute("aria-pressed", String(item === hotspot)));
    showHabitatDetail(hotspot);
  });
});
