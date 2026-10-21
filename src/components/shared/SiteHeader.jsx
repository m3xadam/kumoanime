import { useState } from "react";
import Brand from "./Brand.jsx";
import SearchBox from "./SearchBox.jsx";
import "./SiteHeader.css";

export function MainNavigation({ activePage = "", menuOpen = false, onNavigate }) {
  return (
    <nav id="main-navigation" className={`main-nav${menuOpen ? " is-open" : ""}`} aria-label="Main navigation">
      <a className={`nav-link${activePage === "home" ? " active" : ""}`} href="index.html#home" aria-current={activePage === "home" ? "page" : undefined} onClick={onNavigate}>Home</a>
      <a className={`nav-link${activePage === "discover" ? " active" : ""}`} href="index.html#anime-catalog" aria-current={activePage === "discover" ? "page" : undefined} onClick={onNavigate}>Discover</a>
      <a className={`nav-link${activePage === "series" ? " active" : ""}`} href="index.html#series" aria-current={activePage === "series" ? "page" : undefined} onClick={onNavigate}>Series</a>
      <a className={`nav-link${activePage === "new-episodes" ? " active" : ""}`} href="recent.html" aria-current={activePage === "new-episodes" ? "page" : undefined} onClick={onNavigate}>New Episodes</a>
    </nav>
  );
}

export default function SiteHeader({ activePage = "home" }) {
  const isEpisodesPage = activePage === "new-episodes";
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className={`site-header${isEpisodesPage ? " latest-header" : ""}`}>
      <Brand />
      <MainNavigation activePage={activePage} menuOpen={menuOpen} onNavigate={() => setMenuOpen(false)} />
      <div className="header-actions">
        <button className="mobile-nav-toggle" type="button" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen
            ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
            : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>}
        </button>
        <SearchBox latest={isEpisodesPage} />
      </div>
      <div className={`mobile-nav-backdrop${menuOpen ? " is-open" : ""}`} aria-hidden="true" onClick={() => setMenuOpen(false)} />
    </header>
  );
}
