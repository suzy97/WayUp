const screens = [
  { id: "welcome", label: "Intro" },
  { id: "goals", label: "Goals" },
  { id: "routine", label: "Routine" },
  { id: "home", label: "Home" },
  { id: "prompt", label: "Prompt" },
  { id: "recommend", label: "Recommend" },
  { id: "session", label: "Session" },
  { id: "reflection", label: "Reflection" },
  { id: "report", label: "Report" },
];

const screenContainer = document.getElementById("screen");
const jumpContainer = document.getElementById("screen-jumps");

function renderJumpChips(activeId) {
  jumpContainer.innerHTML = "";

  screens.forEach((screen) => {
    const button = document.createElement("button");
    button.className = `jump-chip${screen.id === activeId ? " active" : ""}`;
    button.textContent = screen.label;
    button.type = "button";
    button.addEventListener("click", () => renderScreen(screen.id));
    jumpContainer.appendChild(button);
  });
}

function wireScreenActions() {
  screenContainer.querySelectorAll("[data-next]").forEach((element) => {
    element.addEventListener("click", () => {
      renderScreen(element.dataset.next);
    });
  });

  screenContainer.querySelectorAll(".pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      pill.classList.toggle("selected");
    });
  });

  screenContainer.querySelectorAll(".emoji").forEach((emoji) => {
    emoji.addEventListener("click", () => {
      screenContainer.querySelectorAll(".emoji").forEach((item) => {
        item.classList.remove("active");
      });
      emoji.classList.add("active");
    });
  });

  screenContainer.querySelectorAll(".action-card").forEach((card) => {
    card.addEventListener("click", () => {
      const next = card.dataset.next;
      if (next) {
        renderScreen(next);
      }
    });
  });
}

function renderScreen(screenId) {
  const template = document.getElementById(`screen-${screenId}`);
  if (!template) {
    return;
  }

  screenContainer.innerHTML = "";
  screenContainer.appendChild(template.content.cloneNode(true));
  renderJumpChips(screenId);
  wireScreenActions();
}

renderScreen("welcome");
