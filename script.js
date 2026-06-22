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
  searchableCards.forEach((card) => {
    card.hidden = false;
    card.classList.remove("is-search-hit");
  });

  keywordButtons.forEach((button) => {
    button.classList.remove("is-active");
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

document.addEventListener("click", (event) => {
  const isDrawerOpen = drawer.classList.contains("is-open");
  const isMenuClick = menuButton.contains(event.target);
  const isDrawerClick = drawer.contains(event.target);
  const isSearchOpen = headerSearchPanel.classList.contains("is-open");
  const isSearchClick = headerSearch.contains(event.target);
  const isSearchPanelClick = headerSearchPanel.contains(event.target);

  if (isDrawerOpen && !isMenuClick && !isDrawerClick) {
    setDrawer(false);
  }

  if (isSearchOpen && !isSearchClick && !isSearchPanelClick) {
    setHeaderSearch(false);
  }
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

const hakenInputs = ["hakenWage", "hakenHours", "hakenDays", "hakenDeduct", "hakenNeed"]
  .map((id) => document.getElementById(id))
  .filter(Boolean);

if (hakenInputs.length) {
  const yenFormatter = new Intl.NumberFormat("ja-JP");
  const hakenGross = document.getElementById("hakenGross");
  const hakenNet = document.getElementById("hakenNet");
  const hakenBalance = document.getElementById("hakenBalance");
  const hakenSimNote = document.getElementById("hakenSimNote");

  function hakenValue(id) {
    return Number(document.getElementById(id)?.value || 0);
  }

  function updateHakenSimulation() {
    const gross = hakenValue("hakenWage") * hakenValue("hakenHours") * hakenValue("hakenDays") * 4.33;
    const net = gross * (1 - hakenValue("hakenDeduct") / 100);
    const balance = net - hakenValue("hakenNeed");

    hakenGross.textContent = `${yenFormatter.format(Math.round(gross))}円`;
    hakenNet.textContent = `${yenFormatter.format(Math.round(net))}円`;
    hakenBalance.textContent = `${balance >= 0 ? "+" : ""}${yenFormatter.format(Math.round(balance))}円`;
    hakenBalance.style.color = balance >= 0 ? "var(--primary-dark)" : "#b04453";

    if (balance >= 50000) {
      hakenSimNote.textContent = "この条件なら生活費を上回る見込みです。余った分を休養、貯金、学習費にどう回すか考えてみましょう。";
    } else if (balance >= 0) {
      hakenSimNote.textContent = "生活費には届く見込みです。ただし急な休みや契約終了に備えて、余白も考えておきましょう。";
    } else {
      hakenSimNote.textContent = "この条件だと、生活費に少し届きません。時給、勤務日数、生活費のどこを調整するか考えてみましょう。";
    }
  }

  hakenInputs.forEach((input) => input.addEventListener("input", updateHakenSimulation));
  updateHakenSimulation();
}
