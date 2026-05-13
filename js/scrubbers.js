export function updateScrubberDisplay(scrubberEl) {
  const fill = scrubberEl.querySelector(".res-scrubber-fill");
  const valueEl = scrubberEl.querySelector(".res-scrubber-value");
  const input = scrubberEl.querySelector(".res-scrubber-input");
  if (!fill || !valueEl || !input) return;
  const min = parseFloat(scrubberEl.dataset.min ?? 0);
  const max = parseFloat(scrubberEl.dataset.max ?? 1);
  const step = parseFloat(scrubberEl.dataset.step ?? 1);
  const val = parseFloat(input.value);
  if (!Number.isFinite(val)) return;
  fill.style.width = Math.max(0, Math.min(100, (val - min) / (max - min) * 100)) + "%";
  const dec = (String(step).split(".")[1] || "").length;
  valueEl.textContent = dec > 0 ? val.toFixed(Math.min(dec, 3)) : String(Math.round(val));
}

export function initScrubbers(container) {
  if (!container) return;
  Array.from(container.querySelectorAll(".res-scrubber")).forEach((scrubber) => {
    const input = scrubber.querySelector(".res-scrubber-input");
    if (!input) return;

    updateScrubberDisplay(scrubber);

    const min = parseFloat(scrubber.dataset.min ?? 0);
    const max = parseFloat(scrubber.dataset.max ?? 1);
    const step = parseFloat(scrubber.dataset.step ?? 1);

    function snapValue(raw) {
      const clamped = Math.max(min, Math.min(max, raw));
      const snapped = Math.round(clamped / step) * step;
      return parseFloat(snapped.toFixed(10));
    }

    function applyValue(newVal) {
      const snapped = snapValue(newVal);
      const asStr = String(snapped);
      if (input.value === asStr) return;
      input.value = asStr;
      updateScrubberDisplay(scrubber);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }

    let isDragging = false;
    let dragStartX = 0;
    let dragStartVal = 0;

    scrubber.addEventListener("pointerdown", (e) => {
      if (scrubber.classList.contains("editing")) return;
      e.preventDefault();
      const rect = scrubber.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      applyValue(min + pct * (max - min));
      isDragging = true;
      dragStartX = e.clientX;
      dragStartVal = parseFloat(input.value) || min;
      scrubber.setPointerCapture(e.pointerId);
      scrubber.classList.add("dragging");
    });

    scrubber.addEventListener("pointermove", (e) => {
      if (!isDragging) return;
      const rect = scrubber.getBoundingClientRect();
      applyValue(dragStartVal + (e.clientX - dragStartX) * (max - min) / Math.max(rect.width, 40));
    });

    scrubber.addEventListener("pointerup", () => {
      if (!isDragging) return;
      isDragging = false;
      scrubber.classList.remove("dragging");
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });

    scrubber.addEventListener("dblclick", () => {
      scrubber.classList.add("editing");
      input.style.display = "block";
      input.focus();
      input.select();
    });

    function exitEdit() {
      scrubber.classList.remove("editing");
      input.style.display = "";
      const parsed = parseFloat(input.value);
      if (Number.isFinite(parsed)) {
        input.value = String(snapValue(parsed));
        updateScrubberDisplay(scrubber);
      }
    }

    input.addEventListener("blur", exitEdit);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { exitEdit(); input.dispatchEvent(new Event("change", { bubbles: true })); }
      if (e.key === "Escape") exitEdit();
    });
  });
}
