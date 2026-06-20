const menuButton = document.querySelector(".menu-button");
const drawer = document.querySelector(".drawer");
const searchForms = document.querySelectorAll("[data-search-form]");
const searchInputs = document.querySelectorAll("[data-search-input]");
const keywordButtons = document.querySelectorAll("[data-keyword]");
const searchableCards = document.querySelectorAll("[data-title]");
const header = document.querySelector(".site-header");
const headerSearch = document.querySelector(".header-search");
const headerSearchPanel = document.querySelector("#headerSearchPanel");
const headerSearchInput = document.querySelector("#headerArticleSearch");
const progress = document.querySelector(".scroll-progress");
const revealTargets = document.querySelectorAll(
  ".quick-links a, .section-heading, .article-card, .wide-card, .category-grid a, .career-list a"
);

function setDrawer(open) {
  drawer.classList.toggle("is-open", open);
  drawer.setAttribute("aria-hidden", String(!open));
  menuButton.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("menu-open", open);

  if (open) {
    setHeaderSearch(false);
  }
}

function setHeaderSearch(open) {
  headerSearchPanel.classList.toggle("is-open", open);
  headerSearchPanel.setAttribute("aria-hidden", String(!open));
  headerSearch.setAttribute("aria-expanded", String(open));

  if (open) {
    setDrawer(false);
    window.setTimeout(() => headerSearchInput.focus(), 120);
  }
}

function filterArticles(term) {
  const query = term.trim().toLowerCase();

  searchableCards.forEach((card) => {
    const text = `${card.dataset.title} ${card.dataset.category}`.toLowerCase();
    const isMatch = query.length === 0 || text.includes(query);

    card.hidden = !isMatch;
    card.classList.toggle("is-search-hit", query.length > 0 && isMatch);
  });

  keywordButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.keyword.toLowerCase() === query);
  });
}

function runSearch(term) {
  searchInputs.forEach((input) => {
    input.value = term;
  });

  filterArticles(term);
}

function updateScrollEffects() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progressValue = maxScroll > 0 ? window.scrollY / maxScroll : 0;

  progress.style.transform = `scaleX(${progressValue})`;
  header.classList.toggle("is-scrolled", window.scrollY > 24);
}

menuButton.addEventListener("click", () => {
  setDrawer(!drawer.classList.contains("is-open"));
});

drawer.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    setDrawer(false);
  }
});

headerSearch.addEventListener("click", () => {
  setHeaderSearch(!headerSearchPanel.classList.contains("is-open"));
});

searchForms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = form.querySelector("[data-search-input]");
    runSearch(input.value);
  });
});

searchInputs.forEach((input) => {
  input.addEventListener("input", () => {
    runSearch(input.value);
  });
});

keywordButtons.forEach((button) => {
  button.addEventListener("click", () => {
    runSearch(button.dataset.keyword);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setHeaderSearch(false);
    setDrawer(false);
  }
});

revealTargets.forEach((target, index) => {
  target.classList.add("reveal");
  target.style.transitionDelay = `${Math.min(index * 35, 220)}ms`;
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealTargets.forEach((target) => revealObserver.observe(target));
window.addEventListener("scroll", updateScrollEffects, { passive: true });
updateScrollEffects();
