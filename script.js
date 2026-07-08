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
const articleIndexFilters = document.querySelectorAll("[data-filter]");
const articleIndexCards = document.querySelectorAll("[data-index-category]");
const progress = document.querySelector(".scroll-progress");
const bachelorSimulator = document.querySelector("[data-bachelor-simulator]");
const revealTargets = document.querySelectorAll(
  ".quick-links a, .section-heading, .article-card, .wide-card, .category-grid a, .career-list a, .section-action"
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

function normalizeSearchText(text) {
  return String(text || "").trim().toLowerCase();
}

function getArticlesIndexPath() {
  return window.location.pathname.includes("/articles/")
    ? "./index.html"
    : "./articles/index.html";
}

function getArticleHref(href) {
  if (!href) {
    return "";
  }

  if (href.startsWith("http")) {
    return href;
  }

  if (href.startsWith("./")) {
    return window.location.pathname.includes("/articles/")
      ? href
      : `./articles/${href.slice(2)}`;
  }

  return href;
}

function getCardSearchText(card) {
  return normalizeSearchText(
    [
      card.dataset.title,
      card.dataset.category,
      card.textContent
    ].join(" ")
  );
}

function scoreSearchResult(card, terms) {
  const searchText = getCardSearchText(card);
  const titleText = normalizeSearchText(card.dataset.title);
  const categoryText = normalizeSearchText(card.dataset.category);

  return terms.reduce((score, term) => {
    if (!term) {
      return score;
    }

    if (titleText.includes(term)) {
      score += 5;
    }

    if (categoryText.includes(term)) {
      score += 3;
    }

    if (searchText.includes(term)) {
      score += 1;
    }

    return score;
  }, 0);
}

async function getSearchableArticleCards() {
  if (articleIndexCards.length) {
    return Array.from(articleIndexCards);
  }

  try {
    const response = await fetch(getArticlesIndexPath());
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    return Array.from(doc.querySelectorAll("[data-title]"));
  } catch (error) {
    return Array.from(searchableCards);
  }
}

async function navigateToSearchResult(term) {
  const searchTerm = normalizeSearchText(term);

  if (!searchTerm) {
    window.location.href = getArticlesIndexPath();
    return;
  }

  const terms = searchTerm.split(/\s+/).filter(Boolean);
  const cards = await getSearchableArticleCards();
  const bestMatch = cards
    .map((card) => ({
      card,
      score: scoreSearchResult(card, terms)
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)[0];

  if (bestMatch) {
    const href = bestMatch.card.getAttribute("href");
    window.location.href = getArticleHref(href);
    return;
  }

  window.location.href = `${getArticlesIndexPath()}?q=${encodeURIComponent(searchTerm)}`;
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

function setArticleIndexFilter(filter, updateHash = true) {
  if (!articleIndexFilters.length || !articleIndexCards.length) {
    return;
  }

  const activeFilter = filter || "all";

  articleIndexFilters.forEach((link) => {
    const isActive = link.dataset.filter === activeFilter;
    link.setAttribute("aria-current", String(isActive));
  });

  let firstVisibleCard = null;

  articleIndexCards.forEach((card) => {
    const matches = activeFilter === "all" || card.dataset.indexCategory === activeFilter;
    card.hidden = !matches;
    card.classList.remove("is-index-featured");

    if (matches && !firstVisibleCard) {
      firstVisibleCard = card;
    }
  });

  firstVisibleCard?.classList.add("is-index-featured");

  if (updateHash) {
    history.replaceState(null, "", `#${activeFilter}`);
  }
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
    navigateToSearchResult(input.value);
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
    navigateToSearchResult(button.dataset.keyword);
  });
});

articleIndexFilters.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    setArticleIndexFilter(link.dataset.filter);
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

if (bachelorSimulator) {
  const costInput = bachelorSimulator.querySelector("[data-sim-cost]");
  const monthlyInput = bachelorSimulator.querySelector("[data-sim-monthly]");
  const bonusInput = bachelorSimulator.querySelector("[data-sim-bonus]");
  const lossInput = bachelorSimulator.querySelector("[data-sim-loss]");
  const result = bachelorSimulator.querySelector("[data-sim-result]");
  const detail = bachelorSimulator.querySelector("[data-sim-detail]");
  const formatter = new Intl.NumberFormat("ja-JP");

  function getNumber(input) {
    return Math.max(Number(input.value) || 0, 0);
  }

  function updateBachelorSimulator() {
    const cost = getNumber(costInput);
    const monthlyIncrease = getNumber(monthlyInput);
    const bonusIncrease = getNumber(bonusInput);
    const incomeLoss = getNumber(lossInput);
    const annualIncrease = monthlyIncrease * 12 + bonusIncrease - incomeLoss;

    if (annualIncrease <= 0) {
      result.textContent = "給与だけでは回収できません";
      detail.textContent = `年間の収入増は${formatter.format(annualIncrease)}円です。キャリア価値も含めて考えましょう。`;
      return;
    }

    const years = cost / annualIncrease;
    result.textContent = `約${years.toFixed(1)}年`;
    detail.textContent = `年間の収入増は${formatter.format(annualIncrease)}円です。`;
  }

  [costInput, monthlyInput, bonusInput, lossInput].forEach((input) => {
    input.addEventListener("input", updateBachelorSimulator);
  });

  updateBachelorSimulator();
}

window.addEventListener("scroll", updateScrollEffects, { passive: true });
window.addEventListener("hashchange", () => {
  setArticleIndexFilter(window.location.hash.replace("#", ""), false);
});
setArticleIndexFilter(window.location.hash.replace("#", ""), false);
updateScrollEffects();
