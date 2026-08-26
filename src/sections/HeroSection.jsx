import HeroSceneSlot from '../components/media/HeroSceneSlot.tsx'
import { useAssistantLauncher } from '../hooks/useAssistantLauncher.ts'

export default function HeroSection({ identity, cvPath }) {
  const openAssistant = useAssistantLauncher()

  return (
    <section id="top" className="portfolio-section hero-section" aria-labelledby="hero-title">
      <div className="page-frame hero-section__inner">
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
