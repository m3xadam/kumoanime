import Brand from "./Brand.jsx";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <Brand href="#home" footer />
      <p>Your next world is one episode away.</p>
      <span>© 2026 Kumo Anime. All rights reserved.</span>
    </footer>
  );
}
