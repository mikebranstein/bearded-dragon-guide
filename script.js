document.querySelectorAll("[data-print]").forEach((button) => {
  button.addEventListener("click", () => window.print());
});

document.querySelectorAll(".habitat-explorer").forEach((explorer) => {
  const buttons = [...explorer.querySelectorAll(".habitat-controls button")];
  const parts = [...explorer.querySelectorAll(".diagram-part")];
  const title = explorer.querySelector("[data-habitat-title]");
  const copy = explorer.querySelector("[data-habitat-copy]");
  const number = explorer.querySelector("[data-habitat-number]");

  function selectFeature(feature) {
    const button = buttons.find((item) => item.dataset.feature === feature);
    if (!button) throw new Error(`Unknown enclosure feature: ${feature}`);
    buttons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    parts.forEach((part) => part.classList.toggle("is-active", part.dataset.feature === feature));
    title.textContent = button.dataset.title;
    copy.textContent = button.dataset.copy;
    number.textContent = button.querySelector("span").textContent;
  }

  // Keep the last explored part visible so pointer exit cannot undo keyboard focus or a tap.
  [...buttons, ...parts].forEach((element) => {
    element.addEventListener("pointerenter", (event) => {
      if (event.pointerType !== "touch") selectFeature(element.dataset.feature);
    });
    element.addEventListener("click", () => selectFeature(element.dataset.feature));
  });
  buttons.forEach((button) => {
    button.addEventListener("focus", () => selectFeature(button.dataset.feature));
  });
  selectFeature(buttons.find((button) => button.getAttribute("aria-pressed") === "true").dataset.feature);
});
