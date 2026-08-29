import HeroSceneSlot from '../components/media/HeroSceneSlot.tsx'
import { useAssistantLauncher } from '../hooks/useAssistantLauncher.ts'

export default function HeroSection({ identity, cvPath }) {
  const openAssistant = useAssistantLauncher()

  return (
    <section id="top" className="portfolio-section hero-section" aria-labelledby="hero-title">
      <div className="page-frame hero-section__inner">
        <div className="hero-section__environment" aria-hidden="true">
          <svg
            className="hero-section__signal-map"
            viewBox="0 0 1200 700"
            preserveAspectRatio="none"
            focusable="false"
          >
            <path
              className="hero-section__trace hero-section__trace--cyan"
              pathLength="1"
              d="M 0 92 H 178 C 292 92 328 172 456 172 S 690 104 842 172 S 1048 232 1200 172"
            />
            <path
              className="hero-section__trace hero-section__trace--violet"
              pathLength="1"
              d="M 344 408 C 486 408 512 332 650 332 H 914 C 1034 332 1060 402 1200 402"
            />
            <path
              className="hero-section__trace hero-section__trace--quiet"
              pathLength="1"
              d="M 18 590 H 326 C 462 590 492 520 610 520 S 838 600 1012 538 H 1200"
            />
            <g className="hero-section__signal-nodes">
              <circle cx="456" cy="172" r="4" />
              <circle cx="650" cy="332" r="3" />
              <circle cx="914" cy="332" r="5" />
              <circle cx="610" cy="520" r="3" />
            </g>
          </svg>
        </div>
        <div className="hero-section__content">
          <p className="eyebrow">{identity.name} · {identity.title}</p>
          <h1 id="hero-title">{identity.heroStatement}</h1>
          <p className="hero-section__capabilities">{identity.capabilityLine}</p>
          <p className="hero-section__summary">{identity.summary}</p>
          <div className="hero-section__actions" aria-label="Portfolio actions">
            <a className="button button--primary" href="#work">Explore My Work</a>
            <button
              className="button button--secondary"
              type="button"
              aria-haspopup="dialog"
              aria-controls="portfolio-assistant-dialog"
              onClick={openAssistant}
            >
              Ask My AI
            </button>
            <a className="text-link" href={cvPath} download>Download CV</a>
          </div>
        </div>
        <HeroSceneSlot />
      </div>
    </section>
  )
}
