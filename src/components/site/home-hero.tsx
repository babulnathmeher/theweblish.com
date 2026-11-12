import Link from "next/link";

export function HomeHero() {
  return <section className="home-hero" aria-labelledby="home-hero-title">
    <div className="site-container home-hero-inner">
      <div className="home-hero-copy">
        <p className="home-hero-kicker"><span aria-hidden="true" /> The Weblish / Digital agency</p>
        <h1 id="home-hero-title">Digital work.<br /><span>Clear purpose.</span><em>Better presence.</em></h1>
        <p className="home-hero-intro">We help businesses shape how they show up online through website development, visual identity, and digital marketing.</p>
        <div className="home-hero-actions"><Link href="/website-development/#quote" className="button button-yellow">Request a Website Quote <span aria-hidden="true">↗</span></Link><Link href="/digital-solution/" className="home-hero-text-link">Explore services <span aria-hidden="true">↘</span></Link></div>
        <div className="home-hero-copy-footer"><span>From the first brief to the finished launch.</span><span aria-hidden="true">↓</span></div>
      </div>

      <div className="home-hero-stage">
        <div className="home-hero-art" aria-hidden="true">
          <div className="home-art-chrome"><span className="home-art-dots"><i /><i /><i /></span><span>Selected website visual</span></div>
          <div className="home-art-screen">
            <span className="home-art-orbit home-art-orbit-one" /><span className="home-art-orbit home-art-orbit-two" />
            <span className="home-art-screen-top"><strong>GIET</strong><span>Education / Admissions</span></span>
            <strong className="home-art-title">Shape the future<br />you imagine.</strong>
            <span className="home-art-screen-bottom"><span>Explore admissions</span><span>↗</span></span>
          </div>
          <div className="home-art-caption"><span>Website design visual</span><strong>GIET</strong></div>
        </div>
      </div>
    </div>
    <div className="site-container home-hero-bottom">
      <div><span>Our focus</span><strong>Websites · Design · Marketing</strong></div>
      <div><span>Our approach</span><strong>Discover · Shape · Build</strong></div>
      <div><span>Selected work</span><Link href="/contact/">Ask about relevant projects <span aria-hidden="true">↗</span></Link></div>
    </div>
  </section>;
}
