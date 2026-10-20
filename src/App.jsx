import { useEffect } from "react";
import CatalogPage from "./pages/CatalogPage.jsx";
import DetailPage from "./pages/DetailPage.jsx";
import DownloadPage from "./pages/DownloadPage.jsx";
import RecentPage from "./pages/RecentPage.jsx";

function getPage(pathname) {
  if (pathname.endsWith("/detail.html")) return "detail";
  if (pathname.endsWith("/recent.html")) return "recent";
  if (pathname.endsWith("/watch.html")) return "download";
  return "catalog";
}

export default function App() {
  const page = getPage(window.location.pathname.toLowerCase());

  useEffect(() => {
    document.body.dataset.page = page;
    if (page === "detail") document.title = "Anime details — Kumo Anime";
    else if (page === "recent") document.title = "New Episodes — Kumo Anime";
    else if (page === "download") document.title = "Download episodes — Kumo Anime";
    else document.title = "Kumo — Your anime, your way";
  }, [page]);

  if (page === "detail") {
    return <DetailPage />;
  }
  if (page === "recent") {
    return <RecentPage />;
  }
  if (page === "download") {
    return <DownloadPage />;
  }
  return <CatalogPage />;
}
