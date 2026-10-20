import { useEffect, useRef, useState } from "react";
import { animePage, animeTitle } from "../../api/anilist.js";
import "./SearchBox.css";

export default function SearchBox({ latest = false }) {
  const inputId = latest ? "latest-search" : "search-input";
  const toggleId = latest ? "latest-search-toggle" : "search-toggle";
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const boxRef = useRef(null);
  const requestId = useRef(0);
  const activeOptionId = `anime-search-option-${latest ? "latest" : "catalog"}-${activeIndex}`;

  useEffect(() => {
    const term = query.trim();
    const currentRequest = ++requestId.current;
    if (term.length < 3) {
      setSuggestions([]);
      setMessage("");
      setOpen(false);
      return undefined;
    }

    const timer = window.setTimeout(async () => {
      setMessage("Searching anime…");
      setOpen(true);
      try {
        const result = await animePage({ page: 1, perPage: 7, search: term });
        if (currentRequest !== requestId.current) return;
        setSuggestions(result.data || []);
        setMessage(result.data?.length ? "" : "No anime found. Try another title.");
      } catch (error) {
        if (currentRequest !== requestId.current) return;
        setSuggestions([]);
        setMessage(`Anime search failed. ${error.message}`);
        console.error("AniList search suggestions failed:", error);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const onDocumentClick = (event) => {
      if (!boxRef.current?.contains(event.target)) setOpen(false);
    };
    const onDocumentKeyDown = (event) => {
      if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
        event.preventDefault();
        boxRef.current?.querySelector("input")?.focus();
        setOpen(Boolean(query.trim()));
      }
    };
    document.addEventListener("click", onDocumentClick);
    document.addEventListener("keydown", onDocumentKeyDown);
    return () => {
      document.removeEventListener("click", onDocumentClick);
      document.removeEventListener("keydown", onDocumentKeyDown);
    };
  }, [query]);

  function toggleSearch() {
    const box = boxRef.current;
    if (window.matchMedia("(max-width: 650px)").matches && box.classList.contains("is-open")) {
      box.classList.remove("is-open");
      setOpen(false);
      box.querySelector("input")?.blur();
      return;
    }
    box.classList.add("is-open");
    box.querySelector("input")?.focus();
  }

  function handleKeyDown(event) {
    if (event.key === "ArrowDown" && open && suggestions.length > 0) {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === "ArrowUp" && open && suggestions.length > 0) {
      event.preventDefault();
      setActiveIndex((current) => current < 0 ? suggestions.length - 1 : (current - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === "Enter" && activeIndex >= 0 && suggestions[activeIndex]) {
      event.preventDefault();
      window.location.href = `detail.html?anilist=${encodeURIComponent(suggestions[activeIndex].id)}`;
    } else if (event.key === "Escape") {
      setOpen(false);
      if (window.matchMedia("(max-width: 650px)").matches) {
        boxRef.current.classList.remove("is-open");
        boxRef.current.querySelector("input")?.blur();
        boxRef.current.querySelector("button")?.focus();
      }
    }
  }

  return (
    <div className="search-box" ref={boxRef}>
      <button className="search-toggle" id={toggleId} type="button" aria-label="Open anime search" aria-expanded={open} aria-controls={inputId} onClick={toggleSearch}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m16 16 4 4" />
        </svg>
      </button>
      <input id={inputId} type="search" placeholder="Search anime..." autoComplete="off" role="combobox" aria-autocomplete="list" aria-controls="anime-search-suggestions" aria-expanded={open} aria-activedescendant={activeIndex >= 0 ? activeOptionId : undefined} value={query} onChange={(event) => { setQuery(event.target.value); setActiveIndex(-1); setOpen(event.target.value.trim().length >= 3); }} onKeyDown={handleKeyDown} />
      <kbd>/</kbd>
      <div className="search-suggestions" id="anime-search-suggestions" role="listbox" aria-label="Anime search results" hidden={!open}>
        {message && <p className="search-suggestion-message">{message}</p>}
        {suggestions.map((item, index) => (
          <a key={item.id} id={`anime-search-option-${latest ? "latest" : "catalog"}-${index}`} className={`search-suggestion${activeIndex === index ? " is-active" : ""}`} role="option" aria-selected={activeIndex === index} href={`detail.html?anilist=${encodeURIComponent(item.id)}`} aria-label={`View ${animeTitle(item)} details`} onMouseEnter={() => setActiveIndex(index)}>
            {(item.coverImage?.large || item.coverImage?.extraLarge) && <img className="search-suggestion-cover" alt="" loading="lazy" src={item.coverImage.large || item.coverImage.extraLarge} />}
            <span className="search-suggestion-copy">
              <strong>{animeTitle(item)}</strong>
              <small>{[item.format?.replaceAll("_", " "), item.seasonYear || item.startDate?.year, item.episodes ? `${item.episodes} episodes` : "", item.averageScore ? `★ ${(item.averageScore / 10).toFixed(1)}` : ""].filter(Boolean).join(" · ") || "Anime details"}</small>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
