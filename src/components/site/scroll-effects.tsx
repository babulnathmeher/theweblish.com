"use client";

import { useEffect } from "react";
import { ReactLenis } from "lenis/react";

const revealSelector = [
  ".site-section .section-heading",
  ".site-section .service-card",
  ".site-section .service-topic-card",
  ".site-section .services-next-step > *",
  ".site-section .info-card",
  ".site-section .feature-item",
  ".site-section .step",
  ".site-section .statement-panel",
  ".site-section .about-intro-grid > *",
  ".site-section .about-principle",
  ".site-section .clients-story-card",
  ".site-section .clients-story-link",
  ".site-section .detail-list > div",
  ".site-section .faq-list details",
  ".site-section .site-form",
  ".site-section .quiet-note",
  ".contact-form-intro > *",
  ".contact-form-panel",
  ".site-section .cta-grid > *",
  ".journal-section .journal-card",
  ".journal-listing-section .journal-card",
  ".journal-section .journal-empty",
  ".journal-listing-section .journal-empty",
  ".journal-listing-head",
  ".article-shell > :not(.markdown-body)",
  ".markdown-body > *",
  ".site-footer .footer-top > *",
  ".site-footer .footer-grid > div",
  ".site-footer .footer-bottom",
].join(", ");

export function ScrollEffects() {
  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | null = null;
    let mutations: MutationObserver | null = null;
    let scanFrame = 0;
    let progressFrame = 0;
    let observed = new WeakSet<HTMLElement>();
    const revealed = new WeakSet<HTMLElement>();
    const runningAnimations = new Set<Animation>();
    const footerOffsets = { orbit: Number.NaN, grid: Number.NaN, glow: Number.NaN, type: Number.NaN };
    let ctaOffset = Number.NaN;

    function reveal(element: Element) {
      const target = element as HTMLElement;
      if (!observer || motionPreference.matches || revealed.has(target)) return;
      revealed.add(target);
      observer?.unobserve(element);
      if (typeof target.animate !== "function") return;
      const siblings = target.parentElement?.children;
      const index = siblings ? Array.prototype.indexOf.call(siblings, target) : 0;
      const delay = Math.min(index % 4, 3) * 85;
      const animation = target.animate(
        [
          { opacity: 0, transform: "translate3d(0, 36px, 0)" },
          { opacity: 1, transform: "translate3d(0, 0, 0)" },
        ],
        { duration: 850, delay, easing: "cubic-bezier(.22, 1, .36, 1)", fill: "both" },
      );
      runningAnimations.add(animation);
      animation.onfinish = () => {
        runningAnimations.delete(animation);
        animation.cancel();
      };
    }

    function scan() {
      scanFrame = 0;
      if (!observer || motionPreference.matches) return;
      document.querySelectorAll<HTMLElement>(revealSelector).forEach((element) => {
        if (observed.has(element)) return;
        observed.add(element);
        const box = element.getBoundingClientRect();
        if (box.bottom <= 0) return;
        observer?.observe(element);
      });
    }

    function scheduleScan() {
      if (!scanFrame) scanFrame = requestAnimationFrame(scan);
    }

    function stopMotion() {
      cancelAnimationFrame(scanFrame);
      scanFrame = 0;
      observer?.disconnect();
      mutations?.disconnect();
      observer = null;
      mutations = null;
      runningAnimations.forEach((animation) => animation.cancel());
      runningAnimations.clear();
      observed = new WeakSet<HTMLElement>();
    }

    function startMotion() {
      if (motionPreference.matches || !window.IntersectionObserver) return;
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) requestAnimationFrame(() => reveal(entry.target));
        });
      }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
      scan();
      mutations = new MutationObserver(() => { scheduleScan(); scheduleProgress(); });
      mutations.observe(document.body, { childList: true, subtree: true });
    }

    function updateProgress() {
      progressFrame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      document.documentElement.style.setProperty("--page-scroll-progress", String(progress));
      const footer = document.querySelector<HTMLElement>(".site-footer");
      const main = document.getElementById("main-content");
      if (footer && main) {
        const footerNeedsNormalFlow = motionPreference.matches || window.innerWidth <= 760 || footer.offsetHeight > window.innerHeight + 1;
        document.documentElement.classList.toggle("footer-static", footerNeedsNormalFlow);
        const footerTop = footer.getBoundingClientRect().top;
        const revealDistance = footer.offsetHeight;
        const reveal = Math.min(1, Math.max(0, (window.innerHeight - (footerNeedsNormalFlow ? footerTop : main.getBoundingClientRect().bottom)) / Math.max(revealDistance, 1)));
        const motionScale = motionPreference.matches ? 0 : window.innerWidth <= 760 ? 0.55 : 1;
        const nextOrbit = Math.round((140 - reveal * 180) * motionScale);
        const nextGrid = Math.round((45 - reveal * 80) * motionScale);
        const nextGlow = Math.round((-60 + reveal * 120) * motionScale);
        const nextType = motionPreference.matches ? 0 : Math.round(window.innerWidth <= 760 ? 80 - reveal * 130 : 150 - reveal * 250);
        if (nextOrbit !== footerOffsets.orbit) { document.documentElement.style.setProperty("--footer-orbit-offset", `${nextOrbit}px`); footerOffsets.orbit = nextOrbit; }
        if (nextGrid !== footerOffsets.grid) { document.documentElement.style.setProperty("--footer-grid-offset", `${nextGrid}px`); footerOffsets.grid = nextGrid; }
        if (nextGlow !== footerOffsets.glow) { document.documentElement.style.setProperty("--footer-glow-offset", `${nextGlow}px`); footerOffsets.glow = nextGlow; }
        if (nextType !== footerOffsets.type) { document.documentElement.style.setProperty("--footer-type-offset", `${nextType}px`); footerOffsets.type = nextType; }
      }
      document.querySelectorAll<HTMLElement>(".cta-section").forEach((cta) => {
        const box = cta.getBoundingClientRect();
        if (box.bottom < 0 || box.top > window.innerHeight) return;
        const position = Math.min(1, Math.max(0, (window.innerHeight - box.top) / (window.innerHeight + box.height)));
        const nextOffset = motionPreference.matches ? 0 : Math.round((0.5 - position) * (window.innerWidth <= 760 ? 50 : 100));
        if (nextOffset !== ctaOffset) {
          document.documentElement.style.setProperty("--cta-parallax-offset", `${nextOffset}px`);
          ctaOffset = nextOffset;
        }
      });
    }

    function scheduleProgress() {
      if (!progressFrame) progressFrame = requestAnimationFrame(updateProgress);
    }

    function onPreferenceChange() {
      stopMotion();
      startMotion();
      scheduleProgress();
    }

    startMotion();
    updateProgress();
    motionPreference.addEventListener("change", onPreferenceChange);
    window.addEventListener("scroll", scheduleProgress, { passive: true });
    window.addEventListener("resize", scheduleProgress);
    return () => {
      stopMotion();
      cancelAnimationFrame(scanFrame);
      cancelAnimationFrame(progressFrame);
      motionPreference.removeEventListener("change", onPreferenceChange);
      window.removeEventListener("scroll", scheduleProgress);
      window.removeEventListener("resize", scheduleProgress);
    };
  }, []);

  return <><ReactLenis root options={{ lerp: 0.12, smoothWheel: true, syncTouch: false, anchors: true, stopInertiaOnNavigate: true }} /><div className="scroll-progress" aria-hidden="true" /></>;
}
