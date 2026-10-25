// Portfolio content is deliberately kept in one place for easy editing.
// Set the optional contact fields to your real values before publishing.
const CONFIG = {
  github: "https://github.com/nurkaje",
  email: "nurkiceldin1@gmail.com",
  linkedin: "https://www.linkedin.com/in/nurkiceldin/"
};

// Featured order is intentional: Asteriva first, Ludo Club second.
// Add another object to this array to add a new project.
const PROJECTS = [
  {
    id: "asteriva", title: "Asteriva", category: "ANDROID · ASTRONOMY",
    short: "An Android app that turns a date, time and location into a personalized night-sky poster.",
    intro: "A personalized night-sky experience, built as a mobile application.",
    what: "Asteriva allows users to create a unique poster of the night sky for a selected place and moment. It combines a mobile interface with astronomy-based processing.",
    role: "I designed and developed the Android experience and worked on the connection to the Python/FastAPI poster-generation backend.",
    technical: "Kotlin and Jetpack Compose on Android, with Python/FastAPI for generation and astronomy libraries for sky data. One challenge was handling location, dates and time zones consistently.",
    tags: ["Kotlin", "Jetpack Compose", "Python", "FastAPI"],
    github: "", // Private? Keep empty unless you make a repository public.
    demo: "",   // Provide a URL if you publish a demo.
    art: "astronomy"
  },
  {
    id: "ludo", title: "Ludo Club", category: "WEB GAME · JAVASCRIPT",
    short: "A browser-based Ludo game designed with mobile-friendly interactions and game logic.",
    intro: "A small browser game focused on a clear interface and playable rules.",
    what: "Ludo Club is a web version of the board game, designed to be used on the same device with simple controls and visual feedback.",
    role: "I built and refined the game's interface and client-side interaction logic, focusing on how players move and interact with the board.",
    technical: "HTML, CSS and JavaScript. The game runs in a browser without a backend and uses responsive layout for mobile screens.",
    tags: ["HTML", "CSS", "JavaScript", "Mobile UI"],
    github: "https://github.com/nurkaje/nurkaje.github.io/blob/main/games/my_ludo_club.html",
    demo: "games/my_ludo_club.html",
    art: "ludo"
  }
];

const projectList = document.getElementById("projectList");
const dialog = document.getElementById("projectDialog");
const closeDialog = document.getElementById("closeDialog");

function element(tag, className, value) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (value !== undefined) el.textContent = value;
  return el;
}
function makeLink(label, url, primary = false) {
  const a = element("a", `btn ${primary ? "btn-primary" : "btn-secondary"}`, label);
  a.href = url;
  if (!url.startsWith("#") && !url.startsWith("mailto:")) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
  return a;
}
function artwork(kind) {
  const wrapper = element("div", `project-art ${kind}`);
  if (kind === "astronomy") {
    const sky = element("div", "sky-art");
    const ring = element("div", "sky-ring sky-ring-one");
    const ring2 = element("div", "sky-ring sky-ring-two");
    const title = element("span", "art-asteriva", "ASTERIVA");
    const caption = element("span", "art-caption", "THE NIGHT SKY · REIMAGINED");
    sky.append(ring, ring2, title, caption); wrapper.append(sky);
  } else {
    const board = element("div", "ludo-board");
    for (let n=0;n<4;n++) board.append(document.createElement("span"));
    wrapper.append(board);
  }
  return wrapper;
}

for (const project of PROJECTS) {
  const tile = element("article", "project-tile");
  tile.append(artwork(project.art));
  tile.append(element("span", "project-kicker", project.category));
  tile.append(element("h3", "", project.title));
  tile.append(element("p", "", project.short));
  const tags = element("div", "tags");
  project.tags.forEach(t => tags.append(element("span", "tag", t)));
  tile.append(tags);
  const buttons = element("div", "project-actions");
  const story = element("button", "btn btn-primary", "Read the story ↗");
  story.type = "button"; story.addEventListener("click", () => openProject(project.id));
  buttons.append(story);
  if (project.id === "asteriva") {
    const tryButton = element("button", "btn btn-secondary mode-interactive", "Try design demo ↗");
    tryButton.type = "button"; tryButton.hidden = true;
    tryButton.addEventListener("click", () => window.openAsterivaLab && window.openAsterivaLab());
    buttons.append(tryButton);
  }
  if (project.demo) buttons.append(makeLink("Play Ludo Club ↗", project.demo));
  tile.append(buttons);
  projectList.append(tile);
}

function openProject(id) {
  const p = PROJECTS.find(item => item.id === id);
  if (!p) return;
  document.getElementById("dialogCategory").textContent = p.category;
  document.getElementById("dialogTitle").textContent = p.title;
  document.getElementById("dialogIntro").textContent = p.intro;
  document.getElementById("dialogWhat").textContent = p.what;
  document.getElementById("dialogRole").textContent = p.role;
  document.getElementById("dialogTech").textContent = p.technical;
  const tags = document.getElementById("dialogTags"); tags.replaceChildren();
  p.tags.forEach(tag => tags.append(element("span", "tag", tag)));
  const links = document.getElementById("dialogLinks"); links.replaceChildren();
  if (p.demo) links.append(makeLink("Open live demo ↗", p.demo, true));
  if (p.github) links.append(makeLink("View source on GitHub ↗", p.github));
  if (!p.demo && !p.github) links.append(element("span", "contact-note", "More details and screenshots can be shared on request."));
  if (!dialog.open) dialog.showModal();
}

document.querySelectorAll("[data-project]").forEach(button => {
  button.addEventListener("click", () => openProject(button.dataset.project));
});
closeDialog.addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });

// Public contact shortcuts appear below the location note, in this order.
const miniLinks = document.getElementById("contactMiniLinks");
const contactLinks = [
  { label: "GitHub ↗", url: CONFIG.github?.trim() || "" },
  { label: "LinkedIn ↗", url: CONFIG.linkedin?.trim() || "" },
  { label: "Email ↗", url: CONFIG.email?.trim() ? `mailto:${CONFIG.email.trim()}` : "" }
];
for (const { label, url } of contactLinks) {
  if (!url) continue;
  const link = element("a", "", label);
  link.href = url;
  if (!url.startsWith("mailto:")) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
  miniLinks.append(link);
}
miniLinks.hidden = miniLinks.children.length === 0;
document.getElementById("year").textContent = String(new Date().getFullYear());

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
    });
  }, {threshold: .08});
  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
} else { document.querySelectorAll(".reveal").forEach(el => el.classList.add("visible")); }
