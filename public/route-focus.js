const heading = document.querySelector("h1");
const announcer = document.querySelector("#route-announcer");

if (heading instanceof HTMLElement) {
  heading.tabIndex = -1;
  requestAnimationFrame(() => {
    heading.focus();
    if (announcer instanceof HTMLElement) {
      announcer.textContent = `${heading.textContent?.trim() || document.title} page loaded.`;
    }
  });
}
