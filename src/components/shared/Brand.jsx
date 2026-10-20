import "./Brand.css";

export default function Brand({ href = "index.html", footer = false }) {
  return (
    <a className={`brand${footer ? " footer-brand" : ""}`} href={href} aria-label="Kumo Anime home">
      <span className="brand-mark" aria-hidden="true">K</span>
      <span>kumo anime</span>
    </a>
  );
}
