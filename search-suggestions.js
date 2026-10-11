(() => {
  const MIN_QUERY_LENGTH = 3;
  const MAX_RESULTS = 7;

  function animeTitle(item) {
    return item.title?.english || item.title?.romaji || item.title?.native || "Untitled anime";
  }

  function createSuggestion(item) {
    const option = document.createElement("a");
    option.className = "search-suggestion";
    option.role = "option";
    option.href = `detail.html?anilist=${encodeURIComponent(item.id)}`;
    option.setAttribute("aria-label", `View ${animeTitle(item)} details`);

    const image = document.createElement("img");
    image.className = "search-suggestion-cover";
    image.alt = "";
    image.loading = "lazy";
    image.src = item.coverImage?.large || item.coverImage?.extraLarge || "";
    image.addEventListener("error", () => image.remove(), { once: true });

    const copy = document.createElement("span");
    copy.className = "search-suggestion-copy";
    const title = document.createElement("strong");
    title.textContent = animeTitle(item);
    const details = document.createElement("small");
    details.textContent = [
      item.format?.replaceAll("_", " "),
      item.seasonYear || item.startDate?.year,
      item.episodes ? `${item.episodes} episodes` : "",
      item.averageScore ? `★ ${(item.averageScore / 10).toFixed(1)}` : "",
    ].filter(Boolean).join(" · ") || "Anime details";
    copy.append(title, details);
    option.append(image, copy);
    return option;
  }

  function initAnimeSearch(inputId, toggleId) {
    const input = document.querySelector(`#${inputId}`);
    const box = input.closest(".search-box");
    const toggle = document.querySelector(`#${toggleId}`);
    const suggestions = box.querySelector(".search-suggestions");
    let debounceTimer;
    let requestId = 0;
    let activeIndex = -1;

    function closeSuggestions() {
      suggestions.hidden = true;
      input.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant");
      activeIndex = -1;
    }

    function setActiveOption(index) {
      const options = [...suggestions.querySelectorAll('[role="option"]')];
      if (!options.length) return;
      activeIndex = (index + options.length) % options.length;
      options.forEach((option, optionIndex) => {
        option.classList.toggle("is-active", optionIndex === activeIndex);
        option.setAttribute("aria-selected", String(optionIndex === activeIndex));
      });
      input.setAttribute("aria-activedescendant", options[activeIndex].id);
      options[activeIndex].scrollIntoView({ block: "nearest" });
    }

    function openSearch() {
      box.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      input.focus();
    }

    async function searchAnime(term, currentRequest) {
      suggestions.replaceChildren();
      const message = document.createElement("p");
      message.className = "search-suggestion-message";
      if (term.length < MIN_QUERY_LENGTH) {
        closeSuggestions();
        return;
      }

      message.textContent = "Searching anime…";
      suggestions.append(message);
      suggestions.hidden = false;
      input.setAttribute("aria-expanded", "true");
      try {
        const result = await window.AniList.animePage({ page: 1, perPage: MAX_RESULTS, search: term });
        if (currentRequest !== requestId || input.value.trim() !== term) return;
        const items = result.data || [];
        suggestions.replaceChildren();
        if (!items.length) {
          message.textContent = "No anime found. Try another title.";
          suggestions.append(message);
        } else {
          suggestions.append(...items.map((item, index) => {
            const option = createSuggestion(item);
            option.id = `anime-search-option-${index}`;
            return option;
          }));
        }
        suggestions.hidden = false;
        input.setAttribute("aria-expanded", "true");
      } catch (error) {
        if (currentRequest !== requestId) return;
        message.textContent = `Anime search failed. ${error.message}`;
        suggestions.replaceChildren(message);
        suggestions.hidden = false;
        input.setAttribute("aria-expanded", "true");
        console.error("AniList search suggestions failed:", error);
      }
    }

    toggle.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 650px)").matches && box.classList.contains("is-open")) {
        box.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        closeSuggestions();
        input.blur();
        return;
      }
      openSearch();
    });

    input.addEventListener("input", () => {
      const term = input.value.trim();
      const currentRequest = ++requestId;
      activeIndex = -1;
      clearTimeout(debounceTimer);
      if (term.length < MIN_QUERY_LENGTH) {
        closeSuggestions();
        suggestions.replaceChildren();
        return;
      }
      debounceTimer = setTimeout(() => searchAnime(term, currentRequest), 350);
    });

    input.addEventListener("keydown", (event) => {
      const options = suggestions.querySelectorAll('[role="option"]');
      if (event.key === "ArrowDown" && !suggestions.hidden) {
        event.preventDefault();
        setActiveOption(activeIndex + 1);
      } else if (event.key === "ArrowUp" && !suggestions.hidden) {
        event.preventDefault();
        setActiveOption(activeIndex < 0 ? options.length - 1 : activeIndex - 1);
      } else if (event.key === "Enter" && activeIndex >= 0 && options[activeIndex]) {
        event.preventDefault();
        window.location.href = options[activeIndex].href;
      } else if (event.key === "Escape") {
        closeSuggestions();
        if (window.matchMedia("(max-width: 650px)").matches) {
          box.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
          input.blur();
          toggle.focus();
        }
      }
    });

    document.addEventListener("click", (event) => {
      if (!box.contains(event.target)) closeSuggestions();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
        event.preventDefault();
        openSearch();
      }
    });
  }

  window.initAnimeSearch = initAnimeSearch;
})();
