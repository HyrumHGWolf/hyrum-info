/** Static site header — server-rendered for a fast first paint. */
export default function SiteHeader() {
  return (
    <header className="site-header">
      <span className="header-glow" aria-hidden="true" />
      <h1 className="name">Hyrum HG Wolf</h1>
      <p className="tagline">Cosmist &amp; Christian</p>
      <p className="sr-only">
        Official personal site of Hyrum HG Wolf, also known as Hyrum Wolf and
        Hyrum Graver — Cosmist and Christian. Work spanning cosmism,
        cryopreservation, Noah Cryotechnology, Cryopets, and frontier science.
      </p>
    </header>
  );
}
