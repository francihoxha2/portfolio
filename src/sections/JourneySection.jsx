import SectionHeading from '../components/common/SectionHeading.jsx'

export default function JourneySection({ journey }) {
  return (
    <section id="journey" className="portfolio-section journey-section" aria-labelledby="journey-title">
      <div className="page-frame">
        <SectionHeading eyebrow="Journey" title="From business and systems to software" headingId="journey-title">
          My journey brings together business education, practical IT support, and continued software development.
        </SectionHeading>

        <ol className="journey-list">
          {journey.map((entry, index) => (
            <li className="journey-item" key={entry.id}>
              <p className="journey-item__marker" aria-hidden="true">{String(index + 1).padStart(2, '0')}</p>
              <div>
                <p className="eyebrow">{entry.kind === 'experience' ? 'Experience' : 'Education'}</p>
                <h3>{entry.title}</h3>
                {entry.period ? <p className="journey-item__period">{entry.period}</p> : null}
                {entry.description ? <p>{entry.description}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
