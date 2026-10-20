import Brand from "./Brand.jsx";
import SearchBox from "./SearchBox.jsx";
import "./SiteHeader.css";

export function MainNavigation({ activePage = "" }) {
  return (
    <nav className="main-nav" aria-label="Main navigation">
      <a className={`nav-link${activePage === "home" ? " active" : ""}`} href="index.html#home" aria-current={activePage === "home" ? "page" : undefined}>Home</a>
      <a className={`nav-link${activePage === "discover" ? " active" : ""}`} href="index.html#anime-catalog" aria-current={activePage === "discover" ? "page" : undefined}>Discover</a>
      <a className={`nav-link${activePage === "series" ? " active" : ""}`} href="index.html#series" aria-current={activePage === "series" ? "page" : undefined}>Series</a>
      <a className={`nav-link${activePage === "new-episodes" ? " active" : ""}`} href="recent.html" aria-current={activePage === "new-episodes" ? "page" : undefined}>New Episodes</a>
    </nav>
  );
}

export default function SiteHeader({ activePage = "home" }) {
  const isEpisodesPage = activePage === "new-episodes";
  return (
    <header className={`site-header${isEpisodesPage ? " latest-header" : ""}`}>
      <Brand />
      <MainNavigation activePage={activePage} />
      <div className="header-actions"><SearchBox latest={isEpisodesPage} /></div>
    </header>
  );
}
