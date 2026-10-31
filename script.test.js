const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { runInNewContext } = require("node:vm");

function setup() {
  const markup = readFileSync(join(__dirname, "index.html"), "utf8");
  const buttons = [...markup.matchAll(/<button type="button" data-feature="([^"]+)" aria-pressed="([^"]+)" aria-controls="habitat-detail" data-title="([^"]+)" data-copy="([^"]+)"><span>(\d+)<\/span>/g)].map((match) => {
    const handlers = {};
    return {
      dataset: { feature: match[1], title: match[3], copy: match[4] },
      pressed: match[2],
      addEventListener(event, handler) { handlers[event] = handler; },
      setAttribute(name, value) { assert.equal(name, "aria-pressed"); this.pressed = value; },
      getAttribute() { return this.pressed; },
      querySelector() { return { textContent: match[5] }; },
      fire(event, detail = {}) { handlers[event]?.(detail); },
    };
  });
  const parts = [...markup.matchAll(/<g data-feature="([^"]+)" class="diagram-part[^"]*">/g)].map((match) => {
    const handlers = {};
    return {
      dataset: { feature: match[1] },
      active: false,
      classList: { toggle(name, active) { assert.equal(name, "is-active"); this.owner.active = active; } },
      addEventListener(event, handler) { handlers[event] = handler; },
      fire(event, detail = {}) { handlers[event]?.(detail); },
    };
  });
  parts.forEach((part) => { part.classList.owner = part; });
  const title = {}, copy = {}, number = {};
  const explorer = {
    querySelectorAll(selector) { return selector === ".diagram-part" ? parts : buttons; },
    querySelector(selector) {
      return { "[data-habitat-title]": title, "[data-habitat-copy]": copy, "[data-habitat-number]": number }[selector];
    },
  };
  runInNewContext(readFileSync(join(__dirname, "script.js"), "utf8"), {
    document: { querySelectorAll(selector) { return selector === ".habitat-explorer" ? [explorer] : []; } },
  });
  return { buttons, parts, title, copy, number };
}

test("all ten labelled controls match illustration parts, with floor selected initially", () => {
  const { buttons, parts, title } = setup();
  assert.equal(buttons.length, 10);
  assert.equal(parts.length, 10);
  assert.deepEqual(buttons.map((b) => b.dataset.feature).sort(), parts.map((p) => p.dataset.feature).sort());
  assert.equal(title.textContent, "What lines the bottom?");
  assert.equal(parts.find((p) => p.active).dataset.feature, "floor");
});

test("hover, keyboard focus, and click keep artwork and explanation synchronized for every part", () => {
  const { buttons, parts, title, copy, number } = setup();
  for (const event of ["pointerenter", "focus", "click"]) {
    for (const button of buttons) {
      button.fire(event);
      assert.equal(title.textContent, button.dataset.title);
      assert.equal(copy.textContent, button.dataset.copy);
      assert.equal(number.textContent, button.querySelector("span").textContent);
      assert.equal(buttons.filter((b) => b.pressed === "true").length, 1);
      assert.equal(parts.filter((p) => p.active).length, 1);
      assert.equal(parts.find((p) => p.active).dataset.feature, button.dataset.feature);
    }
  }
});

test("the illustration itself responds to hover and tap; leaving does not reset the explanation", () => {
  const { buttons, parts, title } = setup();
  for (const part of parts) {
    for (const event of ["pointerenter", "click"]) {
      part.fire(event);
      part.fire("pointerleave");
      const button = buttons.find((b) => b.dataset.feature === part.dataset.feature);
      assert.equal(title.textContent, button.dataset.title);
      assert.equal(button.pressed, "true");
    }
  }
});

test("touch does not preview before a tap has completed", () => {
  const { buttons, title } = setup();
  buttons[0].fire("pointerenter", { pointerType: "touch" });
  assert.equal(title.textContent, "What lines the bottom?");
  buttons[0].fire("click");
  assert.equal(title.textContent, "Space and security");
});
