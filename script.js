const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a, .hero-actions a, .logo");
const popupTriggers = document.querySelectorAll("[data-popup-open], [data-open-overview]");
const popupCloseButtons = document.querySelectorAll("[data-popup-close], [data-close-overview]");
let lastFocusedElement = null;

function closeNavigation() {
  document.body.classList.remove("nav-open");
  navToggle?.setAttribute("aria-expanded", "false");
}

navToggle?.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetSelector = link.getAttribute("href");

    if (!targetSelector || !targetSelector.startsWith("#")) {
      return;
    }

    const target = document.querySelector(targetSelector);

    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    closeNavigation();
  });
});

function openPopup(popup, opener) {
  if (!popup) {
    return;
  }

  lastFocusedElement = opener || document.activeElement;
  popup.classList.add("is-open");
  popup.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  popup.querySelector("[data-popup-close], [data-close-overview], .overview-popup__close")?.focus();
}

function closePopup(popup) {
  if (!popup) {
    return;
  }

  popup.classList.remove("is-open");
  popup.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");

  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
    lastFocusedElement.focus();
  }
}

popupTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const popupId = trigger.dataset.popupOpen || trigger.getAttribute("aria-controls");
    openPopup(document.getElementById(popupId), trigger);
  });
});

popupCloseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    closePopup(button.closest("[role='dialog']"));
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNavigation();
    closePopup(document.querySelector("[role='dialog'].is-open"));
  }
});