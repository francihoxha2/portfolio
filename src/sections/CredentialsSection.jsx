import SectionHeading from '../components/common/SectionHeading.jsx'

export default function CredentialsSection({ credentials }) {
  return (
    <section
      id="credentials"
      className="portfolio-section credentials-section"
      aria-labelledby="credentials-title"
    >
      <div className="page-frame credentials-section__grid">
        <SectionHeading eyebrow="Credentials" title="Continuous learning" headingId="credentials-title">
          My professional development includes software engineering, AI-assisted coding, and AI.
        </SectionHeading>

        <ul className="credential-list" aria-label="Selected credentials">
          {credentials.map((credential) => (
            <li key={credential.id}>
              <span>{credential.title}</span>
              <small>{credential.provider} · {credential.completedOn.slice(0, 4)}</small>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
